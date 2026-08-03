import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const {
      question,
      history: chatHistory,
      patientHistory,
      therapies,
    } = await req.json().catch(() => ({
      question: null,
      history: [],
      patientHistory: null,
      therapies: null,
    }));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are analyzing a patient's health history and dialysis therapy records. You are an analyzing agent.

History data:
${JSON.stringify(patientHistory)}

Therapy sessions data:
${JSON.stringify(therapies)}

${chatHistory && chatHistory.length > 0
  ? `Conversation so far:\n${chatHistory.slice(-4).map((m: { role: string; parts: { text: string }[] }) => `${m.role === "user" ? "User" : "Assistant"}: ${m.parts[0].text}`).join("\n")}\n`
  : ""} 

${question
    ? `The user is asking specifically: "${question}"`
    : "Give a general analysis of trends, anomalies, and anything notable across both datasets."}

Adapt your tone and technical depth to match the user's question:
- If the question uses everyday language or no question was asked, explain in plain terms anyone could understand — avoid jargon, explain any medical/technical term you do use in one short phrase.
- If the question uses clinical/technical terms (e.g. specific lab values, medical terminology, requests for precise figures), respond with matching technical precision, as you would to a clinician.
- Default to the plain-language style whenever unsure.

Do not restate raw numbers as a table — synthesize them into insights. Do not diagnose or make definitive medical claims; describe patterns and flag anything that looks worth discussing with a healthcare provider.
`;

// ^chatHistory.slice(-4) sends only the last 4 messages as context (can increase to 6 - more tokens used)

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err: any) {
      if (err?.status === 429) {
        await new Promise((r) => setTimeout(r, 5000));
        result = await model.generateContent(prompt);
      } else {
        throw err;
      }
    }
    const analysis = result.response.text();

    return NextResponse.json({ analysis });

  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}