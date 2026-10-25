"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  Sparkles,
  Globe,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const STORAGE_KEY = "dido_store_policy_accepted_v2";

export default function StorePolicyModal() {
  const { language, isRTL, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [hasAcceptedPreviously, setHasAcceptedPreviously] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (accepted) {
        setHasAcceptedPreviously(true);
      } else {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }

    const handleOpenModal = () => {
      setIsOpen(true);
    };
    window.addEventListener("dido:open-policy", handleOpenModal);
    return () => window.removeEventListener("dido:open-policy", handleOpenModal);
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setHasAcceptedPreviously(true);
    } catch {}
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (hasAcceptedPreviously && e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
        backgroundColor: "rgba(18, 14, 13, 0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "fadeIn 0.35s ease-out forwards",
      }}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          width: "100%",
          maxWidth: "580px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "32px 28px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(220, 160, 140, 0.3)",
          position: "relative",
          maxHeight: "92vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {/* Top Header & Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--color-border-light)",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                }}
              >
                DIDO STUDIO • FASHION
              </div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  margin: "2px 0 0",
                  letterSpacing: "-0.01em",
                }}
              >
                {language === "ar" ? "شروط وسياسة الطلب" : "Store Policy & Terms"}
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={toggleLanguage}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Globe size={14} />
              <span>{language === "ar" ? "English" : "العربية"}</span>
            </button>

            {hasAcceptedPreviously && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Intro */}
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {language === "ar"
            ? "أهلاً بكِ في متجر ديدو. لضمان تجربة تسوق راقية وسلسة، يرجى الاطلاع على سياسة الشحن، الاستبدال، وتأكيد الحجز قبل الدخول إلى المتجر:"
            : "Welcome to Dido Studio. To guarantee an exceptional and smooth shopping experience, please review our shipping, exchange, and deposit terms before continuing:"}
        </p>

        {/* 3 Chic Policy Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Rule 1: Delivery Timeline */}
          <div
            style={{
              padding: "16px 18px",
              borderRadius: "14px",
              backgroundColor: "#FFF8F5",
              border: "1px solid #FFE4D6",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#FED7AA",
                color: "#9A3412",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              <Truck size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#9A3412",
                  margin: "0 0 4px",
                }}
              >
                {language === "ar" ? "١. مدة الشحن والتوصيل" : "1. Shipping & Delivery"}
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#431407",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {language === "ar" ? (
                  <>
                    بمجرد سداد عربون الـ <strong>50%</strong> يتم تأكيد حجز
                    القطع فوراً من شي إن وشحنها لتصلكِ في خلال من{" "}
                    <strong>٥ أيام إلى ١٢ يوماً عمل</strong>.
                  </>
                ) : (
                  <>
                    Upon payment of the <strong>50% deposit</strong>, your
                    pieces are immediately secured and shipped from SHEIN,
                    delivered within <strong>5 to 12 business days</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Rule 2: Return & Exchange */}
          <div
            style={{
              padding: "16px 18px",
              borderRadius: "14px",
              backgroundColor: "#F9FAFB",
              border: "1px solid var(--color-border-light)",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#E5E7EB",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              <RotateCcw size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  margin: "0 0 4px",
                }}
              >
                {language === "ar"
                  ? "٢. سياسة الاسترجاع والتبديل"
                  : "2. Return & Exchange Policy"}
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {language === "ar" ? (
                  <>
                    <strong>لا يوجد استرداد للأموال أو استرجاع أو استبدال للطلب</strong>{" "}
                    إلا إذا كانت المشكلة تخص <strong>المقاس</strong>، أو وجود{" "}
                    <strong>عيوب في المنتج</strong>، أو حدوث{" "}
                    <strong>تأخير في موعد التسليم</strong>.
                  </>
                ) : (
                  <>
                    <strong>No refunds, returns, or order exchanges</strong> are
                    permitted unless the issue relates to{" "}
                    <strong>sizing discrepancy</strong>,{" "}
                    <strong>manufacturing defects</strong>, or{" "}
                    <strong>delivery delay</strong>.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Rule 3: Cancellation after 15 days */}
          <div
            style={{
              padding: "16px 18px",
              borderRadius: "14px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              <Clock size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#991B1B",
                  margin: "0 0 4px",
                }}
              >
                {language === "ar"
                  ? "٣. مهلة التواصل وتأكيد الحجز"
                  : "3. Confirmation & Communication Period"}
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#7F1D1D",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {language === "ar" ? (
                  <>
                    إذا لم يتم التواصل معنا خلال <strong>١٥ يوماً</strong> من
                    تاريخ الطلب، يُعتبر الطلب <strong>ملغياً نهائياً</strong>{" "}
                    ولا يحق المطالبة بالعربون.
                  </>
                ) : (
                  <>
                    If we are not contacted within <strong>15 days</strong> of
                    placing the order, the order is considered{" "}
                    <strong>permanently cancelled</strong> and the deposit is
                    forfeited.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox agreement */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "10px 14px",
            borderRadius: "10px",
            backgroundColor: agreed ? "var(--color-bg-alt)" : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: "18px",
              height: "18px",
              accentColor: "var(--color-accent)",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text)",
            }}
          >
            {language === "ar"
              ? "قرأت كافة الشروط والسياسات وأوافق عليها للمتابعة"
              : "I have read and agree to all store terms and policies"}
          </span>
        </label>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAccept}
          disabled={!agreed}
          style={{
            width: "100%",
            padding: "15px 24px",
            borderRadius: "14px",
            backgroundColor: agreed ? "var(--color-accent)" : "#D1D5DB",
            color: "#FFFFFF",
            fontSize: "1rem",
            fontWeight: 700,
            border: "none",
            cursor: agreed ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: agreed ? "0 8px 20px rgba(184, 115, 95, 0.35)" : "none",
            transition: "all 0.25s ease",
            transform: agreed ? "translateY(0)" : "none",
          }}
        >
          <CheckCircle2 size={20} />
          <span>
            {language === "ar"
              ? "موافقة والدخول إلى المتجر"
              : "Accept & Enter Store"}
          </span>
        </button>
      </div>
    </div>
  );
}
