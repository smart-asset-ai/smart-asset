// lib/matchScore.ts
// Calculate match score between contractor and property/search

export type MatchLevel = "perfect" | "good" | "partial" | "none";

export interface MatchResult {
  level: MatchLevel;
  label: string;
  color: string;
  bg: string;
  border: string;
  score: number; // 0-100
}

const MATCH_CONFIG: Record<MatchLevel, Omit<MatchResult, "level" | "score">> = {
  perfect: { label: "◎ 最適", color: "#166534", bg: "#dcfce7", border: "#bbf7d0" },
  good:    { label: "○ 対応可", color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe" },
  partial: { label: "△ 一部対応", color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  none:    { label: "— 対応外", color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
};

/**
 * Calculate how well a contractor matches the required work.
 * @param mainWorkType Contractor's primary specialty
 * @param subWorkTypes Contractor's secondary skills
 * @param requiredWork Work type needed by the property/owner
 */
export function calcMatchScore(
  mainWorkType: string | null | undefined,
  subWorkTypes: string[] | null | undefined,
  requiredWork: string | null | undefined
): MatchResult {
  if (!requiredWork) {
    return { level: "none", score: 0, ...MATCH_CONFIG.none };
  }

  const req = normalize(requiredWork);
  const main = normalize(mainWorkType || "");
  const subs = (subWorkTypes || []).map(normalize);

  // Perfect: main work type matches
  if (main && (main === req || main.includes(req) || req.includes(main))) {
    return { level: "perfect", score: 100, ...MATCH_CONFIG.perfect };
  }
  // Good: sub work type matches
  if (subs.some(s => s === req || s.includes(req) || req.includes(s))) {
    return { level: "good", score: 70, ...MATCH_CONFIG.good };
  }
  // Partial: related category matches
  if (isRelated(main, req) || subs.some(s => isRelated(s, req))) {
    return { level: "partial", score: 40, ...MATCH_CONFIG.partial };
  }

  return { level: "none", score: 0, ...MATCH_CONFIG.none };
}

function normalize(s: string): string {
  return s.replace(/[\s・、。]/g, "").toLowerCase();
}

// Related work categories
const RELATED_GROUPS = [
  ["外壁塗装", "外壁", "塗装", "鉄部塗装", "シーリング"],
  ["屋根修繕", "屋根", "屋根葺き替え", "雨漏り"],
  ["防水工事", "防水", "屋上防水", "バルコニー防水"],
  ["タイル補修", "タイル", "タイル貼り"],
  ["給排水工事", "給排水", "配管", "排水"],
  ["電気設備工事", "電気", "電気工事"],
  ["内装リフォーム", "内装", "クロス", "床"],
  ["大規模修繕", "大規模", "修繕"],
  ["耐震補強工事", "耐震", "耐震補強"],
  ["外構", "エクステリア", "駐車場"],
];

function isRelated(a: string, b: string): boolean {
  for (const group of RELATED_GROUPS) {
    const normGroup = group.map(normalize);
    if (normGroup.some(g => a.includes(g)) && normGroup.some(g => b.includes(g))) {
      return true;
    }
  }
  return false;
}
