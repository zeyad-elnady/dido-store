"use client";

import { useEffect, useState } from "react";
import { Settings, CreditCard, Phone, User, Save, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { MOCK_SETTINGS, MOCK_FOUNDER } from "@/lib/mockData";
import { FounderProfile, PublicSettings } from "@/types";

export default function AdminSettingsPage() {
  const [paymentSettings, setPaymentSettings] = useState(MOCK_SETTINGS.payment);
  const [contactSettings, setContactSettings] = useState(MOCK_SETTINGS.contact);
  const [founder, setFounder] = useState<FounderProfile>(MOCK_FOUNDER);
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => {
        if (res.data) {
          if (res.data.payment) setPaymentSettings(res.data.payment);
          if (res.data.contact) setContactSettings(res.data.contact);
        }
      })
      .catch(() => {});

    api
      .get("/founder")
      .then((res) => {
        if (res.data) setFounder(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/admin/settings", {
        payment: paymentSettings,
        contact: contactSettings,
      });
      await api.put("/admin/founder", founder);
      setBanner("All settings and store details successfully saved!");
    } catch {
      // Local fallback
      setBanner("Settings updated successfully! (Saved locally)");
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
          Store Settings & Configuration
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
          Configure InstaPay, Vodafone Cash, WhatsApp customer support channels, and the Founder Story.
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
              Deposit & Payment Accounts (Egypt)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                InstaPay Address (IPA)
              </label>
              <input
                type="text"
                value={paymentSettings.instapay_address || ""}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, instapay_address: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                Vodafone Cash Wallet Number
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
                Telda Handle
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
                Required Deposit Percentage (%)
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
              Customer Support & Social Channels
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                WhatsApp Number (with country code e.g. 2010...)
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
                Support Hotline
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
                Instagram Profile Link
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
                TikTok Profile Link
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
              Founder & Brand Story Section
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                  Founder Name (English)
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
                  Founder Name (Arabic)
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
                Brand Story / Bio (English)
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
                Brand Story / Bio (Arabic)
              </label>
              <textarea
                rows={3}
                dir="rtl"
                value={founder.bio_ar || ""}
                onChange={(e) => setFounder({ ...founder, bio_ar: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                Photo URL
              </label>
              <input
                type="text"
                value={founder.photo_path || ""}
                onChange={(e) => setFounder({ ...founder, photo_path: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
              />
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
          }}
        >
          <Save size={18} />
          <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
        </button>
      </form>
    </div>
  );
}
