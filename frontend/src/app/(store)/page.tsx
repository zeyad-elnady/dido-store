"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Maximize2,
  X,
} from "lucide-react";
import api, { storageUrl } from "@/lib/api";
import { Category, Product, FounderProfile } from "@/types";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_FOUNDER } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
  "dresses-gowns": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
  "tops-blouses": "https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80",
  "pants-jeans": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
  "abayas-modest": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
  "modest-fashion": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
  "accessories": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
  "bags-accessories": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
  "bags": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
  "blazers-co-ords": "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80",
};

function getCategoryImageUrl(cat: Category): string {
  if (cat.image_path) {
    return storageUrl(cat.image_path);
  }
  if (cat.slug && CATEGORY_FALLBACK_IMAGES[cat.slug]) {
    return CATEGORY_FALLBACK_IMAGES[cat.slug];
  }
  return "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80";
}

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [founder, setFounder] = useState<FounderProfile>(MOCK_FOUNDER);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    // Fetch categories
    api
      .get("/categories")
      .then((res) => {
        const cats = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch(() => {});

    // Fetch products
    api
      .get("/products?limit=8")
      .then((res) => {
        const prods = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (prods.length > 0) {
          setProducts(prods);
        }
      })
      .catch(() => {});

    // Fetch founder
    api
      .get("/founder")
      .then((res) => {
        if (res.data) setFounder(res.data);
      })
      .catch(() => {});
  }, []);

  const featuredProducts = products.slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "80px", paddingBottom: "80px" }} suppressHydrationWarning>
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section
        className="hero-section-box"
        style={{
          position: "relative",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#F4F0EB",
          overflow: "hidden",
        }}
      >
        {/* Background Image / Split Backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            opacity: 0.95,
          }}
        >
          <div style={{ backgroundColor: "#FAF7F2" }} />
          <div
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isRTL
              ? "linear-gradient(270deg, rgba(250,247,242,0.98) 0%, rgba(250,247,242,0.85) 50%, rgba(250,247,242,0.2) 100%)"
              : "linear-gradient(90deg, rgba(250,247,242,0.98) 0%, rgba(250,247,242,0.85) 50%, rgba(250,247,242,0.2) 100%)",
          }}
        />

        <div
          className="hero-content-padding"
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "60px 24px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: "640px" }}>
            {/* Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                backgroundColor: "#FFFFFF",
                borderRadius: "30px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-accent)",
                textTransform: "uppercase",
                letterSpacing: isRTL ? 0 : "0.08em",
                marginBottom: "24px",
              }}
            >
              <Sparkles size={14} />
              <span>{t("hero_badge")}</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#181818",
                letterSpacing: isRTL ? 0 : "-0.02em",
                marginBottom: "20px",
              }}
            >
              {t("hero_title_1")}
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
                marginBottom: "36px",
              }}
            >
              {t("hero_subtitle")}
            </p>

            {/* CTAs */}
            <div className="hero-cta-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <Link
                href="/products"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "16px 32px",
                  backgroundColor: "var(--color-text)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                <span>{t("hero_cta_shop")}</span>
                <ArrowIcon size={18} />
              </Link>

              <Link
                href="/order-tracking"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 28px",
                  backgroundColor: "#FFFFFF",
                  color: "var(--color-text)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textDecoration: "none",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <span>{t("hero_cta_track")}</span>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div
              className="trust-metrics-box"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginTop: "48px",
                paddingTop: "32px",
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div>
                <div className="trust-metrics-number" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)" }}>100%</div>
                <div className="trust-metrics-text" style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                  {language === "ar" ? "أصلي من شي إن" : "Authentic SHEIN"}
                </div>
              </div>
              <div>
                <div className="trust-metrics-number" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)" }}>50%</div>
                <div className="trust-metrics-text" style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                  {language === "ar" ? "عربون إنستاباي / كاش" : "Down-Payment"}
                </div>
              </div>
              <div>
                <div className="trust-metrics-number" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)" }}>
                  {language === "ar" ? "27 محافظة" : "All Governorates"}
                </div>
                <div className="trust-metrics-text" style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                  {language === "ar" ? "توصيل لباب بيتك" : "Doorstep Delivery"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. How Dido Store Works ──────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "12px", color: "var(--color-text)" }}>
            {language === "ar" ? "كيف يعمل التسوق معنا؟" : "How Shopping Works"}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            {language === "ar"
              ? "خطوات بسيطة ومضمونة من اختيار الموديل وحتى استلامه عند بابك."
              : "Simple, safe, and transparent. Three easy steps from browsing to delivery."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "28px",
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "36px 28px",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--color-accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-accent)" }}>
              {language === "ar" ? "الخطوة الأولى" : "Step 01"}
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text)" }}>
              {t("feature_shein_title")}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {t("feature_shein_desc")}
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "36px 28px",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--color-accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
              }}
            >
              <CreditCard size={24} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-accent)" }}>
              {language === "ar" ? "الخطوة الثانية" : "Step 02"}
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text)" }}>
              {t("feature_deposit_title")}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {t("feature_deposit_desc")}
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "36px 28px",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "var(--color-accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
              }}
            >
              <Truck size={24} />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-accent)" }}>
              {language === "ar" ? "الخطوة الثالثة" : "Step 03"}
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text)" }}>
              {t("feature_delivery_title")}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {t("feature_delivery_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Featured Categories — Simple & Premium ─────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "8px" }}>
              {t("categories_title")}
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
              {t("categories_subtitle")}
            </p>
          </div>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--color-accent)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            <span>{t("view_all_categories")}</span>
            <ArrowIcon size={16} />
          </Link>
        </div>

        {/* Clean Luxury Category Showcase */}
        <div className="categories-luxury-grid">
          {categories
            .filter((cat) => cat.is_active !== false)
            .map((cat) => {
              const imgSrc = getCategoryImageUrl(cat);
              const itemCount = cat.products_count ?? 0;

              return (
                <Link
                  key={cat.id || cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="category-luxury-card group"
                >
                  <img
                    src={imgSrc}
                    alt={localize(cat, "name")}
                    loading="lazy"
                  />

                  <div className="category-luxury-overlay">
                    <h3 className="category-luxury-title">
                      {localize(cat, "name")}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "4px",
                      }}
                    >
                      <span className="category-luxury-subtitle">
                        {itemCount > 0
                          ? `${itemCount} ${language === "ar" ? "منتج" : "items"}`
                          : language === "ar"
                          ? "تسوقي الآن"
                          : "Explore"}
                      </span>
                      <span className="category-luxury-arrow">
                        <ArrowIcon size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* ── 4. Trending & New Arrivals ──────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "8px" }}>
              {t("featured_title")}
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
              {t("featured_subtitle")}
            </p>
          </div>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--color-accent)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            <span>{t("view_all_categories")}</span>
            <ArrowIcon size={16} />
          </Link>
        </div>

        <div className="products-responsive-grid">
          {featuredProducts.map((product) => {
            const primaryImg =
              product.images?.find((img) => img.is_primary)?.image_path ||
              product.images?.[0]?.image_path ||
              "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800";
            const effectivePrice = product.discount_price ?? product.selling_price;
            const hasDiscount = product.discount_price !== null && product.discount_price < product.selling_price;

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
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Image Container */}
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
                    src={storageUrl(primaryImg)}
                    alt={localize(product, "name")}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                  />

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <span
                      style={{
                        position: "absolute",
                        top: "14px",
                        [isRTL ? "right" : "left"]: "14px",
                        backgroundColor: "var(--color-accent)",
                        color: "#FFFFFF",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {t("sale_badge")}
                    </span>
                  )}

                  {/* Sourced from SHEIN watermark badge */}
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
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    SHEIN
                  </span>
                </Link>

                {/* Content */}
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

                  {/* Sizes Available */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                      {product.sizes.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: "0.6875rem",
                            padding: "2px 7px",
                            backgroundColor: "var(--color-bg-alt)",
                            borderRadius: "4px",
                            color: "var(--color-text-secondary)",
                            fontWeight: 500,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price Row & Add Button */}
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
                      <div className="product-card-price" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)" }}>
                        {formatPriceLocal(effectivePrice)}
                      </div>
                      {hasDiscount && (
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-muted)",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatPriceLocal(product.selling_price)}
                        </div>
                      )}
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
                        transition: "all 0.2s",
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
      </section>

      {/* ── 5. Special Offer Banner ─────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div
          style={{
            position: "relative",
            borderRadius: "20px",
            backgroundColor: "#202022",
            overflow: "hidden",
            color: "#FFFFFF",
            padding: "60px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
          className="banner-grid"
        >
          <div style={{ zIndex: 10 }}>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: isRTL ? 0 : "0.1em",
                color: "var(--color-accent)",
                marginBottom: "12px",
                display: "block",
              }}
            >
              {t("offers_badge")}
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: "16px",
                color: "#FFFFFF",
              }}
            >
              {t("offers_title")}
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.75)",
                marginBottom: "28px",
                lineHeight: 1.7,
              }}
            >
              {t("offers_subtitle")}
            </p>
            <Link
              href="/offers"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                backgroundColor: "var(--color-accent)",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
              }}
            >
              <span>{language === "ar" ? "تصفحي جميع العروض" : "Explore All Offers"}</span>
              <ArrowIcon size={16} />
            </Link>
          </div>

          <div
            className="banner-image-box"
            style={{
              position: "relative",
              height: "380px",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1000&auto=format&fit=crop&q=80"
              alt="Special Offers"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* ── 6. Founder / About Dido Store ────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            border: "1px solid var(--color-border-light)",
            padding: "48px 44px",
            display: "grid",
            gridTemplateColumns: "390px 1fr",
            gap: "52px",
            alignItems: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
          }}
          className="founder-grid"
        >
          {/* ── Editorial Poster Card Matching Reference Exactly ──────── */}
          <div
            className="founder-poster-card"
            style={{
              backgroundColor: "#EFEBE3",
              borderRadius: "26px",
              padding: "36px 24px 20px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 14px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Typographic Title matching reference exactly */}
            <div
              style={{
                textAlign: "center",
                width: "100%",
                marginBottom: "22px",
                lineHeight: 0.88,
              }}
            >
              <div
                style={{
                  fontFamily: "'Cabinet Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(2.3rem, 4.8vw, 3.2rem)",
                  color: "#161616",
                  textTransform: "uppercase",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.88,
                }}
              >
                MEET THE<br />OWNER
              </div>
            </div>

            {/* Photo Container with Reference Architectural Corner Brackets */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "320px",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              {/* Left Architectural Corner Bracket (Bottom-Left └) */}
              <div
                style={{
                  position: "absolute",
                  left: "-12px",
                  bottom: "64px",
                  width: "34px",
                  height: "34px",
                  borderLeft: "2px solid #222222",
                  borderBottom: "2px solid #222222",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              {/* Right Architectural Corner Bracket (Top-Right ┐) */}
              <div
                style={{
                  position: "absolute",
                  right: "-12px",
                  bottom: "64px",
                  width: "34px",
                  height: "34px",
                  borderRight: "2px solid #222222",
                  borderTop: "2px solid #222222",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              {/* The B&W Founder Portrait Image */}
              <div
                onClick={() => setIsPhotoModalOpen(true)}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "390px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  backgroundColor: "#DDD7CB",
                  cursor: "pointer",
                }}
                title={language === "ar" ? "اضغطي لتكبير الصورة" : "Click to view full photo"}
              >
                <img
                  src={founder.photo_path || "/dalia-founder.jpg"}
                  alt="Dalia — Owner of Dido Store"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 20%",
                    filter: "grayscale(100%) contrast(1.06) brightness(1.02)",
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>

              {/* Floating Expand Icon Button (Bottom Right) */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                aria-label={language === "ar" ? "تكبير الصورة" : "Expand photo"}
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "14px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.94)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#161616",
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
                  zIndex: 3,
                  transition: "transform 0.2s ease, background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Maximize2 size={19} strokeWidth={2.2} />
              </button>
            </div>

            {/* Hairline Divider and Bottom Editorial Metadata */}
            <div
              style={{
                width: "100%",
                marginTop: "20px",
                borderTop: "1px solid rgba(0, 0, 0, 0.14)",
                paddingTop: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#2C2C2C",
              }}
            >
              <span>{language === "ar" ? "داليا (ديدو)" : "DALIA (DIDO)"}</span>
              <span style={{ opacity: 0.45 }}>•</span>
              <span>{language === "ar" ? "صاحبة المتجر" : "OWNER"}</span>
              <span style={{ opacity: 0.45 }}>•</span>
              <span>{language === "ar" ? "القاهرة" : "CAIRO"}</span>
            </div>
          </div>

          {/* ── Right Column: Editorial Copy in Third Person ──────────── */}
          <div>
            {/* Pill Badge: MEET THE OWNER */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 16px",
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent-hover)",
                borderRadius: "30px",
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: isRTL ? 0 : "0.08em",
                marginBottom: "18px",
              }}
            >
              <Sparkles size={14} />
              <span>{language === "ar" ? "تعرفي على صاحبة المتجر" : "MEET THE OWNER"}</span>
            </div>

            {/* Editorial Heading */}
            <h2
              style={{
                fontSize: "clamp(2rem, 3.4vw, 2.6rem)",
                fontWeight: 800,
                marginBottom: "20px",
                color: "var(--color-text)",
                lineHeight: 1.24,
                letterSpacing: isRTL ? 0 : "-0.02em",
              }}
            >
              {language === "ar"
                ? "شغف حقيقي بالموضة وُلد من قلب القاهرة"
                : "A True Passion for Fashion Born in the Heart of Cairo"}
            </h2>

            {/* Third-Person Bio */}
            <p
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.85,
                color: "var(--color-text-secondary)",
                marginBottom: "24px",
              }}
            >
              {localize(founder, "bio")}
            </p>

            {/* Editorial Quote Box (Third-Person Attributed) */}
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "#FAF7F2",
                borderLeft: isRTL ? "none" : "4px solid var(--color-accent)",
                borderRight: isRTL ? "4px solid var(--color-accent)" : "none",
                borderRadius: "12px",
                marginBottom: "24px",
                fontStyle: "italic",
                color: "var(--color-text)",
                fontSize: "0.9375rem",
                lineHeight: 1.6,
              }}
            >
              {language === "ar"
                ? "«تختار داليا أرقى تصاميم شي إن العالمية لتتألق كل فتاة في مصر بأناقة وثقة، وبأسهل تجربة دفع وشحن محلي.»"
                : "“Dalia curates authentic global styles so every woman in Egypt can dress effortlessly chic—freed from currency limits and import delays.”"}
            </div>

            {/* Value Highlights Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "26px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  backgroundColor: "#F7F5F0",
                  borderRadius: "10px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <CheckCircle2 size={15} color="var(--color-accent)" />
                <span>{language === "ar" ? "صاحبة المتجر • ديدو ستور" : "Store Owner • Dido Store"}</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  backgroundColor: "#F7F5F0",
                  borderRadius: "10px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <ShieldCheck size={15} color="var(--color-accent)" />
                <span>{language === "ar" ? "قطع شي إن أصلية 100%" : "100% Authentic SHEIN"}</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  backgroundColor: "#F7F5F0",
                  borderRadius: "10px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <Truck size={15} color="var(--color-accent)" />
                <span>{language === "ar" ? "شحن مضمون لـ 27 محافظة" : "Shipping across 27 Governorates"}</span>
              </div>
            </div>

            {/* Founder Signature & Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text)" }}>
                  {localize(founder, "founder_name")}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-accent)", fontWeight: 600, marginTop: "2px" }}>
                  {language === "ar" ? "صاحبة متجر ديدو مصر" : "Owner, Dido Store Egypt"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── High-Resolution Lightbox Modal for Founder Reference Poster ──── */}
      {isPhotoModalOpen && (
        <div
          onClick={() => setIsPhotoModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "#EFEBE3",
              borderRadius: "26px",
              padding: "36px 28px 24px 28px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              aria-label={language === "ar" ? "إغلاق" : "Close"}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#161616",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.16)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.08)")}
            >
              <X size={20} />
            </button>

            {/* Poster Header */}
            <div
              style={{
                fontFamily: "'Cabinet Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 900,
                fontSize: "2.4rem",
                color: "#161616",
                textTransform: "uppercase",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                marginBottom: "20px",
              }}
            >
              MEET THE<br />OWNER
            </div>

            {/* High-Res Photo Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "6px",
                overflow: "hidden",
                backgroundColor: "#DDD7CB",
              }}
            >
              <img
                src={founder.photo_path || "/dalia-founder.jpg"}
                alt="Dalia — Owner of Dido Store"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  filter: "grayscale(100%) contrast(1.06) brightness(1.02)",
                }}
              />
            </div>

            {/* Footer Metadata */}
            <div
              style={{
                marginTop: "18px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(0, 0, 0, 0.14)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#2C2C2C",
              }}
            >
              <span>{language === "ar" ? "داليا (ديدو)" : "DALIA (DIDO)"}</span>
              <span style={{ opacity: 0.45 }}>•</span>
              <span>{language === "ar" ? "صاحبة المتجر" : "OWNER"}</span>
              <span style={{ opacity: 0.45 }}>•</span>
              <span>{language === "ar" ? "القاهرة" : "CAIRO"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Responsive adjustments for grids */}
      <style jsx>{`
        @media (max-width: 860px) {
          :global(.banner-grid) {
            grid-template-columns: 1fr !important;
            padding: 32px 20px !important;
          }
          :global(.founder-grid) {
            grid-template-columns: 1fr !important;
            padding: 32px 20px !important;
          }
        }
        @media (max-width: 640px) {
          :global(.founder-poster-card) {
            padding: 24px 16px 16px 16px !important;
          }
          :global(.banner-image-box) {
            height: 220px !important;
          }
        }
      `}</style>
    </div>
  );
}
