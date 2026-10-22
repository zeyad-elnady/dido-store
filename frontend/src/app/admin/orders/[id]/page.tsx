"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Save,
  Check,
  X,
  Upload,
  Trash2,
} from "lucide-react";
import api, { formatPrice, storageUrl, getProductImageForColor } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import { MOCK_ORDERS } from "@/lib/mockData";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Update State
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Admin manual deposit upload state
  const [adminUploadOpen, setAdminUploadOpen] = useState(false);
  const [adminDepositAmount, setAdminDepositAmount] = useState("");
  const [adminDepositMethod, setAdminDepositMethod] = useState<"instapay" | "vodafone_cash" | "telda">("instapay");
  const [adminReceiptFile, setAdminReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Feedback banner
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const handleDeleteOrder = async () => {
    if (!order) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${order.id}`);
      router.push("/admin/orders");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete order");
      setDeleting(false);
    }
  };

  const fetchOrderData = () => {
    setLoading(true);
    api
      .get(`/admin/orders/${orderId}`)
      .then((res) => {
        const o = res.data?.data || res.data;
        if (o && (o.id || o.order_number)) {
          setOrder(o);
          setNewStatus(o.status);
        }
      })
      .catch((err) => {
        console.error("Failed to load order:", err);
        const found = MOCK_ORDERS.find((o) => o.id.toString() === orderId);
        if (found) {
          setOrder(found);
          setNewStatus(found.status);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setUpdatingStatus(true);

    try {
      await api.patch(`/admin/orders/${order.id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });
      setBannerMessage(`Status successfully updated to "${newStatus.replace(/_/g, " ")}"`);
      setStatusNote("");
      fetchOrderData();
    } catch {
      // Offline fallback: update local state
      setBannerMessage(`Status updated to "${newStatus.replace(/_/g, " ")}" (Saved locally)`);
      setOrder({
        ...order,
        status: newStatus,
        status_history: [
          ...(order.status_history || []),
          {
            id: Date.now(),
            order_id: order.id,
            old_status: order.status,
            new_status: newStatus,
            changed_by: 1,
            note: statusNote || "Status updated by admin",
            created_at: new Date().toISOString(),
          },
        ],
      });
      setStatusNote("");
    } finally {
      setUpdatingStatus(false);
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  const handleAdminUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!adminReceiptFile) {
      alert("Please select a receipt screenshot / image first.");
      return;
    }
    setUploadingReceipt(true);
    const formData = new FormData();
    formData.append("amount", adminDepositAmount || Math.round(order.total * 0.5).toString());
    formData.append("method", adminDepositMethod);
    formData.append("transfer_date", new Date().toISOString().split("T")[0]);
    formData.append("screenshot", adminReceiptFile);

    try {
      await api.post(`/orders/${order.order_number}/deposits`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBannerMessage("Transaction receipt uploaded and linked to order!");
      setAdminUploadOpen(false);
      setAdminReceiptFile(null);
      setAdminDepositAmount("");
      fetchOrderData();
    } catch (err: unknown) {
      console.error("Failed to upload deposit:", err);
      const msg = err && typeof err === "object" && "response" in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response: { data: { message: string } } }).response.data.message
        : "Failed to upload receipt";
      alert(msg);
    } finally {
      setUploadingReceipt(false);
      setTimeout(() => setBannerMessage(null), 3500);
    }
  };

  const handleVerifyDeposit = async (depositId: number, status: "verified" | "rejected" | "pending") => {
    try {
      await api.patch(`/admin/deposits/${depositId}/verify`, { status });
      setBannerMessage(`Deposit status marked as "${status}".`);
      fetchOrderData();
    } catch {
      // Offline fallback
      if (order && order.deposits) {
        const updatedDeposits = order.deposits.map((d) =>
          d.id === depositId ? { ...d, status } : d
        );
        const verifiedSum = updatedDeposits
          .filter((d) => d.status === "verified")
          .reduce((sum, d) => sum + parseFloat(d.amount as any), 0);
        setOrder({
          ...order,
          deposits: updatedDeposits,
          verified_deposits_amount: verifiedSum,
          remaining_balance: Math.max(0, (order.total || 0) - verifiedSum),
        });
      }
    } finally {
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  const handleDeleteDeposit = async (depositId: number) => {
    if (!confirm("Are you sure you want to delete this deposit receipt? This will adjust the verified balance and remaining due.")) {
      return;
    }
    try {
      await api.delete(`/admin/deposits/${depositId}`);
      setBannerMessage("Deposit receipt deleted successfully.");
      fetchOrderData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete deposit receipt");
    } finally {
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.25rem", color: "var(--color-text)", marginBottom: "8px" }}>Order Not Found</h3>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px" }}>The requested order (#{orderId}) could not be found.</p>
        <Link href="/admin/orders" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
          Back to All Orders
        </Link>
      </div>
    );
  }

  const customerWhatsapp = order.customer?.whatsapp_number || order.customer?.phone;
  const isPaidInFull = (order.remaining_balance || 0) <= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/orders"
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
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid var(--color-border-light)",
          padding: "24px 28px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
              {order.order_number}
            </h1>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.8125rem",
                fontWeight: 700,
                textTransform: "uppercase",
                backgroundColor:
                  order.status === "delivered"
                    ? "#DCFCE7"
                    : order.status === "shipped"
                    ? "#E0E7FF"
                    : order.status === "ordered_from_shein"
                    ? "#EDE9FE"
                    : order.status === "confirmed"
                    ? "#DBEAFE"
                    : "#FEF3C7",
                color:
                  order.status === "delivered"
                    ? "#166534"
                    : order.status === "shipped"
                    ? "#3730A3"
                    : order.status === "ordered_from_shein"
                    ? "#5B21B6"
                    : order.status === "confirmed"
                    ? "#1E40AF"
                    : "#92400E",
              }}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "6px", margin: 0, direction: "ltr" }}>
            Registered on{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(order.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* WhatsApp Direct Action */}
          {customerWhatsapp && (
            <a
              href={`https://wa.me/${customerWhatsapp.replace(/\+/g, "").replace(/\s/g, "")}?text=${encodeURIComponent(
                `Hello ${order.customer?.name || ""}, this is Dido Store regarding your order #${order.order_number}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                backgroundColor: "#25D366",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
              }}
            >
              <MessageCircle size={18} />
              <span>WhatsApp Customer</span>
            </a>
          )}

          {/* Delete Order Action */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Trash2 size={16} />
            <span>Delete Order</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div
          style={{
            backgroundColor: "#DCFCE7",
            border: "1px solid #86EFAC",
            borderRadius: "10px",
            padding: "14px 18px",
            color: "#166534",
            fontSize: "0.875rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "28px",
          alignItems: "flex-start",
        }}
        className="order-detail-grid"
      >
        {/* Left Column: Items & Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Items Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
              Ordered Items ({order.items?.length || 1})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(order.items || []).map((item, idx) => {
                const itemImg = getProductImageForColor(item.product, item.color);
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid var(--color-border-light)",
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "90px",
                        borderRadius: "8px",
                        backgroundColor: "#f5f5f5",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          storageUrl(itemImg) ||
                          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300"
                        }
                        alt={item.product_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                        {item.product_name}
                      </h4>
                      <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                        Size: <strong>{item.size || "Standard"}</strong> • Color: <strong>{item.color || "Standard"}</strong> • Qty: <strong>{item.quantity}</strong>
                      </div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text)", marginTop: "8px" }}>
                        {formatPrice(item.line_total || item.unit_price * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Deposits */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                Customer Deposits & Transfer Receipts
              </h3>
              <button
                type="button"
                onClick={() => setAdminUploadOpen(!adminUploadOpen)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  backgroundColor: adminUploadOpen ? "var(--color-border)" : "var(--color-accent-light)",
                  color: adminUploadOpen ? "var(--color-text)" : "var(--color-accent)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Upload size={14} />
                {adminUploadOpen ? "Cancel Upload" : "Upload Receipt Photo"}
              </button>
            </div>

            {adminUploadOpen && (
              <form
                onSubmit={handleAdminUploadReceipt}
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "var(--color-bg-alt)",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text)" }}>
                  Upload Transaction Receipt Photo
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                      Amount (EGP)
                    </label>
                    <input
                      type="number"
                      placeholder={(order.total * 0.5).toString()}
                      value={adminDepositAmount}
                      onChange={(e) => setAdminDepositAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.875rem",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                      Payment Method
                    </label>
                    <select
                      value={adminDepositMethod}
                      onChange={(e) => setAdminDepositMethod(e.target.value as "instapay" | "vodafone_cash" | "telda")}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.875rem",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <option value="instapay">InstaPay</option>
                      <option value="vodafone_cash">Vodafone Cash</option>
                      <option value="telda">Telda</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                    Receipt Photo (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAdminReceiptFile(e.target.files[0]);
                      }
                    }}
                    style={{ fontSize: "0.8125rem" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUploadOpen(false);
                      setAdminReceiptFile(null);
                    }}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingReceipt || !adminReceiptFile}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--color-accent)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: uploadingReceipt || !adminReceiptFile ? "not-allowed" : "pointer",
                    }}
                  >
                    {uploadingReceipt ? "Uploading..." : "Save & Link Receipt"}
                  </button>
                </div>
              </form>
            )}

            {order.deposits && order.deposits.length > 1 && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertCircle size={22} color="#DC2626" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#991B1B", fontSize: "0.875rem" }}>
                    Multiple Deposits Detected ({order.deposits.length} deposits totaling {formatPrice(order.deposits.reduce((sum, d) => sum + parseFloat(d.amount as any), 0))})
                  </strong>
                  <div style={{ color: "#7F1D1D", fontSize: "0.75rem", marginTop: "2px" }}>
                    Clients only pay a 50% deposit ({formatPrice(order.total * 0.5)}). Multiple deposits can mistakenly mark 100% of the product as paid. Use the Delete button below on any duplicate receipt.
                  </div>
                </div>
              </div>
            )}

            {(!order.deposits || order.deposits.length === 0) ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                No deposits submitted for this order yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {order.deposits.map((dep) => (
                  <div
                    key={dep.id}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      backgroundColor: dep.status === "verified" ? "#F0FDF4" : "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{formatPrice(dep.amount)}</span>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "14px",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor: dep.status === "verified" ? "#DCFCE7" : dep.status === "rejected" ? "#FEE2E2" : "#FEF3C7",
                              color: dep.status === "verified" ? "#166534" : dep.status === "rejected" ? "#991B1B" : "#92400E",
                            }}
                          >
                            {dep.status}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px", direction: "ltr" }}>
                          Via {dep.method.replace(/_/g, " ")} •{" "}
                          {new Date(dep.transfer_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {new Date(dep.transfer_date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {dep.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerifyDeposit(dep.id, "verified")}
                              style={{
                                padding: "6px 14px",
                                backgroundColor: "#059669",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyDeposit(dep.id, "rejected")}
                              style={{
                                padding: "6px 14px",
                                backgroundColor: "#DC2626",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </>
                        )}

                        {dep.status === "verified" && (
                          <button
                            onClick={() => handleVerifyDeposit(dep.id, "rejected")}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              border: "1px solid #FDE68A",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            title="Un-verify this deposit and mark as rejected"
                          >
                            <X size={13} />
                            Unverify / Reject
                          </button>
                        )}

                        {dep.status === "rejected" && (
                          <button
                            onClick={() => handleVerifyDeposit(dep.id, "verified")}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#DCFCE7",
                              color: "#166534",
                              border: "1px solid #BBF7D0",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Check size={13} />
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteDeposit(dep.id)}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Delete deposit record"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Receipt Photo Preview */}
                    {dep.screenshot_path ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "12px 16px",
                          backgroundColor: "var(--color-bg-alt)",
                          borderRadius: "10px",
                          border: "1px dashed var(--color-border)",
                        }}
                      >
                        <a
                          href={storageUrl(dep.screenshot_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Click to view full photo"
                          style={{
                            display: "block",
                            width: "90px",
                            height: "90px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            flexShrink: 0,
                            position: "relative",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={storageUrl(dep.screenshot_path)}
                            alt="Transaction receipt"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </a>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                            Transaction Screenshot Photo
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            File: {dep.screenshot_path.split("/").pop()}
                          </span>
                          <a
                            href={storageUrl(dep.screenshot_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "5px 12px",
                              backgroundColor: "#FFFFFF",
                              color: "var(--color-accent)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "6px",
                              fontSize: "0.8125rem",
                              textDecoration: "none",
                              fontWeight: 600,
                              width: "fit-content",
                            }}
                          >
                            <ExternalLink size={13} />
                            View Full Resolution Photo
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        No receipt photo attached to this deposit.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log */}
          {order.status_history && order.status_history.length > 0 && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid var(--color-border-light)",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "18px" }}>
                Status History Log
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {order.status_history.map((hist, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-accent-light)",
                        color: "var(--color-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <Clock size={12} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                        {hist.new_status.replace(/_/g, " ")}
                      </span>
                      {hist.note && (
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
                          {hist.note}
                        </p>
                      )}
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", direction: "ltr" }}>
                        {new Date(hist.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(hist.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Controls & Balance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Status Progression Control */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "16px" }}>
              Update Pipeline Status
            </h3>

            <form onSubmit={handleUpdateStatus} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                  Status Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                >
                  <option value="pending">Pending (Awaiting Deposit)</option>
                  <option value="confirmed">Confirmed (Locks Stock)</option>
                  <option value="ordered_from_shein">Ordered from SHEIN</option>
                  <option value="shipped">Shipped (Cleared Customs & In Transit)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Restores Stock)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
                  Status Note / SHEIN Ref #
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHEIN order placed Ref #GZ-882910"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  backgroundColor: "var(--color-accent)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: updatingStatus ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Save size={16} />
                <span>{updatingStatus ? "Saving..." : "Update Status"}</span>
              </button>
            </form>
          </div>



          {/* Financial Summary Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "16px" }}>
              Financial Balance
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Shipping Fee</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--color-border-light)",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>
                <span>Required 50% Deposit</span>
                <span>{formatPrice(Math.round((order.total || 0) * 0.5))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", fontWeight: 600 }}>
                <span>Verified Deposits</span>
                <span>- {formatPrice(order.verified_deposits_amount || 0)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "10px",
                  borderTop: "2px dashed var(--color-border)",
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: isPaidInFull ? "#059669" : "var(--color-accent-hover)",
                }}
              >
                <span>Remaining Due:</span>
                <span>{formatPrice(order.remaining_balance ?? order.total)}</span>
              </div>
            </div>

            {/* Customer Details info */}
            <div
              style={{
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid var(--color-border-light)",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>Customer: {order.customer?.name}</div>
              <div style={{ color: "var(--color-text-secondary)" }}>Phone: {order.customer?.phone}</div>
              <div style={{ color: "var(--color-text-secondary)", marginTop: "4px" }}>
                Delivery Address: {order.shipping_address}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRM DELETE MODAL ─────────────────────────────────────── */}
      {isDeleteModalOpen && order && (
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
          onClick={() => !deleting && setIsDeleteModalOpen(false)}
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
              Are you sure?
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
              Are you sure you want to delete order #{order.order_number} for customer &quot;{order.customer?.name || "Guest"}&quot;? All associated records will be deleted and this action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteModalOpen(false)}
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
                Cancel
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
                <span>{deleting ? "Deleting..." : "Yes, Delete Order"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 960px) {
          :global(.order-detail-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
