//fetches history and therapy data directly 

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const API_URL = process.env.API_URL;
  const token = req.headers.get("authorization");

  // Fetch both datasets server-side
  const [historyRes, therapiesRes] = await Promise.all([
    fetch(`${API_URL}/history`, { headers: { Authorization: token ?? "" } }),
    fetch(`${API_URL}/therapies`, { headers: { Authorization: token ?? "" } }),
  ]);

  if (!historyRes.ok || !therapiesRes.ok) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 502 });
  }

  const history = await historyRes.json();
  const therapies = await therapiesRes.json();

  // Optional: let the user ask a specific question
  const { question } = await req.json().catch(() => ({ question: null }));

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are analyzing a patient's health history and dialysis therapy records. You are an analyzing agent.

History data:
${JSON.stringify(history)}

Therapy sessions data:
${JSON.stringify(therapies)}

${question
    ? `The user is asking specifically: "${question}"`
    : "Give a general analysis of trends, anomalies, and anything notable across both datasets."}

Adapt your tone and technical depth to match the user's question:
- If the question uses everyday language or no question was asked, explain in plain terms anyone could understand — avoid jargon, explain any medical/technical term you do use in one short phrase.
- If the question uses clinical/technical terms (e.g. specific lab values, medical terminology, requests for precise figures), respond with matching technical precision, as you would to a clinician.
- Default to the plain-language style whenever unsure.

Do not restate raw numbers as a table — synthesize them into insights. Do not diagnose or make definitive medical claims; describe patterns and flag anything that looks worth discussing with a healthcare provider.
`;

  const result = await model.generateContent(prompt);
  const analysis = result.response.text();

  return NextResponse.json({ analysis });
}