import type { VisionModelResult, RawMedicineExtraction } from "../types";

/**
 * Qwen Vision-Language Provider
 * Models: Qwen2.5-VL-72B / Qwen2.5-VL-7B / qwen3.6-27b
 *
 * Rules:
 * - Strictly NO DEFAULT VALUES (null for missing duration/dosage/strength)
 * - Reports unclear characters as (unclear)
 * - Never guesses or infers common medicines unless visible
 */
export async function runQwenVision(
  imageBase64: string,
  mimeType = "image/jpeg",
  symptoms = ""
): Promise<VisionModelResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.QWEN_MODEL || "qwen/qwen3.6-27b";

  if (!apiKey) {
    return {
      provider: "Groq / Qwen",
      model,
      success: false,
      is_readable: true,
      extractions: [],
      error: "Missing GROQ_API_KEY for Qwen vision inference.",
    };
  }

  const systemPrompt = `You are a medical OCR specialist evaluating an Indian handwritten doctor prescription image.
ABSOLUTE RULES:
1. Extract ONLY what is physically visible.
2. NEVER guess missing characters. If unclear, write with "(unclear)" tag.
3. NEVER invent or default values for dosage, duration, or strength. If not written on paper, set to null.
4. Output valid JSON only with NO markdown fences.

OUTPUT SCHEMA:
{
  "is_readable": true,
  "unreadable_reason": null,
  "clinical_notes": null,
  "extractions": [
    {
      "raw_name": "exact written medicine line",
      "raw_strength": "strength if written or null",
      "raw_dosage": "dosage pattern (e.g. 1-0-1) or null",
      "raw_duration": "duration (e.g. 5 days) or null",
      "raw_timing": "meal timing (e.g. after food) or null"
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
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Examine this prescription image independently. Extract all visible medicines and instructions." },
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
        provider: "Qwen Vision",
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
      provider: "Qwen Vision",
      model,
      success: true,
      is_readable: parsed.is_readable !== false,
      unreadable_reason: parsed.unreadable_reason || null,
      clinical_notes: parsed.clinical_notes || null,
      extractions,
    };
  } catch (err: any) {
    return {
      provider: "Qwen Vision",
      model,
      success: false,
      is_readable: true,
      extractions: [],
      error: err?.message || String(err),
    };
  }
}
