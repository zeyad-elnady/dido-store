"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Globe } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/admin/login", { email: email.trim(), password });
      
      if (res.data?.token) {
        localStorage.setItem("admin_token", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      }
      // Purge any legacy demo flags
      localStorage.removeItem("admin_demo");

      router.push("/admin/dashboard");
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.response?.data?.message;

      if (serverMsg && serverMsg !== "Server Error") {
        setError(serverMsg);
      } else {
        setError(
          language === "ar"
            ? "بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
            : "Invalid credentials. Please verify your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#18181A",
        padding: "24px",
        fontFamily: isRTL ? "'Cairo', -apple-system, BlinkMacSystemFont, sans-serif" : "inherit",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "40px 36px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          position: "relative",
        }}
      >
        {/* Language Switcher */}
        <div style={{ position: "absolute", top: "20px", [isRTL ? "left" : "right"]: "20px" }}>
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
              backgroundColor: "#FAF7F2",
              color: "var(--color-primary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Globe size={13} />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", marginTop: "8px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1
            style={{
              fontFamily: isRTL ? "inherit" : "'Playfair Display', Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "8px",
            }}
          >
            {language === "ar" ? "تسجيل دخول الإدارة" : "Staff & Operations"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
            {language === "ar"
              ? "سجلي الدخول للتحكم في الطلبات، تأكيد العربونات وتحديث قطع شي إن."
              : "Sign in with your verified credentials to access Dido Store operations."}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              padding: "12px 14px",
              color: "#991B1B",
              fontSize: "0.875rem",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px", color: "var(--color-text)" }}>
              {language === "ar" ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FAF7F2",
              }}
            >
              <Mail size={18} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9375rem",
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px", color: "var(--color-text)" }}>
              {language === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FAF7F2",
              }}
            >
              <Lock size={18} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9375rem",
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: "0 2px",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "14px",
              backgroundColor: "var(--color-text)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s",
              opacity: loading ? 0.75 : 1,
            }}
          >
            <span>
              {loading
                ? (language === "ar" ? "جارٍ التحقق..." : "Authenticating...")
                : (language === "ar" ? "تسجيل الدخول إلى اللوحة" : "Sign In to Dashboard")}
            </span>
            <ArrowRight size={16} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
              textDecoration: "none",
            }}
          >
            {language === "ar" ? "← العودة إلى متجر الأزياء العام" : "← Return to Public Fashion Store"}
          </Link>
        </div>
      </div>
    </div>
  );
}
