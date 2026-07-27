"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Message = { role: "user" | "model"; text: string };

export default function AnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [patientHistory, setPatientHistory] = useState<unknown>(null);
  const [therapies, setTherapies] = useState<unknown>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        setDataError("Not logged in");
        setDataLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-refresh-token": refreshToken },
        });
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
        const data = await res.json();
        setPatientHistory(data.history);
        setTherapies(data.therapies);
        if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
      } catch (err) {
        setDataError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || dataLoading) return;
    const newMessages: Message[] = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, history, patientHistory, therapies }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "model", text: data.analysis ?? "Error." }]);
    } catch {
      setMessages([...newMessages, { role: "model", text: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  if (dataError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-950 px-4">
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {dataError}
        </p>
        <Link
          href="/login"
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4">
      <div className="max-w-2xl mx-auto pt-16 pb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-6">Health Data Analyzer</h1>

        {dataLoading && (
          <p className="text-white/60 text-sm animate-pulse mb-4">Loading patient data...</p>
        )}

        <div className="h-[600px] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-6 mb-4">
          {messages.map((m, i) => (
            <p
              key={i}
              className={`text-white/90 leading-relaxed ${m.role === "user" ? "mb-4" : "mb-8"}`}
            >
              <strong className="text-white">{m.role === "user" ? "You" : "Gemini"}:</strong> {m.text}
            </p>
          ))}
          {loading && <p className="text-white/60 text-sm animate-pulse">Gemini is typing...</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={loading || dataLoading}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}