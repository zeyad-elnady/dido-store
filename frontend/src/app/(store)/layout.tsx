"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  Phone,
  Search,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Globe,
} from "lucide-react";
import api from "@/lib/api";
import type { PublicSettings } from "@/types";
import { CartProvider, useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import CartDrawer from "@/components/store/CartDrawer";
import StorePolicyModal from "@/components/store/StorePolicyModal";
import { MOCK_SETTINGS } from "@/lib/mockData";

const CartBadge = dynamic(() => import("@/components/store/CartBadge"), {
  ssr: false,
});

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.84a8.27 8.27 0 0 0 4.89 1.59V7c-.34 0-.68-.1-1-.31z" />
    </svg>
  );
}

function StoreHeaderAndContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<PublicSettings>(MOCK_SETTINGS);
  const { totalItems, setIsCartOpen, mounted } = useCart();
  const { language, toggleLanguage, t, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    api
      .get("/settings/public")
      .then((r) => {
        if (r.data) setSettings(r.data);
      })
      .catch(() => {
        // Fallback to mock settings
      });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: t("nav_home") },
    { href: "/products", label: t("nav_catalog") },
    { href: "/offers", label: t("nav_offers") },
    { href: "/order-tracking", label: t("nav_tracking") },
  ];

  const whatsappNumber =
    settings.contact?.whatsapp_number?.replace(/\+/g, "").replace(/\s/g, "") ||
    "201023402591";

  const instagramUrl =
    settings.contact?.instagram_url ||
    "https://www.instagram.com/bydido.studio?dlrf=ZmMyeW41cHBvd3Y5";

  const tiktokUrl =
    settings.contact?.tiktok_url ||
    "https://www.tiktok.com/@didos.studio?_r=1&_t=ZS-9Aim7g6jSsB";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "clip",
      }}
    >
      {/* Top Announcement Bar */}
      <div
        style={{
          backgroundColor: "#1A1A1A",
          color: "#F5ECE8",
          fontSize: "0.75rem",
          fontWeight: 500,
          padding: "7px 12px",
          textAlign: "center",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t("announcement_text_1")}
        </span>
        <span className="hide-mobile" style={{ opacity: 0.6 }}>|</span>
        <span className="hide-mobile" style={{ color: "#E8C2B3" }}>{t("announcement_text_2")}</span>
      </div>

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          transition: "all 0.3s ease",
          background: scrolled ? "rgba(255,255,255,0.96)" : "#FFFFFF",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-light)",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div
          className="store-header-container"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              className="store-logo-text"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Dido Store
            </span>
            <span
              style={{
                fontSize: "0.5625rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--color-accent)",
                fontWeight: 600,
              }}
            >
              SHEIN • Egypt
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "36px",
            }}
            className="hide-mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: pathname === link.href ? 600 : 500,
                  color:
                    pathname === link.href
                      ? "var(--color-accent)"
                      : "var(--color-text)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  position: "relative",
                  padding: "6px 0",
                }}
              >
                {link.label}
                {pathname === link.href && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "var(--color-accent)",
                      borderRadius: "1px",
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(196, 144, 124, 0.12)",
                color: "var(--color-accent-hover)",
                border: "1px solid rgba(196, 144, 124, 0.3)",
                borderRadius: "20px",
                padding: "5px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              aria-label="Switch Language"
              title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
            >
              <Globe size={14} />
              <span className="desktop-lang">{t("language_toggle")}</span>
              <span className="mobile-lang">{language === "en" ? "عربي" : "EN"}</span>
            </button>

            <Link
              href="/products"
              style={{
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
                padding: "6px",
                borderRadius: "50%",
              }}
              aria-label="Search products"
            >
              <Search size={20} />
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                color: "var(--color-text)",
              }}
              aria-label="View Shopping Bag"
              suppressHydrationWarning
            >
              <ShoppingBag size={21} />
              <CartBadge />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                display: "flex",
                padding: "6px",
              }}
              className="show-mobile"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer with Backdrop */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                top: "68px",
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: 48,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "68px",
                left: 0,
                right: 0,
                background: "#FFFFFF",
                borderBottom: "1px solid var(--color-border)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                padding: "16px 20px 24px",
                zIndex: 49,
                animation: "slideUp 0.25s ease",
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 0",
                    fontSize: "1rem",
                    fontWeight: pathname === link.href ? 700 : 500,
                    color:
                      pathname === link.href
                        ? "var(--color-accent)"
                        : "var(--color-text)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--color-border-light)",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ marginTop: "16px", paddingTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  onClick={toggleLanguage}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(196, 144, 124, 0.12)",
                    color: "var(--color-accent-hover)",
                    border: "1px solid rgba(196, 144, 124, 0.3)",
                    borderRadius: "20px",
                    padding: "7px 14px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Globe size={15} />
                  <span>{t("language_toggle")}</span>
                </button>

                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  Admin Portal →
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          language === "ar"
            ? "مرحباً ديدو ستور، أود الاستفسار عن تفاصيل طلب!"
            : "Hello Dido Store, I have an inquiry about an order!"
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="whatsapp-floating-btn"
        style={{
          position: "fixed",
          bottom: "24px",
          right: isRTL ? "auto" : "20px",
          left: isRTL ? "20px" : "auto",
          backgroundColor: "#25D366",
          color: "#ffffff",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
          zIndex: 45,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          textDecoration: "none",
        }}
        title="Chat on WhatsApp"
      >
        <MessageCircle size={30} />
      </a>

      {/* Policy Modal & Cart Drawer Component */}
      <StorePolicyModal />
      <CartDrawer />

      {/* Footer */}
      <footer
        style={{
          background: "#181818",
          color: "rgba(255,255,255,0.7)",
          padding: "70px 24px 32px",
          borderTop: "1px solid #282828",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "48px",
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: "460px" }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "16px",
              }}
            >
              {t("brand_name")}
            </h3>
            <p
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.75)",
                marginBottom: "20px",
              }}
            >
              {t("footer_about_text")}
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  transition: "all 0.2s",
                }}
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
              </a>

              {/* TikTok */}
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  transition: "all 0.2s",
                }}
                aria-label="TikTok"
              >
                <TikTokIcon size={19} />
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  transition: "all 0.2s",
                }}
                aria-label="WhatsApp"
              >
                <Phone size={19} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#FFFFFF",
                marginBottom: "20px",
              }}
            >
              {t("footer_links_title")}
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("dido:open-policy"));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  textAlign: "start",
                  fontFamily: "inherit",
                  transition: "color 0.2s",
                }}
              >
                {language === "ar" ? "شروط وسياسة المتجر" : "Store Policy"}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & language switcher */}
        <div
          style={{
            maxWidth: "1280px",
            margin: "50px auto 0",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <div>{t("footer_rights")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span>{t("footer_governorates")}</span>
            <button
              onClick={toggleLanguage}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "14px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              <Globe size={13} />
              <span>{t("language_toggle")}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global CSS for Mobile Nav */}
      <style jsx global>{`
        .hide-mobile {
          display: flex !important;
        }
        .show-mobile {
          display: none !important;
        }
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <StoreHeaderAndContent>{children}</StoreHeaderAndContent>
      </Suspense>
    </CartProvider>
  );
}
