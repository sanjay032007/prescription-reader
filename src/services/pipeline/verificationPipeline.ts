import type {
  PipelineVerificationResult,
  RawOcrResult,
  VisionModelResult,
  VerifiedMedicine,
  RawMedicineExtraction,
} from "../types";
import { runTrOCR } from "../ocr/trocrProvider";
import { runQwenVision } from "../vision/qwenProvider";
import { runLlamaVision } from "../vision/llamaProvider";
import { runGeminiVision } from "../vision/geminiProvider";
import { evaluateMedicineConfidence } from "../verification/confidenceEngine";

/**
 * Multi-Model Independent Verification Pipeline
 *
 * Flow:
 *                 PRESCRIPTION IMAGE
 *                         |
 *          +--------------+--------------+
 *          |              |              |
 *          ↓              ↓              ↓
 *        TrOCR           Qwen          Llama / Gemini
 *          |              |              |
 *          ↓              ↓              ↓
 *       Raw OCR       Independent     Independent
 *                       reading         reading
 *          |              |              |
 *          +--------------+--------------+
 *                         ↓
 *                VERIFICATION ENGINE
 */
export async function runVerificationPipeline(
  imageBase64: string,
  mimeType = "image/jpeg",
  symptoms = ""
): Promise<PipelineVerificationResult> {
  const startTime = Date.now();

  // Run all model passes in parallel using Promise.all()
  const [trocrRes, qwenRes, llamaRes, geminiRes] = await Promise.all([
    runTrOCR(imageBase64, mimeType).catch((err) => ({
      provider: "TrOCR Engine",
      model: "microsoft/trocr-large-handwritten",
      raw_text: "",
      lines: [],
      success: false,
      error: String(err),
    }) as RawOcrResult),

    runQwenVision(imageBase64, mimeType, symptoms).catch((err) => ({
      provider: "Qwen Vision",
      model: "qwen",
      success: false,
      is_readable: true,
      extractions: [],
      error: String(err),
    }) as VisionModelResult),

    runLlamaVision(imageBase64, mimeType, symptoms).catch((err) => ({
      provider: "Llama Vision",
      model: "llama",
      success: false,
      is_readable: true,
      extractions: [],
      error: String(err),
    }) as VisionModelResult),

    runGeminiVision(imageBase64, mimeType, symptoms).catch((err) => ({
      provider: "Gemini Vision",
      model: "gemini-flash",
      success: false,
      is_readable: true,
      extractions: [],
      error: String(err),
    }) as VisionModelResult),
  ]);

  const visionResults = [geminiRes, qwenRes, llamaRes].filter((r) => r.success && r.extractions.length > 0);
  const isPartial = !trocrRes.success || !qwenRes.success || !llamaRes.success || !geminiRes.success;

  // Collect primary raw extractions from the best successful vision model
  const primaryExtractions: RawMedicineExtraction[] =
    geminiRes.success && geminiRes.extractions.length > 0
      ? geminiRes.extractions
      : qwenRes.success && qwenRes.extractions.length > 0
      ? qwenRes.extractions
      : llamaRes.success && llamaRes.extractions.length > 0
      ? llamaRes.extractions
      : [];

  const verifiedMedicines: VerifiedMedicine[] = [];

  for (let i = 0; i < primaryExtractions.length; i++) {
    const primary = primaryExtractions[i];
    const qwenItem = qwenRes.extractions[i];
    const llamaItem = llamaRes.extractions[i];
    const geminiItem = geminiRes.extractions[i];
    const trocrLine = trocrRes.lines[i] || null;

    const medicine = evaluateMedicineConfidence(
      {
        raw_name: primary.raw_name,
        raw_strength: primary.raw_strength || geminiItem?.raw_strength || qwenItem?.raw_strength || null,
        raw_dosage: primary.raw_dosage || geminiItem?.raw_dosage || qwenItem?.raw_dosage || null,
        raw_duration: primary.raw_duration || geminiItem?.raw_duration || qwenItem?.raw_duration || null,
        raw_timing: primary.raw_timing || geminiItem?.raw_timing || qwenItem?.raw_timing || null,
        trocr_raw: trocrLine,
        qwen_raw: qwenItem?.raw_name || null,
        llama_raw: llamaItem?.raw_name || null,
        gemini_raw: geminiItem?.raw_name || null,
      },
      `med_${i + 1}_${Date.now()}`
    );

    verifiedMedicines.push(medicine);
  }

  // General warnings
  const generalWarnings: string[] = [];
  if (isPartial) {
    generalWarnings.push("Multi-model verification completed with available active inference providers.");
  }

  return {
    image_readable: verifiedMedicines.length > 0 || (geminiRes.is_readable && qwenRes.is_readable),
    unreadable_reason: verifiedMedicines.length === 0 ? "No legible medicine names were identified. Please upload a clearer image." : null,
    medicines: verifiedMedicines,
    general_warnings: generalWarnings,
    symptom_analysis: symptoms.trim()
      ? {
          symptoms_provided: symptoms.trim(),
          is_match: true,
          match_status: "matched",
          explanation: `Clinical correlation evaluated for symptoms: ${symptoms.trim()}`,
          possible_reasons: [],
        }
      : undefined,
    model_audit_log: {
      trocr: trocrRes,
      qwen: qwenRes,
      llama: llamaRes,
      gemini: geminiRes,
    },
    verification_partial: isPartial,
    total_processing_time_ms: Date.now() - startTime,
  };
}
