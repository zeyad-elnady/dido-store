"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { EGYPT_GOVERNORATES, DEFAULT_GOVERNORATE_SHIPPING_RATES, getShippingFeeForGovernorate } from "@/lib/translations";
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
  Copy,
  Check,
  Maximize2,
  X,
} from "lucide-react";
import { MOCK_SETTINGS } from "@/lib/mockData";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, removeFromCart, updateQuantity, clearCart, mounted, setIsCartOpen } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

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

  // Deposit Instructions State
  const [activeDepositTab, setActiveDepositTab] = useState<"instapay" | "wallet" | "telda">("instapay");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Dynamic Shipping Settings State
  const [shippingRates, setShippingRates] = useState<Record<string, number>>(DEFAULT_GOVERNORATE_SHIPPING_RATES);
  const [defaultShippingFee, setDefaultShippingFee] = useState<number>(70);

  useEffect(() => {
    api
      .get("/settings/public")
      .then((res) => {
        const shipping = res.data?.shipping;
        if (shipping) {
          if (shipping.default_shipping_fee) {
            setDefaultShippingFee(Number(shipping.default_shipping_fee) || 70);
          }
          if (shipping.shipping_rates_json) {
            try {
              const parsed = JSON.parse(shipping.shipping_rates_json);
              setShippingRates((prev) => ({ ...prev, ...parsed }));
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Dynamic Shipping Fee based on selected Egyptian Governorate
  const shippingFee = useMemo(() => {
    return getShippingFeeForGovernorate(governorate, shippingRates, defaultShippingFee);
  }, [governorate, shippingRates, defaultShippingFee]);

  const total = subtotal + shippingFee;
  const deposit50 = Math.round(total * 0.5);
  const remainingOnDelivery = total - deposit50;

  const currentGovObj = EGYPT_GOVERNORATES.find((g) => g.value === governorate);
  const currentGovLabel = language === "ar" ? (currentGovObj?.label_ar || governorate) : (currentGovObj?.label_en || governorate);

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
      shipping_fee: shippingFee,
      notes,
    };

    try {
      const res = await api.post("/orders", payload);
      const orderData = res.data?.data || res.data;
      const orderNumber = orderData?.order_number;
      if (orderNumber) {
        clearCart();
        router.push(`/order-tracking?order=${orderNumber}&new=1`);
        return;
      }
      clearCart();
      router.push(`/order-tracking?new=1`);
    } catch (err: any) {
      console.error("Order creation error:", err);
      alert(language === "ar" ? "حدث خطأ أثناء إتمام الطلب، يرجى المحاولة مرة أخرى." : "An error occurred while placing the order. Please try again.");
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
                backgroundColor: "#FDFBF7",
                borderRadius: "16px",
                border: "1px solid #F0ECE1",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CreditCard size={22} color="var(--color-accent)" />
                  <h4 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                    {t("deposit_step_title")}
                  </h4>
                </div>
                <span
                  style={{
                    backgroundColor: "#FEF3C7",
                    color: "#92400E",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "20px",
                  }}
                >
                  {language === "ar" ? "عربون 50% فقط للبدء" : "50% Deposit to Start"}
                </span>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {t("deposit_explanation")}
              </p>

              {/* Payment Method Selector Tabs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  backgroundColor: "#F5EFE6",
                  padding: "4px",
                  borderRadius: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveDepositTab("instapay")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: activeDepositTab === "instapay" ? 700 : 500,
                    backgroundColor: activeDepositTab === "instapay" ? "#FFFFFF" : "transparent",
                    color: activeDepositTab === "instapay" ? "#3F20BA" : "var(--color-text-secondary)",
                    boxShadow: activeDepositTab === "instapay" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>InstaPay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDepositTab("wallet")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: activeDepositTab === "wallet" ? 700 : 500,
                    backgroundColor: activeDepositTab === "wallet" ? "#FFFFFF" : "transparent",
                    color: activeDepositTab === "wallet" ? "#E60000" : "var(--color-text-secondary)",
                    boxShadow: activeDepositTab === "wallet" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>{language === "ar" ? "محفظة إلكترونية" : "Mobile Wallet"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDepositTab("telda")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: activeDepositTab === "telda" ? 700 : 500,
                    backgroundColor: activeDepositTab === "telda" ? "#FFFFFF" : "transparent",
                    color: activeDepositTab === "telda" ? "#000000" : "var(--color-text-secondary)",
                    boxShadow: activeDepositTab === "telda" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>Telda</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeDepositTab === "instapay" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Card & Name Details */}
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border-light)",
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3F20BA", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {language === "ar" ? "رقم البطاقة (Card Number)" : "Card Number"}
                        </div>
                        <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1px", direction: "ltr", marginTop: "2px" }}>
                          5484 4602 2730 8764
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("5484460227308764", "instapay-card")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #3F20BA",
                          backgroundColor: copiedKey === "instapay-card" ? "#EEF2FF" : "#FFFFFF",
                          color: "#3F20BA",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {copiedKey === "instapay-card" ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedKey === "instapay-card" ? t("copied_btn") : t("copy_btn")}</span>
                      </button>
                    </div>

                    <div style={{ borderTop: "1px dashed var(--color-border-light)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        {language === "ar" ? "اسم صاحب البطاقة:" : "Cardholder Name:"}
                      </span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)" }}>
                        dalia ghaleb
                      </span>
                    </div>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div
                    style={{
                      backgroundColor: "#EEF2FF",
                      borderRadius: "12px",
                      border: "1px solid #C7D2FE",
                      padding: "16px 18px",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#3730A3", marginBottom: "8px" }}>
                      {language === "ar" ? "خطوات التحويل عبر إنستاباي:" : "How to transfer via InstaPay:"}
                    </div>
                    <ol
                      style={{
                        margin: 0,
                        paddingInlineStart: "20px",
                        fontSize: "0.8125rem",
                        color: "#312E81",
                        lineHeight: 1.8,
                      }}
                    >
                      <li>
                        {language === "ar"
                          ? "افتحي تطبيق إنستاباي واختاري أيقونة «البطاقة الإلكترونية» (Card) بدلاً من رقم الهاتف."
                          : "Open the InstaPay app and select the 'Card' icon instead of mobile number."}
                      </li>
                      <li>
                        {language === "ar"
                          ? "ادخلي رقم البطاقة: 5484 4602 2730 8764 واسم صاحب البطاقة: dalia ghaleb."
                          : "Enter the Card Number: 5484 4602 2730 8764 and Name: dalia ghaleb."}
                      </li>
                      <li>
                        {language === "ar"
                          ? "حددي قيمة العربون (50%) ثم اضغطي «التالي» وأكدي التحويل والتقطي لقطة شاشة للإيصال."
                          : "Enter the deposit amount (50%), tap 'Next', confirm the transfer, and take a screenshot of the receipt."}
                      </li>
                    </ol>
                  </div>

                  {/* Photo Instructions (ONLY InstaPay) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)" }}>
                        {language === "ar" ? "صورة توضيحية لخطوات التحويل في إنستاباي:" : "Visual transfer guide in InstaPay:"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        {language === "ar" ? "(اضغطي على الصورة للتكبير)" : "(Click to enlarge)"}
                      </span>
                    </div>

                    <div
                      onClick={() => setLightboxImage("/instapay-instructions.jpg")}
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid var(--color-border)",
                        cursor: "pointer",
                        backgroundColor: "#000",
                        maxHeight: "220px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src="/instapay-instructions.jpg"
                        alt="InstaPay Transfer Instructions"
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                          objectPosition: "top center",
                          opacity: 0.95,
                          transition: "transform 0.3s ease, opacity 0.3s ease",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: isRTL ? "auto" : "10px",
                          left: isRTL ? "10px" : "auto",
                          backgroundColor: "rgba(0, 0, 0, 0.75)",
                          color: "#FFFFFF",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Maximize2 size={13} />
                        <span>{language === "ar" ? "تكبير الشرح" : "Enlarge Guide"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDepositTab === "wallet" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border-light)",
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E60000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {language === "ar" ? "رقم المحفظة (فودافون كاش / أورانج / اتصالات / وي)" : "Mobile Wallet Number"}
                        </div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1px", direction: "ltr", marginTop: "2px" }}>
                          01023402591
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("01023402591", "wallet-num")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #E60000",
                          backgroundColor: copiedKey === "wallet-num" ? "#FEF2F2" : "#FFFFFF",
                          color: "#E60000",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {copiedKey === "wallet-num" ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedKey === "wallet-num" ? t("copied_btn") : t("copy_btn")}</span>
                      </button>
                    </div>

                    <div style={{ borderTop: "1px dashed var(--color-border-light)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        {language === "ar" ? "الاسم المسجل في المحفظة:" : "Registered Wallet Name:"}
                      </span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)" }}>
                        داليا غ*** ع**
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderRadius: "10px",
                      border: "1px solid #FECACA",
                      padding: "12px 16px",
                      fontSize: "0.8125rem",
                      color: "#991B1B",
                      lineHeight: 1.6,
                    }}
                  >
                    {language === "ar"
                      ? "يمكنك التحويل من أي محفظة إلكترونية (فودافون، أورانج، اتصالات، أو وي كاش) إلى الرقم 01023402591 وسيظهر اسم المستلم باسم داليا غ*** ع**."
                      : "You can transfer from any mobile wallet (Vodafone, Orange, Etisalat, or WE Cash) to 01023402591. The recipient name will appear as داليا غ*** ع**."}
                  </div>
                </div>
              )}

              {activeDepositTab === "telda" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border-light)",
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {language === "ar" ? "اسم المستخدم في تيلدا" : "Telda Username"}
                        </div>
                        <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", direction: "ltr", marginTop: "2px" }}>
                          @daliaghale616990
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("@daliaghale616990", "telda-handle")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #111827",
                          backgroundColor: copiedKey === "telda-handle" ? "#F3F4F6" : "#FFFFFF",
                          color: "#111827",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {copiedKey === "telda-handle" ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedKey === "telda-handle" ? t("copied_btn") : t("copy_btn")}</span>
                      </button>
                    </div>

                    <div style={{ borderTop: "1px dashed var(--color-border-light)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        {language === "ar" ? "الاسم:" : "Name:"}
                      </span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)" }}>
                        dalia ghaleb
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      padding: "12px 16px",
                      fontSize: "0.8125rem",
                      color: "#374151",
                      lineHeight: 1.6,
                    }}
                  >
                    {language === "ar"
                      ? "أرسلي العربون مباشرة داخل تطبيق تيلدا (Telda) بالبحث عن اسم المستخدم @daliaghale616990."
                      : "Send the deposit directly in the Telda app by searching for the username @daliaghale616990."}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div
            className="checkout-summary-sticky"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              position: "sticky",
              top: "88px",
              alignSelf: "flex-start",
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
                <span>{t("shipping_fee_label")} ({currentGovLabel})</span>
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

      {/* Lightbox Modal for Instructions */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              backgroundColor: "#18181B",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              cursor: "default",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid #27272A",
                color: "#FFFFFF",
              }}
            >
              <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                {language === "ar" ? "شرح التحويل عبر تطبيق إنستاباي" : "InstaPay Transfer Instructions"}
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#A1A1AA",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ maxHeight: "80vh", overflowY: "auto", padding: "12px", backgroundColor: "#000" }}>
              <img
                src={lightboxImage}
                alt="InstaPay Transfer Full Instructions"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
        </div>
      )}

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
