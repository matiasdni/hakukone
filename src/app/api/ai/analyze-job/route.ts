import { NextRequest, NextResponse } from "next/server";
import { analyzeJobPosting } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { jobText, language } = await request.json();
    const result = await analyzeJobPosting(jobText, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Analyze job API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job posting" },
      { status: 500 }
    );
  }
}
