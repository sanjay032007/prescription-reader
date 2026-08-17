import Fuse from "fuse.js";
import indianMedicinesData from "@/data/indian_medicines.json";
import dosageRulesData from "@/data/dosage_rules.json";
import abbreviationsData from "@/data/abbreviations.json";

export interface IndianMedicineRecord {
  name: string;
  brandName: string;
  genericName: string;
  short_composition1: string;
  category: string;
  manufacturer?: string;
  standardStrengths?: string[];
}

export interface VerificationResult {
  matchedRecord: IndianMedicineRecord | null;
  similarityScore: number; // 0 (exact) to 1 (poor)
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
  suggestedBrandName?: string;
  suggestedGenericName?: string;
  rawDetectedName: string;
  standardizedPrefix: string;
  isDosageValid: boolean;
  dosageWarning?: string;
  standardizedFrequency?: string;
  standardizedDuration?: string;
}

// In-memory singleton Fuse instance loaded once at startup
let fuseInstance: Fuse<IndianMedicineRecord> | null = null;

function getFuse(): Fuse<IndianMedicineRecord> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(indianMedicinesData as IndianMedicineRecord[], {
      keys: [
        { name: "brandName", weight: 0.5 },
        { name: "name", weight: 0.3 },
        { name: "short_composition1", weight: 0.15 },
        { name: "genericName", weight: 0.05 },
      ],
      threshold: 0.38, // Catches Indian brand handwriting variants
      distance: 100,
      minMatchCharLength: 3,
      includeScore: true,
    });
  }
  return fuseInstance;
}

/**
 * Clean medicine string for comparison (removes Tab, Cap, mg, extra spaces).
 */
export function cleanMedicineString(str: string): string {
  if (!str) return "";
  return str
    .replace(/(Tab\.|Cap\.|Syp\.|Inj\.|Tablet|Capsule|Syrup|Injection|Ointment|Gel|Drops)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Determine the standard pharmaceutical prefix (Tab., Cap., Syp., Inj.)
 */
export function extractStandardPrefix(rawName: string, category?: string): string {
  const lower = rawName.toLowerCase();
  if (lower.includes("cap") || lower.includes("capsule")) return "Cap.";
  if (lower.includes("syp") || lower.includes("syrup") || lower.includes("suspension") || lower.includes("liquid")) return "Syp.";
  if (lower.includes("inj") || lower.includes("injection")) return "Inj.";
  if (lower.includes("oint") || lower.includes("ointment") || lower.includes("gel")) return "Oint.";
  if (lower.includes("drop") || lower.includes("drops")) return "Drops";
  return "Tab."; // Default standard solid oral dosage in India
}

/**
 * Validate dosage pattern against Indian prescription norms (X-X-X format).
 */
export function validateDosagePattern(frequency: string): { isValid: boolean; warning?: string; normalized: string } {
  if (!frequency || frequency.trim() === "" || frequency.toLowerCase().includes("unclear")) {
    return { isValid: false, normalized: "" };
  }

  const trimmed = frequency.trim();
  const lower = trimmed.toLowerCase();

  // Check abbreviation mappings (OD, BD, TDS, QID, SOS, HS)
  const abbr = abbreviationsData.frequencies as Record<string, string>;
  for (const [key, desc] of Object.entries(abbr)) {
    if (lower === key || lower.startsWith(key + " ") || lower.endsWith(" " + key)) {
      return { isValid: true, normalized: trimmed };
    }
  }

  // Regex matching Indian digit patterns like 1-0-1, 1-1-1, 0-0-1, 1-0-0
  const patternMatch = trimmed.match(/^(\d(?:\/\d)?)\s*[-—–]\s*(\d(?:\/\d)?)\s*[-—–]\s*(\d(?:\/\d)?)(?:\s*[-—–]\s*(\d))?$/);

  if (patternMatch) {
    const [, m, a, n, q] = patternMatch;
    const numM = parseFloat(m) || 0;
    const numA = parseFloat(a) || 0;
    const numN = parseFloat(n) || 0;
    const numQ = q ? parseFloat(q) : 0;

    // Standard single unit doses (0, 0.5, 1)
    if (numM <= 2 && numA <= 2 && numN <= 2 && numQ <= 1) {
      if (numM > 1 || numA > 1 || numN > 1) {
        return {
          isValid: true,
          warning: "High unit dose detected (>1 tablet per session). Please verify with physician.",
          normalized: trimmed,
        };
      }
      return { isValid: true, normalized: trimmed };
    } else {
      return {
        isValid: false,
        warning: `Unusual dosage pattern (${trimmed}) flagged. Standard Indian pattern is 1-0-1, 1-1-1, or 0-0-1.`,
        normalized: trimmed,
      };
    }
  }

  return { isValid: true, normalized: trimmed };
}

/**
 * Validate strength against known Indian pharmaceutical strengths.
 */
export function validateMedicineStrength(
  brandOrGeneric: string,
  detectedStrength?: string
): { isValid: boolean; warning?: string; recommendedStrength?: string } {
  if (!detectedStrength) return { isValid: true };

  const genericRules = dosageRulesData.genericStrengths as Record<string, string[]>;
  const lower = brandOrGeneric.toLowerCase();

  for (const [generic, strengths] of Object.entries(genericRules)) {
    if (lower.includes(generic)) {
      const cleanDetect = detectedStrength.toLowerCase().replace(/\s+/g, "");
      const match = strengths.some((s) => s.toLowerCase().replace(/\s+/g, "") === cleanDetect);
      if (!match) {
        return {
          isValid: false,
          warning: `Detected strength (${detectedStrength}) is unusual for ${generic}. Common Indian strengths: ${strengths.join(", ")}.`,
          recommendedStrength: strengths[0],
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Execute Layer 2 (Fuzzy Match) and Layer 3 (Dosage Rules) on an extracted medicine.
 */
export function verifyIndianMedicine(
  pass1Name: string,
  pass2Name?: string,
  frequency = "",
  timing = "",
  duration = ""
): VerificationResult {
  const fuse = getFuse();
  const rawDetectedName = pass1Name.trim();
  const cleaned1 = cleanMedicineString(pass1Name);
  const cleaned2 = pass2Name ? cleanMedicineString(pass2Name) : cleaned1;

  // Run Fuse.js fuzzy search against Indian database
  const searchResults1 = fuse.search(cleaned1);
  const searchResults2 = pass2Name && pass2Name !== pass1Name ? fuse.search(cleaned2) : [];

  let bestMatch: IndianMedicineRecord | null = null;
  let bestScore = 1.0; // 0 = exact, 1 = no match

  if (searchResults1.length > 0) {
    bestMatch = searchResults1[0].item;
    bestScore = searchResults1[0].score ?? 0.5;
  }

  if (searchResults2.length > 0 && (searchResults2[0].score ?? 1.0) < bestScore) {
    bestMatch = searchResults2[0].item;
    bestScore = searchResults2[0].score ?? 0.5;
  }

  const standardPrefix = extractStandardPrefix(rawDetectedName);
  const dosageVal = validateDosagePattern(frequency);

  // Compare Pass 1 and Pass 2 agreement
  const passesAgree = pass2Name ? cleaned1.toLowerCase() === cleaned2.toLowerCase() : true;

  let confidence: "high" | "medium" | "low" = "medium";
  let confidenceReason = "";
  let suggestedBrandName: string | undefined = undefined;
  let suggestedGenericName: string | undefined = undefined;

  // HIGH CONFIDENCE:
  // - Passes agree AND Fuse.js found an exact/strong match (score <= 0.22)
  if (passesAgree && bestScore <= 0.22 && bestMatch) {
    confidence = "high";
    confidenceReason = "Verified against Indian pharmacopeia database and dual vision passes.";
    suggestedBrandName = bestMatch.brandName;
    suggestedGenericName = bestMatch.genericName;
  }
  // MEDIUM CONFIDENCE:
  // - Good fuzzy match (score between 0.23 and 0.38) OR minor disagreement resolved by database
  else if (bestScore <= 0.38 && bestMatch) {
    confidence = "medium";
    const similarityPct = Math.round((1 - bestScore) * 100);
    confidenceReason = `Matched to Indian database with ${similarityPct}% similarity.`;
    suggestedBrandName = bestMatch.brandName;
    suggestedGenericName = bestMatch.genericName;
  }
  // LOW CONFIDENCE:
  // - No confident database match, or handwriting is unclear
  else {
    confidence = "low";
    confidenceReason = "Handwriting is unclear or medicine was not confidently matched in the Indian medicine registry.";
    if (bestMatch && bestScore < 0.55) {
      suggestedBrandName = bestMatch.brandName;
      suggestedGenericName = bestMatch.genericName;
    }
  }

  return {
    matchedRecord: bestMatch,
    similarityScore: bestScore,
    confidence,
    confidenceReason,
    suggestedBrandName,
    suggestedGenericName,
    rawDetectedName,
    standardizedPrefix,
    isDosageValid: dosageVal.isValid,
    dosageWarning: dosageVal.warning,
    standardizedFrequency: dosageVal.normalized || frequency,
    standardizedDuration: duration,
  };
}
