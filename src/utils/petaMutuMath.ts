/**
 * Logic for ARP (Aplikasi Rekomendasi & Peta Mutu Pendidikan)
 * Calculates SNP indices, Rapor Mutu categorizations, root cause pathways,
 * and ARKAS budget summaries.
 */

export interface SnpStandardScore {
  id: string;
  name: string;
  shortCode: string;
  score: number; // 0 - 100
  target: number; // 0 - 100
  previousYearScore: number;
  weight: number;
  category: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
}

export interface RegionalPathInfo {
  provinsiCode: string;
  kabupatenCode: string;
  kecamatanCode: string;
  npsn: string;
}

/**
 * Parses hierarchical URL path e.g. /simantap/050000/056800/056802/20536900
 * or 050000/056800/056802/20536900
 */
export function parseRegionalPath(path: string): RegionalPathInfo | null {
  const cleanPath = path.replace(/^\/simantap\/?/, '').replace(/^\//, '');
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length >= 4) {
    return {
      provinsiCode: segments[0],
      kabupatenCode: segments[1],
      kecamatanCode: segments[2],
      npsn: segments[3],
    };
  }
  return null;
}

/**
 * Formats regional path into canonical SIMANTAP URL
 */
export function formatRegionalPath(info: RegionalPathInfo): string {
  return `/simantap/${info.provinsiCode}/${info.kabupatenCode}/${info.kecamatanCode}/${info.npsn}`;
}

/**
 * Categorizes a score (0 - 100) into SNP status
 */
export function getScoreCategory(score: number): 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' {
  if (score >= 85) return 'Sangat Baik';
  if (score >= 70) return 'Baik';
  if (score >= 55) return 'Cukup';
  return 'Kurang';
}

/**
 * Converts 0-100 score to Kemendikbud 7-point scale (SNP Bintang 1-7)
 */
export function convertTo7Scale(score: number): number {
  const scaled = (score / 100) * 7;
  return Math.round(scaled * 100) / 100;
}

/**
 * Calculates weighted average of 8 SNP standards
 */
export function calculateOverallSnpScore(standards: { score: number; weight?: number }[]): {
  averageScore: number;
  scaled7: number;
  category: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
} {
  if (standards.length === 0) {
    return { averageScore: 0, scaled7: 0, category: 'Kurang' };
  }
  const totalWeight = standards.reduce((acc, curr) => acc + (curr.weight ?? 1), 0);
  const weightedSum = standards.reduce((acc, curr) => acc + curr.score * (curr.weight ?? 1), 0);
  const averageScore = Math.round((weightedSum / totalWeight) * 10) / 10;
  const scaled7 = convertTo7Scale(averageScore);

  return {
    averageScore,
    scaled7,
    category: getScoreCategory(averageScore),
  };
}

/**
 * Identifies the lowest standards requiring priority intervention (root cause candidates)
 */
export function identifyPriorityGaps(standards: SnpStandardScore[], limit: number = 3): SnpStandardScore[] {
  return [...standards]
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

/**
 * Calculates sum and distribution of ARKAS programs
 */
export interface ArkasProgramItem {
  id: string;
  code: string;
  name: string;
  snpStandardId: string;
  estimatedBudget: number;
  isNonCost: boolean;
  status: 'draft' | 'approved' | 'in_arkas';
}

export function calculateArkasSummary(programs: ArkasProgramItem[]): {
  totalBudget: number;
  approvedBudget: number;
  totalPrograms: number;
  nonCostCount: number;
} {
  let totalBudget = 0;
  let approvedBudget = 0;
  let nonCostCount = 0;

  for (const prog of programs) {
    totalBudget += prog.estimatedBudget;
    if (prog.status === 'approved' || prog.status === 'in_arkas') {
      approvedBudget += prog.estimatedBudget;
    }
    if (prog.isNonCost) {
      nonCostCount += 1;
    }
  }

  return {
    totalBudget,
    approvedBudget,
    totalPrograms: programs.length,
    nonCostCount,
  };
}

/**
 * Calculates budget adjustment scenarios according to school's available funds
 */
export interface BudgetAdjustmentParams {
  availableBudgetForMutu: number; // Total budget available for quality improvement
  totalSchoolBosBudget: number; // Overall BOS budget (e.g. 148 * Rp 900.000)
  programs: ArkasProgramItem[];
}

export interface BudgetAdjustmentResult {
  availableBudget: number;
  totalProposed: number;
  allocatedBudget: number;
  remainingBudget: number; // positive = surplus, negative = deficit
  isBalanced: boolean;
  tier1Budget: number; // High priority (Root cause / Numerasi & Sarpras)
  tier2Budget: number; // Medium priority
  tier3Budget: number; // Low priority
  recommendedReductions: { programName: string; code: string; savedAmount: number; recommendation: string }[];
  recommendedSurplusActions: string[];
}

export function calculateSchoolBudgetAdjustment(params: BudgetAdjustmentParams): BudgetAdjustmentResult {
  const { availableBudgetForMutu, programs } = params;

  let totalProposed = 0;
  let tier1Budget = 0;
  let tier2Budget = 0;
  let tier3Budget = 0;

  for (const p of programs) {
    if (p.isNonCost) continue;
    totalProposed += p.estimatedBudget;

    // Categorize by priority code / standard target
    if (p.code.startsWith('02.04') || p.code.startsWith('03.01') || p.snpStandardId.toLowerCase().includes('sarpras')) {
      tier1Budget += p.estimatedBudget;
    } else if (p.code.startsWith('03.04') || p.code.startsWith('04.02') || p.snpStandardId.toLowerCase().includes('proses')) {
      tier2Budget += p.estimatedBudget;
    } else {
      tier3Budget += p.estimatedBudget;
    }
  }

  const remainingBudget = availableBudgetForMutu - totalProposed;
  const isBalanced = remainingBudget >= 0;

  const recommendedReductions: { programName: string; code: string; savedAmount: number; recommendation: string }[] = [];
  const recommendedSurplusActions: string[] = [];

  if (!isBalanced) {
    // If deficit, recommend adjusting tier 3 and converting tier 2 activities into Non-Cost Kombel
    for (const p of programs) {
      if (p.isNonCost) continue;
      if (p.code.startsWith('05.01')) {
        recommendedReductions.push({
          programName: p.name,
          code: p.code,
          savedAmount: p.estimatedBudget * 0.5,
          recommendation: 'Sesuaikan volume pengadaan atau gunakan sisa bahan pemeliharaan triwulan sebelumnya.',
        });
      } else if (p.code.startsWith('04.02')) {
        recommendedReductions.push({
          programName: p.name,
          code: p.code,
          savedAmount: p.estimatedBudget * 0.4,
          recommendation: 'Optimalkan instrumen digital Google Form / PMM mandiri guru untuk menekan biaya cetak.',
        });
      }
    }
  } else {
    recommendedSurplusActions.push(
      'Alokasikan sisa pagu untuk pengadaan buku cerita bermutu Ramah Anak (prioritas pojok baca kelas 1-3).',
      'Tambahkan alokasi langganan media interaktif edukasi numerasi atau alat peraga kit sains kontekstual.',
      'Sediakan insentif transport bimbingan teknis guru penggerak dalam komunitas belajar antar sekolah di Bumiaji.'
    );
  }

  return {
    availableBudget: availableBudgetForMutu,
    totalProposed,
    allocatedBudget: isBalanced ? totalProposed : availableBudgetForMutu,
    remainingBudget,
    isBalanced,
    tier1Budget,
    tier2Budget,
    tier3Budget,
    recommendedReductions,
    recommendedSurplusActions,
  };
}

/**
 * Validates uploaded Rapor Pendidikan data integrity
 */
export function validateRaporUpload(
  uploadedNpsn: string,
  targetNpsn: string,
  indicatorsCount: number
): { isValid: boolean; error?: string } {
  if (uploadedNpsn !== targetNpsn) {
    return {
      isValid: false,
      error: `NPSN berkas (${uploadedNpsn}) tidak sesuai dengan sekolah aktif (${targetNpsn}).`,
    };
  }
  if (indicatorsCount < 5) {
    return {
      isValid: false,
      error: 'Berkas Rapor Pendidikan tidak lengkap atau kurang dari 5 indikator prioritas SPM.',
    };
  }
  return { isValid: true };
}

