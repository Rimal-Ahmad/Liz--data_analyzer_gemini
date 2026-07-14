"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAnalysis } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");

  const runAnalysis = async (q?: string) => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalysis(q);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Analyzing your data...</p>;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link href="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>Health Analysis</h1>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 24 }}>
        {analysis}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Ask something specific, e.g. 'any concerning trends?'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => runAnalysis(question)} style={{ padding: "8px 16px" }}>
          Ask
        </button>
      </div>
    </div>
  );
}