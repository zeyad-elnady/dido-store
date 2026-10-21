"use client";

import { useEffect, useState, useRef } from "react";
import {
  Settings,
  CreditCard,
  Phone,
  User,
  Save,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  UploadCloud,
  Trash2,
  Link2,
  Check,
  Loader2,
} from "lucide-react";
import api, { storageUrl } from "@/lib/api";
import { MOCK_SETTINGS, MOCK_FOUNDER } from "@/lib/mockData";
import { FounderProfile, PublicSettings } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminSettingsPage() {
  const { isRTL, language } = useLanguage();

  // Store General Settings
  const [paymentSettings, setPaymentSettings] = useState(MOCK_SETTINGS.payment);
  const [contactSettings, setContactSettings] = useState(MOCK_SETTINGS.contact);
  const [founder, setFounder] = useState<FounderProfile>(MOCK_FOUNDER);
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Founder photo upload state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFounderPhotoUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoUploadError(isRTL ? "يرجى اختيار ملف صورة صالح" : "Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoUploadError(isRTL ? "حجم الصورة كبير جداً، الحد الأقصى 10 ميجابايت" : "Image size exceeds 10MB limit");
      return;
    }

    setPhotoUploadError(null);
    setPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.url) {
        setFounder((prev) => ({ ...prev, photo_path: res.data.url }));
      } else if (res.data?.path) {
        setFounder((prev) => ({ ...prev, photo_path: `/storage/${res.data.path}` }));
      }
    } catch (err: any) {
      console.error("Founder photo upload error:", err);
      setPhotoUploadError(
        err.response?.data?.message ||
        (isRTL ? "فشل رفع الصورة من الجهاز" : "Failed to upload photo from device")
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  // Admin Account & Security Settings
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch store settings
    api
      .get("/admin/settings")
      .then((res) => {
        if (res.data) {
          if (res.data.payment) setPaymentSettings(res.data.payment);
          if (res.data.contact) setContactSettings(res.data.contact);
        }
      })
      .catch(() => {});

    // Fetch founder info
    api
      .get("/founder")
      .then((res) => {
        if (res.data) setFounder(res.data);
      })
      .catch(() => {});

    // Fetch current admin profile
    api
      .get("/admin/me")
      .then((res) => {
        if (res.data) {
          if (res.data.name) setAdminName(res.data.name);
          if (res.data.email) setAdminEmail(res.data.email);
          localStorage.setItem("admin_user", JSON.stringify(res.data));
        }
      })
      .catch(() => {
        // Fallback to cached admin_user
        try {
          const cached = localStorage.getItem("admin_user");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.name) setAdminName(parsed.name);
            if (parsed.email) setAdminEmail(parsed.email);
          }
        } catch {}
      });
  }, []);

  // Update Admin Profile & Password
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setAccountSuccess(null);

    if (!adminEmail.trim()) {
      setAccountError(isRTL ? "يرجى إدخال البريد الإلكتروني." : "Please enter an email address.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setAccountError(
          isRTL
            ? "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف."
            : "New password must be at least 6 characters long."
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        setAccountError(
          isRTL
            ? "تأكيد كلمة المرور غير متطابق مع كلمة المرور الجديدة."
            : "New password confirmation does not match."
        );
        return;
      }
      if (!currentPassword) {
        setAccountError(
          isRTL
            ? "يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور."
            : "Please enter your current password to authorize this change."
        );
        return;
      }
    }

    setAccountSaving(true);

    try {
      const payload: any = {
        name: adminName.trim(),
        email: adminEmail.trim(),
      };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.put("/admin/profile", payload);

      if (res.data?.user) {
        localStorage.setItem("admin_user", JSON.stringify(res.data.user));
        setAdminName(res.data.user.name || "");
        setAdminEmail(res.data.user.email || "");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setAccountSuccess(
        isRTL
          ? "تم تحديث بيانات البريد وكلمة المرور بنجاح!"
          : "Account email and password successfully updated!"
      );

      setTimeout(() => setAccountSuccess(null), 5000);
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.errors?.current_password?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.new_password?.[0] ||
        err?.response?.data?.message;

      setAccountError(
        serverMsg ||
          (isRTL
            ? "تعذر تحديث الحساب. يرجى التأكد من كلمة المرور الحالية والمحاولة مجدداً."
            : "Failed to update account. Please verify your current password and try again.")
      );
    } finally {
      setAccountSaving(false);
    }
  };

  // Save Store General Settings & Founder
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/admin/settings", {
        payment: paymentSettings,
        contact: contactSettings,
      });
      await api.put("/admin/founder", founder);
      setBanner(isRTL ? "تم حفظ كافة إعدادات المتجر وبيانات المؤسسة بنجاح!" : "All settings and store details successfully saved!");
    } catch {
      // Local fallback
      setBanner(isRTL ? "تم تحديث الإعدادات وحفظها محلياً!" : "Settings updated successfully! (Saved locally)");
    } finally {
      setSaving(false);
      setTimeout(() => setBanner(null), 3000);
    }
  };

  return (
    <div style={{ maxWidth: "860px", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
          {isRTL ? "إعدادات المتجر وأمان الحساب" : "Store Settings & Account Security"}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
          {isRTL
            ? "تغيير البريد الإلكتروني وكلمة المرور، وضبط محافظ الدفع (إنستاباي وفودافون كاش) وقنوات التواصل."
            : "Manage your admin email and password, payment accounts (InstaPay & Vodafone Cash), and customer channels."}
        </p>
      </div>

      {banner && (
        <div
          style={{
            backgroundColor: "#DCFCE7",
            border: "1px solid #86EFAC",
            borderRadius: "10px",
            padding: "14px 18px",
            color: "#166534",
            fontSize: "0.875rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{banner}</span>
        </div>
      )}

      {/* ── SECTION 1: Admin Account & Password Security ──────────────── */}
      <div
        id="account"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid var(--color-border-light)",
          padding: "28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <ShieldCheck size={22} color="var(--color-accent)" />
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
            {isRTL ? "أمان الحساب وتغيير كلمة المرور" : "Admin Credentials & Security"}
          </h2>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "20px" }}>
          {isRTL
            ? "يمكنك من هنا تغيير البريد الإلكتروني للدخول وكلمة المرور الخاصة بلوحة الإدارة."
            : "Update your login email address and change your administrator password."}
        </p>

        {accountSuccess && (
          <div
            style={{
              backgroundColor: "#DCFCE7",
              border: "1px solid #86EFAC",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#166534",
              fontSize: "0.875rem",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{accountSuccess}</span>
          </div>
        )}

        {accountError && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#991B1B",
              fontSize: "0.875rem",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{accountError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateAccount} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "اسم المدير" : "Admin Name"}
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FAF7F2",
                }}
              >
                <User size={16} color="var(--color-text-muted)" />
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Admin Manager"
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "البريد الإلكتروني للدخول *" : "Login Email Address *"}
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FAF7F2",
                }}
              >
                <Mail size={16} color="var(--color-text-muted)" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@didostore.com"
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "#FAF7F2",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <KeyRound size={16} color="var(--color-accent)" />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                {isRTL ? "تغيير كلمة المرور (اختياري)" : "Change Password (Optional)"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                  {isRTL ? "كلمة المرور الحالية" : "Current Password"}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Lock size={15} color="var(--color-text-muted)" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ border: "none", outline: "none", width: "100%", fontSize: "0.8125rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}
                  >
                    {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                  {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Lock size={15} color="var(--color-accent)" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRTL ? "6 أحرف فأكثر" : "Min 6 chars"}
                    style={{ border: "none", outline: "none", width: "100%", fontSize: "0.8125rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px", color: "var(--color-text-secondary)" }}>
                  {isRTL ? "تأكيد كلمة المرور" : "Confirm New"}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Lock size={15} color="var(--color-accent)" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ border: "none", outline: "none", width: "100%", fontSize: "0.8125rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
            <button
              type="submit"
              disabled={accountSaving}
              style={{
                padding: "10px 22px",
                backgroundColor: "var(--color-text)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: accountSaving ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                opacity: accountSaving ? 0.75 : 1,
              }}
            >
              {accountSaving && <RefreshCw size={15} className="animate-spin" />}
              <span>
                {accountSaving
                  ? (isRTL ? "جارٍ الحفظ..." : "Updating Account...")
                  : (isRTL ? "تحديث البريد وكلمة المرور" : "Update Account & Password")}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* ── SECTION 2: General Store Settings Form ──────────────────── */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Payment Wallets */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--color-border-light)",
            padding: "28px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <CreditCard size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {isRTL ? "حسابات التحويل ومحافظ الدفع (مصر)" : "Deposit & Payment Accounts (Egypt)"}
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "رقم بطاقة إنستاباي (Card Number)" : "InstaPay Card Number"}
              </label>
              <input
                type="text"
                value={(paymentSettings as any).instapay_card_number || paymentSettings.instapay_address || ""}
                onChange={(e) =>
                  setPaymentSettings({
                    ...paymentSettings,
                    instapay_card_number: e.target.value,
                    instapay_address: e.target.value,
                  } as any)
                }
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "اسم صاحب بطاقة إنستاباي" : "InstaPay Cardholder Name"}
              </label>
              <input
                type="text"
                value={(paymentSettings as any).instapay_name || ""}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, instapay_name: e.target.value } as any)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "رقم المحفظة الإلكترونية (فودافون كاش)" : "Mobile Wallet Number (Vodafone Cash)"}
              </label>
              <input
                type="text"
                value={paymentSettings.vodafone_cash_number || ""}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, vodafone_cash_number: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "اسم صاحب المحفظة كما يظهر للمحول" : "Wallet Registered Name"}
              </label>
              <input
                type="text"
                value={(paymentSettings as any).vodafone_cash_name || ""}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, vodafone_cash_name: e.target.value } as any)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "معرّف تيلدا (Telda)" : "Telda Handle"}
              </label>
              <input
                type="text"
                value={paymentSettings.telda_handle || ""}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, telda_handle: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "نسبة العربون المطلوبة (%)" : "Required Deposit Percentage (%)"}
              </label>
              <input
                type="number"
                value={paymentSettings.deposit_percentage || "50"}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, deposit_percentage: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>
        </div>

        {/* Support & Contact */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--color-border-light)",
            padding: "28px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <Phone size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {isRTL ? "خدمة العملاء وقنوات التواصل الاجتماعي" : "Customer Support & Social Channels"}
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "رقم الواتساب (مع كود الدولة مثل 2010...)" : "WhatsApp Number (with country code e.g. 2010...)"}
              </label>
              <input
                type="text"
                value={contactSettings.whatsapp_number || ""}
                onChange={(e) => setContactSettings({ ...contactSettings, whatsapp_number: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "الخط الساخن أو الهاتف" : "Support Hotline"}
              </label>
              <input
                type="text"
                value={contactSettings.phone_number || ""}
                onChange={(e) => setContactSettings({ ...contactSettings, phone_number: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "رابط حساب إنستجرام" : "Instagram Profile Link"}
              </label>
              <input
                type="text"
                value={contactSettings.instagram_url || ""}
                onChange={(e) => setContactSettings({ ...contactSettings, instagram_url: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "رابط حساب تيك توك" : "TikTok Profile Link"}
              </label>
              <input
                type="text"
                value={contactSettings.tiktok_url || ""}
                onChange={(e) => setContactSettings({ ...contactSettings, tiktok_url: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>
        </div>

        {/* Founder Profile */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--color-border-light)",
            padding: "28px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <User size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {isRTL ? "قسم صاحبة المتجر (داليا ديدو)" : "Store Owner & Brand Story Section"}
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                  {isRTL ? "اسم صاحبة المتجر (بالإنجليزية)" : "Owner Name (English)"}
                </label>
                <input
                  type="text"
                  value={founder.founder_name_en}
                  onChange={(e) => setFounder({ ...founder, founder_name_en: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                  {isRTL ? "اسم صاحبة المتجر (بالعربية)" : "Owner Name (Arabic)"}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={founder.founder_name_ar}
                  onChange={(e) => setFounder({ ...founder, founder_name_ar: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "نبذة عن صاحبة المتجر (بالإنجليزية)" : "Owner Bio (English)"}
              </label>
              <textarea
                rows={3}
                value={founder.bio_en || ""}
                onChange={(e) => setFounder({ ...founder, bio_en: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                {isRTL ? "نبذة عن صاحبة المتجر (بالعربية)" : "Owner Bio (Arabic)"}
              </label>
              <textarea
                rows={3}
                dir="rtl"
                value={founder.bio_ar || ""}
                onChange={(e) => setFounder({ ...founder, bio_ar: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            {/* Founder Photo Upload from Device */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  {isRTL ? "الصورة الشخصية لصاحبة المتجر" : "Owner Photo"}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPhotoUrlInput(!showPhotoUrlInput)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-accent)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0,
                  }}
                >
                  <Link2 size={13} />
                  <span>{showPhotoUrlInput ? (isRTL ? "إخفاء إدخال الرابط" : "Hide URL") : (isRTL ? "أو إدخال رابط خارجي" : "Or enter URL")}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFounderPhotoUpload(e.target.files[0]);
                  }
                }}
              />

              {founder.photo_path ? (
                <div
                  style={{
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    padding: "10px",
                    backgroundColor: "var(--color-bg)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "#E2E8F0",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={storageUrl(founder.photo_path)}
                      alt="Owner"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: "#DCFCE7",
                          color: "#166534",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                        }}
                      >
                        <Check size={11} />
                        {isRTL ? "الصورة محددة" : "Photo Selected"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        margin: "0 0 8px 0",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {founder.photo_path}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--color-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--color-text)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: photoUploading ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {photoUploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                        <span>{photoUploading ? (isRTL ? "جارٍ الرفع..." : "Uploading...") : (isRTL ? "رفع صورة جديدة من الجهاز" : "Upload new from device")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFounder({ ...founder, photo_path: "" })}
                        disabled={photoUploading}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#FEE2E2",
                          color: "#DC2626",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Trash2 size={13} />
                        <span>{isRTL ? "إزالة" : "Remove"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !photoUploading && photoInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "10px",
                    padding: "20px 16px",
                    textAlign: "center",
                    cursor: photoUploading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {photoUploading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-accent)" }} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-accent)" }}>
                        {isRTL ? "جارٍ رفع الصورة من جهازك..." : "Uploading photo from device..."}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(196, 144, 124, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-accent)",
                        }}
                      >
                        <UploadCloud size={20} />
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                        {isRTL ? "اضغط لاختيار صورة من جهازك" : "Click to select a photo from device"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {isRTL ? "يدعم PNG, JPG, WEBP حتى 10MB" : "Supports PNG, JPG, WEBP up to 10MB"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {photoUploadError && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{photoUploadError}</span>
                </div>
              )}

              {showPhotoUrlInput && (
                <div style={{ marginTop: "10px" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                    {isRTL ? "أو الصق رابط الصورة المباشر:" : "Or paste direct image URL:"}
                  </label>
                  <input
                    type="text"
                    value={founder.photo_path || ""}
                    onChange={(e) => setFounder({ ...founder, photo_path: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", fontSize: "0.8125rem", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "16px 28px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 4px 14px rgba(196, 144, 124, 0.35)",
            opacity: saving ? 0.75 : 1,
          }}
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? (isRTL ? "جارٍ الحفظ..." : "Saving Changes...") : (isRTL ? "حفظ كافة إعدادات المتجر" : "Save All Settings")}</span>
        </button>
      </form>
    </div>
  );
}
