import { NextResponse } from "next/server";

export async function POST() {
  const API_URL = process.env.API_URL;
  const phone_number = process.env.BACKEND_USERNAME;
  const password = process.env.BACKEND_PASSWORD;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Login failed" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ access_token: data.access_token });
}