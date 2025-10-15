import { NextRequest, NextResponse } from "next/server";
import { digitizeResumeImage } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { base64Image, mimeType, language } = await request.json();
    const result = await digitizeResumeImage(base64Image, mimeType, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Digitize image API error:", error);
    return NextResponse.json(
      { error: "Failed to digitize image" },
      { status: 500 }
    );
  }
}
