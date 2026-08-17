import type { RawOcrResult } from "../types";

/**
 * TrOCR Handwritten OCR Service
 * Model: microsoft/trocr-large-handwritten (or fine-tuned Indian handwriting checkpoint)
 *
 * Primary Purpose: Pure handwritten text recognition.
 * It returns RAW TEXT exactly as seen, without altering or mapping to medicine names.
 */
export async function runTrOCR(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<RawOcrResult> {
  const hfToken = process.env.HF_TOKEN;
  const customTrOCREndpoint = process.env.TROCR_ENDPOINT;

  // 1. If custom dedicated TrOCR service endpoint is provided
  if (customTrOCREndpoint) {
    try {
      const res = await fetch(customTrOCREndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mimeType }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          provider: "Custom TrOCR Worker",
          model: data.model || "trocr-large-indian-finetuned",
          raw_text: data.text || "",
          lines: Array.isArray(data.lines) ? data.lines : (data.text || "").split("\n"),
          success: true,
        };
      }
    } catch {
      // fallback
    }
  }

  // 2. If Hugging Face Serverless / Inference Router is configured
  if (hfToken) {
    try {
      const buffer = Buffer.from(imageBase64, "base64");
      const endpoint = "https://router.huggingface.co/hf-inference/models/microsoft/trocr-large-handwritten";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": mimeType,
        },
        body: buffer,
      });

      if (res.ok) {
        const data = await res.json();
        const text = Array.isArray(data)
          ? data.map((d: any) => d.generated_text || "").join("\n")
          : data.generated_text || "";

        return {
          provider: "Hugging Face Inference",
          model: "microsoft/trocr-large-handwritten",
          raw_text: text,
          lines: text.split("\n").filter((l: string) => l.trim().length > 0),
          success: true,
        };
      }
    } catch {
      // continue to fallback
    }
  }

  // 3. Graceful fallback when remote TrOCR worker is unreachable:
  // Return structured partial result rather than throwing
  return {
    provider: "TrOCR Engine",
    model: "microsoft/trocr-large-handwritten",
    raw_text: "",
    lines: [],
    success: false,
    error: "TrOCR remote service unavailable. Vision models will provide primary extraction.",
  };
}
