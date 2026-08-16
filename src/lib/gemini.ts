// ============================================================
// Prescription Reader — Gemini API helpers
// ============================================================
// Calls Gemini Vision directly via fetch().
// No SDK, no backend route. Image -> base64 happens client-side
// in page.tsx, base64 is sent to the Gemini endpoint here.
// ============================================================

export interface Medicine {
  brandName: string;
  genericName: string;
  category: string;
  frequency: string;
  timing: string;
  duration: string;
  description: string;
  whyPrescribed: string;
  sideEffects: string[];
  isAntibiotic: boolean;
  isPenicillinBased: boolean;
  allergyWarning: string | null;
  completionWarning: string | null;
}

export interface PrescriptionResult {
  medicines: Medicine[];
  generalWarnings: string[];
}

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

/**
 * Convert a File to a base64 string (no data: prefix).
 */
export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Build the enhanced clinical prompt sent to Gemini Vision.
 * Rigorously engineered for pharmacopeial accuracy, handwriting resolution,
 * exact dosage matching, and strict hallucination prevention.
 */
function buildPrompt(symptoms: string): string {
  const trimmed = symptoms.trim();
  return `You are a world-class Clinical Pharmacist and Medical Vision Intelligence system.
Your mission is to examine the provided doctor's prescription image and extract the EXACT tablet, capsule, syrup, or injection names with 100% pharmacological accuracy.

Patient Symptoms provided: ${trimmed || "None provided"}

CRITICAL ACCURACY & RECOGNITION RULES:
1. EXACT MEDICINE / TABLET IDENTIFICATION:
   - Carefully decipher every line of handwritten cursive or printed doctor text.
   - Look for medical prefixes: "Tab." (Tablet), "Cap." (Capsule), "Syp." (Syrup), "Inj." (Injection), "Oint." (Ointment), "Drops".
   - Identify the exact Brand Name (e.g. "Augmentin 625", "Dolo 650", "Pan 40", "Azithral 500", "Allegra 120", "Zifi 200", "Monocef-O") and the corresponding Active Pharmaceutical Ingredient / Generic Salt name (e.g. "Amoxicillin + Clavulanic Acid 625mg", "Paracetamol 650mg", "Pantoprazole 40mg", "Azithromycin 500mg").
   - Validate extracted names against official pharmacopeias (FDA, WHO, BNF). Never invent or hallucinate drug names.
   - If letters in a medicine name are ambiguous or difficult to read, cross-reference with typical clinical indication and dosage strengths (e.g., 650mg is typically Paracetamol; 40mg is typically Pantoprazole/Esomeprazole; 500mg is typically Amoxicillin/Ciprofloxacin/Azithromycin), and append "(unclear)" if there is lingering uncertainty.

2. ACCURATE DOSAGE & TIMING INTERPRETATION:
   - Decode medical frequency shorthand accurately:
     * "1-0-0" or "OD" -> "Once a day (Morning)"
     * "0-0-1" or "HS" -> "Once a day (Bedtime)"
     * "1-0-1" or "BD / BID" -> "Twice a day (Morning & Night)"
     * "1-1-1" or "TDS / TID" -> "3 times a day (Morning, Afternoon & Night)"
     * "1-1-1-1" or "QID" -> "4 times a day"
     * "SOS / PRN" -> "As needed / when required"
     * "AC" -> "Before food / meals"
     * "PC" -> "After food / meals"

3. CLINICAL CATEGORY & SAFETY INTEGRITY:
   - Categorize accurately (e.g. "Antibiotic", "Analgesic / Antipyretic", "Antacid / Proton Pump Inhibitor", "Antihistamine / Allergy", "NSAID", "Bronchodilator", "Antidiabetic", "Cardiovascular").
   - Antibiotics: If it is an antibiotic, set "isAntibiotic": true and provide the standard course completion rule.
   - Penicillin Allergies: If the drug is penicillin-derived (e.g. Amoxicillin, Ampicillin, Augmentin, Piperacillin), set "isPenicillinBased": true and populate "allergyWarning" with "Penicillin-based antibiotic — inform your doctor if you are allergic to penicillin."

4. OUTPUT FORMAT:
Return ONLY a valid JSON object matching this exact schema with zero markdown fences or additional chatter:

{
  "medicines": [
    {
      "brandName": "Exact Brand Name and Strength (e.g. Dolo 650)",
      "genericName": "Exact Active Generic / Salt Name (e.g. Paracetamol 650mg)",
      "category": "Accurate Clinical Class (e.g. Painkiller / Antipyretic)",
      "frequency": "Exact dosage schedule (e.g. Twice a day)",
      "timing": "Exact timing (e.g. After meals)",
      "duration": "Duration (e.g. 5 days)",
      "description": "Clear plain-English explanation of how this medicine functions. 2 sentences maximum.",
      "whyPrescribed": "Clinical rationale explaining why the doctor prescribed this for the condition/symptoms. 2 sentences maximum.",
      "sideEffects": ["Top side effect 1", "Top side effect 2"],
      "isAntibiotic": false,
      "isPenicillinBased": false,
      "allergyWarning": null,
      "completionWarning": null
    }
  ],
  "generalWarnings": []
}`;
}

/**
 * Strip possible \`\`\`json fences and surrounding noise from a model response
 * before JSON.parse.
 */
function sanitizeResponseText(raw: string): string {
  let text = raw.trim();

  // Strip leading \`\`\`json or \`\`\` fences
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/i, "");
  }

  // If there's still surrounding text, try to slice to the outermost braces.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

/**
 * Validate / coerce a parsed JSON object into a PrescriptionResult.
 * Falls back to safe defaults for missing or malformed fields.
 */
function coerceResult(parsed: unknown): PrescriptionResult {
  const safeString = (v: unknown, fallback = ""): string =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
  const safeStringArray = (v: unknown): string[] =>
    Array.isArray(v)
      ? v
          .map((x) => (typeof x === "string" ? x.trim() : ""))
          .filter((x) => x.length > 0)
      : [];
  const safeBool = (v: unknown): boolean => v === true;
  const safeNullableString = (v: unknown): string | null =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

  const rawMedicines =
    parsed && typeof parsed === "object" && "medicines" in parsed
      ? (parsed as { medicines: unknown }).medicines
      : [];
  const medicinesList = Array.isArray(rawMedicines) ? rawMedicines : [];

  const medicines: Medicine[] = medicinesList.map((m): Medicine => {
    const med = (m ?? {}) as Record<string, unknown>;
    return {
      brandName: safeString(med.brandName, "Unknown medicine"),
      genericName: safeString(med.genericName),
      category: safeString(med.category, "Medicine"),
      frequency: safeString(med.frequency),
      timing: safeString(med.timing),
      duration: safeString(med.duration),
      description: safeString(med.description),
      whyPrescribed: safeString(med.whyPrescribed),
      sideEffects: safeStringArray(med.sideEffects).slice(0, 3),
      isAntibiotic: safeBool(med.isAntibiotic),
      isPenicillinBased: safeBool(med.isPenicillinBased),
      allergyWarning: safeNullableString(med.allergyWarning),
      completionWarning: safeNullableString(med.completionWarning),
    };
  });

  const generalWarnings =
    parsed && typeof parsed === "object" && "generalWarnings" in parsed
      ? safeStringArray((parsed as { generalWarnings: unknown }).generalWarnings)
      : [];

  return { medicines, generalWarnings };
}

// Ordered list of candidate models for maximum accuracy and zero downtime
const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest"
];

/**
 * Analyse a prescription image with Gemini Vision.
 * @param imageBase64 base64 string (no data: prefix)
 * @param mimeType e.g. "image/jpeg" | "image/png"
 * @param symptoms optional patient symptoms text
 */
export async function analysePrescription(
  imageBase64: string,
  mimeType: string,
  symptoms: string,
): Promise<PrescriptionResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError(
      "Missing NEXT_PUBLIC_GEMINI_API_KEY. Add it to .env.local and restart the dev server.",
    );
  }

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: buildPrompt(symptoms) },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1, // Lower temperature to minimize hallucination and maximize clinical precision
      topP: 0.95,
      maxOutputTokens: 2048,
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
        lastError = `Model ${modelName}: (${res.status}) ${detail}`;
        continue;
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ??
        "";

      if (!text) {
        continue;
      }

      const cleaned = sanitizeResponseText(text);
      const parsed = JSON.parse(cleaned);
      return coerceResult(parsed);
    } catch (err: any) {
      lastError = err?.message || String(err);
      continue;
    }
  }

  throw new GeminiError(
    `Could not parse the prescription accurately. ${lastError || "Try uploading a higher resolution photo with clear lighting."}`
  );
}
