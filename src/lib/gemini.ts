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
 */
function buildPrompt(symptoms: string): string {
  const trimmed = symptoms.trim();
  return `You are a world-class Clinical Pharmacist and Medical Vision Intelligence system.
Your mission is to examine the provided doctor's prescription image and extract the EXACT tablet, capsule, syrup, or injection names with 100% pharmacological accuracy.

Patient Symptoms provided: ${trimmed ? `"${trimmed}"` : "None provided"}

CRITICAL ACCURACY & CLINICAL RULES:
1. EXACT MEDICINE / TABLET IDENTIFICATION:
   - Carefully decipher every line of handwritten cursive or printed doctor text.
   - Look for medical prefixes: "Tab." (Tablet), "Cap." (Capsule), "Syp." (Syrup), "Inj." (Injection), "Oint." (Ointment), "Drops".
   - Identify the exact Brand Name (e.g. "Augmentin 625", "Dolo 650", "Pan 40", "Azithral 500", "Allegra 120", "Zifi 200", "Monocef-O") and the corresponding Active Pharmaceutical Ingredient / Generic Salt name (e.g. "Amoxicillin + Clavulanic Acid 625mg", "Paracetamol 650mg", "Pantoprazole 40mg", "Azithromycin 500mg").
   - Validate extracted names against official pharmacopeias (FDA, WHO, BNF). Never invent or hallucinate drug names.

2. DOSAGE UNDERSTANDING & VERIFICATION RULE:
   - ONLY extract dosage and schedule details ("frequency", "timing", "duration") if they are clearly legible or unambiguously identifiable on the prescription.
   - Decode shorthand if legible: "1-0-0" / "OD", "1-0-1" / "BD", "1-1-1" / "TDS", "0-0-1" / "HS", "AC" (before food), "PC" (after food).
   - If the dosage / schedule is illegible, absent, cut off, or unclear, set "dosageUnderstood": false and leave frequency/timing/duration as empty strings.
   - Set "dosageUnderstood": true ONLY when you can confidently identify the administration schedule.

3. SYMPTOM CORRELATION & MISMATCH ANALYSIS:
   - When patient symptoms are provided (${trimmed ? `"${trimmed}"` : "None"}):
     * Cross-reference the patient's reported symptoms against the clinical indications of all prescribed medicines.
     * Evaluate matchStatus:
       - "matched": The prescribed medications directly treat and correspond to the patient's reported symptoms.
       - "partial_match": The medications address only a portion of the symptoms, but other significant reported symptoms are not addressed.
       - "mismatch": The prescribed medications do NOT match or treat the reported symptoms (for example: chronic cardiovascular/hypertension pills prescribed when patient reported acute ear ache/cough, or antacids prescribed for a muscle fracture).
     * If "mismatch" or "partial_match", provide a clear, empathetic "explanation" in plain English explaining WHY they do not match, what the medicines actually treat, and list 2-3 "possibleReasons" (e.g., "Prescription might be for an ongoing chronic health condition rather than acute symptoms", "The uploaded prescription slip may belong to another consultation", "Medication may only offer supportive/indirect comfort").
   - If no symptoms were provided, set matchStatus: "none_provided", isMatch: true, explanation: "No symptoms provided for cross-referencing.", possibleReasons: [].

4. SAFETY & PENICILLIN WARNINGS:
   - Antibiotics: If it is an antibiotic, set "isAntibiotic": true and provide the course completion warning.
   - Penicillin Allergies: If the drug is penicillin-derived (e.g. Amoxicillin, Augmentin, Ampicillin), set "isPenicillinBased": true and populate "allergyWarning" with "Penicillin-based antibiotic — inform your doctor if you have a known penicillin allergy."

5. OUTPUT FORMAT:
Return ONLY a valid JSON object matching this exact schema with zero markdown fences or extra chatter:

{
  "medicines": [
    {
      "brandName": "Exact Brand Name and Strength",
      "genericName": "Exact Active Generic / Salt Name",
      "category": "Accurate Clinical Class",
      "frequency": "Exact dosage schedule (e.g. Twice a day) or empty if unclear",
      "timing": "Exact timing (e.g. After meals) or empty if unclear",
      "duration": "Duration (e.g. 5 days) or empty if unclear",
      "dosageUnderstood": true,
      "description": "Clear plain-English explanation of how this medicine functions.",
      "whyPrescribed": "Clinical rationale explaining why the doctor prescribed this.",
      "sideEffects": ["Top side effect 1", "Top side effect 2"],
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
    "matchStatus": "matched",
    "explanation": "Detailed explanation of symptom alignment or mismatch.",
    "possibleReasons": []
  }
}`;
}

/**
 * Strip possible ```json fences and surrounding noise from a model response
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
    const freq = safeString(med.frequency);
    const tim = safeString(med.timing);
    const dur = safeString(med.duration);
    const explicitUnderstood = typeof med.dosageUnderstood === "boolean" ? med.dosageUnderstood : null;

    // Check if dosage is truly understood and not "unclear" / empty
    const hasValidDosage =
      Boolean(freq && !freq.toLowerCase().includes("unclear")) ||
      Boolean(tim && !tim.toLowerCase().includes("unclear")) ||
      Boolean(dur && !dur.toLowerCase().includes("unclear"));

    const dosageUnderstood = explicitUnderstood !== null ? (explicitUnderstood && hasValidDosage) : hasValidDosage;

    return {
      brandName: safeString(med.brandName, "Unknown medicine"),
      genericName: safeString(med.genericName),
      category: safeString(med.category, "Medicine"),
      frequency: freq,
      timing: tim,
      duration: dur,
      dosageUnderstood,
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

  let symptomAnalysis: SymptomAnalysis | undefined = undefined;
  if (parsed && typeof parsed === "object" && "symptomAnalysis" in parsed) {
    const rawSym = (parsed as { symptomAnalysis: unknown }).symptomAnalysis as Record<string, unknown>;
    if (rawSym && typeof rawSym === "object") {
      const matchStatus = safeString(rawSym.matchStatus, "none_provided") as
        | "matched"
        | "partial_match"
        | "mismatch"
        | "none_provided";
      symptomAnalysis = {
        symptomsProvided: safeNullableString(rawSym.symptomsProvided),
        isMatch: matchStatus === "matched",
        matchStatus,
        explanation: safeString(rawSym.explanation),
        possibleReasons: safeStringArray(rawSym.possibleReasons),
      };
    }
  }

  return { medicines, generalWarnings, symptomAnalysis };
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
      temperature: 0.1,
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
