// ============================================================
// Prescription Reader — Gemini API helpers
// ============================================================

export interface Medicine {
  brandName: string;
  genericName: string;
  category: string;
  frequency: string;
  timing: string;
  duration: string;
  dosageUnderstood: boolean;
  confidence: "high" | "medium" | "low";
  description: string;
  whyPrescribed: string;
  sideEffects: string[];
  isAntibiotic: boolean;
  isPenicillinBased: boolean;
  allergyWarning: string | null;
  completionWarning: string | null;
}

export interface SymptomAnalysis {
  symptomsProvided: string | null;
  isMatch: boolean;
  matchStatus: "matched" | "partial_match" | "mismatch" | "none_provided";
  explanation: string;
  possibleReasons: string[];
}

export interface PrescriptionResult {
  medicines: Medicine[];
  generalWarnings: string[];
  symptomAnalysis?: SymptomAnalysis;
  imageReadable: boolean;
  unreadableReason?: string;
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
 * Build the clinical prompt. The single most important thing:
 * NEVER invent medicine names. If you cannot read it, say so.
 */
function buildPrompt(symptoms: string): string {
  const trimmed = symptoms.trim();
  return `You are a pharmacist reading a doctor's prescription image.

ABSOLUTE RULES — VIOLATION OF THESE MEANS FAILURE:

RULE 1: IMAGE READABILITY CHECK (DO THIS FIRST)
Before extracting ANY medicines, assess if the image is actually a readable prescription.
Set "imageReadable": false if ANY of these are true:
  - The image is blurry, dark, rotated, or too low resolution to read text
  - The image is NOT a prescription (e.g. a random photo, selfie, landscape, receipt)
  - The handwriting is completely illegible and you cannot make out ANY medicine names
  - The image is cut off and critical information is missing
If "imageReadable" is false, set "medicines" to an empty array [] and provide "unreadableReason" explaining what is wrong (e.g. "Image is too blurry to read any medicine names", "This does not appear to be a prescription").

RULE 2: ZERO HALLUCINATION — THIS IS THE MOST IMPORTANT RULE
  - ONLY output medicine names that you can ACTUALLY SEE written on the prescription.
  - If you can see "Shelcal" written, output "Shelcal". If you can see "Dolo 650", output "Dolo 650".
  - NEVER guess, infer, or fabricate a medicine name. If you cannot read a word clearly, SKIP that line entirely. Do NOT include it.
  - Do NOT output common medicines (Paracetamol, Amoxicillin, etc.) unless you can literally see them written on the paper.
  - For each medicine, set "confidence": "high" if clearly legible, "medium" if mostly readable but some letters uncertain, "low" if you are guessing. Do NOT include any medicine with "low" confidence — skip it.
  - It is MUCH BETTER to return fewer medicines (even 0) than to return wrong names.

RULE 3: DOSAGE — ONLY WHAT IS WRITTEN
  - Extract frequency/timing/duration ONLY if explicitly written on the prescription.
  - Common shorthands: "1-0-0"=Morning only, "1-0-1"=Morning+Night, "1-1-1"=Three times, "0-0-1"=Night only, "BD"=Twice, "TDS"=Thrice, "OD"=Once, "AC"=Before food, "PC"=After food.
  - If dosage is not written or not legible, set "dosageUnderstood": false and leave frequency/timing/duration empty.

RULE 4: SYMPTOM CROSS-CHECK
Patient symptoms: ${trimmed ? `"${trimmed}"` : "None provided"}
  - If symptoms are provided, compare them against the medicines' clinical uses.
  - matchStatus: "matched" if medicines treat those symptoms, "partial_match" if only some symptoms are covered, "mismatch" if medicines clearly don't treat those symptoms.
  - If mismatch, explain WHY and give possibleReasons.
  - If no symptoms provided, set matchStatus: "none_provided".

RULE 5: SAFETY FLAGS
  - Set isAntibiotic: true for antibiotics, with completionWarning about finishing the full course.
  - Set isPenicillinBased: true for penicillin-derived drugs (Amoxicillin, Augmentin, Ampicillin) with allergyWarning.

OUTPUT: Return ONLY valid JSON, no markdown fences, no extra text:

{
  "imageReadable": true,
  "unreadableReason": "",
  "medicines": [
    {
      "brandName": "EXACT name as written on paper",
      "genericName": "Correct generic salt name",
      "category": "Clinical class",
      "frequency": "",
      "timing": "",
      "duration": "",
      "dosageUnderstood": false,
      "confidence": "high",
      "description": "What this medicine does, 1-2 sentences.",
      "whyPrescribed": "Why a doctor would prescribe this.",
      "sideEffects": ["effect1", "effect2"],
      "isAntibiotic": false,
      "isPenicillinBased": false,
      "allergyWarning": null,
      "completionWarning": null
    }
  ],
  "generalWarnings": [],
  "symptomAnalysis": {
    "symptomsProvided": ${trimmed ? `"${trimmed}"` : "null"},
    "isMatch": true,
    "matchStatus": "${trimmed ? "matched" : "none_provided"}",
    "explanation": "",
    "possibleReasons": []
  }
}`;
}

/**
 * Strip possible ```json fences and surrounding noise.
 */
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
 * Validate / coerce a parsed JSON object into a PrescriptionResult.
 */
function coerceResult(parsed: unknown): PrescriptionResult {
  const safeString = (v: unknown, fallback = ""): string =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
  const safeStringArray = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map((x) => (typeof x === "string" ? x.trim() : "")).filter((x) => x.length > 0)
      : [];
  const safeBool = (v: unknown): boolean => v === true;
  const safeNullableString = (v: unknown): string | null =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;

  // Image readability check
  const imageReadable = obj.imageReadable !== false;
  const unreadableReason = safeString(obj.unreadableReason);

  const rawMedicines = "medicines" in obj ? obj.medicines : [];
  const medicinesList = Array.isArray(rawMedicines) ? rawMedicines : [];

  // Filter out low-confidence medicines to prevent hallucinations
  const medicines: Medicine[] = medicinesList
    .map((m): Medicine | null => {
      const med = (m ?? {}) as Record<string, unknown>;
      const brandName = safeString(med.brandName);
      const confidence = safeString(med.confidence, "high") as "high" | "medium" | "low";

      // Skip medicines with low confidence or "Unknown" names
      if (
        confidence === "low" ||
        !brandName ||
        brandName === "Unknown medicine" ||
        brandName.toLowerCase().includes("unknown") ||
        brandName.toLowerCase().includes("illegible") ||
        brandName.toLowerCase().includes("unreadable")
      ) {
        return null;
      }

      const freq = safeString(med.frequency);
      const tim = safeString(med.timing);
      const dur = safeString(med.duration);
      const explicitUnderstood = typeof med.dosageUnderstood === "boolean" ? med.dosageUnderstood : null;

      const hasValidDosage =
        Boolean(freq && !freq.toLowerCase().includes("unclear")) ||
        Boolean(tim && !tim.toLowerCase().includes("unclear")) ||
        Boolean(dur && !dur.toLowerCase().includes("unclear"));

      const dosageUnderstood = explicitUnderstood !== null ? (explicitUnderstood && hasValidDosage) : hasValidDosage;

      return {
        brandName,
        genericName: safeString(med.genericName),
        category: safeString(med.category, "Medicine"),
        frequency: freq,
        timing: tim,
        duration: dur,
        dosageUnderstood,
        confidence,
        description: safeString(med.description),
        whyPrescribed: safeString(med.whyPrescribed),
        sideEffects: safeStringArray(med.sideEffects).slice(0, 3),
        isAntibiotic: safeBool(med.isAntibiotic),
        isPenicillinBased: safeBool(med.isPenicillinBased),
        allergyWarning: safeNullableString(med.allergyWarning),
        completionWarning: safeNullableString(med.completionWarning),
      };
    })
    .filter((m): m is Medicine => m !== null);

  const generalWarnings = "generalWarnings" in obj ? safeStringArray(obj.generalWarnings) : [];

  let symptomAnalysis: SymptomAnalysis | undefined = undefined;
  if ("symptomAnalysis" in obj) {
    const rawSym = obj.symptomAnalysis as Record<string, unknown>;
    if (rawSym && typeof rawSym === "object") {
      const matchStatus = safeString(rawSym.matchStatus, "none_provided") as
        | "matched" | "partial_match" | "mismatch" | "none_provided";
      symptomAnalysis = {
        symptomsProvided: safeNullableString(rawSym.symptomsProvided),
        isMatch: matchStatus === "matched",
        matchStatus,
        explanation: safeString(rawSym.explanation),
        possibleReasons: safeStringArray(rawSym.possibleReasons),
      };
    }
  }

  return { medicines, generalWarnings, symptomAnalysis, imageReadable, unreadableReason };
}

// Use only the most accurate model — no fallback to weaker models
const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
];

/**
 * Analyse a prescription image with Gemini Vision.
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
      temperature: 0.0,   // Zero temperature = zero creativity = zero hallucination
      topP: 0.9,
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
        lastError = `(${res.status}) ${detail}`;
        continue;
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ??
        "";

      if (!text) {
        lastError = "Model returned an empty response.";
        continue;
      }

      const cleaned = sanitizeResponseText(text);
      const parsed = JSON.parse(cleaned);
      const result = coerceResult(parsed);

      // If the image was flagged as unreadable by the model
      if (!result.imageReadable) {
        throw new GeminiError(
          result.unreadableReason ||
          "The prescription image is not clear enough to read. Please upload a sharper, well-lit photo and try again."
        );
      }

      // If no medicines were extracted at all
      if (result.medicines.length === 0) {
        throw new GeminiError(
          "Could not identify any medicine names on this prescription. The handwriting may be too unclear, or this may not be a prescription. Please upload a clearer photo."
        );
      }

      return result;
    } catch (err: any) {
      if (err instanceof GeminiError) throw err;
      lastError = err?.message || String(err);
      continue;
    }
  }

  throw new GeminiError(
    `Could not analyze the prescription. ${lastError || "Please try uploading a clearer, well-lit photo."}`
  );
}
