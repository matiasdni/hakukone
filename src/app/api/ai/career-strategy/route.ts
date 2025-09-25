import { NextRequest, NextResponse } from "next/server";
import { askCareerStrategist } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { query, context, language } = await request.json();
    const result = await askCareerStrategist(query, context, language);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Career strategy API error:", error);
    return NextResponse.json(
      { error: "Failed to get career strategy" },
      { status: 500 }
    );
  }
}
