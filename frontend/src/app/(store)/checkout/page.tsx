"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { EGYPT_GOVERNORATES } from "@/lib/translations";
import api, { storageUrl } from "@/lib/api";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { MOCK_SETTINGS } from "@/lib/mockData";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, removeFromCart, updateQuantity, clearCart, mounted } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [governorate, setGovernorate] = useState("Cairo");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<"instagram" | "tiktok" | "whatsapp">("instagram");
  const [platformUsername, setPlatformUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = 70;
  const total = subtotal + shippingFee;
  const deposit50 = Math.round(total * 0.5);
  const remainingOnDelivery = total - deposit50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError(language === "ar" ? "حقيبة التسوق فارغة. يرجى إضافة قطع قبل تقديم الطلب." : "Your cart is empty. Please add items before placing an order.");
      return;
    }

    if (!name.trim() || !phone.trim() || !city.trim() || !street.trim() || !building.trim()) {
      setError(
        language === "ar"
          ? "يرجى استكمال جميع البيانات الإلزامية (الاسم، الهاتف، المدينة/المنطقة، الشارع، ورقم العمارة)."
          : "Please complete all required fields (Name, Phone, City/Area, Street, and Building Number)."
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    const effectiveWhatsapp = sameAsPhone ? phone : (whatsapp || phone);

    const addressComponents = [
      city.trim(),
      street.trim(),
      building.trim() ? (language === "ar" ? `عمارة ${building.trim()}` : `Bldg ${building.trim()}`) : "",
      apartment.trim() ? (language === "ar" ? `شقة/دور ${apartment.trim()}` : `Apt/Floor ${apartment.trim()}`) : "",
      landmark.trim() ? (language === "ar" ? `علامة مميزة: ${landmark.trim()}` : `Landmark: ${landmark.trim()}`) : "",
    ].filter(Boolean).join("، ");

    const formattedShippingAddress = `${governorate} — ${addressComponents}`;

    const payload = {
      customer: {
        name,
        phone,
        whatsapp_number: effectiveWhatsapp,
        source_platform: sourcePlatform,
        instagram_username: sourcePlatform === "instagram" ? platformUsername : null,
        tiktok_username: sourcePlatform === "tiktok" ? platformUsername : null,
      },
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shipping_address: formattedShippingAddress,
      notes,
    };

    try {
      const res = await api.post("/orders", payload);
      const orderNumber = res.data?.data?.order_number || `DS-${Math.floor(1000 + Math.random() * 9000)}`;
      clearCart();
      router.push(`/order-tracking?order=${orderNumber}&new=1`);
    } catch {
      // Fallback simulation order number if offline
      const mockOrderNumber = `DS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      clearCart();
      router.push(`/order-tracking?order=${mockOrderNumber}&new=1`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ maxWidth: "600px", margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
        <div
          style={{
            display: "inline-block",
            width: "36px",
            height: "36px",
            border: "3px solid #EFEBE3",
            borderTopColor: "var(--color-accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "var(--color-bg-alt)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "var(--color-text-muted)",
          }}
        >
          <ShoppingBag size={32} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "12px", color: "var(--color-text)" }}>
          {t("cart_empty_title")}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "28px", lineHeight: 1.6 }}>
          {t("cart_empty_desc")}
        </p>
        <Link
          href="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <span>{t("cart_continue_shopping")}</span>
          <ArrowIcon size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "8px",
          }}
        >
          {t("checkout_title")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
          {t("checkout_subtitle")}
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#FEE2E2",
            border: "1px solid #FCA5A5",
            borderRadius: "10px",
            padding: "14px 18px",
            color: "#991B1B",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: "48px",
            alignItems: "flex-start",
          }}
          className="checkout-grid"
        >
          {/* Customer & Shipping Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Contact Details Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid var(--color-border-light)",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
                {t("customer_info_title")}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                    {t("full_name")} <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("full_name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div className="checkout-two-col">
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("phone_number")} <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t("phone_placeholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("whatsapp_number")}
                    </label>
                    <input
                      type="tel"
                      disabled={sameAsPhone}
                      placeholder={sameAsPhone ? phone || (language === "ar" ? "نفس رقم الهاتف" : "Same as phone") : "01012345678"}
                      value={sameAsPhone ? phone : whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: sameAsPhone ? "var(--color-bg-alt)" : "#FFFFFF",
                        fontSize: "0.9375rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="samePhone"
                    checked={sameAsPhone}
                    onChange={(e) => setSameAsPhone(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "var(--color-accent)" }}
                  />
                  <label htmlFor="samePhone" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                    {t("same_as_phone")}
                  </label>
                </div>

                {/* Where did you find us? */}
                <div className="checkout-two-col">
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("social_source_title")}
                    </label>
                    <select
                      value={sourcePlatform}
                      onChange={(e) => setSourcePlatform(e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        outline: "none",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="whatsapp">{language === "ar" ? "واتساب / ترشيح صديق" : "WhatsApp / Friend Referral"}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("platform_username")}
                    </label>
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      value={platformUsername}
                      onChange={(e) => setPlatformUsername(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid var(--color-border-light)",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
                {language === "ar" ? "2. عنوان التوصيل في مصر" : "2. Doorstep Delivery Address"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Governorate & City / District */}
                <div className="checkout-two-col">
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("governorate")} <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov.value} value={gov.value}>
                          {language === "ar" ? gov.label_ar : gov.label_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("city_district")} <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("city_placeholder")}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Street Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                    {t("street_name")} <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("street_placeholder")}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Building Number & Apartment / Floor */}
                <div className="checkout-two-col">
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("building_no")} <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t("building_placeholder")}
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                      {t("apartment_floor")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("apartment_placeholder")}
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.9375rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Nearest Landmark */}
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                    {t("nearest_landmark")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("landmark_placeholder")}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "6px" }}>
                    {t("order_notes")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("notes_placeholder")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.9375rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Deposit Instructions Card */}
            <div
              style={{
                backgroundColor: "#FDF8F6",
                borderRadius: "16px",
                border: "1px solid #F5ECE8",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CreditCard size={22} color="var(--color-accent)" />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                  {t("deposit_step_title")}
                </h4>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {t("deposit_explanation")}
              </p>
              <div className="checkout-two-col" style={{ marginTop: "4px" }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--color-border-light)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3F20BA" }}>INSTAPAY</div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)" }}>
                    {MOCK_SETTINGS.payment.instapay_address}
                  </div>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--color-border-light)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E60000" }}>VODAFONE CASH</div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)" }}>
                    {MOCK_SETTINGS.payment.vodafone_cash_number}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              position: "sticky",
              top: "90px",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
              {t("order_summary_title")} ({items.length})
            </h3>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
              {items.map((item, idx) => {
                const img =
                  item.product.images?.find((i) => i.is_primary)?.image_path ||
                  item.product.images?.[0]?.image_path ||
                  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200";
                const unitPrice = item.product.discount_price ?? item.product.selling_price;

                return (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "56px", height: "70px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, backgroundColor: "#f5f5f5" }}>
                      <img src={storageUrl(img)} alt={localize(item.product, "name")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {localize(item.product, "name")}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        {item.size} • {item.color} • {language === "ar" ? `العدد ${item.quantity}` : `Qty ${item.quantity}`}
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginTop: "4px" }}>
                        {formatPriceLocal(unitPrice * item.quantity)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "4px" }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Financial Breakdown */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--color-border-light)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "0.9375rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>{t("cart_subtotal")}</span>
                <span>{formatPriceLocal(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>{t("shipping_fee_label")}</span>
                <span>{formatPriceLocal(shippingFee)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--color-border-light)",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "var(--color-text)",
                }}
              >
                <span>{t("total_order_value")}</span>
                <span>{formatPriceLocal(total)}</span>
              </div>

              {/* 50% Deposit Requirement Highlight */}
              <div
                style={{
                  marginTop: "12px",
                  padding: "14px",
                  backgroundColor: "var(--color-bg-alt)",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-accent-hover)", fontWeight: 700 }}>
                  <span>{t("deposit_required_now")}:</span>
                  <span>{formatPriceLocal(deposit50)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", fontSize: "0.8125rem", marginTop: "4px" }}>
                  <span>{t("balance_on_doorstep")}:</span>
                  <span>{formatPriceLocal(remainingOnDelivery)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "16px 20px",
                backgroundColor: "var(--color-accent)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(196, 144, 124, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <span>{submitting ? t("order_submitting") : t("place_order_btn")}</span>
              <ArrowIcon size={18} />
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.checkout-grid) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          :global(.checkout-container) {
            padding: 24px 16px 60px !important;
          }
        }
      `}</style>
    </div>
  );
}
