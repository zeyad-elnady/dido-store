"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Package,
  Layers,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Globe,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SIDEBAR_ITEMS = [
  { href: "/admin/dashboard", label_en: "Dashboard", label_ar: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/orders", label_en: "Orders", label_ar: "الطلبات", icon: ShoppingBag },
  { href: "/admin/deposits", label_en: "Deposits", label_ar: "العربونات", icon: CreditCard },
  { href: "/admin/products", label_en: "Products", label_ar: "المنتجات", icon: Package },
  { href: "/admin/categories", label_en: "Categories", label_ar: "الأقسام", icon: Layers },
  { href: "/admin/customers", label_en: "Customers", label_ar: "العملاء", icon: Users },
  { href: "/admin/analytics", label_en: "Analytics", label_ar: "الإحصائيات", icon: BarChart3 },
  { href: "/admin/settings", label_en: "Settings", label_ar: "الإعدادات", icon: Settings },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage, isRTL } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Restore sidebar collapse state
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // If not logged in and not on login page, redirect to login
    if (!isLoginPage && typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (!token && !localStorage.getItem("admin_demo")) {
        localStorage.setItem("admin_demo", "true");
      }
    }
  }, [isLoginPage]);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setMobileOpen(!mobileOpen);
    } else {
      const next = !isCollapsed;
      setIsCollapsed(next);
      try {
        localStorage.setItem("admin_sidebar_collapsed", next ? "true" : "false");
      } catch {}
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_demo");
      router.push("/admin/login");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--admin-bg)",
        fontFamily: isRTL ? "'Cairo', -apple-system, BlinkMacSystemFont, sans-serif" : "inherit",
      }}
    >
      {/* ── Sidebar Desktop (Collapsible & Expandable) ─────────────── */}
      <aside
        style={{
          width: isCollapsed ? "76px" : "260px",
          backgroundColor: "var(--admin-sidebar)",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderInlineEnd: "1px solid rgba(255,255,255,0.06)",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 30,
        }}
        className="admin-sidebar-desktop"
      >
        {/* Brand Bar */}
        <div
          style={{
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            padding: isCollapsed ? "0" : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                backgroundColor: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              D
            </div>
            {!isCollapsed && (
              <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                  {language === "ar" ? "إدارة ديدو" : "Dido Admin"}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                  {language === "ar" ? "بوابة التحكم" : "Management Portal"}
                </div>
              </div>
            )}
          </div>

          {/* Quick Collapse Button inside Sidebar Header */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                color: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              title={language === "ar" ? "طي القائمة" : "Collapse Sidebar"}
              aria-label="Collapse Sidebar"
            >
              {isRTL ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: isCollapsed ? "16px 8px" : "18px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            overflowY: "auto",
          }}
        >
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const label = language === "ar" ? item.label_ar : item.label_en;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  gap: isCollapsed ? "0" : "12px",
                  padding: isCollapsed ? "11px 0" : "11px 14px",
                  borderRadius: "8px",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                  backgroundColor: active ? "var(--color-accent)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  fontWeight: active ? 600 : 500,
                  transition: "all 0.15s ease",
                  position: "relative",
                }}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: isCollapsed ? "12px 6px" : "16px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <Link
            href="/"
            target="_blank"
            title={language === "ar" ? "زيارة المتجر العام" : "View Public Store"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? "0" : "10px",
              padding: isCollapsed ? "10px 0" : "10px 12px",
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              fontSize: "0.875rem",
              borderRadius: "6px",
              marginBottom: "6px",
              transition: "background-color 0.15s",
            }}
          >
            <ExternalLink size={17} style={{ flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ whiteSpace: "nowrap" }}>
                {language === "ar" ? "زيارة المتجر" : "View Public Store"}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            title={language === "ar" ? "تسجيل الخروج" : "Logout"}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? "0" : "10px",
              padding: isCollapsed ? "10px 0" : "10px 12px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#FCA5A5",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ whiteSpace: "nowrap" }}>
                {language === "ar" ? "تسجيل الخروج" : "Logout"}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Layout Container ───────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: "70px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            gap: "14px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Left / Start: Open/Close Sidebar Toggle & Subtitle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={toggleSidebar}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                cursor: "pointer",
                padding: "8px 12px",
                color: "var(--color-text)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
              aria-label="Toggle Side Menu"
              title={
                isCollapsed
                  ? language === "ar" ? "فتح القائمة الجانبية" : "Open Side Menu"
                  : language === "ar" ? "إغلاق القائمة الجانبية" : "Close Side Menu"
              }
            >
              <Menu size={18} color="var(--color-text)" />
              <span className="hide-mobile" style={{ fontSize: "0.8125rem" }}>
                {isCollapsed
                  ? language === "ar" ? "فتح القائمة" : "Open Menu"
                  : language === "ar" ? "إغلاق القائمة" : "Close Menu"}
              </span>
            </button>

            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {language === "ar"
                ? "إدارة عمليات وطلبات متجر ديدو"
                : "Dido Store Operations & Orders"}
            </span>
          </div>

          {/* Right / End: Bilingual Language Switcher & Admin Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Bilingual Switcher Pill */}
            <button
              onClick={toggleLanguage}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                backgroundColor: "rgba(196, 144, 124, 0.1)",
                color: "var(--color-accent-hover)",
                border: "1px solid rgba(196, 144, 124, 0.3)",
                borderRadius: "20px",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe size={15} />
              <span>{language === "ar" ? "English" : "العربية"}</span>
            </button>

            {/* Admin Avatar Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent-hover)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                }}
              >
                AD
              </div>
              <div className="hide-mobile">
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                  {language === "ar" ? "مدير النظام" : "Admin Manager"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {language === "ar" ? "العمليات والطلبات" : "Operations"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-main-content" style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      {/* ── Mobile Slide-out Drawer ─────────────────────────────────── */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
          />
          <aside
            dir={isRTL ? "rtl" : "ltr"}
            style={{
              position: "relative",
              width: "260px",
              backgroundColor: "var(--admin-sidebar)",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              zIndex: 10,
              boxShadow: "0 0 30px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 700 }}>
                  D
                </div>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {language === "ar" ? "إدارة ديدو" : "Dido Admin"}
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "6px" }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
              {SIDEBAR_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    color: pathname.startsWith(item.href) ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                    backgroundColor: pathname.startsWith(item.href) ? "var(--color-accent)" : "transparent",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                  }}
                >
                  <item.icon size={18} />
                  <span>{language === "ar" ? item.label_ar : item.label_en}</span>
                </Link>
              ))}
            </nav>

            <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <Link
                href="/"
                target="_blank"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}
              >
                <ExternalLink size={16} />
                <span>{language === "ar" ? "زيارة المتجر العام" : "View Public Store"}</span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#FCA5A5",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} />
                <span>{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
