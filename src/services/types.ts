export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface CandidateMatch {
  name: string;
  genericName: string | null;
  short_composition: string | null;
  category: string | null;
  manufacturer: string | null;
  similarity: number; // 0.0 to 1.0 (e.g. 0.94 for 94%)
}

export interface ExtractedField<T = string> {
  raw_text: string | null;
  value?: T | null;
  confidence: number;
  warning?: string;
}

export interface VerifiedMedicine {
  id: string;
  raw_text: string;
  verified_name: string | null;
  candidate_matches: CandidateMatch[];
  selected_candidate: CandidateMatch | null;
  strength: ExtractedField;
  dosage: ExtractedField;
  duration: ExtractedField;
  timing: ExtractedField;
  category: string | null;
  manufacturer: string | null;
  composition: string | null;
  confidence: ConfidenceLevel;
  confidence_score: number;
  confidence_reasons: string[];
  evidence: {
    trocr_raw?: string | null;
    qwen_raw?: string | null;
    llama_raw?: string | null;
    gemini_raw?: string | null;
  };
  user_confirmed: boolean;
  allergy_warning: string | null;
  completion_warning: string | null;
  description: string | null;
  why_prescribed: string | null;
  side_effects: string[];
}

export interface RawOcrResult {
  provider: string;
  model: string;
  raw_text: string;
  lines: string[];
  success: boolean;
  error?: string;
}

export interface RawMedicineExtraction {
  raw_name: string;
  raw_strength?: string | null;
  raw_dosage?: string | null;
  raw_duration?: string | null;
  raw_timing?: string | null;
  raw_instructions?: string | null;
  confidence_hint?: number;
}

export interface VisionModelResult {
  provider: string;
  model: string;
  success: boolean;
  is_readable: boolean;
  unreadable_reason?: string | null;
  extractions: RawMedicineExtraction[];
  clinical_notes?: string | null;
  diagnosis?: string | null;
  error?: string;
}

export interface PipelineVerificationResult {
  image_readable: boolean;
  unreadable_reason?: string | null;
  medicines: VerifiedMedicine[];
  general_warnings: string[];
  symptom_analysis?: {
    symptoms_provided: string | null;
    is_match: boolean;
    match_status: "matched" | "partial_match" | "mismatch" | "none_provided";
    explanation: string | null;
    possible_reasons: string[];
  };
  model_audit_log: {
    trocr: RawOcrResult | null;
    qwen: VisionModelResult | null;
    llama: VisionModelResult | null;
    gemini: VisionModelResult | null;
  };
  verification_partial: boolean;
  total_processing_time_ms: number;
}
