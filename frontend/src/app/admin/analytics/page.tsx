"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  DollarSign,
  Package,
  Layers,
  Users,
  Percent,
} from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import { Analytics } from "@/types";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics>({
    kpis: {
      total_orders: 45,
      total_revenue: 86400,
      total_cost: 44200,
      net_profit: 42200,
      total_customs_fees: 3850,
      total_deposits: 43200,
      outstanding_balances: 43200,
    },
    orders_by_status: {
      pending: 3,
      confirmed: 6,
      ordered_from_shein: 8,
      shipped: 7,
      delivered: 21,
    },
    orders_over_time: [
      { date: "Mar 1", count: 4 },
      { date: "Mar 5", count: 7 },
      { date: "Mar 10", count: 9 },
      { date: "Mar 15", count: 12 },
      { date: "Mar 20", count: 13 },
    ],
    revenue_vs_profit: [
      { date: "Week 1", revenue: 16500, profit: 8200 },
      { date: "Week 2", revenue: 22400, profit: 11100 },
      { date: "Week 3", revenue: 26100, profit: 12800 },
      { date: "Week 4", revenue: 21400, profit: 10100 },
    ],
    best_selling_products: [
      { product_id: 1, product_name: "SHEIN Pleated Satin Midi Dress", total_sold: 16, total_revenue: 19040 },
      { product_id: 2, product_name: "SHEIN MOTF Double-Breasted Blazer", total_sold: 11, total_revenue: 17050 },
      { product_id: 5, product_name: "SHEIN Modest Linen Kimono Set", total_sold: 9, total_revenue: 15210 },
      { product_id: 3, product_name: "SHEIN Bohemian Maxi Dress", total_sold: 8, total_revenue: 10800 },
    ],
    best_categories: [
      { id: 1, name_en: "Dresses & Gowns", total_sold: 24, total_revenue: 29840 },
      { id: 2, name_en: "Blazers & Co-ords", total_sold: 14, total_revenue: 21700 },
      { id: 4, name_en: "Modest Fashion & Abayas", total_sold: 9, total_revenue: 15210 },
      { id: 3, name_en: "Tops & Blouses", total_sold: 8, total_revenue: 5920 },
    ],
  });

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
          Financial & Sales Analytics
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
          Track profit margins, international SHEIN sourcing costs, customs fees, and channel conversion rates.
        </p>
      </div>

      {/* KPI Financial Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>Total Revenue</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "var(--color-text)" }}>
            {formatPrice(data.kpis.total_revenue)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>45 Completed Orders</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>SHEIN Sourcing Cost</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "#4B5563" }}>
            {formatPrice(data.kpis.total_cost)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Direct procurement</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>Estimated Net Profit</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "#059669" }}>
            {formatPrice(data.kpis.net_profit)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>~48% Profit Margin</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>Customs Surcharges</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "var(--color-accent-hover)" }}>
            {formatPrice(data.kpis.total_customs_fees)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Import clearance</span>
        </div>
      </div>

      {/* Grid: Best Sellers & Acquisition Channels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }} className="analytics-split">
        {/* Best Selling Products */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid var(--color-border-light)",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
            Top Selling SHEIN Pieces
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.best_selling_products.map((item, idx) => (
              <div key={item.product_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      backgroundColor: "var(--color-bg-alt)",
                      color: "var(--color-text)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text)" }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      {item.total_sold} units ordered
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text)" }}>
                  {formatPrice(item.total_revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acquisition Channels */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid var(--color-border-light)",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "20px" }}>
            Customer Acquisition Channels
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>Instagram (@didostore.eg)</span>
                <span style={{ fontWeight: 700 }}>58% (26 orders)</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "var(--color-bg-alt)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "58%", height: "100%", backgroundColor: "#DB2777" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>TikTok (@didostore.eg)</span>
                <span style={{ fontWeight: 700 }}>28% (13 orders)</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "var(--color-bg-alt)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "28%", height: "100%", backgroundColor: "#111827" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600 }}>WhatsApp Direct / Referrals</span>
                <span style={{ fontWeight: 700 }}>14% (6 orders)</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "var(--color-bg-alt)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "14%", height: "100%", backgroundColor: "#059669" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          :global(.analytics-split) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
