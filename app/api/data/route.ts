import { NextRequest, NextResponse } from "next/server";
import { last30DaysRange } from "@/lib/dates";

export async function POST(req: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const refreshToken = req.headers.get("x-refresh-token");

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshRes.ok) {
      return NextResponse.json({ error: "Unable to refresh token" }, { status: 401 });
    }

    const { access_token, refresh_token: newRefreshToken } = await refreshRes.json();
    const { startDate, endDate } = last30DaysRange();

    const [historyRes, therapiesRes] = await Promise.all([
      fetch(`${API_URL}/api/data/history`, {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
      fetch(`${API_URL}/api/therapies/date-range?start_date=${startDate}&end_date=${endDate}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      }),
    ]);

    if (!historyRes.ok || !therapiesRes.ok) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 502 });
    }

    const history = await historyRes.json();
    const therapies = await therapiesRes.json();

    return NextResponse.json({ history, therapies, refresh_token: newRefreshToken });
  } catch (err) {
    console.error("Data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}