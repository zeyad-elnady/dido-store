"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Users,
  PackageCheck,
  ChevronRight,
  Eye,
} from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import { Order } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboardPage() {
  const { language, isRTL } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [registeredClients, setRegisteredClients] = useState<number>(0);
  const [pendingDeposits, setPendingDeposits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // 1. Fetch recent orders
    const fetchOrders = api
      .get("/admin/orders?limit=5")
      .then((res) => {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setOrders(list);
      })
      .catch(() => setOrders([]));

    // 2. Fetch analytics KPIs and status breakdown
    const fetchAnalytics = api
      .get("/admin/analytics")
      .then((res) => {
        if (res.data?.kpis) {
          setTotalRevenue(Number(res.data.kpis.total_revenue) || 0);
        }
        if (res.data?.orders_by_status) {
          setStatusCounts(res.data.orders_by_status);
        }
      })
      .catch(() => {});

    // 3. Fetch registered customers count
    const fetchCustomers = api
      .get("/admin/customers")
      .then((res) => {
        const total =
          res.data?.total ??
          (Array.isArray(res.data?.data)
            ? res.data.data.length
            : Array.isArray(res.data)
            ? res.data.length
            : 0);
        setRegisteredClients(total);
      })
      .catch(() => setRegisteredClients(0));

    // 4. Fetch pending deposits
    const fetchDeposits = api
      .get("/admin/deposits?status=pending")
      .then((res) => {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setPendingDeposits(list.length);
      })
      .catch(() => setPendingDeposits(0));

    Promise.allSettled([fetchOrders, fetchAnalytics, fetchCustomers, fetchDeposits]).finally(() => {
      setLoading(false);
    });
  }, []);

  const inTransitOrders =
    (statusCounts["shipped"] || 0) + (statusCounts["ordered_from_shein"] || 0);
  const activeOrdersCount =
    (statusCounts["pending"] || 0) +
    (statusCounts["confirmed"] || 0) +
    inTransitOrders;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.01em",
            }}
          >
            {language === "ar" ? "نظرة عامة على العمليات" : "Operational Overview"}
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9375rem",
              marginTop: "4px",
            }}
          >
            {language === "ar"
              ? "متابعة مسار طلبات شي إن، تأكيد عربونات إنستاباي، وحركة الشحن في مصر لحظة بلحظة."
              : "Monitor real-time SHEIN order pipelines, verified InstaPay deposits, and shipments across Egypt."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/admin/deposits"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent-hover)",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <CreditCard size={16} />
            <span>{language === "ar" ? "مراجعة العربونات" : "Review Deposits"}</span>
          </Link>

          <Link
            href="/admin/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "var(--color-accent)",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <span>{language === "ar" ? "إدارة الكتالوج" : "Manage Catalog"}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {/* KPI 1: Gross Sales */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--color-border-light)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              {language === "ar" ? "إجمالي المبيعات" : "Total Gross Sales"}
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            {formatPrice(totalRevenue)}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#059669",
              marginTop: "6px",
              fontWeight: 500,
            }}
          >
            {language === "ar" ? "محدث لحظياً" : "Realtime updated"}
          </div>
        </div>

        {/* KPI 2: Active Orders */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--color-border-light)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              {language === "ar" ? "الطلبات النشطة" : "Active Orders"}
            </span>
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
              <ShoppingBag size={20} />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            {activeOrdersCount}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginTop: "6px",
            }}
          >
            {inTransitOrders}{" "}
            {language === "ar"
              ? "طلبات قيد الشحن من شي إن"
              : "currently in transit from SHEIN"}
          </div>
        </div>

        {/* KPI 3: Pending Deposits */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--color-border-light)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              {language === "ar" ? "العربونات المعلقة" : "Pending Deposits"}
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={20} />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            {pendingDeposits}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#D97706",
              marginTop: "6px",
              fontWeight: 500,
            }}
          >
            {language === "ar"
              ? "إيصالات بانتظار المراجعة"
              : "Receipt screenshots to review"}
          </div>
        </div>

        {/* KPI 4: Registered Clients */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--color-border-light)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              {language === "ar" ? "العملاء المسجلين" : "Registered Clients"}
            </span>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#EDE9FE",
                color: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            {registeredClients}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginTop: "6px",
            }}
          >
            {language === "ar"
              ? "عملاء انستجرام وتيك توك"
              : "Instagram & TikTok buyers"}
          </div>
        </div>
      </div>

      {/* Orders Pipeline Status Tracker */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border-light)",
          padding: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <PackageCheck size={22} color="var(--color-accent)" />
          <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
            {language === "ar" ? "توزيع حالات الطلبات:" : "Pipeline Status Breakdown:"}
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <span
            style={{
              padding: "6px 12px",
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {language === "ar" ? "بانتظار العربون" : "Pending Deposit"} ({statusCounts["pending"] || 0})
          </span>
          <span
            style={{
              padding: "6px 12px",
              backgroundColor: "#DBEAFE",
              color: "#1E40AF",
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {language === "ar" ? "مؤكد / حجز المخزون" : "Confirmed / Stock Locked"} ({statusCounts["confirmed"] || 0})
          </span>
          <span
            style={{
              padding: "6px 12px",
              backgroundColor: "#EDE9FE",
              color: "#5B21B6",
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {language === "ar" ? "مطلوب من شي إن" : "Ordered from SHEIN"} ({statusCounts["ordered_from_shein"] || 0})
          </span>
          <span
            style={{
              padding: "6px 12px",
              backgroundColor: "#E0E7FF",
              color: "#3730A3",
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {language === "ar" ? "قيد الشحن والتوصيل" : "Shipped / In Transit"} ({statusCounts["shipped"] || 0})
          </span>
          <span
            style={{
              padding: "6px 12px",
              backgroundColor: "#DCFCE7",
              color: "#166534",
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {language === "ar" ? "تم التوصيل" : "Delivered"} ({statusCounts["delivered"] || 0})
          </span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid var(--color-border-light)",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            {language === "ar" ? "أحدث الطلبات والشحنات" : "Recent Orders & Shipments"}
          </h2>
          <Link
            href="/admin/orders"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-accent)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{language === "ar" ? "عرض كل الطلبات" : "View All Orders"}</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: isRTL ? "right" : "left",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderBottom: "1px solid var(--color-border-light)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <th style={{ padding: "14px 24px", fontWeight: 600 }}>
                  {language === "ar" ? "رقم الطلب" : "Order #"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "العميل" : "Customer"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "المنصة" : "Platform"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "القيمة الإجمالية" : "Total Value"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "المبلغ المتبقي" : "Remaining Due"}
                </th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th
                  style={{
                    padding: "14px 24px",
                    fontWeight: 600,
                    textAlign: isRTL ? "left" : "right",
                  }}
                >
                  {language === "ar" ? "الإجراء" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "54px 24px",
                      textAlign: "center",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-bg-alt)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-accent)",
                        }}
                      >
                        <ShoppingBag size={24} />
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "var(--color-text)",
                        }}
                      >
                        {language === "ar" ? "لا توجد طلبات مسجلة حالياً" : "No orders found"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-muted)",
                          maxWidth: "420px",
                        }}
                      >
                        {language === "ar"
                          ? "تم حذف الطلبات والعملاء التجريبيين بنجاح. ستظهر هنا الطلبات الجديدة التي يقوم العملاء بطلبها."
                          : "Old sample orders and customers were cleared. New customer orders will show up here."}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPaidFull = (order.remaining_balance || 0) <= 0;

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid var(--color-border-light)",
                        transition: "background 0.15s",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px 24px",
                          fontWeight: 600,
                          color: "var(--color-text)",
                        }}
                      >
                        <Link
                          href={`/admin/orders/${order.id}`}
                          style={{
                            color: "var(--color-text)",
                            textDecoration: "none",
                          }}
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--color-text)",
                          }}
                        >
                          {order.customer?.name || "Customer"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {order.customer?.phone}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontSize: "0.75rem",
                            padding: "3px 8px",
                            backgroundColor: "var(--color-bg-alt)",
                            borderRadius: "4px",
                            fontWeight: 500,
                          }}
                        >
                          {order.customer?.source_platform || "Instagram"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          fontWeight: 600,
                          color: "var(--color-text)",
                        }}
                      >
                        {formatPrice(order.total)}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: isPaidFull
                              ? "#059669"
                              : "var(--color-accent-hover)",
                          }}
                        >
                          {formatPrice(order.remaining_balance ?? order.total)}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
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
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          textAlign: isRTL ? "left" : "right",
                        }}
                      >
                        <Link
                          href={`/admin/orders/${order.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
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
                          <span>{language === "ar" ? "عرض" : "View"}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
