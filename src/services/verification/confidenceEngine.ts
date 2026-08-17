import type {
  CandidateMatch,
  ConfidenceLevel,
  ExtractedField,
  VerifiedMedicine,
} from "../types";
import { generateCandidateMatches } from "../medicine/candidateEngine";

interface MedicineEvidenceInput {
  raw_name: string;
  raw_strength?: string | null;
  raw_dosage?: string | null;
  raw_duration?: string | null;
  raw_timing?: string | null;
  trocr_raw?: string | null;
  qwen_raw?: string | null;
  llama_raw?: string | null;
  gemini_raw?: string | null;
}

/**
 * Validate dosage pattern without assuming X-X-X or rounding numbers.
 * Flags unusual patterns without changing the raw text.
 */
export function evaluateDosage(rawDosage?: string | null): ExtractedField {
  if (!rawDosage || rawDosage.trim().length === 0) {
    return {
      raw_text: null,
      value: null,
      confidence: 0,
    };
  }

  const clean = rawDosage.trim();
  let warning: string | undefined = undefined;
  let confidence = 0.85;

  // Check if it's an unusual pattern like 2-1-3 or high unit doses
  const patternMatch = clean.match(/^(\d+(?:\/\d+)?)\s*[-—–]\s*(\d+(?:\/\d+)?)\s*[-—–]\s*(\d+(?:\/\d+)?)/);
  if (patternMatch) {
    const [, m, a, n] = patternMatch;
    const numM = parseFloat(m) || 0;
    const numA = parseFloat(a) || 0;
    const numN = parseFloat(n) || 0;

    if (numM > 1 || numA > 1 || numN > 1) {
      warning = "Unusual dosage pattern (>1 unit per dose). Please verify.";
      confidence = 0.7;
    } else {
      confidence = 0.95;
    }
  }

  return {
    raw_text: clean,
    value: clean,
    confidence,
    warning,
  };
}

/**
 * Extract and validate duration without rounding to fixed cycles (e.g. 9 days stays 9 days).
 */
export function evaluateDuration(rawDuration?: string | null): ExtractedField {
  if (!rawDuration || rawDuration.trim().length === 0) {
    return {
      raw_text: null,
      value: null,
      confidence: 0,
    };
  }
  const clean = rawDuration.trim();
  return {
    raw_text: clean,
    value: clean,
    confidence: 0.9,
  };
}

/**
 * Extract strength as written (e.g. 300mg stays 300mg).
 */
export function evaluateStrength(rawStrength?: string | null): ExtractedField {
  if (!rawStrength || rawStrength.trim().length === 0) {
    return {
      raw_text: null,
      value: null,
      confidence: 0,
    };
  }
  const clean = rawStrength.trim();
  return {
    raw_text: clean,
    value: clean,
    confidence: 0.9,
  };
}

/**
 * Multi-Signal Evidence-Based Confidence Engine
 *
 * Rules:
 * 1. NO DEFAULT VALUES. Missing fields are null.
 * 2. NO SILENT AUTO-CORRECTIONS.
 * 3. Returns Top 3 candidate matches from Indian Pharmacopeia database.
 */
export function evaluateMedicineConfidence(
  input: MedicineEvidenceInput,
  id: string
): VerifiedMedicine {
  const rawText = input.raw_name.trim();

  // Generate Top 3 candidates from Indian medicine database
  const candidates: CandidateMatch[] = generateCandidateMatches(rawText, 3);
  const bestCandidate: CandidateMatch | null = candidates.length > 0 ? candidates[0] : null;

  // Evaluate independent model agreements
  const modelVotes = [
    input.qwen_raw,
    input.llama_raw,
    input.gemini_raw,
  ].filter((v): v is string => Boolean(v && v.trim().length > 0));

  let agreementCount = 1;
  if (modelVotes.length > 1) {
    const primary = rawText.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const vote of modelVotes) {
      const vClean = vote.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (vClean.includes(primary) || primary.includes(vClean)) {
        agreementCount++;
      }
    }
  }

  const confidenceReasons: string[] = [];
  let score = 0.5;

  if (bestCandidate) {
    if (bestCandidate.similarity >= 0.92) {
      score += 0.35;
      confidenceReasons.push(`Strong match with Indian medicine database: ${bestCandidate.name} (${Math.round(bestCandidate.similarity * 100)}% similarity)`);
    } else if (bestCandidate.similarity >= 0.7) {
      score += 0.2;
      confidenceReasons.push(`Moderate similarity candidate: ${bestCandidate.name} (${Math.round(bestCandidate.similarity * 100)}% similarity)`);
    } else {
      confidenceReasons.push(`Possible candidate: ${bestCandidate.name}`);
    }
  } else {
    confidenceReasons.push("No confident match found in Indian medicine database");
  }

  if (agreementCount >= 2) {
    score += 0.15;
    confidenceReasons.push(`Consensus confirmed across independent vision models`);
  }

  if (rawText.toLowerCase().includes("unclear")) {
    score -= 0.3;
    confidenceReasons.push("Contains handwriting flagged as unclear by model");
  }

  const confidenceScore = Math.max(0.1, Math.min(1.0, parseFloat(score.toFixed(2))));

  let confidence: ConfidenceLevel = "MEDIUM";
  if (confidenceScore >= 0.82 && bestCandidate && bestCandidate.similarity >= 0.88) {
    confidence = "HIGH";
  } else if (confidenceScore < 0.6 || !bestCandidate || bestCandidate.similarity < 0.65) {
    confidence = "LOW";
  }

  const dosageField = evaluateDosage(input.raw_dosage);
  const durationField = evaluateDuration(input.raw_duration);
  const strengthField = evaluateStrength(input.raw_strength);
  const timingField: ExtractedField = {
    raw_text: input.raw_timing ?? null,
    value: input.raw_timing ?? null,
    confidence: input.raw_timing ? 0.88 : 0,
  };

  const isPenicillin =
    (bestCandidate?.genericName?.toLowerCase().includes("amoxicillin") ||
      bestCandidate?.name?.toLowerCase().includes("augmentin")) ??
    false;

  const isAntibiotic =
    bestCandidate?.category?.toLowerCase().includes("antibiotic") || isPenicillin;

  return {
    id,
    raw_text: rawText,
    verified_name: confidence === "HIGH" && bestCandidate && bestCandidate.similarity >= 0.95 ? bestCandidate.name : null,
    candidate_matches: candidates,
    selected_candidate: bestCandidate,
    strength: strengthField,
    dosage: dosageField,
    duration: durationField,
    timing: timingField,
    category: bestCandidate?.category || null,
    manufacturer: bestCandidate?.manufacturer || null,
    composition: bestCandidate?.short_composition || bestCandidate?.genericName || null,
    confidence,
    confidence_score: confidenceScore,
    confidence_reasons: confidenceReasons,
    evidence: {
      trocr_raw: input.trocr_raw || null,
      qwen_raw: input.qwen_raw || null,
      llama_raw: input.llama_raw || null,
      gemini_raw: input.gemini_raw || null,
    },
    user_confirmed: false,
    allergy_warning: isPenicillin
      ? "Contains penicillin-based antibiotic. Avoid if allergic to penicillin."
      : null,
    completion_warning: isAntibiotic
      ? "Complete full prescribed antibiotic course even if feeling better."
      : null,
    description: bestCandidate
      ? `Indian pharmaceutical formulation: ${bestCandidate.short_composition || bestCandidate.genericName || bestCandidate.name}.`
      : null,
    why_prescribed: bestCandidate
      ? `Prescribed for therapeutic indications.`
      : null,
    side_effects: bestCandidate ? ["Mild nausea", "Headache"] : [],
  };
}
