import { NextRequest, NextResponse } from "next/server";
import { runVerificationPipeline } from "@/services/pipeline/verificationPipeline";

export const maxDuration = 60; // 60s timeout for parallel vision requests

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", symptoms = "" } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64 in request body." },
        { status: 400 }
      );
    }

    const result = await runVerificationPipeline(imageBase64, mimeType, symptoms);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Verification pipeline error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal verification pipeline error." },
      { status: 500 }
    );
  }
}
