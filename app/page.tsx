"use client"; // interactivity -> buttons / typing / state
import { useState } from "react";
import { getToken } from "@/lib/auth";

type Message = { role: "user" | "model"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]); //useState gives mem -> can render page once the useState changes
  const [input, setInput] = useState(""); // 1st (messages, input, loading) -> values & 2nd (setters) -> updater functions
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const token = getToken();
    const refreshToken = localStorage.getItem("refresh_token");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-refresh-token": refreshToken ?? "",
       },
      body: JSON.stringify({ question: input, }),
    });
    const data = await res.json();

    setMessages([...newMessages, { role: "model", text: data.analysis ?? "Error." }]);
    setLoading(false);
  };

  // drawing how the page actually looks like
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>Gemini Chat</h1>
      <div style={{ minHeight: 300, border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.role === "user" ? "You" : "Gemini"}:</strong> {m.text}</p>
        ))}
        {loading && <p><em>Gemini is typing...</em></p>}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
        style={{
         flex: 1,
         padding: "10px 12px",
         border: "1px solid #ccc",
         borderRadius: 6,
         fontSize: 14,
         outline: "none",
         width: "80%",
        }} 
      />
      <button onClick={sendMessage} style={{
        padding: "9px 16px",
        marginLeft: 10,
        cursor: "pointer",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: 6,
      }}
      >Send</button>
    </div>
  );
}