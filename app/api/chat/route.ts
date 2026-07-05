import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history ?? [], // [{role: "user"|"model", parts:[{text: "..."}]}]
    });

    const response = await chat.sendMessage({ message });

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}