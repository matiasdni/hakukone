import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobDescription, language } = await request.json();
    const result = await generateCoverLetter(
      resumeData,
      jobDescription,
      language
    );
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generate cover letter API error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
