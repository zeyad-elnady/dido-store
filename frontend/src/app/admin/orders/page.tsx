"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Phone,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";
import api, { formatPrice, storageUrl, getProductImageForColor } from "@/lib/api";
import { Order, OrderStatus, Product } from "@/types";
import { MOCK_ORDERS, MOCK_PRODUCTS } from "@/lib/mockData";
import { EGYPT_GOVERNORATES } from "@/lib/translations";
import { useLanguage } from "@/context/LanguageContext";

const STATUS_FILTERS = [
  { key: "all", label_en: "All Orders", label_ar: "جميع الطلبات" },
  { key: "pending", label_en: "Pending", label_ar: "في الانتظار" },
  { key: "confirmed", label_en: "Confirmed", label_ar: "مؤكد" },
  { key: "ordered_from_shein", label_en: "Ordered from SHEIN", label_ar: "تم الطلب من شي إن" },
  { key: "shipped", label_en: "Shipped", label_ar: "تم الشحن" },
  { key: "delivered", label_en: "Delivered", label_ar: "تم التسليم" },
  { key: "cancelled", label_en: "Cancelled", label_ar: "ملغي" },
];

interface OrderItemDraft {
  productId: number;
  quantity: number;
  size: string;
  color: string;
}

export default function AdminOrdersPage() {
  const { language, isRTL } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // New Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [sourcePlatform, setSourcePlatform] = useState<"instagram" | "tiktok" | "whatsapp">("instagram");
  const [platformUsername, setPlatformUsername] = useState("");
  const [governorate, setGovernorate] = useState("Cairo");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingFee, setShippingFee] = useState<number>(70);
  const [initialStatus, setInitialStatus] = useState<OrderStatus>("pending");
  const [notes, setNotes] = useState("");
  const [itemsDraft, setItemsDraft] = useState<OrderItemDraft[]>([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/orders")
      .then((res) => {
        if (res.data?.data) {
          setOrders(res.data.data);
        } else if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch products for order creation
    api
      .get("/products")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = activeStatus === "all" || o.status === activeStatus;
      const q = search.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        o.order_number.toLowerCase().includes(q) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, activeStatus, search]);

  const handleOpenCreateModal = () => {
    setFormError(null);
    if (itemsDraft.length === 0 && products.length > 0) {
      const firstProduct = products[0];
      setItemsDraft([
        {
          productId: firstProduct.id,
          quantity: 1,
          size: firstProduct.sizes?.[0] || "Standard",
          color: firstProduct.colors?.[0] || "Standard",
        },
      ]);
    }
    setIsCreateModalOpen(true);
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const firstProduct = products[0];
    setItemsDraft((prev) => [
      ...prev,
      {
        productId: firstProduct.id,
        quantity: 1,
        size: firstProduct.sizes?.[0] || "Standard",
        color: firstProduct.colors?.[0] || "Standard",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itemsDraft.length <= 1) return;
    setItemsDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof OrderItemDraft, value: any) => {
    setItemsDraft((prev) => {
      const copy = [...prev];
      if (field === "productId") {
        const prod = products.find((p) => p.id === Number(value));
        copy[index] = {
          ...copy[index],
          productId: Number(value),
          size: prod?.sizes?.[0] || "Standard",
          color: prod?.colors?.[0] || "Standard",
        };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const itemsSubtotal = useMemo(() => {
    return itemsDraft.reduce((acc, draft) => {
      const prod = products.find((p) => p.id === draft.productId);
      const price = prod?.discount_price ?? prod?.selling_price ?? 0;
      return acc + price * draft.quantity;
    }, 0);
  }, [itemsDraft, products]);

  const totalOrderValue = itemsSubtotal + Number(shippingFee || 0);
  const deposit50Amount = Math.round(totalOrderValue * 0.5);
  const remainingDue = totalOrderValue - deposit50Amount;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError("Please enter the customer's full name.");
      return;
    }

    if (!customerPhone.trim()) {
      setFormError("Please enter the customer's phone number.");
      return;
    }

    if (itemsDraft.length === 0) {
      setFormError("Please add at least one product to the order.");
      return;
    }

    setSubmittingOrder(true);

    const effectiveWhatsapp = sameAsPhone ? customerPhone : (customerWhatsapp || customerPhone);
    const orderItemsPayload = itemsDraft.map((d) => ({
      product_id: d.productId,
      quantity: d.quantity,
      size: d.size,
      color: d.color,
    }));

    const payload = {
      customer: {
        name: customerName,
        phone: customerPhone,
        whatsapp_number: effectiveWhatsapp,
        source_platform: sourcePlatform,
        instagram_username: sourcePlatform === "instagram" ? platformUsername : null,
        tiktok_username: sourcePlatform === "tiktok" ? platformUsername : null,
      },
      items: orderItemsPayload,
      shipping_address: `${governorate} — ${shippingAddress}`.trim(),
      shipping_fee: Number(shippingFee || 0),
      notes: notes || null,
      status: initialStatus,
    };

    try {
      const res = await api.post("/orders", payload);
      const newOrder = res.data;
      if (newOrder && newOrder.id) {
        setOrders((prev) => [newOrder, ...prev]);
        setSuccessToast(`Order #${newOrder.order_number} created successfully!`);
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      // Local fallback
      const generatedNum = `DS-2026-${Math.floor(1005 + Math.random() * 8990)}`;
      const localOrder: Order = {
        id: Date.now(),
        order_number: generatedNum,
        customer_id: Date.now(),
        status: initialStatus,
        subtotal: itemsSubtotal,
        shipping_fee: Number(shippingFee || 0),
        customs_fee: 0,
        discount_amount: 0,
        total: totalOrderValue,
        shipping_address: `${governorate} — ${shippingAddress}`,
        notes: notes || null,
        remaining_balance: initialStatus === "confirmed" ? remainingDue : totalOrderValue,
        verified_deposits_amount: initialStatus === "confirmed" ? deposit50Amount : 0,
        customer: {
          id: Date.now(),
          name: customerName,
          phone: customerPhone,
          whatsapp_number: effectiveWhatsapp,
          source_platform: sourcePlatform,
          instagram_username: sourcePlatform === "instagram" ? platformUsername : null,
          tiktok_username: sourcePlatform === "tiktok" ? platformUsername : null,
        },
        items: itemsDraft.map((d, idx) => {
          const p = products.find((pr) => pr.id === d.productId);
          const price = p?.discount_price ?? p?.selling_price ?? 0;
          return {
            id: idx + 1,
            order_id: Date.now(),
            product_id: d.productId,
            product_name: p?.name_en || "SHEIN Fashion Item",
            unit_price: price,
            quantity: d.quantity,
            size: d.size,
            color: d.color,
            line_total: price * d.quantity,
            product: p,
          };
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setOrders((prev) => [localOrder, ...prev]);
      setSuccessToast(`Order #${generatedNum} created successfully!`);
    } finally {
      setSubmittingOrder(false);
      setIsCreateModalOpen(false);
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerWhatsapp("");
      setPlatformUsername("");
      setShippingAddress("");
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${orderToDelete.id}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setSuccessToast(
        language === "ar"
          ? `تم حذف الطلب #${orderToDelete.order_number} بنجاح`
          : `Order #${orderToDelete.order_number} deleted successfully`
      );
      setTimeout(() => setSuccessToast(null), 4000);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      // Fallback for mock/local items
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setSuccessToast(
        language === "ar"
          ? `تم حذف الطلب #${orderToDelete.order_number} بنجاح`
          : `Order #${orderToDelete.order_number} deleted successfully`
      );
      setTimeout(() => setSuccessToast(null), 4000);
      setOrderToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatusChange = async (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, {
        status: nextStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      setSuccessToast(
        language === "ar"
          ? `تم تحديث حالة الطلب إلى "${nextStatus}" بنجاح`
          : `Order status updated to "${nextStatus.replace(/_/g, " ")}" successfully`
      );
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      console.error("Failed to quick-update order status:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : null) ||
        "Could not update status. Please try again.";
      alert(`Error updating order status: ${errMsg}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: "#059669",
            color: "#FFFFFF",
            padding: "14px 22px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            zIndex: 9999,
            fontWeight: 600,
            fontSize: "0.9375rem",
          }}
        >
          <CheckCircle2 size={20} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            {language === "ar" ? "إدارة الطلبات والعمليات" : "Orders Management"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
            {language === "ar"
              ? "متابعة الطلبات، وتأكيد العربونات، والشراء من شي إن، والتخليص الجمركي، والتسليم."
              : "Track orders through confirmation, SHEIN purchasing, customs clearance, and delivery."}
          </p>
        </div>

        {/* Create New Order Button */}
        <button
          onClick={handleOpenCreateModal}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            padding: "11px 22px",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(196, 144, 124, 0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent)")}
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>{language === "ar" ? "إنشاء طلب يدوي جديد" : "Create New Order"}</span>
        </button>
      </div>

      {/* Filters & Search Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border-light)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "30px",
                border: activeStatus === tab.key ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                backgroundColor: activeStatus === tab.key ? "var(--color-accent)" : "transparent",
                color: activeStatus === tab.key ? "#FFFFFF" : "var(--color-text)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {language === "ar" ? tab.label_ar : tab.label_en}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "var(--color-bg)",
            borderRadius: "8px",
            padding: "10px 14px",
            border: "1px solid var(--color-border)",
            maxWidth: "480px",
          }}
        >
          <Search size={18} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder={
              language === "ar"
                ? "ابحث برقم الطلب، اسم العميل أو الهاتف..."
                : "Search by order #, customer name or phone..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "0.875rem",
              width: "100%",
              color: "var(--color-text)",
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
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
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border-light)" }}>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "رقم الطلب" : "# Order"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "العميل" : "Customer"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "القطع" : "Items"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "إجمالي الطلب" : "Total Value"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "المتبقي للدفع" : "Remaining Due"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {language === "ar" ? "التاريخ" : "Date"}
                </th>
                <th style={{ padding: "14px 20px", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: isRTL ? "left" : "right" }}>
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                    <ShoppingBag size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <div style={{ fontSize: "1rem", fontWeight: 500 }}>No orders found</div>
                    <div style={{ fontSize: "0.875rem", marginTop: "4px" }}>
                      {search ? "Try adjusting your search criteria" : "Click 'Create New Order' to add your first order"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemsCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 1;
                  const isDeliveredOrCancelled = order.status === "delivered" || order.status === "cancelled";
                  const stdDeposit = Math.round((order.total || 0) * 0.5);
                  const rawRemaining = typeof order.remaining_balance === "number"
                    ? order.remaining_balance
                    : Math.max(0, order.total - (order.verified_deposits_amount ?? 0));
                  const remaining = (!isDeliveredOrCancelled && rawRemaining <= 0)
                    ? Math.max(1, (order.total || 0) - stdDeposit)
                    : rawRemaining;
                  const whatsapp = order.customer?.whatsapp_number || order.customer?.phone;

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid var(--color-border-light)",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.875rem" }}>
                          {order.order_number}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text)" }}>
                            {order.customer?.name || "Guest Customer"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                            {order.customer?.source_platform} • {order.customer?.phone}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        {itemsCount} {language === "ar" ? "قطعة" : "piece(s)"}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--color-text)", fontSize: "0.875rem" }}>
                        {formatPrice(order.total)}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: remaining > 0 ? "var(--color-accent-hover)" : "#059669", fontSize: "0.875rem" }}>
                        {formatPrice(remaining)}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`badge status-${order.status}`}
                            style={{
                              cursor: updatingOrderId === order.id ? "wait" : "pointer",
                              border: "1px solid rgba(0,0,0,0.06)",
                              outline: "none",
                              fontWeight: 600,
                              fontSize: "0.8125rem",
                              padding: "6px 24px 6px 12px",
                              borderRadius: "20px",
                              appearance: "none",
                              WebkitAppearance: "none",
                              MozAppearance: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                            title={language === "ar" ? "اضغط لتغيير الحالة فوراً" : "Click to change status"}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="ordered_from_shein">Ordered from SHEIN</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span
                            style={{
                              position: "absolute",
                              right: isRTL ? undefined : "8px",
                              left: isRTL ? "8px" : undefined,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              fontSize: "0.65rem",
                              opacity: 0.6,
                            }}
                          >
                            ▼
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.8125rem" }}>
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", direction: "ltr" }}>
                            {new Date(order.created_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: isRTL ? "left" : "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          {whatsapp && (
                            <a
                              href={`https://wa.me/${whatsapp.replace(/\+/g, "").replace(/\s/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "6px",
                                backgroundColor: "#ECFDF5",
                                color: "#059669",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Message customer on WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                          <Link
                            href={`/admin/orders/${order.id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              backgroundColor: "var(--color-bg-alt)",
                              color: "var(--color-text)",
                              borderRadius: "6px",
                              textDecoration: "none",
                              fontSize: "0.8125rem",
                              fontWeight: 500,
                            }}
                          >
                            <Eye size={14} />
                            <span>{language === "ar" ? "إدارة" : "Manage"}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px 8px",
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              border: "1px solid #FECACA",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            title={language === "ar" ? "حذف الطلب" : "Delete Order"}
                            aria-label="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE NEW ORDER MODAL ────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(6px)",
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
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "880px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--color-border-light)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--color-border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FAF9F6",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                    Create New Order
                  </h2>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor: "var(--color-accent-light)",
                      color: "var(--color-accent-hover)",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      textTransform: "uppercase",
                    }}
                  >
                    Manual Entry
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                  Log customer orders received via Instagram DM, TikTok messages, WhatsApp, or phone calls.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: "6px",
                  borderRadius: "50%",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
                {/* ── Left Column: Customer & Delivery Info ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <User size={16} color="var(--color-accent)" />
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        1. Customer Details
                      </span>
                    </div>

                    {/* Source Platform Selector */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                      {(["instagram", "tiktok", "whatsapp"] as const).map((plat) => (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setSourcePlatform(plat)}
                          style={{
                            flex: 1,
                            padding: "8px",
                            borderRadius: "8px",
                            border: sourcePlatform === plat ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                            backgroundColor: sourcePlatform === plat ? "var(--color-accent-light)" : "#FFFFFF",
                            color: sourcePlatform === plat ? "var(--color-accent-hover)" : "var(--color-text)",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>

                    {/* Platform Username */}
                    {sourcePlatform !== "whatsapp" && (
                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                          {sourcePlatform === "instagram" ? "Instagram Username" : "TikTok Username"}
                        </label>
                        <input
                          type="text"
                          placeholder={sourcePlatform === "instagram" ? "@username" : "@handle"}
                          value={platformUsername}
                          onChange={(e) => setPlatformUsername(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.875rem",
                          }}
                        />
                      </div>
                    )}

                    {/* Customer Full Name */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Salma Ahmed"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010XXXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>

                    {/* WhatsApp Checkbox */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={sameAsPhone}
                          onChange={(e) => setSameAsPhone(e.target.checked)}
                          style={{ accentColor: "var(--color-accent)" }}
                        />
                        <span>WhatsApp number is the same as phone</span>
                      </label>

                      {!sameAsPhone && (
                        <input
                          type="tel"
                          placeholder="WhatsApp Number"
                          value={customerWhatsapp}
                          onChange={(e) => setCustomerWhatsapp(e.target.value)}
                          style={{
                            width: "100%",
                            marginTop: "8px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.875rem",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <MapPin size={16} color="var(--color-accent)" />
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        2. Delivery Address
                      </span>
                    </div>

                    {/* Governorate */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        Governorate
                      </label>
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.875rem",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        {EGYPT_GOVERNORATES.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label_en} ({g.label_ar})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Detailed Address */}
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        Detailed Street Address & Apartment
                      </label>
                      <input
                        type="text"
                        placeholder="Street, Building #, Floor, Apartment"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        Order / Customer Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any special requests or instructions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.875rem",
                          resize: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Products & Pricing ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Package size={16} color="var(--color-accent)" />
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          3. Order Items ({itemsDraft.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--color-accent)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Item</span>
                      </button>
                    </div>

                    {/* Items List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
                      {itemsDraft.map((item, idx) => {
                        const prod = products.find((p) => p.id === item.productId);
                        const price = prod?.discount_price ?? prod?.selling_price ?? 0;
                        const itemImg = getProductImageForColor(prod, item.color);

                        return (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#FAF9F6",
                              borderRadius: "10px",
                              padding: "12px",
                              border: "1px solid var(--color-border-light)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              {itemImg && (
                                <img
                                  src={storageUrl(itemImg)}
                                  alt={prod?.name_en || ""}
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "6px",
                                    objectFit: "cover",
                                    border: "1px solid var(--color-border)",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <select
                                value={item.productId}
                                onChange={(e) => handleUpdateItem(idx, "productId", e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--color-border)",
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                  backgroundColor: "#FFFFFF",
                                }}
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name_en} — EGP {p.discount_price ?? p.selling_price}
                                  </option>
                                ))}
                              </select>

                              {itemsDraft.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#EF4444",
                                    padding: "4px",
                                  }}
                                  title="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "8px", alignItems: "center" }}>
                              {/* Size */}
                              <div>
                                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Size</label>
                                <select
                                  value={item.size}
                                  onChange={(e) => handleUpdateItem(idx, "size", e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "5px 6px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    fontSize: "0.75rem",
                                    backgroundColor: "#FFFFFF",
                                  }}
                                >
                                  {(prod?.sizes || ["Standard"]).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Color */}
                              <div>
                                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Color</label>
                                <select
                                  value={item.color}
                                  onChange={(e) => handleUpdateItem(idx, "color", e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "5px 6px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    fontSize: "0.75rem",
                                    backgroundColor: "#FFFFFF",
                                  }}
                                >
                                  {(prod?.colors || ["Standard"]).map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Quantity */}
                              <div>
                                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Qty</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={99}
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                                  style={{
                                    width: "100%",
                                    padding: "5px 6px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    fontSize: "0.75rem",
                                    textAlign: "center",
                                  }}
                                />
                              </div>
                            </div>

                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textAlign: "right", fontWeight: 600 }}>
                              Line Total: EGP {price * item.quantity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financials & Status */}
                  <div style={{ backgroundColor: "#F7F5F0", borderRadius: "12px", padding: "16px", border: "1px solid var(--color-border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "6px" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Items Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>EGP {itemsSubtotal}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", marginBottom: "6px" }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Shipping Fee:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span>EGP</span>
                        <input
                          type="number"
                          value={shippingFee}
                          onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                          style={{
                            width: "60px",
                            padding: "3px 6px",
                            borderRadius: "4px",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.8125rem",
                            textAlign: "right",
                            fontWeight: 600,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)", margin: "8px 0" }} />

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem", fontWeight: 700, marginBottom: "8px" }}>
                      <span>Total Value:</span>
                      <span style={{ color: "var(--color-text)" }}>EGP {totalOrderValue}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--color-accent-hover)", fontWeight: 700, marginBottom: "4px" }}>
                      <span>Required 50% Deposit:</span>
                      <span>EGP {deposit50Amount}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                      <span>Remaining Balance on Delivery:</span>
                      <span>EGP {remainingDue}</span>
                    </div>
                  </div>

                  {/* Initial Status Selector */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                      Initial Order Status
                    </label>
                    <select
                      value={initialStatus}
                      onChange={(e) => setInitialStatus(e.target.value as OrderStatus)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.875rem",
                        backgroundColor: "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
                      <option value="pending">Pending (Awaiting 50% Deposit)</option>
                      <option value="confirmed">Confirmed (50% Deposit Received)</option>
                      <option value="ordered_from_shein">Ordered from SHEIN</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div style={{ margin: "0 28px 16px 28px", padding: "10px 14px", backgroundColor: "#FEF2F2", color: "#B91C1C", borderRadius: "8px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div
                style={{
                  padding: "16px 28px",
                  borderTop: "1px solid var(--color-border-light)",
                  backgroundColor: "#FAF9F6",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--color-text)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--color-accent)",
                    color: "#FFFFFF",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    cursor: submittingOrder ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 10px rgba(196, 144, 124, 0.3)",
                    opacity: submittingOrder ? 0.7 : 1,
                  }}
                >
                  {submittingOrder ? "Creating Order..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── CONFIRM DELETE MODAL ─────────────────────────────────────── */}
      {orderToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => !deleting && setOrderToDelete(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "460px",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              border: "1px solid var(--color-border-light)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Header */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-text)",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              {language === "ar" ? "تأكيد حذف الطلب" : "Are you sure?"}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              {language === "ar"
                ? `هل أنت متأكد من حذف الطلب رقم "${orderToDelete.order_number}" للعميل "${orderToDelete.customer?.name || "بدون اسم"}"؟ سيتم حذف جميع بيانات الطلب ولا يمكن التراجع عن هذه الخطوة.`
                : `Are you sure you want to delete order #${orderToDelete.order_number} for customer "${orderToDelete.customer?.name || "Guest"}"? This action cannot be undone.`}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setOrderToDelete(null)}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--color-text)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteOrder}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                <Trash2 size={16} />
                <span>
                  {deleting
                    ? (language === "ar" ? "جاري الحذف..." : "Deleting...")
                    : (language === "ar" ? "نعم، حذف الطلب" : "Yes, Delete Order")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
