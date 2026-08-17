import { verifyIndianMedicine, extractStandardPrefix } from "./verificationEngine";

export interface Medicine {
  brandName: string;
  originalExtractedName?: string;
  genericName: string;
  category: string;
  frequency: string;
  timing: string;
  duration: string;
  dosageUnderstood: boolean;
  confidence: "high" | "medium" | "low";
  confidenceReason?: string;
  suggestedCorrection?: {
    brandName: string;
    genericName: string;
    similarity: number;
  };
  rawDetectedText?: string;
  dosageWarning?: string;
  description: string;
  whyPrescribed: string;
  sideEffects: string[];
  isAntibiotic: boolean;
  isPenicillinBased: boolean;
  allergyWarning: string | null;
  completionWarning: string | null;
  manufacturer?: string;
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
 * Prompt 1 — Extraction Pass (OCR focus, strict literal read)
 */
function buildExtractionPrompt(): string {
  return `You are a medical OCR specialist. Look at this doctor prescription image very carefully.
List ONLY the medicine names, strengths, forms, frequencies (e.g. 1-0-1, 1-1-1, 1-0-0, 0-0-1), timings (AC/PC/HS), and durations you can literally see written on the paper.

CRITICAL RULES:
1. Do NOT guess or fabricate. If a word is unclear, write it exactly as it appears with '(unclear)' tag.
2. If image is blurry or not a prescription, set imageReadable: false with unreadableReason.
3. Extract each medicine as a structured item.

OUTPUT ONLY JSON:
{
  "imageReadable": true,
  "unreadableReason": "",
  "items": [
    {
      "detectedName": "Exact text on paper (e.g. Tab. Dolo 650)",
      "frequency": "e.g. 1-0-1",
      "timing": "e.g. after food / PC",
      "duration": "e.g. 5 days",
      "isUnclear": false
    }
  ]
}`;
}

/**
 * Prompt 2 — Verification Pass (Indian clinical pharmacist with 20+ years experience)
 */
function buildVerificationPrompt(symptoms: string): string {
  const trimmed = symptoms.trim();
  return `You are a licensed Indian clinical pharmacist with 20+ years of dispensing experience in India.
Look at this Indian doctor prescription image.

Your task:
1. Read the prescription and cross-check all Indian brand names (common examples: Dolo 650, Crocin, Augmentin 625, Pan-D, Pantocid 40, Calpol 650, Meftal-Spas, Allegra 120, Montair-LC, Azithral 500, Azee 500, Shelcal 500, Telma 40, Glycomet 500, Zerodol-P, Voveran, Polycrol, etc.).
2. Identify dosage schedules in standard Indian format (1-0-0 = Morning, 1-0-1 = Morning & Night, 1-1-1 = Thrice daily, 0-0-1 = Bedtime).
3. For each medicine, provide generic salt composition, therapeutic category, clinical rationale (why prescribed), side effects, and safety warnings (penicillin / antibiotic completion).
4. Patient symptoms reported: ${trimmed ? `"${trimmed}"` : "None provided"}. Assess if medicines match symptoms.

OUTPUT ONLY JSON:
{
  "imageReadable": true,
  "unreadableReason": "",
  "medicines": [
    {
      "brandName": "Correct Indian Brand Name (e.g. Dolo 650, Augmentin 625)",
      "genericName": "Generic Salt Name (e.g. Paracetamol 650mg)",
      "category": "Therapeutic Class (e.g. Antipyretic, Antibiotic, PPI Antacid)",
      "frequency": "e.g. 1-1-1",
      "timing": "e.g. after food",
      "duration": "e.g. 5 days",
      "dosageUnderstood": true,
      "description": "Short explanation of the medication.",
      "whyPrescribed": "Clinical reason for this medication.",
      "sideEffects": ["nausea", "headache"],
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

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-pro-latest",
];

async function callGemini(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  promptText: string
): Promise<any> {
  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: promptText },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 2500,
    },
  };

  let lastError = "";

  // Cascade through available high-performance models if one is under high demand (503/429)
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
        
        // If 503 (high demand) or 429 (rate limit), seamlessly try the next candidate model
        if (res.status === 503 || res.status === 429 || res.status >= 500) {
          continue;
        }
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
      return JSON.parse(cleaned);
    } catch (err: any) {
      lastError = err?.message || String(err);
      continue;
    }
  }

  throw new GeminiError(lastError || "Could not analyze the prescription image. Please try again.");
}

/**
 * Multi-layer 4-step Verification Pipeline:
 * Layer 1: Parallel Gemini Dual-Pass Extraction (with resilient multi-model cascade)
 * Layer 2: Fuse.js Fuzzy Matching against Indian Medicine Database
 * Layer 3: Pure JS Dosage Pattern & Strength Rule Engine
 * Layer 4: Confidence Assignment & User Verification Payload
 */
export async function analysePrescription(
  imageBase64: string,
  mimeType: string,
  symptoms: string
): Promise<PrescriptionResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("Missing NEXT_PUBLIC_GEMINI_API_KEY. Add it to .env.local and restart.");
  }

  // ============================================================
  // LAYER 1: Parallel Dual-Pass Execution via Promise.all()
  // ============================================================
  let pass1Data: any = null;
  let pass2Data: any = null;

  try {
    const [res1, res2] = await Promise.all([
      callGemini(apiKey, imageBase64, mimeType, buildExtractionPrompt()),
      callGemini(apiKey, imageBase64, mimeType, buildVerificationPrompt(symptoms)),
    ]);
    pass1Data = res1;
    pass2Data = res2;
  } catch (err: any) {
    throw new GeminiError(err?.message || "Failed to analyze prescription image with dual vision passes.");
  }

  // Check image readability from both passes
  const isReadable = (pass1Data?.imageReadable !== false) && (pass2Data?.imageReadable !== false);
  if (!isReadable) {
    throw new GeminiError(
      pass2Data?.unreadableReason ||
      pass1Data?.unreadableReason ||
      "The prescription image is too unclear or is not a medical prescription. Please upload a clearer photo."
    );
  }

  const rawExtractedItems = Array.isArray(pass1Data?.items) ? pass1Data.items : [];
  const rawVerifiedMedicines = Array.isArray(pass2Data?.medicines) ? pass2Data.medicines : [];

  if (rawExtractedItems.length === 0 && rawVerifiedMedicines.length === 0) {
    throw new GeminiError(
      "No legible medicine names were found. The handwriting may be too faded or unclear. Please upload a well-lit photo."
    );
  }

  // ============================================================
  // LAYERS 2 & 3: Fuzzy Matching + Dosage Rule Engine
  // ============================================================
  const finalMedicines: Medicine[] = [];

  // Match each medicine from the verified list
  const primaryList = rawVerifiedMedicines.length > 0 ? rawVerifiedMedicines : rawExtractedItems;

  for (let i = 0; i < primaryList.length; i++) {
    const vMed = (rawVerifiedMedicines[i] || {}) as Record<string, any>;
    const eItem = (rawExtractedItems[i] || {}) as Record<string, any>;

    const pass1Name = (eItem.detectedName || vMed.brandName || "").trim();
    const pass2Name = (vMed.brandName || eItem.detectedName || "").trim();
    const frequency = vMed.frequency || eItem.frequency || "";
    const timing = vMed.timing || eItem.timing || "";
    const duration = vMed.duration || eItem.duration || "";

    if (!pass1Name && !pass2Name) continue;

    // Run verification engine (Layer 2 & Layer 3)
    const verification = verifyIndianMedicine(pass1Name, pass2Name, frequency, timing, duration);

    // Determine final brand name & generic composition
    let finalBrand = pass2Name || pass1Name;
    let finalGeneric = vMed.genericName || verification.suggestedGenericName || "General formulation";
    let finalCategory = vMed.category || verification.matchedRecord?.category || "Medication";

    // Build suggested correction if fuzzy match found a close variant
    let suggestedCorrection: Medicine["suggestedCorrection"] = undefined;
    if (verification.suggestedBrandName && verification.suggestedBrandName.toLowerCase() !== finalBrand.toLowerCase()) {
      suggestedCorrection = {
        brandName: verification.suggestedBrandName,
        genericName: verification.suggestedGenericName || finalGeneric,
        similarity: Math.round((1 - verification.similarityScore) * 100),
      };

      // Auto-correct high confidence typos (similarity >= 88%)
      if (verification.similarityScore <= 0.15 && verification.matchedRecord) {
        finalBrand = verification.matchedRecord.brandName;
        finalGeneric = verification.matchedRecord.genericName;
        finalCategory = verification.matchedRecord.category;
      }
    }

    // Ensure medical prefix (Tab., Cap., Syp.)
    const prefix = verification.standardizedPrefix;
    if (!finalBrand.startsWith("Tab.") && !finalBrand.startsWith("Cap.") && !finalBrand.startsWith("Syp.") && !finalBrand.startsWith("Inj.")) {
      finalBrand = `${prefix} ${finalBrand}`;
    }

    const hasValidDosage = Boolean(
      (verification.standardizedFrequency && !verification.standardizedFrequency.toLowerCase().includes("unclear")) ||
      (timing && !timing.toLowerCase().includes("unclear"))
    );

    finalMedicines.push({
      brandName: finalBrand,
      originalExtractedName: pass1Name,
      genericName: finalGeneric,
      category: finalCategory,
      frequency: verification.standardizedFrequency,
      timing: timing || "",
      duration: verification.standardizedDuration || duration,
      dosageUnderstood: hasValidDosage,
      confidence: verification.confidence,
      confidenceReason: verification.confidenceReason,
      suggestedCorrection,
      rawDetectedText: pass1Name !== finalBrand ? pass1Name : undefined,
      dosageWarning: verification.dosageWarning,
      description: vMed.description || `Commonly prescribed in India for clinical treatment.`,
      whyPrescribed: vMed.whyPrescribed || `Prescribed for therapeutic indications.`,
      sideEffects: Array.isArray(vMed.sideEffects) ? vMed.sideEffects.slice(0, 3) : ["Mild nausea", "Headache"],
      isAntibiotic: Boolean(vMed.isAntibiotic || finalCategory.toLowerCase().includes("antibiotic")),
      isPenicillinBased: Boolean(vMed.isPenicillinBased || finalGeneric.toLowerCase().includes("amoxicillin") || finalGeneric.toLowerCase().includes("augmentin")),
      allergyWarning: vMed.allergyWarning || (finalGeneric.toLowerCase().includes("amoxicillin") ? "Contains penicillin-based antibiotic. Avoid if allergic to penicillin." : null),
      completionWarning: vMed.completionWarning || (vMed.isAntibiotic ? "Complete full prescribed antibiotic course even if feeling better." : null),
      manufacturer: verification.matchedRecord?.manufacturer,
    });
  }

  // General warnings
  const generalWarnings: string[] = Array.isArray(pass2Data?.generalWarnings)
    ? pass2Data.generalWarnings
    : [];

  // Symptom cross check
  let symptomAnalysis: SymptomAnalysis | undefined = undefined;
  if (pass2Data?.symptomAnalysis && typeof pass2Data.symptomAnalysis === "object") {
    const sym = pass2Data.symptomAnalysis;
    symptomAnalysis = {
      symptomsProvided: sym.symptomsProvided || null,
      isMatch: sym.matchStatus === "matched",
      matchStatus: sym.matchStatus || (symptoms.trim() ? "matched" : "none_provided"),
      explanation: sym.explanation || "",
      possibleReasons: Array.isArray(sym.possibleReasons) ? sym.possibleReasons : [],
    };
  }

  return {
    medicines: finalMedicines,
    generalWarnings,
    symptomAnalysis,
    imageReadable: true,
  };
}
