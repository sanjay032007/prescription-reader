import Fuse from "fuse.js";
import indianMedicinesData from "../../data/indian_medicines.json";
import type { CandidateMatch } from "../types";

export interface IndianMedicineRecord {
  name: string;
  brandName?: string;
  genericName?: string;
  short_composition1?: string;
  category?: string;
  manufacturer?: string;
  standardStrengths?: string[];
}

let fuseInstance: Fuse<IndianMedicineRecord> | null = null;

export function getMedicineDatabase(): IndianMedicineRecord[] {
  return indianMedicinesData as IndianMedicineRecord[];
}

export function getCandidateFuse(): Fuse<IndianMedicineRecord> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(getMedicineDatabase(), {
      keys: [
        { name: "brandName", weight: 0.55 },
        { name: "name", weight: 0.3 },
        { name: "short_composition1", weight: 0.1 },
        { name: "genericName", weight: 0.05 },
      ],
      threshold: 0.45,
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }
  return fuseInstance;
}

/**
 * Clean text for fuzzy searching (strip Tab., Cap., Syp., numbers, dosage noise)
 */
export function cleanForSearch(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/(Tab\.|Cap\.|Syp\.|Inj\.|Tablet|Capsule|Syrup|Injection|Ointment|Gel|Drops)/gi, "")
    .replace(/[\(\)\[\]\{\}\-\_\:\;\,\.\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate Top-K Candidate matches from Indian Medicine Database.
 * NOTE: The database NEVER automatically overrides raw text.
 */
export function generateCandidateMatches(rawText: string, topK = 3): CandidateMatch[] {
  if (!rawText || rawText.trim().length < 2) return [];

  const cleaned = cleanForSearch(rawText);
  const fuse = getCandidateFuse();
  const results = fuse.search(cleaned || rawText);

  if (!results || results.length === 0) return [];

  return results.slice(0, topK).map((res) => {
    const item = res.item;
    const fuseScore = res.score ?? 0.5;
    const similarity = Math.max(0.01, Math.min(1.0, parseFloat((1 - fuseScore).toFixed(2))));

    return {
      name: item.brandName || item.name,
      genericName: item.genericName || null,
      short_composition: item.short_composition1 || null,
      category: item.category || null,
      manufacturer: item.manufacturer || null,
      similarity,
    };
  });
}
