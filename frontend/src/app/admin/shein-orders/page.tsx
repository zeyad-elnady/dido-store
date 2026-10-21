"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  ShoppingBag,
  CheckSquare,
  Square,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Save,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  DollarSign,
  Truck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api, { formatPrice, storageUrl } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Order, OrderItem } from "@/types";
import { MOCK_ORDERS } from "@/lib/mockData";

export default function SheinOrdersCalculatorPage() {
  const { language, isRTL } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selection: Map of order ID -> boolean
  const [selectedOrderIds, setSelectedOrderIds] = useState<Record<number, boolean>>({});

  // Item Costs: Map of `${orderId}-${itemId}` -> SHEIN Cost per unit in EGP
  const [itemCosts, setItemCosts] = useState<Record<string, number>>({});

  // Customs & Clearance (جمارك) price for this batch in EGP
  const [customsFee, setCustomsFee] = useState<string>("0");

  // Optional Logistics / Extra shipping in EGP
  const [logisticsFee, setLogisticsFee] = useState<string>("0");

  // SHEIN Order Reference for batch marking
  const [sheinReference, setSheinReference] = useState<string>("");
  const [updatingBatch, setUpdatingBatch] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedList, setCopiedList] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders?per_page=100");
      const list: Order[] = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setOrders(list);
        initItemCosts(list);
      } else {
        setOrders(MOCK_ORDERS);
        initItemCosts(MOCK_ORDERS);
      }
    } catch {
      setOrders(MOCK_ORDERS);
      initItemCosts(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const initItemCosts = (ordersList: Order[]) => {
    setItemCosts((prev) => {
      const initial: Record<string, number> = { ...prev };
      ordersList.forEach((order) => {
        (order.items || []).forEach((item) => {
          const key = `${order.id}-${item.id}`;
          if (initial[key] === undefined) {
            // Default to product cost_price if saved, otherwise 60% of unit price
            const productCost = item.product?.cost_price;
            initial[key] = productCost ? parseFloat(productCost.toString()) : Math.round(item.unit_price * 0.6);
          }
        });
      });
      return initial;
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Exclude cancelled
      if (order.status === "cancelled") return false;

      // Filter by status tab
      if (statusFilter === "pending_or_confirmed") {
        if (order.status !== "pending" && order.status !== "confirmed") return false;
      } else if (statusFilter === "ordered_from_shein") {
        if (order.status !== "ordered_from_shein") return false;
      } else if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const numMatch = order.order_number?.toLowerCase().includes(q);
      const nameMatch = order.customer?.name?.toLowerCase().includes(q);
      const phoneMatch = order.customer?.phone?.includes(q);
      return numMatch || nameMatch || phoneMatch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Selected orders array
  const selectedOrders = useMemo(() => {
    return orders.filter((o) => selectedOrderIds[o.id]);
  }, [orders, selectedOrderIds]);

  // Toggle single order selection
  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Toggle select all visible orders
  const toggleSelectAll = () => {
    const allSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds[o.id]);
    const updated = { ...selectedOrderIds };
    filteredOrders.forEach((o) => {
      updated[o.id] = !allSelected;
    });
    setSelectedOrderIds(updated);
  };

  // Handle inline cost update for an item
  const handleItemCostChange = (orderId: number, itemId: number, value: string) => {
    const num = parseFloat(value) || 0;
    setItemCosts((prev) => ({
      ...prev,
      [`${orderId}-${itemId}`]: num,
    }));
  };

  // ── Financial Calculations ──────────────────────────────────────────────
  const calculations = useMemo(() => {
    let totalCustomerRevenue = 0;
    let totalSheinCost = 0;
    let totalItemCount = 0;

    selectedOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const qty = item.quantity || 1;
        totalItemCount += qty;
        totalCustomerRevenue += (parseFloat(item.unit_price?.toString() || "0") * qty);

        const key = `${order.id}-${item.id}`;
        const unitCost = itemCosts[key] !== undefined ? itemCosts[key] : (item.product?.cost_price || Math.round(item.unit_price * 0.6));
        totalSheinCost += unitCost * qty;
      });
    });

    const customs = Math.max(0, parseFloat(customsFee) || 0);
    const logistics = Math.max(0, parseFloat(logisticsFee) || 0);

    const totalExpenses = totalSheinCost + customs + logistics;
    const finalWinning = totalCustomerRevenue - totalExpenses;
    const profitMargin = totalCustomerRevenue > 0 ? (finalWinning / totalCustomerRevenue) * 100 : 0;

    return {
      totalCustomerRevenue,
      totalSheinCost,
      customs,
      logistics,
      totalExpenses,
      finalWinning,
      profitMargin,
      totalItemCount,
      orderCount: selectedOrders.length,
    };
  }, [selectedOrders, itemCosts, customsFee, logisticsFee]);

  // Copy SHEIN purchase list to clipboard
  const handleCopyPurchaseList = () => {
    if (selectedOrders.length === 0) return;

    let text = `📦 DIDO STORE — SHEIN BATCH ORDER SHEET\n`;
    text += `Date: ${new Date().toLocaleDateString("en-EG")}\n`;
    text += `Selected Orders (${calculations.orderCount}): ${selectedOrders.map((o) => o.order_number).join(", ")}\n`;
    text += `Total Pieces: ${calculations.totalItemCount}\n\n`;
    text += `ITEMS TO ORDER:\n`;
    text += `------------------------------------\n`;

    selectedOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = `${o.id}-${item.id}`;
        const cost = itemCosts[key] || item.product?.cost_price || 0;
        text += `• ${item.product_name} | Qty: ${item.quantity} | Size: ${item.size || "N/A"} | Color: ${item.color || "N/A"}\n`;
        text += `  Order: ${o.order_number} (${o.customer?.name || "Client"})\n`;
        text += `  SHEIN Cost: ${cost} EGP | Customer Price: ${item.unit_price} EGP\n\n`;
      });
    });

    text += `------------------------------------\n`;
    text += `FINANCIAL SUMMARY:\n`;
    text += `Total Customer Revenue: ${calculations.totalCustomerRevenue.toLocaleString()} EGP\n`;
    text += `Total SHEIN Cost: ${calculations.totalSheinCost.toLocaleString()} EGP\n`;
    text += `Customs & Clearance (جمارك): ${calculations.customs.toLocaleString()} EGP\n`;
    text += `Total Expenses: ${calculations.totalExpenses.toLocaleString()} EGP\n`;
    text += `FINAL WINNING (المكسب الصافي): ${calculations.finalWinning.toLocaleString()} EGP (${calculations.profitMargin.toFixed(1)}%)\n`;

    navigator.clipboard.writeText(text);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2500);
  };

  // Batch update orders to "ordered_from_shein"
  const handleBatchMarkOrdered = async () => {
    if (selectedOrders.length === 0) {
      alert(language === "ar" ? "يرجى تحديد طلب واحد على الأقل" : "Please select at least one order");
      return;
    }

    const confirmMsg = language === "ar"
      ? `هل أنت متأكد من تحديث ${selectedOrders.length} طلب إلى (تم الطلب من شي إن)؟`
      : `Are you sure you want to mark ${selectedOrders.length} orders as "Ordered from SHEIN"?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingBatch(true);
    setBannerMessage(null);

    const refNote = sheinReference.trim()
      ? `SHEIN Ref #${sheinReference.trim()}`
      : "Batch ordered from SHEIN";

    // Allocate customs fee evenly across selected orders if entered
    const perOrderCustoms = calculations.orderCount > 0 ? Math.round((calculations.customs / calculations.orderCount) * 100) / 100 : 0;

    let successCount = 0;

    for (const order of selectedOrders) {
      try {
        await api.patch(`/admin/orders/${order.id}/status`, {
          status: "ordered_from_shein",
          note: refNote,
        });

        if (perOrderCustoms > 0) {
          try {
            await api.patch(`/admin/orders/${order.id}/customs-fee`, {
              customs_fee: perOrderCustoms,
              reason: `Batch SHEIN allocation (${sheinReference || "Import"})`,
            });
          } catch {}
        }

        successCount++;
      } catch (err) {
        console.error(`Failed to update order ${order.id}:`, err);
      }
    }

    setUpdatingBatch(false);
    if (successCount > 0) {
      setBannerMessage({
        type: "success",
        text: language === "ar"
          ? `تم تحديث ${successCount} طلب بنجاح إلى "تم الطلب من شي إن"!`
          : `Successfully updated ${successCount} orders to "Ordered from SHEIN"!`,
      });
      setSheinReference("");
      fetchOrders();
    } else {
      setBannerMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء تحديث بعض الطلبات." : "Error updating some orders.",
      });
    }
  };

  return (
    <div style={{ padding: "32px 28px 80px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calculator size={22} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
              {language === "ar" ? "حساب أرباح وطلبات شي إن" : "SHEIN Purchasing & Profit"}
            </h1>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", margin: 0 }}>
            {language === "ar"
              ? "حددي طلبات العملاء من المتجر، أدخلي تكلفة الشراء من شي إن وسعر الجمارك، لمعرفة المكسب الصافي بدقة وتحديث الحالة بنقرة واحدة."
              : "Select customer orders, enter your owner SHEIN cost & customs fee in EGP, and calculate your exact net winning."}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleCopyPurchaseList}
            disabled={selectedOrders.length === 0}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: selectedOrders.length === 0 ? "not-allowed" : "pointer",
              opacity: selectedOrders.length === 0 ? 0.6 : 1,
            }}
          >
            {copiedList ? <Check size={16} color="#059669" /> : <Copy size={16} />}
            <span>{copiedList ? (language === "ar" ? "تم النسخ!" : "Copied!") : (language === "ar" ? "نسخ كشف الشراء" : "Copy Batch Sheet")}</span>
          </button>

          <Link
            href="/admin/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--color-bg-alt)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ShoppingBag size={16} />
            <span>{language === "ar" ? "إدارة كل الطلبات" : "All Orders"}</span>
          </Link>
        </div>
      </div>

      {/* Banner notification */}
      {bannerMessage && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "24px",
            backgroundColor: bannerMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${bannerMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            color: bannerMessage.type === "success" ? "#065F46" : "#991B1B",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {bannerMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* ── Main Grid Layout ────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: "28px",
          alignItems: "flex-start",
        }}
        className="shein-calculator-grid"
      >
        {/* ── Left Column: Orders Selector & Items List ───────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Controls Bar: Search & Status Filter */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid var(--color-border-light)",
              padding: "16px 20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Status Filter Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "all", label_ar: "جميع الطلبات", label_en: "All Orders" },
                { id: "pending_or_confirmed", label_ar: "جاهزة للطلب (قيد الانتظار والمؤكدة)", label_en: "Ready (Pending & Confirmed)" },
                { id: "ordered_from_shein", label_ar: "تم طلبها من شي إن", label_en: "Ordered from SHEIN" },
              ].map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 700 : 500,
                      border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                      backgroundColor: active ? "var(--color-accent-light)" : "transparent",
                      color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {language === "ar" ? tab.label_ar : tab.label_en}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "240px", flex: 1, maxWidth: "340px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  [isRTL ? "right" : "left"]: "12px",
                  color: "var(--color-text-muted)",
                }}
              />
              <input
                type="text"
                placeholder={language === "ar" ? "بحث برقم الطلب أو العميل..." : "Search by order # or customer..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: isRTL ? "8px 36px 8px 12px" : "8px 12px 8px 36px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.8125rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Select All Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 16px",
              backgroundColor: "#FAF7F2",
              borderRadius: "10px",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <button
              onClick={toggleSelectAll}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                color: "var(--color-text)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds[o.id]) ? (
                <CheckSquare size={18} color="var(--color-accent)" />
              ) : (
                <Square size={18} color="var(--color-text-muted)" />
              )}
              <span>
                {language === "ar" ? "تحديد كل الطلبات المعروضة" : "Select All Displayed Orders"} ({filteredOrders.length})
              </span>
            </button>

            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {language === "ar"
                ? `المحدد: ${selectedOrders.length} طلب (${calculations.totalItemCount} قطعة)`
                : `Selected: ${selectedOrders.length} orders (${calculations.totalItemCount} items)`}
            </span>
          </div>

          {/* Orders Cards List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
              {language === "ar" ? "جارٍ تحميل الطلبات..." : "Loading store orders..."}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid var(--color-border-light)",
                padding: "48px 24px",
                textAlign: "center",
                color: "var(--color-text-secondary)",
              }}
            >
              <ShoppingBag size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: "1rem", fontWeight: 600 }}>
                {language === "ar" ? "لا توجد طلبات مطابقة" : "No matching orders found"}
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                {language === "ar" ? "جربي تغيير الفلتر أو كلمة البحث أعلاه." : "Try clearing filters or search query."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = !!selectedOrderIds[order.id];

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "14px",
                    border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--color-border-light)",
                    boxShadow: isSelected ? "0 4px 16px rgba(196, 144, 124, 0.12)" : "0 2px 6px rgba(0,0,0,0.02)",
                    overflow: "hidden",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Order Card Header */}
                  <div
                    onClick={() => toggleOrderSelection(order.id)}
                    style={{
                      padding: "16px 20px",
                      backgroundColor: isSelected ? "var(--color-accent-light)" : "#FAFAFA",
                      borderBottom: "1px solid var(--color-border-light)",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {isSelected ? (
                        <CheckSquare size={20} color="var(--color-accent)" />
                      ) : (
                        <Square size={20} color="var(--color-text-muted)" />
                      )}

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text)" }}>
                            {order.order_number}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor:
                                order.status === "ordered_from_shein"
                                  ? "#DBEAFE"
                                  : order.status === "confirmed"
                                  ? "#DCFCE7"
                                  : "#FEF3C7",
                              color:
                                order.status === "ordered_from_shein"
                                  ? "#1E40AF"
                                  : order.status === "confirmed"
                                  ? "#166534"
                                  : "#92400E",
                            }}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                          {order.customer?.name || "Customer"} • {order.customer?.phone || ""} • {new Date(order.created_at).toLocaleDateString("en-EG")}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ textAlign: isRTL ? "left" : "right" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                          {language === "ar" ? "سعر البيع للعميل" : "Customer Total"}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>
                          {formatPrice(order.total)}
                        </div>
                      </div>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        title={language === "ar" ? "عرض تفاصيل الطلب الكاملة" : "View Full Order"}
                        style={{
                          color: "var(--color-text-muted)",
                          padding: "6px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {(order.items || []).map((item) => {
                        const key = `${order.id}-${item.id}`;
                        const sheinUnitCost = itemCosts[key] !== undefined ? itemCosts[key] : (item.product?.cost_price || Math.round(item.unit_price * 0.6));
                        const itemQty = item.quantity || 1;
                        const itemCustomerTotal = item.unit_price * itemQty;
                        const itemSheinTotal = sheinUnitCost * itemQty;
                        const itemProfit = itemCustomerTotal - itemSheinTotal;

                        const primaryImg = item.product?.images?.find((img) => img.is_primary)?.image_path ||
                          item.product?.images?.[0]?.image_path;

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "auto 1fr 140px 140px 110px",
                              alignItems: "center",
                              gap: "16px",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              backgroundColor: isSelected ? "#FAF7F2" : "#FAFAFA",
                              border: "1px solid var(--color-border-light)",
                            }}
                          >
                            {/* Product Thumbnail */}
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                backgroundColor: "var(--color-border-light)",
                                flexShrink: 0,
                              }}
                            >
                              {primaryImg ? (
                                <img
                                  src={storageUrl(primaryImg)}
                                  alt={item.product_name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text)" }}>
                                {item.product_name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                                {item.size && <span>Size: {item.size} • </span>}
                                {item.color && <span>Color: {item.color} • </span>}
                                <span>Qty: <b>{itemQty}</b></span>
                              </div>
                            </div>

                            {/* Customer Selling Price */}
                            <div>
                              <div style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>
                                {language === "ar" ? "سعر بيع القطعة" : "Selling Price"}
                              </div>
                              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text)" }}>
                                {formatPrice(item.unit_price)}
                              </div>
                              {itemQty > 1 && (
                                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
                                  Total: {formatPrice(itemCustomerTotal)}
                                </div>
                              )}
                            </div>

                            {/* Owner SHEIN Cost Input (EGP) */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-accent)", fontWeight: 700, marginBottom: "2px" }}>
                                {language === "ar" ? "تكلفة شي إن (ج.م)" : "SHEIN Cost (EGP)"}
                              </label>
                              <div style={{ position: "relative" }}>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={sheinUnitCost}
                                  onChange={(e) => handleItemCostChange(order.id, item.id, e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    backgroundColor: "#FFFFFF",
                                    color: "var(--color-text)",
                                  }}
                                />
                              </div>
                              {itemQty > 1 && (
                                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                                  Total: {formatPrice(itemSheinTotal)}
                                </div>
                              )}
                            </div>

                            {/* Item Gross Difference */}
                            <div style={{ textAlign: isRTL ? "left" : "right" }}>
                              <div style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                                {language === "ar" ? "فارق البيع" : "Gross Diff"}
                              </div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.875rem",
                                  color: itemProfit >= 0 ? "#059669" : "#DC2626",
                                }}
                              >
                                {itemProfit >= 0 ? "+" : ""}{formatPrice(itemProfit)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Right Column: Sticky Live Profit & Winning Calculator ───── */}
        <div
          style={{
            position: "sticky",
            top: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Main Profit Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Sparkles size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                {language === "ar" ? "حساب الأرباح والمكسب النهائي" : "Profit & Winning Calculator"}
              </h2>
            </div>

            {/* Selected summary badge */}
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "var(--color-bg-alt)",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
                marginBottom: "18px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{language === "ar" ? "الطلبات المحددة لحساب الشحنة:" : "Orders in Batch:"}</span>
              <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                {calculations.orderCount} {language === "ar" ? "طلبات" : "orders"} ({calculations.totalItemCount} {language === "ar" ? "قطعة" : "items"})
              </span>
            </div>

            {/* Expense Inputs: Customs & Shipping */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              {/* Customs Price (جمارك) */}
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#FAF7F2",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text)" }}>
                    {language === "ar" ? "سعر الجمارك والتخليص (ج.م)" : "Customs & Clearance Price (EGP)"}
                  </label>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-accent)", fontWeight: 600 }}>
                    {language === "ar" ? "جمارك الشحنة كاملة" : "Batch Total"}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={customsFee}
                  onChange={(e) => setCustomsFee(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                  {language === "ar"
                    ? "المبلغ الإجمالي المدفوع للجمارك والتخليص الجمركي لهذه الشحنة."
                    : "Total clearance & customs tariff paid for this batch of items."}
                </p>
              </div>

              {/* Extra Logistics / Shipping (Optional) */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                  {language === "ar" ? "شحن دولي / محلي إضافي (اختياري - ج.م)" : "Extra Logistics / Freight (Optional - EGP)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0"
                  value={logisticsFee}
                  onChange={(e) => setLogisticsFee(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div
              style={{
                borderTop: "1px solid var(--color-border-light)",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)" }}>
                <span>{language === "ar" ? "إجمالي مبيعات العملاء:" : "Total Customer Revenue:"}</span>
                <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                  {formatPrice(calculations.totalCustomerRevenue)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#DC2626" }}>
                <span>{language === "ar" ? "• تكلفة الطلب من شي إن:" : "• SHEIN Sourcing Cost:"}</span>
                <span style={{ fontWeight: 600 }}>
                  - {formatPrice(calculations.totalSheinCost)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#DC2626" }}>
                <span>{language === "ar" ? "• سعر الجمارك والتخليص:" : "• Customs Fee (جمارك):"}</span>
                <span style={{ fontWeight: 600 }}>
                  - {formatPrice(calculations.customs)}
                </span>
              </div>

              {calculations.logistics > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#DC2626" }}>
                  <span>{language === "ar" ? "• شحن ولوجستيات:" : "• Extra Logistics:"}</span>
                  <span style={{ fontWeight: 600 }}>
                    - {formatPrice(calculations.logistics)}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--color-text-secondary)",
                  paddingTop: "6px",
                  borderTop: "1px dashed var(--color-border)",
                  fontSize: "0.8125rem",
                }}
              >
                <span>{language === "ar" ? "إجمالي التكاليف والمصاريف:" : "Total Expenses:"}</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(calculations.totalExpenses)}</span>
              </div>
            </div>

            {/* ── HIGHLIGHTED FINAL WINNING (المكسب الصافي) ───────────── */}
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "14px",
                background:
                  calculations.finalWinning >= 0
                    ? "linear-gradient(135deg, #064E3B 0%, #065F46 100%)"
                    : "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)",
                color: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(6, 78, 59, 0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.9 }}>
                  {language === "ar" ? "المكسب النهائي الصافي" : "Final Net Winning"}
                </span>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {calculations.profitMargin.toFixed(1)}% {language === "ar" ? "هامش ربح" : "Margin"}
                </span>
              </div>

              <div style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {formatPrice(calculations.finalWinning)}
              </div>

              <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "6px" }}>
                {calculations.finalWinning >= 0
                  ? language === "ar"
                    ? "صافي أرباح ديدو بعد خصم سعر شي إن ومصاريف الجمارك."
                    : "Clean owner profit after SHEIN cost and customs deduction."
                  : language === "ar"
                  ? "تنبيه: التكاليف أعلى من الإيراد. يرجى مراجعة التكلفة والجمارك."
                  : "Warning: Expenses exceed customer price for this selection."}
              </div>
            </div>
          </div>

          {/* ── Batch Order Execution on SHEIN ───────────────────────── */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid var(--color-border-light)",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "12px" }}>
              {language === "ar" ? "تأكيد الطلب وتحديث حالة الطلبات" : "Order from SHEIN Execution"}
            </h3>

            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              {language === "ar"
                ? "بعد إتمام الدفع على شي إن، أدخلي رقم الطلب لتحديث حالة كل الطلبات المحددة بنقرة واحدة."
                : "Enter your SHEIN purchase reference number to update all selected orders at once."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                  {language === "ar" ? "رقم مرجع طلب شي إن (SHEIN Ref / Tracking)" : "SHEIN Order Ref # / Tracking"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. GZ-8891024 or SHEIN-99120"
                  value={sheinReference}
                  onChange={(e) => setSheinReference(e.target.value)}
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
                onClick={handleBatchMarkOrdered}
                disabled={updatingBatch || selectedOrders.length === 0}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent)",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  cursor: updatingBatch || selectedOrders.length === 0 ? "not-allowed" : "pointer",
                  opacity: updatingBatch || selectedOrders.length === 0 ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 8px rgba(196, 144, 124, 0.3)",
                }}
              >
                <Save size={16} />
                <span>
                  {updatingBatch
                    ? language === "ar"
                      ? "جارٍ التحديث..."
                      : "Updating..."
                    : language === "ar"
                    ? `تحديث ${selectedOrders.length} طلب إلى (تم الطلب من شي إن)`
                    : `Mark ${selectedOrders.length} as Ordered on SHEIN`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
