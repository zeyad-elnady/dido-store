"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@didostore.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/admin/login", { email, password });
      if (res.data?.token) {
        localStorage.setItem("admin_token", res.data.token);
      }
      localStorage.setItem("admin_demo", "true");
      router.push("/admin/dashboard");
    } catch {
      // Demo fallback: allow sign-in with default demo credentials
      if (email === "admin@didostore.com" && password) {
        localStorage.setItem("admin_demo", "true");
        localStorage.setItem("admin_token", "demo-token-12345");
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials. Please verify your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    localStorage.setItem("admin_demo", "true");
    localStorage.setItem("admin_token", "demo-token-12345");
    router.push("/admin/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#18181A",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "44px 36px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "8px",
            }}
          >
            Staff & Operations
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            Sign in to manage orders, verify deposits & update SHEIN inventory.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              padding: "12px 14px",
              color: "#991B1B",
              fontSize: "0.875rem",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
              Email Address
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
            >
              <Mail size={18} color="var(--color-text-muted)" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@didostore.com"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9375rem",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "6px" }}>
              Password
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
            >
              <Lock size={18} color="var(--color-text-muted)" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9375rem",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "14px",
              backgroundColor: "var(--color-text)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s",
            }}
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowRight size={16} />
          </button>

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleDemoAccess}
            style={{
              padding: "12px",
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent-hover)",
              border: "1px dashed var(--color-accent)",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⚡ Instant 1-Click Demo Review Access
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
              textDecoration: "none",
            }}
          >
            ← Return to Public Fashion Store
          </Link>
        </div>
      </div>
    </div>
  );
}
