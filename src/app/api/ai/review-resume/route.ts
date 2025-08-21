import { NextRequest, NextResponse } from "next/server";
import { reviewResume } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, language } = await request.json();
    const result = await reviewResume(resumeText, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Review resume API error:", error);
    return NextResponse.json(
      { error: "Failed to review resume" },
      { status: 500 }
    );
  }
}
