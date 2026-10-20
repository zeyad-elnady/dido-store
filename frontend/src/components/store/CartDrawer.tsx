"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { X, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { storageUrl } from "@/lib/api";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (!isCartOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: isRTL ? "8px 0 25px rgba(0,0,0,0.15)" : "-8px 0 25px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          animation: isRTL ? "slideInLeft 0.3s ease-out forwards" : "slideInRight 0.3s ease-out forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
              {t("cart_title")} ({totalItems})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              borderRadius: "50%",
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-bg-alt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--color-text-muted)",
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <p style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                {t("cart_empty_title")}
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                {t("cart_empty_desc")}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {t("cart_continue_shopping")}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {items.map((item, index) => {
                const primaryImage =
                  item.product.images?.find((img) => img.is_primary)?.image_path ||
                  item.product.images?.[0]?.image_path ||
                  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300";
                const unitPrice = item.product.discount_price ?? item.product.selling_price;

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                    style={{
                      display: "flex",
                      gap: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid var(--color-border-light)",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "100px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "#f5f5f5",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={storageUrl(primaryImage)}
                        alt={localize(item.product, "name")}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <h4
                            style={{
                              fontSize: "0.9375rem",
                              fontWeight: 600,
                              color: "var(--color-text)",
                              lineHeight: 1.3,
                              margin: 0,
                            }}
                          >
                            {localize(item.product, "name")}
                          </h4>
                          <button
                            onClick={() => removeFromCart(index)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
                              padding: "2px",
                            }}
                            title={t("cart_remove")}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "6px", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                          <span>{language === "ar" ? "المقاس" : "Size"}: <strong>{item.size}</strong></span>
                          <span>•</span>
                          <span>{language === "ar" ? "اللون" : "Color"}: <strong>{item.color}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                        {/* Quantity Controls */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid var(--color-border)",
                            borderRadius: "6px",
                            overflow: "hidden",
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            style={{
                              padding: "4px 10px",
                              background: "var(--color-bg-alt)",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            -
                          </button>
                          <span style={{ padding: "4px 12px", fontSize: "0.875rem", fontWeight: 500 }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            style={{
                              padding: "4px 10px",
                              background: "var(--color-bg-alt)",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.9375rem" }}>
                          {formatPriceLocal(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-alt)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
                {t("cart_subtotal")}
              </span>
              <span style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text)" }}>
                {formatPriceLocal(subtotal)}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
              {t("cart_deposit_info")}
            </p>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "var(--color-accent)",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9375rem",
                transition: "background 0.2s",
              }}
            >
              <span>{t("cart_checkout_btn")}</span>
              <ArrowIcon size={18} />
            </Link>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
