import { NextRequest, NextResponse } from "next/server";
import { getMatchAnalysis } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, language } = await request.json();
    const result = await getMatchAnalysis(resumeText, jobDescription, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Match analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to get match analysis" },
      { status: 500 }
    );
  }
}
