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
} from "lucide-react";
import api, { formatPrice } from "@/lib/api";
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

  // Customs Fee Update State
  const [customsFee, setCustomsFee] = useState<string>("0");
  const [customsReason, setCustomsReason] = useState("");
  const [updatingCustoms, setUpdatingCustoms] = useState(false);

  // Feedback banner
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const fetchOrderData = () => {
    setLoading(true);
    api
      .get(`/admin/orders/${orderId}`)
      .then((res) => {
        if (res.data?.data) {
          const o = res.data.data;
          setOrder(o);
          setNewStatus(o.status);
          setCustomsFee(o.customs_fee.toString());
        }
      })
      .catch(() => {
        // Fallback to mock order
        const found =
          MOCK_ORDERS.find((o) => o.id.toString() === orderId) ||
          MOCK_ORDERS[0];
        setOrder(found);
        setNewStatus(found.status);
        setCustomsFee(found.customs_fee.toString());
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

  const handleUpdateCustoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setUpdatingCustoms(true);

    const feeNum = parseFloat(customsFee) || 0;

    try {
      await api.patch(`/admin/orders/${order.id}/customs-fee`, {
        customs_fee: feeNum,
        reason: customsReason || undefined,
      });
      setBannerMessage("Customs fee and total order balance adjusted!");
      fetchOrderData();
    } catch {
      // Offline fallback
      setBannerMessage("Customs fee updated!");
      const diff = feeNum - order.customs_fee;
      setOrder({
        ...order,
        customs_fee: feeNum,
        total: order.total + diff,
        remaining_balance: (order.remaining_balance || order.total) + diff,
      });
    } finally {
      setUpdatingCustoms(false);
      setTimeout(() => setBannerMessage(null), 3000);
    }
  };

  const handleVerifyDeposit = async (depositId: number, status: "verified" | "rejected") => {
    try {
      await api.patch(`/admin/deposits/${depositId}/verify`, { status });
      fetchOrderData();
    } catch {
      // Offline fallback
      if (order && order.deposits) {
        setOrder({
          ...order,
          deposits: order.deposits.map((d) =>
            d.id === depositId ? { ...d, status } : d
          ),
        });
      }
    }
  };

  if (loading || !order) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Loading order details...</p>
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
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "6px", margin: 0 }}>
            Registered on {new Date(order.created_at).toLocaleString("en-EG")}
          </p>
        </div>

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
              padding: "12px 20px",
              backgroundColor: "#25D366",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
            }}
          >
            <MessageCircle size={18} />
            <span>Chat with Customer on WhatsApp</span>
          </a>
        )}
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
              {(order.items || []).map((item, idx) => (
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
                        item.product?.images?.[0]?.image_path ||
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
              ))}
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
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "16px" }}>
              Customer Deposits & Transfer Receipts
            </h3>

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
                      borderRadius: "10px",
                      padding: "16px",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: dep.status === "verified" ? "#F0FDF4" : "#FFFFFF",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>{formatPrice(dep.amount)}</span>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "14px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            backgroundColor: dep.status === "verified" ? "#DCFCE7" : "#FEF3C7",
                            color: dep.status === "verified" ? "#166534" : "#92400E",
                          }}
                        >
                          {dep.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                        Via {dep.method.replace(/_/g, " ")} • {new Date(dep.transfer_date).toLocaleString("en-EG")}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {dep.screenshot_path && (
                        <a
                          href={dep.screenshot_path}
                          target="_blank"
                          rel="noopener"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "var(--color-bg-alt)",
                            color: "var(--color-text)",
                            borderRadius: "6px",
                            fontSize: "0.8125rem",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          View Receipt
                        </a>
                      )}

                      {dep.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerifyDeposit(dep.id, "verified")}
                            style={{
                              padding: "6px 14px",
                              backgroundColor: "#059669",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyDeposit(dep.id, "rejected")}
                            style={{
                              padding: "6px 14px",
                              backgroundColor: "#DC2626",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
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
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {new Date(hist.created_at).toLocaleString("en-EG")}
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

          {/* Customs Fee Adjustment */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
              Customs & Clearance Adjustment
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "14px" }}>
              Add or update customs clearance fee levied on this shipment. Total order will update automatically.
            </p>

            <form onSubmit={handleUpdateCustoms} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Customs Fee (EGP)
                </label>
                <input
                  type="number"
                  value={customsFee}
                  onChange={(e) => setCustomsFee(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Airport inspection surcharge"
                  value={customsReason}
                  onChange={(e) => setCustomsReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updatingCustoms}
                style={{
                  padding: "10px",
                  backgroundColor: "var(--color-text)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: updatingCustoms ? "not-allowed" : "pointer",
                }}
              >
                {updatingCustoms ? "Adjusting..." : "Adjust Customs Fee"}
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
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>Customs Fee</span>
                <span>{formatPrice(order.customs_fee)}</span>
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
