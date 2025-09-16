import { NextRequest, NextResponse } from "next/server";
import { chatWithAssistant } from "@/services/geminiService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  history: Array<{ role: string; parts: { text: string }[] }>;
  message: string;
  language?: "en" | "fi";
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const { history = [], message, language = "en" } = body;
    const result = await chatWithAssistant(history, message, language);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to chat with assistant", details: errorMessage },
      { status: 500 }
    );
  }
}
