"use client";
import { useEffect, useState, useRef } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Link2,
  AlertCircle,
} from "lucide-react";
import api, { storageUrl } from "@/lib/api";
import { Category } from "@/types";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminCategoriesPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);

  // Device upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = () => {
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
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingCategory(null);
    setNameEn("");
    setNameAr("");
    setSlug("");
    setImagePath("");
    setSortOrder((categories.length + 1).toString());
    setIsActive(true);
    setUploadError(null);
    setUploading(false);
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameEn(cat.name_en);
    setNameAr(cat.name_ar || "");
    setSlug(cat.slug);
    setImagePath(cat.image_path || "");
    setSortOrder(cat.sort_order.toString());
    setIsActive(cat.is_active);
    setUploadError(null);
    setUploading(false);
    setShowUrlInput(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError(isRTL ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, GIF)" : "Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(isRTL ? "حجم الصورة كبير جداً، الحد الأقصى 10 ميجابايت" : "Image size exceeds 10MB limit");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.url) {
        setImagePath(res.data.url);
      } else if (res.data?.path) {
        setImagePath(`/storage/${res.data.path}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(
        err.response?.data?.message ||
        (isRTL ? "فشل رفع الصورة من الجهاز، يرجى المحاولة مرة أخرى" : "Failed to upload image from device")
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name_en: nameEn,
      name_ar: nameAr || null,
      slug: slug || nameEn.toLowerCase().replace(/\s+/g, "-"),
      image_path: imagePath || null,
      sort_order: parseInt(sortOrder) || 1,
      is_active: isActive,
    };

    if (editingCategory) {
      try {
        await api.put(`/admin/categories/${editingCategory.id}`, payload);
      } catch {
        // Fallback local update
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...payload } : c))
        );
      }
    } else {
      try {
        const res = await api.post("/admin/categories", payload);
        if (res.data?.data) fetchCategories();
      } catch {
        // Fallback local insert
        const newCat: Category = {
          id: Date.now(),
          ...payload,
          products_count: 0,
        };
        setCategories((prev) => [...prev, newCat]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
    } catch {
      // Local fallback
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Store Categories
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
            Organize dresses, blazers, co-ords, modest fashion, and accessories.
          </p>
        </div>

        <button
          onClick={openAdd}
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
          }}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid var(--color-border-light)",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ height: "160px", position: "relative", backgroundColor: "#f0f0f0" }}>
              <img
                src={storageUrl(cat.image_path) || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"}
                alt={cat.name_en}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  backgroundColor: cat.is_active ? "#DCFCE7" : "#FEE2E2",
                  color: cat.is_active ? "#166534" : "#991B1B",
                }}
              >
                {cat.is_active ? "Active" : "Hidden"}
              </span>
            </div>

            <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                {cat.name_en}
              </h3>
              {cat.name_ar && (
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", direction: "rtl", textAlign: "left", marginTop: "2px" }}>
                  {cat.name_ar}
                </div>
              )}

              <div style={{ marginTop: "12px", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                Slug: <code>{cat.slug}</code> • Sort: {cat.sort_order}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "auto",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--color-border-light)",
                }}
              >
                <button
                  onClick={() => openEdit(cat)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "var(--color-bg-alt)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
              maxWidth: "500px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Category Name (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                  />
                </div>
              </div>

              {/* Cover Image Upload from Device */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    {isRTL ? "صورة غلاف القسم" : "Category Cover Image"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-accent)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0,
                    }}
                  >
                    <Link2 size={13} />
                    <span>{showUrlInput ? (isRTL ? "إخفاء إدخال الرابط" : "Hide URL input") : (isRTL ? "أو إدخال رابط خارجي" : "Or enter external URL")}</span>
                  </button>
                </div>

                {/* Hidden File Input for Device Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {/* Upload Preview or Dropzone */}
                {imagePath ? (
                  <div
                    style={{
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      padding: "10px",
                      backgroundColor: "var(--color-bg)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "#E2E8F0",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      <img
                        src={storageUrl(imagePath)}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#DCFCE7",
                            color: "#166534",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                          }}
                        >
                          <Check size={11} />
                          {isRTL ? "الصورة محددة" : "Image Selected"}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          margin: "0 0 8px 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {imagePath}
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--color-border)",
                            backgroundColor: "#FFFFFF",
                            color: "var(--color-text)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: uploading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                          <span>{uploading ? (isRTL ? "جارٍ الرفع..." : "Uploading...") : (isRTL ? "رفع صورة بديلة من الجهاز" : "Upload new from device")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePath("")}
                          disabled={uploading}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={13} />
                          <span>{isRTL ? "إزالة" : "Remove"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border)"}`,
                      backgroundColor: isDragging ? "rgba(196, 144, 124, 0.08)" : "var(--color-bg)",
                      borderRadius: "10px",
                      padding: "24px 16px",
                      textAlign: "center",
                      cursor: uploading ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {uploading ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <Loader2 size={28} className="animate-spin" style={{ color: "var(--color-accent)" }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-accent)" }}>
                          {isRTL ? "جارٍ رفع الصورة من جهازك..." : "Uploading image from device..."}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(196, 144, 124, 0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-accent)",
                          }}
                        >
                          <UploadCloud size={22} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                            {isRTL ? "اضغط لاختيار صورة من جهازك" : "Click to select a photo from device"}
                          </span>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "block", marginTop: "2px" }}>
                            {isRTL ? "أو اسحب الصورة وأفلتها هنا (PNG, JPG, WEBP حتى 10MB)" : "or drag and drop here (PNG, JPG, WEBP up to 10MB)"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Error Alert */}
                {uploadError && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "#FEE2E2",
                      color: "#DC2626",
                      fontSize: "0.8125rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Collapsible Manual URL input */}
                {showUrlInput && (
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                      {isRTL ? "أو الصق رابط الصورة المباشر:" : "Or paste direct image URL:"}
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={imagePath}
                      onChange={(e) => setImagePath(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", fontSize: "0.8125rem", borderRadius: "6px", border: "1px solid var(--color-border)" }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="activeCat"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="activeCat" style={{ fontSize: "0.875rem" }}>
                  Active and visible on public website
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "var(--color-accent)", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
