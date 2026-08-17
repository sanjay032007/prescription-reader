import type { VerifiedMedicine, CandidateMatch } from "@/services/types";

export interface GroundTruthMedicine {
  exact_handwritten_text: string;
  expected_brand_name: string;
  expected_generic_name: string;
  expected_strength: string | null;
  expected_dosage: string | null;
  expected_duration: string | null;
}

export interface EvaluationMetrics {
  total_samples: number;
  medicine_name_top1_accuracy: number;
  medicine_name_top3_accuracy: number;
  strength_accuracy: number;
  dosage_accuracy: number;
  duration_accuracy: number;
  abstention_rate: number; // percentage of low-confidence flagged items
  complete_record_accuracy: number;
}

/**
 * Benchmark evaluation suite for measuring accuracy on Indian handwritten prescriptions.
 */
export function evaluatePredictions(
  predictions: VerifiedMedicine[],
  groundTruths: GroundTruthMedicine[]
): EvaluationMetrics {
  let top1Matches = 0;
  let top3Matches = 0;
  let strengthMatches = 0;
  let dosageMatches = 0;
  let durationMatches = 0;
  let abstentions = 0;
  let completeMatches = 0;

  const total = Math.max(1, groundTruths.length);

  for (let i = 0; i < groundTruths.length; i++) {
    const truth = groundTruths[i];
    const pred = predictions[i];

    if (!pred) continue;

    if (pred.confidence === "LOW") {
      abstentions++;
    }

    const norm = (s?: string | null) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const top1Candidate = pred.selected_candidate?.name || pred.verified_name || pred.raw_text;
    const isTop1 = norm(top1Candidate) === norm(truth.expected_brand_name);
    if (isTop1) top1Matches++;

    const isTop3 = pred.candidate_matches.some(
      (c) => norm(c.name) === norm(truth.expected_brand_name)
    );
    if (isTop3 || isTop1) top3Matches++;

    const isStrength = norm(pred.strength.raw_text) === norm(truth.expected_strength);
    if (isStrength) strengthMatches++;

    const isDosage = norm(pred.dosage.raw_text) === norm(truth.expected_dosage);
    if (isDosage) dosageMatches++;

    const isDuration = norm(pred.duration.raw_text) === norm(truth.expected_duration);
    if (isDuration) durationMatches++;

    if (isTop1 && (truth.expected_strength ? isStrength : true) && (truth.expected_dosage ? isDosage : true)) {
      completeMatches++;
    }
  }

  return {
    total_samples: total,
    medicine_name_top1_accuracy: parseFloat(((top1Matches / total) * 100).toFixed(1)),
    medicine_name_top3_accuracy: parseFloat(((top3Matches / total) * 100).toFixed(1)),
    strength_accuracy: parseFloat(((strengthMatches / total) * 100).toFixed(1)),
    dosage_accuracy: parseFloat(((dosageMatches / total) * 100).toFixed(1)),
    duration_accuracy: parseFloat(((durationMatches / total) * 100).toFixed(1)),
    abstention_rate: parseFloat(((abstentions / total) * 100).toFixed(1)),
    complete_record_accuracy: parseFloat(((completeMatches / total) * 100).toFixed(1)),
  };
}
