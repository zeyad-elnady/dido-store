"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Tag, Sparkles, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { Product } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        if (res.data?.data) {
          const onSale = res.data.data.filter(
            (p: Product) => p.discount_price !== null && p.discount_price < p.selling_price
          );
          setProducts(onSale.length > 0 ? onSale : MOCK_PRODUCTS.filter((p) => p.discount_price !== null));
        }
      })
      .catch(() => {
        setProducts(MOCK_PRODUCTS.filter((p) => p.discount_price !== null));
      });
  }, []);

  return (
    <div className="offers-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Banner */}
      <div
        className="offers-banner-box"
        style={{
          backgroundColor: "#1C1C1E",
          color: "#FFFFFF",
          borderRadius: "20px",
          padding: "50px 36px",
          marginBottom: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            backgroundColor: "rgba(196, 144, 124, 0.2)",
            color: "var(--color-accent)",
            borderRadius: "30px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: isRTL ? 0 : "0.08em",
          }}
        >
          <Sparkles size={14} />
          <span>{t("offers_badge")}</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {t("offers_title")}
        </h1>

        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.0625rem", maxWidth: "600px", lineHeight: 1.7 }}>
          {t("offers_subtitle")}
        </p>
      </div>

      {/* Grid */}
      <div className="products-responsive-grid">
        {products.map((product) => {
          const primaryImg =
            product.images?.find((img) => img.is_primary)?.image_path ||
            product.images?.[0]?.image_path ||
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800";
          const discountPercent =
            product.discount_percentage ||
            (product.discount_price
              ? Math.round(((product.selling_price - product.discount_price) / product.selling_price) * 100)
              : 15);

          return (
            <div
              key={product.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid var(--color-border-light)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="product-card-image"
                style={{
                  position: "relative",
                  height: "340px",
                  overflow: "hidden",
                  display: "block",
                  backgroundColor: "#f7f7f7",
                }}
              >
                <img
                  src={primaryImg}
                  alt={localize(product, "name")}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    [isRTL ? "right" : "left"]: "12px",
                    backgroundColor: "var(--color-danger)",
                    color: "#FFFFFF",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {language === "ar" ? `خصم ${discountPercent}%` : `SAVE ${discountPercent}%`}
                </span>

                <span
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    [isRTL ? "left" : "right"]: "12px",
                    backgroundColor: "rgba(0,0,0,0.65)",
                    color: "#FFFFFF",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                  }}
                >
                  SHEIN
                </span>
              </Link>

              <div className="product-card-body" style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <Link
                  href={`/products/${product.slug}`}
                  style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                >
                  <h3
                    className="product-card-title"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      marginBottom: "8px",
                      lineHeight: 1.4,
                    }}
                  >
                    {localize(product, "name")}
                  </h3>
                </Link>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "auto",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--color-border-light)",
                  }}
                >
                  <div>
                    <div className="product-card-price" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-danger)" }}>
                      {formatPriceLocal(product.discount_price || product.selling_price)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-muted)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPriceLocal(product.selling_price)}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="product-card-add-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "var(--color-accent-light)",
                      color: "var(--color-accent-hover)",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>{t("add_to_cart")}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          :global(.offers-container) {
            padding: 24px 16px 60px !important;
          }
          :global(.offers-banner-box) {
            padding: 32px 18px !important;
            margin-bottom: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}
