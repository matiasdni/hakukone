import { NextRequest, NextResponse } from "next/server";
import { reviewCoverLetter } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { letterText, language } = await request.json();
    const result = await reviewCoverLetter(letterText, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Review cover letter API error:", error);
    return NextResponse.json(
      { error: "Failed to review cover letter" },
      { status: 500 }
    );
  }
}
