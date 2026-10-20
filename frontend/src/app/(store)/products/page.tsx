"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ShoppingBag,
  ArrowUpDown,
  Tag,
  Check,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { Category, Product } from "@/types";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [onlySale, setOnlySale] = useState<boolean>(false);
  const { addToCart } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  useEffect(() => {
    // Fetch categories
    api
      .get("/categories")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});

    // Fetch products
    api
      .get("/products")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      const catObj = categories.find((c) => c.slug === selectedCategory);
      if (catObj) {
        result = result.filter((p) => p.category_id === catObj.id);
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          (p.name_ar && p.name_ar.toLowerCase().includes(q)) ||
          (p.description_en && p.description_en.toLowerCase().includes(q))
      );
    }

    // Only sale items
    if (onlySale) {
      result = result.filter((p) => p.discount_price !== null && p.discount_price < p.selling_price);
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = a.discount_price ?? a.selling_price;
      const priceB = b.discount_price ?? b.selling_price;

      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0; // default featured
    });

    return result;
  }, [products, categories, selectedCategory, searchQuery, onlySale, sortBy]);

  return (
    <div className="catalog-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Title & Description */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "12px",
          }}
        >
          {t("catalog_title")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", maxWidth: "600px", margin: "0 auto" }}>
          {t("catalog_subtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="catalog-filter-bar"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border-light)",
          padding: "20px",
          marginBottom: "36px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "var(--color-bg)",
            borderRadius: "8px",
            padding: "8px 14px",
            flex: "1 1 280px",
            border: "1px solid var(--color-border)",
          }}
        >
          <Search size={18} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder={t("filter_search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              fontSize: "0.9375rem",
              color: "var(--color-text)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
              aria-label="Clear search"
            >
              <X size={16} color="var(--color-text-muted)" />
            </button>
          )}
        </div>

        {/* Sort and Sale Toggle */}
        <div className="filter-controls-group" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Sale Filter Toggle */}
          <button
            onClick={() => setOnlySale(!onlySale)}
            className="filter-sale-btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: onlySale ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
              backgroundColor: onlySale ? "var(--color-accent-light)" : "#FFFFFF",
              color: onlySale ? "var(--color-accent-hover)" : "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Tag size={15} />
            <span>{t("filter_only_sale")}</span>
            {onlySale && <Check size={14} />}
          </button>

          {/* Sort Dropdown */}
          <div className="filter-sort-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SlidersHorizontal size={16} color="var(--color-text-secondary)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFFFFF",
                fontSize: "0.875rem",
                color: "var(--color-text)",
                cursor: "pointer",
                outline: "none",
                width: "100%",
              }}
            >
              <option value="featured">{t("sort_featured")}</option>
              <option value="newest">{t("sort_newest")}</option>
              <option value="price_asc">{t("sort_price_low")}</option>
              <option value="price_desc">{t("sort_price_high")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div
        className="horizontal-touch-scroll"
        style={{
          display: "flex",
          gap: "10px",
          paddingBottom: "16px",
          marginBottom: "28px",
        }}
      >
        <button
          onClick={() => setSelectedCategory("all")}
          style={{
            padding: "8px 20px",
            borderRadius: "30px",
            border: selectedCategory === "all" ? "1px solid var(--color-text)" : "1px solid var(--color-border)",
            backgroundColor: selectedCategory === "all" ? "var(--color-text)" : "#FFFFFF",
            color: selectedCategory === "all" ? "#FFFFFF" : "var(--color-text)",
            fontSize: "0.875rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {t("filter_all")} ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.slug)}
            style={{
              padding: "8px 20px",
              borderRadius: "30px",
              border: selectedCategory === c.slug ? "1px solid var(--color-text)" : "1px solid var(--color-border)",
              backgroundColor: selectedCategory === c.slug ? "var(--color-text)" : "#FFFFFF",
              color: selectedCategory === c.slug ? "#FFFFFF" : "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {localize(c, "name")}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--color-border-light)",
          }}
        >
          <Search size={40} color="var(--color-text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
            {t("no_products_found")}
          </h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: "24px" }}>
            {language === "ar" ? "جربي البحث بكلمات مختلفة أو إزالة تصفيات الأقسام." : "Try adjusting your search terms or clearing category filters."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setOnlySale(false);
            }}
            style={{
              padding: "10px 24px",
              backgroundColor: "var(--color-text)",
              color: "#FFFFFF",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {t("filter_clear")}
          </button>
        </div>
      ) : (
        <div className="products-responsive-grid">
          {filteredProducts.map((product) => {
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
                    src={primaryImg}
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
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          :global(.catalog-container) {
            padding: 24px 16px 60px !important;
          }
          :global(.catalog-filter-bar) {
            padding: 16px !important;
            gap: 12px !important;
          }
          :global(.filter-controls-group) {
            width: 100% !important;
            display: flex !important;
          }
          :global(.filter-sale-btn) {
            flex: 1 !important;
            padding: 8px 10px !important;
            font-size: 0.8125rem !important;
          }
          :global(.filter-sort-wrapper) {
            flex: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh", padding: "60px 24px", textAlign: "center" }}>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
