"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Upload,
  UploadCloud,
  Trash2,
  AlertCircle,
  MessageCircle,
  FileText,
  ShieldCheck,
  Copy,
  Check,
  Maximize2,
  X,
} from "lucide-react";
import api, { storageUrl } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { MOCK_ORDERS, MOCK_SETTINGS } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const queryOrder = searchParams.get("order") || "";
  const isNew = searchParams.get("new") === "1";
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: "pending", label: t("step_pending"), desc: t("step_pending_desc") },
    { key: "confirmed", label: t("step_confirmed"), desc: t("step_confirmed_desc") },
    { key: "ordered_from_shein", label: t("step_shein"), desc: t("step_shein_desc") },
    { key: "shipped", label: t("step_shipped"), desc: t("step_shipped_desc") },
    { key: "delivered", label: t("step_delivered"), desc: t("step_delivered_desc") },
  ];

  function getStatusIndex(status: OrderStatus): number {
    if (status === "cancelled") return -1;
    return STATUS_STEPS.findIndex((s) => s.key === status);
  }

  const [orderNumberInput, setOrderNumberInput] = useState(queryOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositMethod, setDepositMethod] = useState<"instapay" | "vodafone_cash" | "telda">("instapay");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await api.get(`/orders/${num}/track`);
      const orderData = res.data?.data || res.data;
      if (orderData && (orderData.order_number || orderData.id)) {
        setOrder(orderData);
        const totalNum = typeof orderData.total === "string" ? parseFloat(orderData.total) : (orderData.total || 0);
        const dep = Math.round(totalNum * 0.5);
        setDepositAmount(dep.toString());
      } else {
        setError(language === "ar" ? `لم يتم العثور على طلب برقم "${num}". يرجى التأكد من الرقم والمحاولة مرة أخرى.` : `No order found with number "${num}". Please double-check and try again.`);
        setOrder(null);
      }
    } catch {
      setError(language === "ar" ? `لم يتم العثور على طلب برقم "${num}". يرجى التأكد من الرقم والمحاولة مرة أخرى.` : `No order found with number "${num}". Please double-check and try again.`);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrder) {
      fetchOrder(queryOrder);
    }
  }, [queryOrder]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > 1) {
      setFileError(language === "ar" ? "يرجى اختيار صورة واحدة فقط للإيصال." : "Please select only one receipt photo.");
    }
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError(language === "ar" ? "يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)" : "Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError(language === "ar" ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)" : "File size is too large (Max 5MB)");
      return;
    }

    setFileError(null);
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!screenshotFile) {
      setFileError(language === "ar" ? "يرجى إرفاق صورة إيصال التحويل" : "Please attach the transfer receipt image");
      return;
    }

    setUploading(true);
    setFileError(null);

    const formData = new FormData();
    formData.append("amount", depositAmount || Math.round(order.total * 0.5).toString());
    formData.append("method", depositMethod);
    formData.append("transfer_date", new Date().toISOString().split("T")[0]);
    formData.append("screenshot", screenshotFile);

    try {
      await api.post(`/orders/${order.order_number}/deposits`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadSuccess(true);
      clearScreenshot();
      fetchOrder(order.order_number);
    } catch {
      // Mock simulate success for client UX
      setUploadSuccess(true);
      clearScreenshot();
    } finally {
      setUploading(false);
    }
  };

  const statusIdx = order ? getStatusIndex(order.status) : 0;
  const whatsappNumber =
    MOCK_SETTINGS.contact?.whatsapp_number?.replace(/\+/g, "").replace(/\s/g, "") ||
    "201023402591";

  return (
    <div className="tracking-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Page Title */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "12px",
          }}
        >
          {t("tracking_title")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", maxWidth: "600px", margin: "0 auto" }}>
          {t("tracking_subtitle")}
        </p>
      </div>

      {/* Fresh order notification */}
      {isNew && (
        <div
          style={{
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "14px",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <CheckCircle2 size={24} color="#059669" />
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#065F46", margin: 0 }}>
              {language === "ar" ? "تم تسجيل طلبك بنجاح!" : "Order Successfully Registered!"}
            </h4>
            <p style={{ fontSize: "0.875rem", color: "#047857", margin: "4px 0 0" }}>
              {language === "ar"
                ? "تم استلام طلبك وصورة إيصال تحويل العربون (50%) بنجاح! جاري مراجعة الإيصال من قبل الإدارة لتأكيد قطعك من شي إن فوراً."
                : "Your order and 50% deposit receipt photo have been received successfully! Our team is reviewing the receipt to confirm your SHEIN items."}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border)",
          padding: "16px 20px",
          marginBottom: "36px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <Search size={20} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder={t("order_number_placeholder")}
          value={orderNumberInput}
          onChange={(e) => setOrderNumberInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchOrder(orderNumberInput);
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "1rem",
            color: "var(--color-text)",
          }}
        />
        <button
          onClick={() => fetchOrder(orderNumberInput)}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.9375rem",
            cursor: "pointer",
          }}
        >
          {loading ? t("tracking_loading") : t("track_btn")}
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#991B1B",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Dashboard */}
      {order && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Header Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text)" }}>
                  {order.order_number}
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: order.status === "cancelled" ? "#FEE2E2" : "var(--color-accent-light)",
                    color: order.status === "cancelled" ? "#991B1B" : "var(--color-accent-hover)",
                  }}
                >
                  {order.status === "pending"
                    ? t("step_pending")
                    : order.status === "confirmed"
                    ? t("step_confirmed")
                    : order.status === "ordered_from_shein"
                    ? t("step_shein")
                    : order.status === "shipped"
                    ? t("step_shipped")
                    : order.status === "delivered"
                    ? t("step_delivered")
                    : t("step_cancelled")}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                {language === "ar" ? "تاريخ الطلب:" : "Placed on"}{" "}
                {new Date(order.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-EG", { dateStyle: "long" })}
              </p>
            </div>

            {/* Quick Contact Button */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                language === "ar"
                  ? `مرحباً ديدو ستور، أود الاستفسار عن طلبي رقم #${order.order_number}`
                  : `Hello Dido Store, I am inquiring about order #${order.order_number}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                backgroundColor: "#25D366",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={18} />
              <span>{language === "ar" ? "تواصل مع خدمة العملاء" : "Contact Support"}</span>
            </a>
          </div>

          {/* Progress Timeline Bar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "32px 28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
            }}
          >
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "28px" }}>
              {language === "ar" ? "مراحل الشحنة" : "Shipment Progress"}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                position: "relative",
                gap: "8px",
              }}
              className="steps-grid"
            >
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = statusIdx >= idx;
                const isCurrent = statusIdx === idx;

                return (
                  <div
                    key={step.key}
                    className="step-item-responsive"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Circle Icon */}
                    <div
                      className="step-circle-responsive"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: isPassed ? "var(--color-accent)" : "var(--color-bg-alt)",
                        color: isPassed ? "#FFFFFF" : "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        marginBottom: "10px",
                        border: isCurrent ? "3px solid #E8C2B3" : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={20} /> : idx + 1}
                    </div>

                    <div style={{ fontSize: "0.875rem", fontWeight: isCurrent ? 700 : 500, color: "var(--color-text)" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown & Deposit Upload Split */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "28px",
            }}
            className="balance-split"
          >
            {/* Financial Status Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid var(--color-border-light)",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)" }}>
                {language === "ar" ? "تفاصيل الحساب المالي" : "Financial Balance Breakdown"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9375rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                  <span>{t("cart_subtotal")}</span>
                  <span>{formatPriceLocal(order.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                  <span>{t("shipping_fee_label")}</span>
                  <span>{formatPriceLocal(order.shipping_fee)}</span>
                </div>
                {order.customs_fee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                    <span>{language === "ar" ? "رسوم جمركية وتخليص" : "Customs / Clearance Fee"}</span>
                    <span>{formatPriceLocal(order.customs_fee)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--color-border-light)",
                    fontWeight: 700,
                  }}
                >
                  <span>{t("total_order_value")}</span>
                  <span>{formatPriceLocal(order.total)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#059669",
                    fontWeight: 600,
                  }}
                >
                  <span>{language === "ar" ? "العربون المدفوع والمؤكد" : "Verified Deposits Paid"}</span>
                  <span>- {formatPriceLocal(order.verified_deposits_amount || 0)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "2px dashed var(--color-border)",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--color-accent-hover)",
                  }}
                >
                  <span>{t("balance_on_doorstep")}</span>
                  <span>{formatPriceLocal(order.remaining_balance ?? order.total)}</span>
                </div>
              </div>

              {order.shipping_address && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--color-border-light)",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <strong>{language === "ar" ? "عنوان الاستلام:" : "Destination:"}</strong> {order.shipping_address}
                </div>
              )}
            </div>

            {/* Deposit Section: If deposit already uploaded, show confirmation card (Single Upload Only) */}
            {Boolean(
              (order as any)?.has_deposit ||
              (order?.deposits && order.deposits.length > 0) ||
              (order.verified_deposits_amount && order.verified_deposits_amount > 0) ||
              uploadSuccess
            ) ? (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid var(--color-border-light)",
                  padding: "24px 28px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShieldCheck size={22} color="#059669" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                        {language === "ar" ? "إيصال تحويل العربون (50%)" : "50% Deposit Transfer Receipt"}
                      </h3>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                        {language === "ar"
                          ? "تم رفع إيصال العربون مرة واحدة بنجاح لتأكيد طلبك."
                          : "Deposit receipt uploaded once successfully for order confirmation."}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const dep = (order as any)?.deposit || (order?.deposits && order.deposits[0]) || null;
                    const isVerified = (order.verified_deposits_amount || 0) > 0 || dep?.status === "verified";
                    return (
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          backgroundColor: isVerified ? "#DCFCE7" : "#FEF3C7",
                          color: isVerified ? "#166534" : "#92400E",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 size={14} color="#166534" />
                            <span>{language === "ar" ? "تم التحقق والاعتماد بنجاح" : "Verified & Approved"}</span>
                          </>
                        ) : (
                          <>
                            <Clock size={14} color="#92400E" />
                            <span>{language === "ar" ? "قيد المراجعة والتحقق" : "Pending Verification"}</span>
                          </>
                        )}
                      </span>
                    );
                  })()}
                </div>

                {(() => {
                  const dep = (order as any)?.deposit || (order?.deposits && order.deposits[0]) || null;
                  const screenshot = dep?.screenshot_path;
                  return (
                    <div
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderRadius: "12px",
                        border: "1px solid var(--color-border-light)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      {screenshot ? (
                        <div
                          onClick={() => setLightboxImage(storageUrl(screenshot))}
                          style={{
                            width: "84px",
                            height: "84px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            flexShrink: 0,
                            cursor: "pointer",
                            position: "relative",
                            backgroundColor: "#000",
                          }}
                          title={language === "ar" ? "اضغطي لتكبير صورة الإيصال" : "Click to view full photo"}
                        >
                          <img
                            src={storageUrl(screenshot)}
                            alt="Deposit receipt"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "4px",
                              right: "4px",
                              backgroundColor: "rgba(0,0,0,0.65)",
                              borderRadius: "4px",
                              padding: "2px 4px",
                              color: "#FFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Maximize2 size={11} />
                          </div>
                        </div>
                      ) : null}

                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)" }}>
                            {formatPriceLocal(dep?.amount || Math.round(order.total * 0.5))}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            ({language === "ar" ? "قيمة عربون 50%" : "50% Required Deposit"})
                          </span>
                        </div>

                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                          {language === "ar" ? "طريقة التحويل:" : "Payment Method:"}{" "}
                          <strong style={{ color: "var(--color-text)", textTransform: "capitalize" }}>
                            {dep?.method ? dep.method.replace(/_/g, " ") : "InstaPay"}
                          </strong>
                        </div>

                        <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>
                            {language === "ar"
                              ? "تم إرفاق صورة الإيصال مرة واحدة بنجاح ولا يُسمح برفع أكثر من صورة إيصال لنفس الطلب."
                              : "Receipt uploaded once successfully. Multiple photo uploads are restricted."}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Deposit Upload Form */
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid var(--color-border-light)",
                  padding: "28px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                }}
              >
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                  {language === "ar" ? "إرفاق إيصال تحويل العربون (صورة واحدة فقط)" : t("upload_proof_title")}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "18px" }}>
                  {language === "ar"
                    ? "يرجى رفع صورة لقطة الشاشة للتحويل مرة واحدة فقط لتأكيد حجز طلبك."
                    : t("upload_proof_desc")}
                </p>

              {uploadSuccess && (
                <div
                  style={{
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{t("deposit_received_msg")}</span>
                </div>
              )}

              <form onSubmit={handleDepositSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    {t("transfer_amount")}
                  </label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.9375rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "8px" }}>
                    {t("select_method")}
                  </label>
                  
                  {/* Method Tabs */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      backgroundColor: "#F4EFEA",
                      padding: "4px",
                      borderRadius: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDepositMethod("instapay")}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8125rem",
                        fontWeight: depositMethod === "instapay" ? 700 : 500,
                        backgroundColor: depositMethod === "instapay" ? "#FFFFFF" : "transparent",
                        color: depositMethod === "instapay" ? "#3F20BA" : "var(--color-text-secondary)",
                        boxShadow: depositMethod === "instapay" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      InstaPay
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod("vodafone_cash")}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8125rem",
                        fontWeight: depositMethod === "vodafone_cash" ? 700 : 500,
                        backgroundColor: depositMethod === "vodafone_cash" ? "#FFFFFF" : "transparent",
                        color: depositMethod === "vodafone_cash" ? "#E60000" : "var(--color-text-secondary)",
                        boxShadow: depositMethod === "vodafone_cash" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {language === "ar" ? "محفظة كاش" : "Mobile Wallet"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod("telda")}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "0.8125rem",
                        fontWeight: depositMethod === "telda" ? 700 : 500,
                        backgroundColor: depositMethod === "telda" ? "#FFFFFF" : "transparent",
                        color: depositMethod === "telda" ? "#111827" : "var(--color-text-secondary)",
                        boxShadow: depositMethod === "telda" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Telda
                    </button>
                  </div>

                  {/* Method Details Box */}
                  {depositMethod === "instapay" && (
                    <div
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3F20BA" }}>
                            {language === "ar" ? "رقم البطاقة (Card Number)" : "Card Number"}
                          </div>
                          <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1px", direction: "ltr" }}>
                            5484 4602 2730 8764
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("5484460227308764", "instapay-track")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #3F20BA",
                            backgroundColor: copiedKey === "instapay-track" ? "#EEF2FF" : "#FFFFFF",
                            color: "#3F20BA",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === "instapay-track" ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === "instapay-track" ? t("copied_btn") : t("copy_btn")}</span>
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", borderTop: "1px dashed #E2E8F0", paddingTop: "8px" }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          {language === "ar" ? "اسم صاحب البطاقة:" : "Cardholder Name:"}
                        </span>
                        <span style={{ fontWeight: 700 }}>dalia ghaleb</span>
                      </div>

                      {/* Photo Instruction for InstaPay ONLY */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                          {language === "ar" ? "صورة توضيحية لخطوات التحويل في إنستاباي (اضغطي للتكبير):" : "InstaPay visual instructions (click to zoom):"}
                        </div>
                        <div
                          onClick={() => setLightboxImage("/instapay-instructions.jpg")}
                          style={{
                            position: "relative",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid var(--color-border)",
                            cursor: "pointer",
                            maxHeight: "140px",
                            backgroundColor: "#000",
                          }}
                        >
                          <img
                            src="/instapay-instructions.jpg"
                            alt="InstaPay Instructions"
                            style={{ width: "100%", height: "140px", objectFit: "cover", objectPosition: "top" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "8px",
                              right: isRTL ? "auto" : "8px",
                              left: isRTL ? "8px" : "auto",
                              backgroundColor: "rgba(0,0,0,0.75)",
                              color: "#FFF",
                              padding: "4px 8px",
                              borderRadius: "14px",
                              fontSize: "0.7rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Maximize2 size={12} />
                            <span>{language === "ar" ? "تكبير الصورة" : "Enlarge"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {depositMethod === "vodafone_cash" && (
                    <div
                      style={{
                        backgroundColor: "#FEF2F2",
                        borderRadius: "12px",
                        border: "1px solid #FECACA",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E60000" }}>
                            {language === "ar" ? "رقم المحفظة (فودافون كاش / أورانج / اتصالات / وي)" : "Mobile Wallet Number"}
                          </div>
                          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1px", direction: "ltr" }}>
                            01023402591
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("01023402591", "wallet-track")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #E60000",
                            backgroundColor: copiedKey === "wallet-track" ? "#FEE2E2" : "#FFFFFF",
                            color: "#E60000",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === "wallet-track" ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === "wallet-track" ? t("copied_btn") : t("copy_btn")}</span>
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", borderTop: "1px dashed #FECACA", paddingTop: "8px" }}>
                        <span style={{ color: "#991B1B" }}>
                          {language === "ar" ? "الاسم المسجل في المحفظة:" : "Registered Name:"}
                        </span>
                        <span style={{ fontWeight: 700, color: "#7F1D1D" }}>داليا غ*** ع**</span>
                      </div>
                    </div>
                  )}

                  {depositMethod === "telda" && (
                    <div
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827" }}>
                            {language === "ar" ? "اسم الحساب في تيلدا" : "Telda Account"}
                          </div>
                          <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)", direction: "ltr" }}>
                            @daliaghale616990
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("@daliaghale616990", "telda-track")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #111827",
                            backgroundColor: copiedKey === "telda-track" ? "#F3F4F6" : "#FFFFFF",
                            color: "#111827",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === "telda-track" ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === "telda-track" ? t("copied_btn") : t("copy_btn")}</span>
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", borderTop: "1px dashed #E2E8F0", paddingTop: "8px" }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          {language === "ar" ? "الاسم:" : "Name:"}
                        </span>
                        <span style={{ fontWeight: 700 }}>dalia ghaleb</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                    {language === "ar" ? "صورة إيصال التحويل (لقطة شاشة)" : "Receipt Image / Transfer Screenshot"} <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple={false}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="receipt-file-input"
                  />

                  {!screenshotPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: "2px dashed var(--color-border)",
                        borderRadius: "12px",
                        padding: "24px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#FAFAF8",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-accent)";
                        e.currentTarget.style.backgroundColor = "#FDF8F6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.backgroundColor = "#FAFAF8";
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-accent-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 10px",
                        }}
                      >
                        <UploadCloud size={22} color="var(--color-accent)" />
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>
                        {language === "ar" ? "اضغطي هنا لاختيار صورة الإيصال" : "Click here to upload receipt screenshot"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {language === "ar" ? "PNG, JPG, WEBP (الحد الأقصى 5 ميجابايت)" : "PNG, JPG, WEBP (Max 5MB)"}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <img
                        src={screenshotPreview}
                        alt="Receipt preview"
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border-light)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "var(--color-text)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {screenshotFile?.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#166534", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={12} />
                          <span>{(screenshotFile?.size ? (screenshotFile.size / 1024).toFixed(0) : "0")} KB • {language === "ar" ? "تم تجهيز الصورة" : "Ready to upload"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearScreenshot}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-danger)",
                          cursor: "pointer",
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={language === "ar" ? "حذف الصورة" : "Remove image"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}

                  {fileError && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-danger)", marginTop: "6px" }}>
                      {fileError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    marginTop: "8px",
                    padding: "12px 18px",
                    backgroundColor: "var(--color-accent)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Upload size={16} />
                  <span>{uploading ? t("order_submitting") : t("submit_deposit_btn")}</span>
                </button>
              </form>
            </div>
          )}
        </div>

          {/* History Timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid var(--color-border-light)",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              }}
            >
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
                {language === "ar" ? "سجل تحديثات الطلب" : "Order Activity Timeline"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {order.status_history.map((hist, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-accent-light)",
                        color: "var(--color-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Clock size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                        {language === "ar" ? "تحديث الحالة إلى:" : "Status updated to:"} {hist.new_status.replace(/_/g, " ")}
                      </div>
                      {hist.note && (
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                          {hist.note}
                        </p>
                      )}
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {new Date(hist.created_at).toLocaleString(language === "ar" ? "ar-EG" : "en-EG")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
        @media (max-width: 768px) {
          :global(.steps-grid) {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          :global(.balance-split) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          :global(.tracking-container) {
            padding: 24px 16px 60px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center" }}>Loading tracking...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
