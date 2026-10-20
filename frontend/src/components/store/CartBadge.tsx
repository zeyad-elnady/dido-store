"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || totalItems <= 0) {
    return null;
  }

  return (
    <span
      style={{
        position: "absolute",
        top: "0px",
        right: "0px",
        backgroundColor: "var(--color-accent)",
        color: "#ffffff",
        fontSize: "0.625rem",
        fontWeight: 700,
        width: "17px",
        height: "17px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {totalItems}
    </span>
  );
}
