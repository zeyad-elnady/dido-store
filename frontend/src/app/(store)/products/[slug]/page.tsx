"use client";

import { useEffect, useState, use } from "react";
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
} from "lucide-react";
import api, { storageUrl } from "@/lib/api";
import { Product } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

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

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 1, product_id: product.id, image_path: selectedImage, sort_order: 1, is_primary: true }];

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
          {/* Main Large Image */}
          <div
            className="product-detail-image-box"
            style={{
              position: "relative",
              height: "540px",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#f7f7f7",
              boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
            }}
          >
            <img
              src={storageUrl(selectedImage)}
              alt={localize(product, "name")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {hasDiscount && (
              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  [isRTL ? "right" : "left"]: "16px",
                  backgroundColor: "var(--color-accent)",
                  color: "#FFFFFF",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                }}
              >
                {t("sale_badge")}
              </span>
            )}
            <span
              style={{
                position: "absolute",
                bottom: "16px",
                [isRTL ? "left" : "right"]: "16px",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "#FFFFFF",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                backdropFilter: "blur(6px)",
              }}
            >
              SHEIN AUTHENTIC
            </span>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="horizontal-touch-scroll" style={{ display: "flex", gap: "12px", paddingBottom: "6px" }}>
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_path)}
                  style={{
                    width: "80px",
                    height: "100px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: selectedImage === img.image_path ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                    cursor: "pointer",
                    padding: 0,
                    background: "none",
                  }}
                  aria-label="Select photo"
                >
                  <img
                    src={storageUrl(img.image_path)}
                    alt="thumbnail"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                  {t("select_size")}: <strong>{selectedSize}</strong>
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: selectedSize === s ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                      backgroundColor: selectedSize === s ? "var(--color-text)" : "#FFFFFF",
                      color: selectedSize === s ? "#FFFFFF" : "var(--color-text)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                  {t("select_color")}: <strong>{selectedColor}</strong>
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: selectedColor === c ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                      backgroundColor: selectedColor === c ? "var(--color-accent-light)" : "#FFFFFF",
                      color: selectedColor === c ? "var(--color-accent-hover)" : "var(--color-text)",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {c}
                  </button>
                ))}
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
