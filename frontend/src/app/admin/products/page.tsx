"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api, { formatPrice, storageUrl } from "@/lib/api";
import { Product, Category } from "@/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

interface GalleryImage {
  id: string;
  file?: File;
  previewUrl: string;
  isPrimary: boolean;
}

export default function AdminProductsPage() {
  const { isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [descEn, setDescEn] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [colors, setColors] = useState("Black, Cream, Beige");
  const [stockQuantity, setStockQuantity] = useState("10");

  // Multi-Image Gallery State
  const [imageMode, setImageMode] = useState<"device" | "url">("device");
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products?per_page=100");
      if (res.data?.data) {
        setProducts(res.data.data);
      } else if (Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch products from API:", err);
    } finally {
      setLoading(false);
    }

    try {
      const catRes = await api.get("/categories");
      const cats = Array.isArray(catRes.data)
        ? catRes.data
        : (catRes.data?.data || []);
      if (cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn("Could not fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilesSelect = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const validImages: GalleryImage[] = [];

    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        alert(isRTL ? `الملف ${file.name} ليس صورة صالحة` : `File ${file.name} is not a valid image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(isRTL ? `الصورة ${file.name} حجمها أكبر من 10 ميجابايت` : `File ${file.name} is larger than 10MB`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      validImages.push({
        id: `device-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        isPrimary: false,
      });
    }

    if (validImages.length > 0) {
      setGallery((prev) => {
        const hasPrimary = prev.some((img) => img.isPrimary);
        const updated = [...prev, ...validImages];
        if (!hasPrimary && updated.length > 0) {
          updated[0].isPrimary = true;
        }
        return updated;
      });
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      alert(isRTL ? "يرجى إدخال رابط يبدأ بـ http:// أو https://" : "Please enter a valid URL starting with http:// or https://");
      return;
    }
    const newImage: GalleryImage = {
      id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      previewUrl: trimmed,
      isPrimary: false,
    };
    setGallery((prev) => {
      const hasPrimary = prev.some((img) => img.isPrimary);
      const updated = [...prev, newImage];
      if (!hasPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
    setUrlInput("");
  };

  const handleSetPrimary = (id: string) => {
    setGallery((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id: string) => {
    setGallery((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    setGallery((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setNameEn("");
    setNameAr("");
    setCategoryId(categories[0]?.id || 1);
    setDescEn("");
    setSellingPrice("");
    setDiscountPrice("");
    setCostPrice("");
    setSizes("S, M, L, XL");
    setColors("Black, Beige, White");
    setStockQuantity("10");
    setGallery([]);
    setUrlInput("");
    setImageMode("device");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNameEn(p.name_en);
    setNameAr(p.name_ar || "");
    setCategoryId(p.category_id);
    setDescEn(p.description_en || "");
    setSellingPrice(p.selling_price.toString());
    setDiscountPrice(p.discount_price ? p.discount_price.toString() : "");
    setCostPrice(p.cost_price.toString());
    setSizes(p.sizes ? p.sizes.join(", ") : "");
    setColors(p.colors ? p.colors.join(", ") : "");
    setStockQuantity(p.stock_quantity.toString());

    const pImages = p.images || [];
    const hasExistingPrimary = pImages.some((i) => i.is_primary);
    const existingImages: GalleryImage[] = pImages.map((img, idx) => ({
      id: `existing-${img.id || idx}`,
      previewUrl: img.image_path,
      isPrimary: !!img.is_primary || (idx === 0 && !hasExistingPrimary),
    }));
    setGallery(existingImages);
    setUrlInput("");
    setImageMode("device");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // 1. Upload new files from device to storage
      const finalImageUrls: string[] = [];
      let finalPrimaryUrl = "";

      for (let i = 0; i < gallery.length; i++) {
        const item = gallery[i];
        let url = item.previewUrl;

        if (item.file) {
          setUploadProgress(
            isRTL
              ? `جارٍ رفع الصورة ${i + 1} من ${gallery.length}...`
              : `Uploading photo ${i + 1} of ${gallery.length}...`
          );
          const formData = new FormData();
          formData.append("image", item.file);
          const uploadRes = await api.post("/admin/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (uploadRes.data?.url) {
            url = uploadRes.data.url;
          }
        }

        finalImageUrls.push(url);
        if (item.isPrimary) {
          finalPrimaryUrl = url;
        }
      }

      if (!finalPrimaryUrl && finalImageUrls.length > 0) {
        finalPrimaryUrl = finalImageUrls[0];
      }

      setUploadProgress(isRTL ? "جارٍ حفظ بيانات القطعة في قاعدة البيانات..." : "Saving piece to database...");

      const payload = {
        name_en: nameEn,
        name_ar: nameAr || null,
        category_id: categoryId,
        description_en: descEn,
        selling_price: parseFloat(sellingPrice) || 0,
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        cost_price: parseFloat(costPrice) || 0,
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
        stock_quantity: parseInt(stockQuantity) || 0,
        image_urls: finalImageUrls,
        primary_image: finalPrimaryUrl || null,
        image_url: finalPrimaryUrl || (finalImageUrls[0] || null),
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      const errors = err?.response?.data?.errors;
      const firstErr = errors ? (Object.values(errors).flat()[0] as string) : undefined;
      const errorMsg =
        firstErr ||
        err?.response?.data?.message ||
        (isRTL ? "فشل حفظ القطعة." : "Failed to save product.");
      alert(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isRTL ? "هل أنتِ متأكدة من حذف هذه القطعة؟" : "Are you sure you want to delete this piece?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      await fetchProducts();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (isRTL ? "فشل حذف القطعة من قاعدة البيانات." : "Failed to delete product from database.");
      alert(errorMsg);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCat === "all" || p.category_id.toString() === selectedCat;
      const q = search.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        p.name_en.toLowerCase().includes(q) ||
        (p.name_ar && p.name_ar.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCat, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            SHEIN Sourced Catalog
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
            Add, edit, manage stock, and set selling & discount prices in Egyptian Pounds.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(196, 144, 124, 0.3)",
          }}
        >
          <Plus size={18} />
          <span>Add New Piece</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              fontSize: "0.9375rem",
              color: "var(--color-text)",
            }}
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            backgroundColor: "#FFFFFF",
            fontSize: "0.875rem",
            color: "var(--color-text)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
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
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border-light)", color: "var(--color-text-secondary)" }}>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Piece</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Selling Price</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Discount Price</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>SHEIN Cost</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Stock Qty</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "0.9375rem" }}>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>{isRTL ? "جارٍ جلب القطع من قاعدة البيانات..." : "Loading catalog from database..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    {isRTL ? "لا توجد قطع مطابقة للبحث أو القسم." : "No pieces found in catalog."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                const img =
                  p.images?.find((i) => i.is_primary)?.image_path ||
                  p.images?.[0]?.image_path ||
                  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200";

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ position: "relative", width: "48px", height: "60px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#f5f5f5", flexShrink: 0 }}>
                          <img src={storageUrl(img)} alt={p.name_en} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {p.images && p.images.length > 1 && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                [isRTL ? "left" : "right"]: "2px",
                                backgroundColor: "rgba(0,0,0,0.72)",
                                color: "#FFFFFF",
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                padding: "1px 4px",
                                borderRadius: "4px",
                                lineHeight: 1.2,
                              }}
                              title={`${p.images.length} photos`}
                            >
                              +{p.images.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-text)", maxWidth: "260px" }}>
                            {p.name_en}
                          </div>
                          {p.name_ar && (
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", direction: "rtl", textAlign: "left" }}>
                              {p.name_ar}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--color-text)" }}>
                      {formatPrice(p.selling_price)}
                    </td>
                    <td style={{ padding: "16px 20px", color: p.discount_price ? "var(--color-danger)" : "var(--color-text-muted)" }}>
                      {p.discount_price ? formatPrice(p.discount_price) : "—"}
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-text-secondary)" }}>
                      {formatPrice(p.cost_price)}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: p.stock_quantity < 5 ? "#D97706" : "var(--color-text)",
                        }}
                      >
                        {p.stock_quantity} in stock
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "14px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: p.is_available ? "#DCFCE7" : "#FEE2E2",
                          color: p.is_available ? "#166534" : "#991B1B",
                        }}
                      >
                        {p.is_available ? "Active" : "Unavailable"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{
                            padding: "6px",
                            backgroundColor: "var(--color-bg-alt)",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "var(--color-text)",
                          }}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            padding: "6px",
                            backgroundColor: "#FEE2E2",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "#DC2626",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
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
            style={{
              width: "100%",
              maxWidth: "680px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <form
              onSubmit={handleSave}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                maxHeight: "92vh",
                overflow: "hidden",
              }}
            >
              {/* Fixed Header */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--color-border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                    {editingProduct
                      ? (isRTL ? "تعديل بيانات القطعة" : "Edit Product Piece")
                      : (isRTL ? "إضافة قطعة جديدة" : "Add New SHEIN Piece")}
                  </h3>
                  {editingProduct && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      ID: #{editingProduct.id} • {editingProduct.slug}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "50%",
                    color: "var(--color-text-secondary)",
                  }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Product Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Product Title (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "#fff" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_en}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    Selling Price (EGP) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    Discount Price
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    SHEIN Cost Price
                  </label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    {isRTL ? "المقاسات (مفصولة بفاصلة)" : "Sizes (comma separated)"}
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="XS, S, M, L, XL, XXL"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    {isRTL ? "الكمية المتاحة (المخزون)" : "Stock Quantity"}
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>

              {/* Colors (comma separated) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    {isRTL ? "الألوان (مفصولة بفاصلة) *" : "Colors (comma separated) *"}
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {isRTL ? "اختيار سريع للألوان:" : "Quick add colors:"}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="Black, White, Beige, Blue, Red, Pink..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "6px" }}
                />
                {/* Quick Add Color Pills */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["Black", "White", "Beige", "Blue", "Red", "Pink", "Green", "Brown", "Purple", "Gold", "Silver"].map((cName) => {
                    const currentList = colors.split(",").map((s) => s.trim().toLowerCase());
                    const isAdded = currentList.includes(cName.toLowerCase());
                    return (
                      <button
                        key={cName}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            const updated = colors
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s.toLowerCase() !== cName.toLowerCase())
                              .join(", ");
                            setColors(updated);
                          } else {
                            const updated = colors.trim() ? `${colors.trim()}, ${cName}` : cName;
                            setColors(updated);
                          }
                        }}
                        style={{
                          padding: "3px 10px",
                          borderRadius: "14px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: isAdded ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                          backgroundColor: isAdded ? "var(--color-accent-light)" : "#FFFFFF",
                          color: isAdded ? "var(--color-accent-hover)" : "var(--color-text)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isAdded ? `✓ ${cName}` : `+ ${cName}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  {isRTL ? "وصف القطعة (اختياري)" : "Product Description (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder={isRTL ? "اكتبي وصفاً مختصراً للقطعة وخامتها..." : "Piece description, fabric details..."}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.875rem", resize: "vertical" }}
                />
              </div>

              {/* Photo Upload Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Multi-Photo Manager Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{isRTL ? "صور القطعة" : "Piece Photos"}</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: gallery.length > 0 ? "#fdf3eb" : "#f1ebe4",
                        color: gallery.length > 0 ? "var(--color-accent)" : "#7a6e65",
                        border: "1px solid #ebd9c8",
                        padding: "1px 8px",
                        borderRadius: "12px",
                      }}
                    >
                      {gallery.length} {isRTL ? "صور" : gallery.length === 1 ? "photo" : "photos"}
                    </span>
                  </label>

                  <div style={{ display: "flex", background: "#f3ece5", borderRadius: "8px", padding: "2px" }}>
                    <button
                      type="button"
                      onClick={() => setImageMode("device")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: imageMode === "device" ? "#fff" : "transparent",
                        color: imageMode === "device" ? "var(--color-primary)" : "#7a6e65",
                        boxShadow: imageMode === "device" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <UploadCloud size={14} />
                      {isRTL ? "رفع من الجهاز" : "Upload Device"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: imageMode === "url" ? "#fff" : "transparent",
                        color: imageMode === "url" ? "var(--color-primary)" : "#7a6e65",
                        boxShadow: imageMode === "url" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <LinkIcon size={14} />
                      {isRTL ? "رابط خارجي" : "Web URL"}
                    </button>
                  </div>
                </div>

                {/* Hidden Multi-file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelect(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />

                {/* Input Method */}
                {imageMode === "device" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFilesSelect(e.dataTransfer.files);
                      }
                    }}
                    style={{
                      border: `2px dashed ${dragOver ? "var(--color-accent)" : "#d6cbbf"}`,
                      background: dragOver ? "#f4ede4" : "#faf7f2",
                      borderRadius: "12px",
                      padding: gallery.length > 0 ? "14px 16px" : "24px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: gallery.length > 0 ? "36px" : "44px",
                        height: gallery.length > 0 ? "36px" : "44px",
                        borderRadius: "50%",
                        background: "#ede3d6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        color: "var(--color-accent)",
                      }}
                    >
                      <UploadCloud size={gallery.length > 0 ? 18 : 22} />
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 4px" }}>
                      {gallery.length > 0
                        ? (isRTL ? "+ اضغطي لاختيار صور إضافية من الجهاز (تحديد متعدد)" : "+ Click to add more photos from device (multiple)")
                        : (isRTL ? "اضغطي لاختيار صورة أو عدة صور معاً من جهازك" : "Click to select one or multiple photos from your device")}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#8a7e74", margin: 0 }}>
                      {isRTL
                        ? "يمكنكِ اختيار عدة صور دفعة واحدة أو سحبها وإفلاتها هنا (PNG, JPG, WEBP حتى 10 ميجا)"
                        : "Select multiple photos at once or drag and drop here (PNG, JPG, WEBP up to 10MB)"}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddUrl();
                          }
                        }}
                        placeholder="https://images.unsplash.com/... or https://img.ltwebstatic.com/..."
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.875rem",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "var(--color-primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Plus size={16} />
                        {isRTL ? "إضافة رابط" : "Add URL"}
                      </button>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#8a7e74", margin: "6px 0 0" }}>
                      {isRTL
                        ? "ألصقي رابط أي صورة خارجية واضغطي 'إضافة رابط'. يمكنكِ تكرار ذلك لإضافة عدة صور."
                        : "Paste any image URL and click 'Add URL'. You can add multiple photos."}
                    </p>
                  </div>
                )}

                {/* Gallery Grid */}
                {gallery.length > 0 && (
                  <div
                    style={{
                      background: "#faf7f2",
                      border: "1px solid #e5ded4",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-primary)" }}>
                        {isRTL
                          ? "معاينة وترتيب الصور (اضغطي على النجمة لتعيين صورة الغلاف الرئيسية):"
                          : "Photo Gallery (click the star to set as cover photo):"}
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-accent)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        <Plus size={14} />
                        {isRTL ? "إضافة صور" : "Add photos"}
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {gallery.map((img, index) => (
                        <div
                          key={img.id}
                          style={{
                            position: "relative",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: img.isPrimary ? "2px solid var(--color-accent)" : "1px solid #dcd4c8",
                            backgroundColor: "#fff",
                            boxShadow: img.isPrimary ? "0 2px 8px rgba(155, 107, 67, 0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ position: "relative", width: "100%", height: "120px", background: "#f0ebe4" }}>
                            <img
                              src={storageUrl(img.previewUrl)}
                              alt={`Photo ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />

                            {/* Cover Star Button */}
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(img.id)}
                              title={isRTL ? "تعيين كصورة الغلاف" : "Set as Cover photo"}
                              style={{
                                position: "absolute",
                                top: "6px",
                                [isRTL ? "right" : "left"]: "6px",
                                padding: "3px 6px",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                backgroundColor: img.isPrimary ? "#B45309" : "rgba(0,0,0,0.55)",
                                color: "#fff",
                                backdropFilter: "blur(4px)",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              }}
                            >
                              <Star size={11} fill={img.isPrimary ? "#FBBF24" : "none"} color={img.isPrimary ? "#FBBF24" : "#fff"} />
                              <span>{img.isPrimary ? (isRTL ? "الغلاف" : "Cover") : (isRTL ? "غلاف؟" : "Cover")}</span>
                            </button>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              title={isRTL ? "حذف هذه الصورة" : "Remove this photo"}
                              style={{
                                position: "absolute",
                                top: "6px",
                                [isRTL ? "left" : "right"]: "6px",
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor: "rgba(220, 38, 38, 0.85)",
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Reorder and Index Controls */}
                          <div
                            style={{
                              padding: "4px 6px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: img.isPrimary ? "#faf2ea" : "#fff",
                              borderTop: "1px solid #f0ebe4",
                              fontSize: "0.6875rem",
                            }}
                          >
                            <span style={{ fontWeight: 600, color: img.isPrimary ? "var(--color-accent)" : "#7a6e65" }}>
                              #{index + 1}
                            </span>
                            <div style={{ display: "flex", gap: "2px" }}>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveImage(index, -1)}
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: index === 0 ? "default" : "pointer",
                                  opacity: index === 0 ? 0.25 : 1,
                                  padding: "1px 3px",
                                  color: "var(--color-primary)",
                                }}
                                title="Move left"
                              >
                                <ChevronLeft size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={index === gallery.length - 1}
                                onClick={() => handleMoveImage(index, 1)}
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: index === gallery.length - 1 ? "default" : "pointer",
                                  opacity: index === gallery.length - 1 ? 0.25 : 1,
                                  padding: "1px 3px",
                                  color: "var(--color-primary)",
                                }}
                                title="Move right"
                              >
                                <ChevronRight size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add More Tile */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          height: "152px",
                          borderRadius: "10px",
                          border: "2px dashed #d6cbbf",
                          backgroundColor: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#8a7e74",
                          padding: "8px",
                          textAlign: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#ede3d6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "6px",
                            color: "var(--color-accent)",
                          }}
                        >
                          <Plus size={18} />
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {isRTL ? "+ إضافة صور" : "+ Add Photos"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              </div>

              {/* Sticky Footer (Always Visible at Bottom) */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid var(--color-border-light)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                  {gallery.length > 0 && (
                    <span>
                      {gallery.length} {isRTL ? "صور محددة" : "photos selected"}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    style={{
                      padding: "11px 26px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "var(--color-accent)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(196, 144, 124, 0.4)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isUploading && <RefreshCw size={16} className="animate-spin" />}
                    {isUploading
                      ? (uploadProgress || (isRTL ? "جارٍ الحفظ والرفع..." : "Uploading & Saving..."))
                      : (editingProduct ? (isRTL ? "حفظ التعديلات" : "Save Changes") : (isRTL ? "حفظ القطعة" : "Save Piece"))}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
