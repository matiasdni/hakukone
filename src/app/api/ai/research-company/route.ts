import { NextRequest, NextResponse } from "next/server";
import { researchCompany } from "@/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { companyName, language } = await request.json();
    const result = await researchCompany(companyName, language);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Research company API error:", error);
    return NextResponse.json(
      { error: "Failed to research company" },
      { status: 500 }
    );
  }
}
