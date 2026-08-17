import type { VisionModelResult, RawMedicineExtraction } from "../types";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
];

function sanitizeResponseText(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/i, "");
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

/**
 * Gemini Vision Provider
 *
 * Rules:
 * - Strictly NO DEFAULT assumptions (null for missing fields)
 * - Deciphers handwritten Indian doctor clinical pad
 */
export async function runGeminiVision(
  imageBase64: string,
  mimeType = "image/jpeg",
  symptoms = ""
): Promise<VisionModelResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      provider: "Google AI Studio",
      model: "gemini-flash",
      success: false,
      is_readable: true,
      extractions: [],
      error: "Missing NEXT_PUBLIC_GEMINI_API_KEY",
    };
  }

  const prompt = `You are a medical OCR specialist inspecting an Indian doctor prescription image.
List all visible medicines, exact strengths, dosages, and durations written on the paper.

CRITICAL RULES:
1. Extract ONLY what you see written. Do NOT guess or extrapolate.
2. If a field (duration, dosage, timing, strength) is not written, set it to null. NEVER use defaults.
3. If handwriting is cursive or partially unclear, write with "(unclear)" tag.

OUTPUT VALID JSON ONLY:
{
  "is_readable": true,
  "unreadable_reason": null,
  "clinical_notes": "diagnosis or general instructions if written",
  "extractions": [
    {
      "raw_name": "medicine name as written",
      "raw_strength": "strength or null",
      "raw_dosage": "dosage pattern (e.g. 1-0-1) or null",
      "raw_duration": "duration (e.g. 5 days) or null",
      "raw_timing": "timing (e.g. after food) or null"
    }
  ]
}`;

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.9,
      maxOutputTokens: 2500,
    },
  };

  let lastError = "";

  for (const modelName of CANDIDATE_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const errJson = await res.json();
          detail = errJson?.error?.message ?? errJson?.message ?? JSON.stringify(errJson);
        } catch {
          detail = await res.text().catch(() => "");
        }
        lastError = `(${res.status}) ${detail}`;
        continue;
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ??
        "";

      if (!text) {
        lastError = "Empty response";
        continue;
      }

      const cleaned = sanitizeResponseText(text);
      const parsed = JSON.parse(cleaned);

      const extractions: RawMedicineExtraction[] = Array.isArray(parsed.extractions)
        ? parsed.extractions.map((item: any) => ({
            raw_name: item.raw_name || item.name || "",
            raw_strength: item.raw_strength ?? null,
            raw_dosage: item.raw_dosage ?? null,
            raw_duration: item.raw_duration ?? null,
            raw_timing: item.raw_timing ?? null,
            confidence_hint: 0.9,
          })).filter((x: any) => x.raw_name.trim().length > 0)
        : [];

      return {
        provider: "Google Gemini Vision",
        model: modelName,
        success: true,
        is_readable: parsed.is_readable !== false,
        unreadable_reason: parsed.unreadable_reason || null,
        clinical_notes: parsed.clinical_notes || null,
        extractions,
      };
    } catch (err: any) {
      lastError = err?.message || String(err);
      continue;
    }
  }

  return {
    provider: "Google Gemini Vision",
    model: "gemini-3.5-flash",
    success: false,
    is_readable: true,
    extractions: [],
    error: lastError || "Gemini vision failed",
  };
}
