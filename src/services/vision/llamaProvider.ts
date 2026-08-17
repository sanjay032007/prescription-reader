import type { VisionModelResult, RawMedicineExtraction } from "../types";

/**
 * Llama 3.2 Vision Provider
 *
 * Rules:
 * - Independent verification model
 * - Does NOT receive other models' answers
 * - Strictly NO DEFAULT assumptions
 */
export async function runLlamaVision(
  imageBase64: string,
  mimeType = "image/jpeg",
  symptoms = ""
): Promise<VisionModelResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.LLAMA_MODEL || "meta-llama/llama-4-scout";

  if (!apiKey) {
    return {
      provider: "Llama Vision",
      model,
      success: false,
      is_readable: true,
      extractions: [],
      error: "Missing GROQ_API_KEY for Llama vision inference.",
    };
  }

  const prompt = `You are an independent clinical vision expert examining a handwritten doctor prescription.
Extract all visible medicine names, strengths, dosages, and durations.
DO NOT guess. DO NOT fill in missing values with defaults. If a field is not visible, return null.

Return ONLY valid JSON:
{
  "is_readable": true,
  "unreadable_reason": null,
  "extractions": [
    {
      "raw_name": "medicine name as visible",
      "raw_strength": "strength or null",
      "raw_dosage": "dosage pattern or null",
      "raw_duration": "duration or null",
      "raw_timing": "timing or null"
    }
  ]
}`;

  try {
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        provider: "Llama Vision",
        model,
        success: false,
        is_readable: true,
        extractions: [],
        error: `(${res.status}) ${errText}`,
      };
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    const extractions: RawMedicineExtraction[] = Array.isArray(parsed.extractions)
      ? parsed.extractions.map((item: any) => ({
          raw_name: item.raw_name || item.name || "",
          raw_strength: item.raw_strength ?? null,
          raw_dosage: item.raw_dosage ?? null,
          raw_duration: item.raw_duration ?? null,
          raw_timing: item.raw_timing ?? null,
          confidence_hint: 0.85,
        })).filter((x: any) => x.raw_name.trim().length > 0)
      : [];

    return {
      provider: "Llama Vision",
      model,
      success: true,
      is_readable: parsed.is_readable !== false,
      unreadable_reason: parsed.unreadable_reason || null,
      extractions,
    };
  } catch (err: any) {
    return {
      provider: "Llama Vision",
      model,
      success: false,
      is_readable: true,
      extractions: [],
      error: err?.message || String(err),
    };
  }
}
