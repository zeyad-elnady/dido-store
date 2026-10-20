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
} from "lucide-react";
import api, { formatPrice, storageUrl } from "@/lib/api";
import { Product, Category } from "@/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminProductsPage() {
  const { isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
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

  // Image Upload State
  const [imageMode, setImageMode] = useState<"device" | "url">("device");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProducts = () => {
    api
      .get("/admin/products")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch(() => {});

    api
      .get("/categories")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(isRTL ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)" : "Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(isRTL ? "حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)" : "File is too large (max 10MB)");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
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
    setImageUrl("");
    setSelectedFile(null);
    setImagePreview("");
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
    const existingImg = p.images?.[0]?.image_path || "";
    setImageUrl(existingImg);
    setSelectedFile(null);
    setImagePreview(existingImg);
    setImageMode(existingImg && existingImg.startsWith("http") ? "url" : "device");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrl = imageUrl;

    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadRes = await api.post("/admin/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (uploadRes.data?.url) {
          finalImageUrl = uploadRes.data.url;
        }
      } catch (err) {
        console.warn("Direct upload fallback to data URL:", err);
        finalImageUrl = imagePreview || imageUrl;
      }
    }

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
      image_url: finalImageUrl || null,
    };

    if (editingProduct) {
      try {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        fetchProducts();
      } catch {
        // Local state update
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...payload,
                  images: finalImageUrl
                    ? [{ id: Date.now(), product_id: p.id, image_path: finalImageUrl, sort_order: 1, is_primary: true }]
                    : p.images,
                }
              : p
          )
        );
      }
    } else {
      try {
        const res = await api.post("/admin/products", payload);
        if (res.data?.data) {
          fetchProducts();
        }
      } catch {
        // Local state addition
        const newProd: Product = {
          id: Date.now(),
          ...payload,
          slug: nameEn.toLowerCase().replace(/\s+/g, "-"),
          is_available: true,
          is_featured: false,
          created_at: new Date().toISOString(),
          description_ar: null,
          images: [
            {
              id: Date.now(),
              product_id: Date.now(),
              image_path: finalImageUrl || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
              sort_order: 1,
              is_primary: true,
            },
          ],
        };
        setProducts((prev) => [newProd, ...prev]);
      }
    }

    setIsUploading(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this piece?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
    } catch {
      // Local fallback
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
              {filteredProducts.map((p) => {
                const img =
                  p.images?.find((i) => i.is_primary)?.image_path ||
                  p.images?.[0]?.image_path ||
                  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200";

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: "48px", height: "60px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#f5f5f5", flexShrink: 0 }}>
                          <img src={storageUrl(img)} alt={p.name_en} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
              })}
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
              maxWidth: "600px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid var(--color-border-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                {editingProduct ? "Edit Product Piece" : "Add New SHEIN Piece"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
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
                    Sizes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="S, M, L, XL"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-primary)" }}>
                    {isRTL ? "صورة القطعة *" : "Piece Photo *"}
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

                {imageMode === "device" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    {imagePreview ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: "12px",
                          background: "#faf7f2",
                          border: "1px solid #e5ded4",
                          borderRadius: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: "#eae3d9",
                            flexShrink: 0,
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <img
                            src={storageUrl(imagePreview)}
                            alt="Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 600, margin: 0, color: "var(--color-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedFile ? selectedFile.name : (isRTL ? "الصورة الحالية للقطعة" : "Current piece photo")}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "#8a7e74", margin: "2px 0 0" }}>
                            {selectedFile
                              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                              : (isRTL ? "جاهزة للحفظ" : "Ready to save")}
                          </p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                borderRadius: "6px",
                                border: "1px solid #d4c8bc",
                                background: "#fff",
                                cursor: "pointer",
                                color: "var(--color-primary)",
                                fontWeight: 500,
                              }}
                            >
                              {isRTL ? "تغيير الصورة" : "Change photo"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setImagePreview("");
                                setImageUrl("");
                              }}
                              style={{
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                borderRadius: "6px",
                                border: "none",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                            >
                              {isRTL ? "حذف" : "Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
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
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        style={{
                          border: `2px dashed ${dragOver ? "var(--color-accent)" : "#d6cbbf"}`,
                          background: dragOver ? "#f4ede4" : "#faf7f2",
                          borderRadius: "12px",
                          padding: "24px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            background: "#ede3d6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 10px",
                            color: "var(--color-accent)",
                          }}
                        >
                          <UploadCloud size={22} />
                        </div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", margin: "0 0 4px" }}>
                          {isRTL ? "اضغطي لاختيار صورة من جهازك" : "Click to choose a photo from your device"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#8a7e74", margin: 0 }}>
                          {isRTL
                            ? "أو اسحبي الصورة وأفلتها هنا (PNG, JPG, WEBP حتى 10 ميجا)"
                            : "or drag and drop an image file here (PNG, JPG, WEBP up to 10MB)"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                        setSelectedFile(null);
                      }}
                      placeholder="https://images.unsplash.com/... or https://img.ltwebstatic.com/..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                    {imageUrl && (
                      <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", background: "#eee", flexShrink: 0 }}>
                          <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#666" }}>
                          {isRTL ? "معاينة الرابط المباشر" : "Direct URL preview"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "none", cursor: "pointer" }}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: isUploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isUploading ? 0.7 : 1,
                  }}
                >
                  {isUploading && <RefreshCw size={16} className="animate-spin" />}
                  {isUploading
                    ? (isRTL ? "جارٍ الحفظ والرفع..." : "Uploading & Saving...")
                    : (isRTL ? "حفظ القطعة" : "Save Piece")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
