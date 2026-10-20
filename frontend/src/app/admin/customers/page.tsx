"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, Search, MessageCircle, Phone, Plus, X } from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import { Customer } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminCustomersPage() {
  const { language, isRTL } = useLanguage();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [platformFilter, setPlatformFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "whatsapp">("instagram");
  const [socialHandle, setSocialHandle] = useState("");

  useEffect(() => {
    api
      .get("/admin/customers")
      .then((res) => {
        if (res.data?.data) {
          setCustomers(res.data.data);
        } else if (Array.isArray(res.data)) {
          setCustomers(res.data);
        } else {
          setCustomers([]);
        }
      })
      .catch(() => {
        setCustomers([]);
      });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = {
      id: Date.now(),
      name,
      phone,
      whatsapp_number: whatsapp || phone,
      source_platform: platform,
      instagram_username: platform === "instagram" ? socialHandle : null,
      tiktok_username: platform === "tiktok" ? socialHandle : null,
      orders_count: 0,
    };

    try {
      await api.post("/admin/customers", newCust);
    } catch {
      // Local fallback
    }

    setCustomers((prev) => [newCust, ...prev]);
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setWhatsapp("");
    setSocialHandle("");
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchPlat = platformFilter === "all" || c.source_platform === platformFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.instagram_username && c.instagram_username.toLowerCase().includes(q)) ||
        (c.tiktok_username && c.tiktok_username.toLowerCase().includes(q));
      return matchPlat && matchSearch;
    });
  }, [customers, platformFilter, search]);

  const platformLabels: Record<string, { en: string; ar: string }> = {
    all: { en: "All", ar: "الكل" },
    instagram: { en: "Instagram", ar: "إنستغرام" },
    tiktok: { en: "TikTok", ar: "تيك توك" },
    whatsapp: { en: "WhatsApp", ar: "واتساب" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            {language === "ar" ? "سجل وقاعدة بيانات العملاء (CRM)" : "Customer Directory (CRM)"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
            {language === "ar"
              ? "إدارة ملفات العملاء، منصات التواصل، سجل الطلبات والمراسلة المباشرة عبر واتساب."
              : "Manage client profiles, source platforms, order histories, and instant WhatsApp outreach."}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 20px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(196, 144, 124, 0.3)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent)")}
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>{language === "ar" ? "إضافة عميل جديد" : "New Customer"}</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border-light)",
          padding: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "var(--color-bg)",
            borderRadius: "8px",
            padding: "10px 14px",
            border: "1px solid var(--color-border)",
            flex: "1 1 300px",
          }}
        >
          <Search size={18} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder={
              language === "ar"
                ? "ابحث باسم العميل، الهاتف، أو الحساب..."
                : "Search by customer name, phone, or handle..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              fontSize: "0.875rem",
              color: "var(--color-text)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {(["all", "instagram", "tiktok", "whatsapp"] as const).map((p) => {
            const active = platformFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "30px",
                  border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                  backgroundColor: active ? "var(--color-accent)" : "transparent",
                  color: active ? "#FFFFFF" : "var(--color-text)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {language === "ar" ? platformLabels[p].ar : platformLabels[p].en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border-light)",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: isRTL ? "right" : "left",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border-light)", color: "var(--color-text-secondary)" }}>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "اسم العميل" : "Customer Name"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "رقم الهاتف" : "Phone"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "منصة الطلب" : "Source Platform"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "حساب التواصل" : "Social Handle"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "عدد الطلبات" : "Orders Count"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: isRTL ? "left" : "right" }}>
                  {language === "ar" ? "مراسلة واتساب" : "WhatsApp"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                    <Users size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                      {language === "ar" ? "لم يتم العثور على عملاء" : "No customers found"}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const wa = c.whatsapp_number || c.phone;

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid var(--color-border-light)",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--color-text)" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "16px 20px" }}>{c.phone}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            textTransform: "capitalize",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor:
                              c.source_platform === "instagram"
                                ? "#FDF2F8"
                                : c.source_platform === "tiktok"
                                ? "#F3F4F6"
                                : "#ECFDF5",
                            color:
                              c.source_platform === "instagram"
                                ? "#DB2777"
                                : c.source_platform === "tiktok"
                                ? "#111827"
                                : "#059669",
                          }}
                        >
                          {c.source_platform}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--color-text-secondary)" }}>
                        {c.instagram_username || c.tiktok_username || "—"}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                        {c.orders_count || 1} {language === "ar" ? "طلب(ات)" : "order(s)"}
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: isRTL ? "left" : "right" }}>
                        <a
                          href={`https://wa.me/${wa.replace(/\+/g, "").replace(/\s/g, "")}?text=${encodeURIComponent(
                            language === "ar"
                              ? `أهلاً ${c.name}، معك متجر ديدو ستور بخصوص تشكيلات شي إن المميزة!`
                              : `Hello ${c.name}, this is Dido Store regarding our latest SHEIN arrivals!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            backgroundColor: "#ECFDF5",
                            color: "#059669",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>{language === "ar" ? "محادثة" : "Chat"}</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 24px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                {language === "ar" ? "تسجيل عميل جديد" : "Register New Customer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  {language === "ar" ? "اسم العميل *" : "Customer Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salma Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  {language === "ar" ? "رقم الهاتف في مصر *" : "Phone Number (Egypt) *"}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  {language === "ar" ? "رقم الواتساب (اتركه فارغاً إذا كان نفس الرقم)" : "WhatsApp Number (Leave empty if same)"}
                </label>
                <input
                  type="tel"
                  placeholder="010XXXXXXXX"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  {language === "ar" ? "منصة التواصل" : "Discovery Platform"}
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "#fff", fontSize: "0.875rem" }}
                >
                  <option value="instagram">{language === "ar" ? "إنستغرام" : "Instagram"}</option>
                  <option value="tiktok">{language === "ar" ? "تيك توك" : "TikTok"}</option>
                  <option value="whatsapp">{language === "ar" ? "واتساب / ترشيح" : "WhatsApp / Referral"}</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  {language === "ar" ? "اسم الحساب (اختياري)" : "Social Username (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.875rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-accent)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  {language === "ar" ? "حفظ العميل" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
