"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Heart,
  Share2,
  CreditCard,
  MessageCircle,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import api, { storageUrl } from "@/lib/api";
import { Product } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

// Comprehensive luxury fashion color palette mapping
const LUXURY_COLOR_MAP: Record<string, { bg: string; border?: string; isLight?: boolean }> = {
  black: { bg: "#171717" },
  white: { bg: "#ffffff", border: "#e4e4e7", isLight: true },
  "off-white": { bg: "#fafaf9", border: "#e4e4e7", isLight: true },
  cream: { bg: "#fefae0", border: "#e4e4e7", isLight: true },
  beige: { bg: "#e6d7c3" },
  nude: { bg: "#deb887" },
  sand: { bg: "#d7c4b7" },
  tan: { bg: "#c4a482" },
  brown: { bg: "#5c3d2e" },
  chocolate: { bg: "#3e2723" },
  coffee: { bg: "#4a3525" },
  blue: { bg: "#2563eb" },
  "light blue": { bg: "#7dd3fc" },
  "sky blue": { bg: "#38bdf8" },
  "baby blue": { bg: "#bae6fd", isLight: true },
  "royal blue": { bg: "#1d4ed8" },
  navy: { bg: "#0f172a" },
  teal: { bg: "#0d9488" },
  cyan: { bg: "#06b6d4" },
  turquoise: { bg: "#14b8a6" },
  red: { bg: "#dc2626" },
  burgundy: { bg: "#831843" },
  wine: { bg: "#701a75" },
  maroon: { bg: "#4c0519" },
  pink: { bg: "#ec4899" },
  "baby pink": { bg: "#fbcfe8", isLight: true },
  "dusty pink": { bg: "#d4818a" },
  rose: { bg: "#f43f5e" },
  "dusty rose": { bg: "#ba707a" },
  magenta: { bg: "#c026d3" },
  green: { bg: "#16a34a" },
  olive: { bg: "#556b2f" },
  sage: { bg: "#8da38b" },
  emerald: { bg: "#047857" },
  mint: { bg: "#a7f3d0", isLight: true },
  "forest green": { bg: "#14532d" },
  yellow: { bg: "#eab308" },
  mustard: { bg: "#ca8a04" },
  orange: { bg: "#ea580c" },
  coral: { bg: "#fb7185" },
  peach: { bg: "#fbcfe8", isLight: true },
  purple: { bg: "#9333ea" },
  violet: { bg: "#7c3aed" },
  lilac: { bg: "#c084fc" },
  lavender: { bg: "#e9d5ff", isLight: true },
  plum: { bg: "#581c87" },
  gold: { bg: "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)" },
  silver: { bg: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)" },
  grey: { bg: "#64748b" },
  gray: { bg: "#64748b" },
  charcoal: { bg: "#334155" },
  multicolor: { bg: "conic-gradient(from 180deg at 50% 50%, #f472b6, #60a5fa, #34d399, #facc15, #f472b6)" },
  multi: { bg: "conic-gradient(from 180deg at 50% 50%, #f472b6, #60a5fa, #34d399, #facc15, #f472b6)" },
  floral: { bg: "radial-gradient(circle, #f472b6 25%, #60a5fa 55%, #34d399 85%)" },
  print: { bg: "radial-gradient(circle, #f472b6 25%, #60a5fa 55%, #34d399 85%)" },
  pattern: { bg: "radial-gradient(circle, #f472b6 25%, #60a5fa 55%, #34d399 85%)" },

  // Arabic fashion color terms
  "أسود": { bg: "#171717" },
  "اسود": { bg: "#171717" },
  "أبيض": { bg: "#ffffff", border: "#e4e4e7", isLight: true },
  "ابيض": { bg: "#ffffff", border: "#e4e4e7", isLight: true },
  "أوف وايت": { bg: "#fafaf9", border: "#e4e4e7", isLight: true },
  "اوف وايت": { bg: "#fafaf9", border: "#e4e4e7", isLight: true },
  "كريمي": { bg: "#fefae0", border: "#e4e4e7", isLight: true },
  "بيج": { bg: "#e6d7c3" },
  "نيود": { bg: "#deb887" },
  "أزرق": { bg: "#2563eb" },
  "ازرق": { bg: "#2563eb" },
  "كحلي": { bg: "#0f172a" },
  "سماوي": { bg: "#38bdf8" },
  "لبني": { bg: "#7dd3fc" },
  "تركواز": { bg: "#14b8a6" },
  "أحمر": { bg: "#dc2626" },
  "احمر": { bg: "#dc2626" },
  "نبيتي": { bg: "#831843" },
  "بورجوندي": { bg: "#831843" },
  "مارون": { bg: "#4c0519" },
  "وردي": { bg: "#ec4899" },
  "بينك": { bg: "#f472b6" },
  "روز": { bg: "#fb7185" },
  "بودرة": { bg: "#fbcfe8", isLight: true },
  "أخضر": { bg: "#16a34a" },
  "اخضر": { bg: "#16a34a" },
  "زيتي": { bg: "#556b2f" },
  "سيراميك": { bg: "#8da38b" },
  "مينت": { bg: "#a7f3d0", isLight: true },
  "نعناعي": { bg: "#a7f3d0", isLight: true },
  "بني": { bg: "#5c3d2e" },
  "شوكولاتة": { bg: "#3e2723" },
  "بنفسجي": { bg: "#9333ea" },
  "موف": { bg: "#c084fc" },
  "لافندر": { bg: "#e9d5ff", isLight: true },
  "ليلكي": { bg: "#c084fc" },
  "أصفر": { bg: "#eab308" },
  "اصفر": { bg: "#eab308" },
  "مسطردة": { bg: "#ca8a04" },
  "برتقالي": { bg: "#ea580c" },
  "خوخي": { bg: "#fbcfe8", isLight: true },
  "سلمون": { bg: "#fb7185" },
  "ذهبي": { bg: "linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)" },
  "فضي": { bg: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)" },
  "رمادي": { bg: "#64748b" },
  "فحمي": { bg: "#334155" },
  "مشجر": { bg: "radial-gradient(circle, #f472b6 25%, #60a5fa 55%, #34d399 85%)" },
  "متعدد الألوان": { bg: "conic-gradient(from 180deg at 50% 50%, #f472b6, #60a5fa, #34d399, #facc15, #f472b6)" },
  "منقوش": { bg: "radial-gradient(circle, #f472b6 25%, #60a5fa 55%, #34d399 85%)" },
};

function getLuxuryColorStyle(colorName: string): { bg: string; border?: string; isLight?: boolean } {
  if (!colorName) return { bg: "#e2e8f0", border: "#cbd5e1", isLight: true };
  const normalized = colorName.trim().toLowerCase();
  
  if (LUXURY_COLOR_MAP[normalized]) {
    return LUXURY_COLOR_MAP[normalized];
  }
  
  for (const [key, val] of Object.entries(LUXURY_COLOR_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }

  return { bg: "#e2e8f0", border: "#cbd5e1", isLight: true };
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const { addToCart } = useCart();
  const { language, t, localize, formatPriceLocal, isRTL } = useLanguage();

  const ArrowBackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        const p = res.data?.data || res.data;
        if (p && (p.id || p.name_en)) {
          setProduct(p);
          const primaryImg =
            p.images?.find((img: any) => img.is_primary)?.image_path ||
            p.images?.[0]?.image_path ||
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800";
          setSelectedImage(primaryImg);
          if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
          if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0]);
        } else {
          const found = MOCK_PRODUCTS.find((item) => item.slug === slug);
          if (found) {
            setProduct(found);
            setSelectedImage(found.images?.[0]?.image_path || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800");
            if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
            if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load product from API:", err);
        // Fallback to mock product
        const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
        if (found) {
          setProduct(found);
          setSelectedImage(
            found.images?.[0]?.image_path ||
              "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"
          );
          if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
          if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const images = (product?.images && product.images.length > 0)
    ? product.images
    : (selectedImage ? [{ id: 1, product_id: product?.id || 1, image_path: selectedImage, sort_order: 1, is_primary: true }] : []);

  const currentImageIndex = Math.max(0, images.findIndex((img) => img.image_path === selectedImage));

  const handleSelectImage = (img: any, idx: number) => {
    setSelectedImage(img.image_path);
    const el = document.getElementById(`thumbnail-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const showNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    const nextIdx = (currentImageIndex + 1) % images.length;
    handleSelectImage(images[nextIdx], nextIdx);
  };

  const showPrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    const prevIdx = (currentImageIndex - 1 + images.length) % images.length;
    handleSelectImage(images[prevIdx], prevIdx);
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailsRef.current) {
      const scrollAmount = 260;
      thumbnailsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const openLightbox = (index?: number) => {
    const idx = index !== undefined ? index : currentImageIndex;
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const nextLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    const nextIdx = (lightboxIndex + 1) % images.length;
    setLightboxIndex(nextIdx);
    setSelectedImage(images[nextIdx].image_path);
  };

  const prevLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    const prevIdx = (lightboxIndex - 1 + images.length) % images.length;
    setLightboxIndex(prevIdx);
    setSelectedImage(images[prevIdx].image_path);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        if (isRTL) prevLightboxImage();
        else nextLightboxImage();
      }
      if (e.key === "ArrowLeft") {
        if (isRTL) nextLightboxImage();
        else prevLightboxImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxOpen, lightboxIndex, images.length, isRTL]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1280px", margin: "100px auto", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem" }}>
          {language === "ar" ? "جاري تحميل تفاصيل القطعة..." : "Loading piece details..."}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: "1280px", margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px", color: "var(--color-text)" }}>
          {language === "ar" ? "عذراً، لم يتم العثور على هذه القطعة" : "Piece Not Found"}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}>
          {language === "ar" ? "ربما تم تعديل الرابط أو نفاد الكمية." : "This piece might have been removed or is currently unavailable."}
        </p>
        <Link
          href="/products"
          style={{
            display: "inline-block",
            padding: "10px 22px",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {t("back_to_catalog")}
        </Link>
      </div>
    );
  }

  const effectivePrice = product.discount_price ?? product.selling_price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.selling_price;
  const deposit50 = Math.round(effectivePrice * 0.5);

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    router.push("/checkout");
  };

  return (
    <div className="product-detail-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Back button */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <ArrowBackIcon size={16} />
          <span>{t("back_to_catalog")}</span>
        </Link>
      </div>

      <div className="product-detail-layout">
        {/* Gallery */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Main Large Image Container */}
          <div
            className="product-detail-image-box"
            onClick={() => openLightbox()}
            style={{
              position: "relative",
              height: "620px",
              borderRadius: "18px",
              overflow: "hidden",
              background: "radial-gradient(circle at center, #ffffff 0%, #faf8f5 100%)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              cursor: "zoom-in",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={storageUrl(selectedImage)}
              alt={localize(product, "name")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "16px",
                transition: "transform 0.3s ease",
              }}
            />

            {/* Expand / View Full Size Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openLightbox();
              }}
              style={{
                position: "absolute",
                top: "16px",
                [isRTL ? "left" : "right"]: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(10px)",
                color: "var(--color-text)",
                border: "1px solid rgba(0,0,0,0.08)",
                padding: "8px 14px",
                borderRadius: "24px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                zIndex: 3,
                transition: "all 0.2s ease",
              }}
              title={language === "ar" ? "عرض الصورة بالحجم الكامل" : "View Full Size"}
            >
              <Maximize2 size={13} />
              <span>{language === "ar" ? "عرض بالحجم الكامل" : "Full Size"}</span>
            </button>

            {/* Discount Badge */}
            {hasDiscount && (
              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  [isRTL ? "right" : "left"]: "16px",
                  backgroundColor: "var(--color-accent)",
                  color: "#FFFFFF",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 10px rgba(196, 144, 124, 0.4)",
                  zIndex: 3,
                }}
              >
                {t("sale_badge")}
              </span>
            )}

            {/* Prev / Next Arrows directly on photo */}
            {images.length > 1 && (
              <>
                <button
                  onClick={showPrevImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    [isRTL ? "right" : "left"]: "12px",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "var(--color-text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    zIndex: 3,
                    transition: "all 0.2s",
                  }}
                  aria-label="Previous image"
                >
                  {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <button
                  onClick={showNextImage}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    [isRTL ? "left" : "right"]: "12px",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "var(--color-text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    zIndex: 3,
                    transition: "all 0.2s",
                  }}
                  aria-label="Next image"
                >
                  {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </>
            )}

            {/* Bottom Badges */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                right: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pointerEvents: "none",
                zIndex: 3,
              }}
            >
              <span
                style={{
                  backgroundColor: "rgba(18, 18, 20, 0.78)",
                  color: "#FFFFFF",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
                  letterSpacing: "0.05em",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                SHEIN AUTHENTIC
              </span>

              {images.length > 1 && (
                <span
                  style={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(8px)",
                    color: "var(--color-text)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {currentImageIndex + 1} / {images.length}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Under Photo */}
          {images.length > 1 && (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  padding: "0 2px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                    {language === "ar" ? "جميع الألوان والموديلات المتاحة" : "All Available Colors & Styles"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      backgroundColor: "var(--color-bg-alt)",
                      color: "var(--color-accent-hover)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {images.length}
                  </span>
                </div>

                {images.length > 5 && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => scrollThumbnails(isRTL ? "right" : "left")}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--color-text)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                      aria-label="Scroll thumbnails backward"
                    >
                      {isRTL ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                    </button>
                    <button
                      onClick={() => scrollThumbnails(isRTL ? "left" : "right")}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--color-text)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                      aria-label="Scroll thumbnails forward"
                    >
                      {isRTL ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Scrollable Container */}
              <div
                ref={thumbnailsRef}
                className="horizontal-touch-scroll"
                style={{
                  display: "flex",
                  gap: "10px",
                  padding: "4px 2px 10px",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {images.map((img, idx) => {
                  const isSelected = selectedImage === img.image_path;
                  return (
                    <button
                      key={img.id || idx}
                      id={`thumbnail-${idx}`}
                      onClick={() => handleSelectImage(img, idx)}
                      style={{
                        width: "74px",
                        height: "94px",
                        minWidth: "74px",
                        flexShrink: 0,
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: isSelected
                          ? "2px solid var(--color-accent)"
                          : "1px solid rgba(0,0,0,0.08)",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(196, 144, 124, 0.35)"
                          : "0 1px 3px rgba(0,0,0,0.03)",
                        cursor: "pointer",
                        padding: 0,
                        backgroundColor: "#FAF9F7",
                        transform: isSelected ? "scale(1.03)" : "scale(1)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                      }}
                      aria-label={`Select photo ${idx + 1}`}
                    >
                      <img
                        src={storageUrl(img.image_path)}
                        alt={`thumbnail-${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "4px",
                        }}
                      />
                      {isSelected && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            [isRTL ? "left" : "right"]: "4px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-accent)",
                            boxShadow: "0 0 0 2px #fff",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Info & Purchase Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: isRTL ? 0 : "0.1em",
                color: "var(--color-accent)",
                marginBottom: "8px",
                display: "block",
              }}
            >
              {language === "ar" ? "كولكشن شي إن الأصلي" : "SHEIN Curated Selection"}
            </span>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--color-text)",
                lineHeight: 1.3,
                marginBottom: "12px",
              }}
            >
              {localize(product, "name")}
            </h1>

            {/* Price section */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "14px",
                padding: "16px 0",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text)" }}>
                {formatPriceLocal(effectivePrice)}
              </span>
              {hasDiscount && (
                <span
                  style={{
                    fontSize: "1.125rem",
                    color: "var(--color-text-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPriceLocal(product.selling_price)}
                </span>
              )}
            </div>

            {/* 50% Deposit Notice */}
            <div
              style={{
                marginTop: "16px",
                padding: "14px 18px",
                backgroundColor: "var(--color-bg-alt)",
                borderRadius: "10px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <CreditCard size={22} color="var(--color-accent)" />
              <div style={{ fontSize: "0.875rem", color: "var(--color-text)" }}>
                <strong>{formatPriceLocal(deposit50)}</strong> ({language === "ar" ? "عربون 50%" : "50% deposit"}) {language === "ar" ? "مطلوب لتأكيد الطلب." : "required to place order."}
                <span style={{ display: "block", color: "var(--color-text-secondary)", fontSize: "0.75rem", marginTop: "2px" }}>
                  {language === "ar" ? "يتم سداد باقي المبلغ عند استلام الشحنة لباب بيتك." : "Remaining balance paid when courier delivers to your door."}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "8px" }}>
              {t("product_description")}
            </h4>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
              {localize(product, "description")}
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{t("select_size")}:</span>
                  <span
                    style={{
                      backgroundColor: "var(--color-bg-alt)",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {selectedSize}
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        minWidth: "50px",
                        height: "44px",
                        padding: "0 16px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                        backgroundColor: isSelected ? "var(--color-text)" : "#FFFFFF",
                        color: isSelected ? "#FFFFFF" : "var(--color-text)",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.15)" : "0 1px 2px rgba(0,0,0,0.03)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                    {t("select_color")}:
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "var(--color-bg-alt)",
                      padding: "3px 10px",
                      borderRadius: "14px",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: getLuxuryColorStyle(selectedColor).bg,
                        border: getLuxuryColorStyle(selectedColor).border
                          ? `1px solid ${getLuxuryColorStyle(selectedColor).border}`
                          : "1px solid rgba(0,0,0,0.15)",
                        display: "inline-block",
                      }}
                    />
                    <span>{selectedColor}</span>
                  </span>
                </div>

                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {product.colors.length} {language === "ar" ? "ألوان" : "colors"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {product.colors.map((c) => {
                  const styleInfo = getLuxuryColorStyle(c);
                  const isSelected = selectedColor === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "24px",
                        border: isSelected
                          ? "2px solid var(--color-accent)"
                          : "1px solid var(--color-border)",
                        backgroundColor: isSelected
                          ? "rgba(196, 144, 124, 0.08)"
                          : "#FFFFFF",
                        color: isSelected ? "var(--color-accent-hover)" : "var(--color-text)",
                        fontSize: "0.875rem",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: isSelected
                          ? "0 2px 8px rgba(196, 144, 124, 0.25)"
                          : "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                      aria-label={`Select color ${c}`}
                    >
                      {/* Color circle swatch */}
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: styleInfo.bg,
                          border: styleInfo.border
                            ? `1px solid ${styleInfo.border}`
                            : "1px solid rgba(0,0,0,0.15)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={11}
                            color={styleInfo.isLight ? "#111111" : "#ffffff"}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", display: "block", marginBottom: "8px" }}>
              {t("quantity")}
            </span>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  padding: "8px 16px",
                  background: "var(--color-bg-alt)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                -
              </button>
              <span style={{ padding: "8px 20px", fontSize: "0.9375rem", fontWeight: 600 }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  padding: "8px 16px",
                  background: "var(--color-bg-alt)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            <div className="product-detail-buttons" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleAdd}
                style={{
                  flex: "1 1 200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "16px 24px",
                  backgroundColor: "var(--color-accent)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(196, 144, 124, 0.3)",
                  transition: "background 0.2s",
                }}
              >
                <ShoppingBag size={18} />
                <span>{t("add_to_cart")}</span>
              </button>

              <button
                onClick={handleBuyNow}
                style={{
                  flex: "1 1 200px",
                  padding: "16px 24px",
                  backgroundColor: "var(--color-text)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {language === "ar" ? "شراء فوري" : "Buy Now"}
              </button>
            </div>

            {addedMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#166534",
                  backgroundColor: "#DCFCE7",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={16} />
                <span>{t("product_added_msg")}</span>
              </div>
            )}
          </div>

          {/* Delivery & Assurance Guarantees */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "24px",
              borderTop: "1px solid var(--color-border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <Truck size={20} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h5 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                  {language === "ar" ? "مدة التوصيل في مصر" : "Estimated Delivery in Egypt"}
                </h5>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                  {language === "ar"
                    ? "من 10 إلى 14 يوم عمل لباب بيتك في جميع المحافظات."
                    : "10-14 days from international dispatch to your doorstep anywhere in Egypt."}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <ShieldCheck size={20} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h5 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                  {language === "ar" ? "شامل التخليص الجمركي والضرائب" : "All Customs & Clearance Included"}
                </h5>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                  {language === "ar"
                    ? "لا توجد أي مصاريف إضافية غير معلنة بالجنيه المصري."
                    : "No hidden airport or import fees. Everything is clearly computed in EGP."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Image Viewer */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10, 10, 12, 0.95)",
            backdropFilter: "blur(16px)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
          }}
        >
          {/* Lightbox Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#ffffff",
              zIndex: 2,
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "#ffffff" }}>
                {localize(product, "name")}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>
                {language === "ar"
                  ? `صورة ${lightboxIndex + 1} من ${images.length}`
                  : `Photo ${lightboxIndex + 1} of ${images.length}`}
              </p>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              aria-label="Close full size view"
            >
              <X size={22} />
            </button>
          </div>

          {/* Center Image with Navigation Arrows */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "calc(100vh - 220px)",
              maxWidth: "1100px",
            }}
          >
            {images.length > 1 && (
              <button
                onClick={prevLightboxImage}
                style={{
                  position: "absolute",
                  [isRTL ? "right" : "left"]: "12px",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "background 0.2s",
                }}
                aria-label="Previous image"
              >
                {isRTL ? <ChevronRight size={26} /> : <ChevronLeft size={26} />}
              </button>
            )}

            <img
              src={storageUrl(images[lightboxIndex]?.image_path || selectedImage)}
              alt={localize(product, "name")}
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                userSelect: "none",
              }}
            />

            {images.length > 1 && (
              <button
                onClick={nextLightboxImage}
                style={{
                  position: "absolute",
                  [isRTL ? "left" : "right"]: "12px",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "background 0.2s",
                }}
                aria-label="Next image"
              >
                {isRTL ? <ChevronLeft size={26} /> : <ChevronRight size={26} />}
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                gap: "8px",
                maxWidth: "92vw",
                overflowX: "auto",
                padding: "8px 0",
              }}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setSelectedImage(img.image_path);
                  }}
                  style={{
                    width: "56px",
                    height: "72px",
                    minWidth: "56px",
                    flexShrink: 0,
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: lightboxIndex === idx ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
                    opacity: lightboxIndex === idx ? 1 : 0.55,
                    cursor: "pointer",
                    padding: 0,
                    background: "#18181b",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    src={storageUrl(img.image_path)}
                    alt="lightbox thumb"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          :global(.product-detail-container) {
            padding: 20px 16px 60px !important;
          }
        }
      `}</style>
    </div>
  );
}
