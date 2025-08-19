import { NextRequest, NextResponse } from "next/server";
import { fastRewrite } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { text, tone, language } = await request.json();
    const result = await fastRewrite(text, tone, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Rewrite API error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite text" },
      { status: 500 }
    );
  }
}
