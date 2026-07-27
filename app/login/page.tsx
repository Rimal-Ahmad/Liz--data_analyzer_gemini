"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await login();
      setToken(data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      router.push("/analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

return (
  <div
    style={{
      maxWidth: 360,
      margin: "80px auto",
      padding: 32,
      textAlign: "center",
      border: "1px solid #e5e5e5",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <h1 style={{ fontSize: 22, marginBottom: 8 }}>Welcome</h1>
    <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
      Sign in to view your health analysis
    </p>

    {error && (
      <p style={{ color: "crimson", marginBottom: 16, fontSize: 14 }}>{error}</p>
    )}

    <button
      onClick={handleLogin}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px 16px",
        fontSize: 15,
        fontWeight: 600,
        color: "#fff",
        backgroundColor: loading ? "#7fa8ff" : "#007bff",
        border: "none",
        borderRadius: 8,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background-color 0.15s ease",
      }}
    >
      {loading ? "Logging in..." : "Click here to log in"}
    </button>
  </div>
);
}