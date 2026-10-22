"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Percent,
} from "lucide-react";
import api, { formatPrice } from "@/lib/api";
import { Analytics } from "@/types";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics>({
    kpis: {
      total_orders: 0,
      total_revenue: 0,
      total_cost: 0,
      net_profit: 0,
      total_customs_fees: 0,
      total_deposits: 0,
      outstanding_balances: 0,
    },
    orders_by_status: {},
    orders_over_time: [],
    revenue_vs_profit: [],
    best_selling_products: [],
    best_categories: [],
  });

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {});
  }, []);

  const totalOrders = data.kpis.total_orders || 0;
  const completedOrders = data.orders_by_status?.delivered || 0;
  const profitMargin =
    data.kpis.total_revenue > 0
      ? Math.round((data.kpis.net_profit / data.kpis.total_revenue) * 100)
      : 0;

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
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
            {completedOrders} Completed Orders ({totalOrders} total)
          </span>
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
          <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
            {profitMargin}% Profit Margin
          </span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>Customs Surcharges</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "var(--color-accent-hover)" }}>
            {formatPrice(data.kpis.total_customs_fees)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Import clearance</span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>Verified Deposits</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "#2563EB" }}>
            {formatPrice(data.kpis.total_deposits)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#2563EB", fontWeight: 600 }}>
            Secured down payments
          </span>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>Outstanding Due</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "6px", color: "#D97706" }}>
            {formatPrice(data.kpis.outstanding_balances)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 600 }}>
            COD collection pipeline
          </span>
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
            Top Selling Pieces
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.best_selling_products.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-muted)" }}>
                <ShoppingBag size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                <div style={{ fontSize: "0.875rem" }}>No sales recorded yet.</div>
              </div>
            ) : (
              data.best_selling_products.map((item, idx) => (
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
              ))
            )}
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

          {(() => {
            const igCount = data.acquisition_channels?.instagram?.count || 0;
            const igRev = data.acquisition_channels?.instagram?.revenue || 0;
            const ttCount = data.acquisition_channels?.tiktok?.count || 0;
            const ttRev = data.acquisition_channels?.tiktok?.revenue || 0;
            const waCount = data.acquisition_channels?.whatsapp?.count || 0;
            const waRev = data.acquisition_channels?.whatsapp?.revenue || 0;
            const sumChannels = igCount + ttCount + waCount || 1;
            const igPct = Math.round((igCount / sumChannels) * 100);
            const ttPct = Math.round((ttCount / sumChannels) * 100);
            const waPct = Math.round((waCount / sumChannels) * 100);

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600 }}>Instagram</span>
                    <span style={{ fontWeight: 700 }}>
                      {igCount > 0 ? `${igCount} orders (${formatPrice(igRev)})` : "0 orders"}
                    </span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "var(--color-bg-alt)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${igCount > 0 ? Math.max(igPct, 6) : 0}%`, height: "100%", backgroundColor: "#DB2777", transition: "width 0.4s ease" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600 }}>TikTok</span>
                    <span style={{ fontWeight: 700 }}>
                      {ttCount > 0 ? `${ttCount} orders (${formatPrice(ttRev)})` : "0 orders"}
                    </span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "var(--color-bg-alt)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${ttCount > 0 ? Math.max(ttPct, 6) : 0}%`, height: "100%", backgroundColor: "#111827", transition: "width 0.4s ease" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600 }}>WhatsApp Direct / Referrals</span>
                    <span style={{ fontWeight: 700 }}>
                      {waCount > 0 ? `${waCount} orders (${formatPrice(waRev)})` : "0 orders"}
                    </span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "var(--color-bg-alt)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${waCount > 0 ? Math.max(waPct, 6) : 0}%`, height: "100%", backgroundColor: "#059669", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              </div>
            );
          })()}
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
