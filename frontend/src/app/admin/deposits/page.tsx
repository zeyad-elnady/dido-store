"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  ExternalLink,
  X,
  Search,
} from "lucide-react";
import api, { formatPrice, storageUrl } from "@/lib/api";
import { Deposit } from "@/types";
import { MOCK_ORDERS } from "@/lib/mockData";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Extract all deposits from mock orders as fallback
  const initialMockDeposits: Deposit[] = [
    {
      id: 1,
      order_id: 1,
      customer_id: 1,
      amount: 1500,
      method: "instapay",
      transfer_date: "2026-03-15 14:30:00",
      screenshot_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
      status: "verified",
      admin_note: "InstaPay transfer verified into CIB account",
      verified_by: 1,
      verified_at: "2026-03-15 15:00:00",
      created_at: "2026-03-15 14:35:00",
      order: MOCK_ORDERS[0],
      customer: MOCK_ORDERS[0].customer,
    },
    {
      id: 2,
      order_id: 2,
      customer_id: 2,
      amount: 1000,
      method: "vodafone_cash",
      transfer_date: "2026-03-10 18:00:00",
      screenshot_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
      status: "verified",
      admin_note: "VF Cash wallet balance received",
      verified_by: 1,
      verified_at: "2026-03-10 18:30:00",
      created_at: "2026-03-10 18:05:00",
      order: MOCK_ORDERS[1],
      customer: MOCK_ORDERS[1].customer,
    },
    {
      id: 3,
      order_id: 3,
      customer_id: 3,
      amount: 950,
      method: "instapay",
      transfer_date: "2026-03-18 11:20:00",
      screenshot_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
      status: "pending",
      admin_note: null,
      verified_by: null,
      verified_at: null,
      created_at: "2026-03-18 11:25:00",
      order: {
        ...MOCK_ORDERS[0],
        id: 3,
        order_number: "DS-2026-1003",
        customer: { id: 3, name: "Salma Fouad", phone: "01099887766", whatsapp_number: "01099887766", tiktok_username: null, instagram_username: "@salma.f", source_platform: "instagram" },
      },
      customer: { id: 3, name: "Salma Fouad", phone: "01099887766", whatsapp_number: "01099887766", tiktok_username: null, instagram_username: "@salma.f", source_platform: "instagram" },
    },
  ];

  const fetchDeposits = () => {
    setLoading(true);
    api
      .get("/admin/deposits")
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setDeposits(res.data.data);
        } else {
          setDeposits(initialMockDeposits);
        }
      })
      .catch(() => {
        setDeposits(initialMockDeposits);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleVerify = async (id: number, status: "verified" | "rejected") => {
    try {
      await api.patch(`/admin/deposits/${id}/verify`, { status });
      fetchDeposits();
    } catch {
      // Offline fallback: update local state
      setDeposits((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status, verified_at: new Date().toISOString() } : d))
      );
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
          Deposits & Payments Queue
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginTop: "4px" }}>
          Verify InstaPay, Vodafone Cash & Telda transfer screenshots before locking stock.
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          backgroundColor: "#FFFFFF",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid var(--color-border-light)",
          width: "fit-content",
        }}
      >
        {["all", "pending", "verified", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: filter === tab ? "var(--color-accent)" : "transparent",
              color: filter === tab ? "#FFFFFF" : "var(--color-text)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
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
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Deposit ID</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Order #</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Customer</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Method</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Receipt</th>
                <th style={{ padding: "14px 20px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "14px 20px", fontWeight: 600, textAlign: "right" }}>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    No deposits found under "{filter}".
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 600 }}>#{dep.id}</td>
                    <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                      <Link
                        href={`/admin/orders/${dep.order_id}`}
                        style={{ color: "var(--color-text)", textDecoration: "none" }}
                      >
                        {dep.order?.order_number || `Order #${dep.order_id}`}
                      </Link>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 600, color: "var(--color-text)" }}>
                        {dep.customer?.name || "Customer"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {dep.customer?.phone}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--color-text)" }}>
                      {formatPrice(dep.amount)}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor:
                            dep.method === "instapay"
                              ? "#EDE9FE"
                              : dep.method === "vodafone_cash"
                              ? "#FEE2E2"
                              : "#FEF3C7",
                          color:
                            dep.method === "instapay"
                              ? "#6D28D9"
                              : dep.method === "vodafone_cash"
                              ? "#DC2626"
                              : "#B45309",
                        }}
                      >
                        {dep.method.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {dep.screenshot_path ? (
                        <button
                          onClick={() => setSelectedScreenshot(dep.screenshot_path)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            backgroundColor: "var(--color-bg-alt)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "6px",
                            fontSize: "0.8125rem",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          <Eye size={14} />
                          <span>View Screenshot</span>
                        </button>
                      ) : (
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                          backgroundColor:
                            dep.status === "verified"
                              ? "#DCFCE7"
                              : dep.status === "rejected"
                              ? "#FEE2E2"
                              : "#FEF3C7",
                          color:
                            dep.status === "verified"
                              ? "#166534"
                              : dep.status === "rejected"
                              ? "#991B1B"
                              : "#92400E",
                        }}
                      >
                        {dep.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      {dep.status === "pending" ? (
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleVerify(dep.id, "verified")}
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
                            Verify & Lock Stock
                          </button>
                          <button
                            onClick={() => handleVerify(dep.id, "rejected")}
                            style={{
                              padding: "6px 12px",
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
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Viewer Modal */}
      {selectedScreenshot && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "24px",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--color-border-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "1rem" }}>Deposit Receipt Screenshot</span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto", textAlign: "center" }}>
              <img
                src={storageUrl(selectedScreenshot)}
                alt="Deposit Screenshot"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
