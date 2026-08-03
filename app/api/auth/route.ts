import { NextResponse } from "next/server";

export async function POST() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const phone_number = process.env.BACKEND_USERNAME;
  const password = process.env.BACKEND_PASSWORD;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number, password }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Login failed" }, { status: res.status });
  }

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    console.log("Non-JSON response:", text);
    data = { error: "Server returned invalid response" };
  }

  return NextResponse.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}