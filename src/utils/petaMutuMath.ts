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

    // Categorize by priority code / standard target (supports ARKAS 4 Kemendikdasmen & legacy codes)
    if (
      p.code.startsWith('04.06') ||
      p.code.startsWith('03.03') ||
      p.code.startsWith('02.04') ||
      p.code.startsWith('03.01') ||
      p.snpStandardId.toLowerCase().includes('sarpras')
    ) {
      tier1Budget += p.estimatedBudget;
    } else if (
      p.code.startsWith('02.02') ||
      p.code.startsWith('08.04') ||
      p.code.startsWith('03.04') ||
      p.code.startsWith('04.02') ||
      p.snpStandardId.toLowerCase().includes('proses')
    ) {
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
      if (p.code.startsWith('05.05') || p.code.startsWith('05.01')) {
        recommendedReductions.push({
          programName: p.name,
          code: p.code,
          savedAmount: p.estimatedBudget * 0.5,
          recommendation: 'Sesuaikan volume pengadaan atau gunakan sisa bahan pemeliharaan triwulan sebelumnya.',
        });
      } else if (p.code.startsWith('08.04') || p.code.startsWith('04.02')) {
        recommendedReductions.push({
          programName: p.name,
          code: p.code,
          savedAmount: p.estimatedBudget * 0.4,
          recommendation: 'Optimalkan instrumen digital Google Form / Ruang GTK mandiri guru untuk menekan biaya cetak.',
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
 * Validates uploaded Rapor Pendidikan data integrity as single source of truth
 */
export function validateRaporUpload(
  uploadedNpsn: string,
  indicatorsCount: number
): { isValid: boolean; error?: string } {
  const cleanNpsn = uploadedNpsn.trim();
  if (!/^\d{8}$/.test(cleanNpsn)) {
    return {
      isValid: false,
      error: `NPSN pada berkas ("${uploadedNpsn || '-'}") harus berupa 8 digit angka yang valid.`,
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

export interface ExtractedRaporSchoolInfo {
  npsn?: string;
  name?: string;
  level?: string;
  status?: 'Negeri' | 'Swasta';
  address?: string;
  district?: string;
  city?: string;
  province?: string;
}

export interface ExtractedRaporIndicatorRow {
  code: string;
  name?: string;
  score: number;
  delta?: string;
}

const KNOWN_RAPOR_CODES = ['A.1', 'A.2', 'A.3', 'D.1', 'D.4', 'D.8', 'D.10', 'E.2'];

/**
 * Extracts school metadata and Rapor Pendidikan indicator scores from parsed tabular sheet rows.
 */
export function parseRaporSheetRows(
  rows: unknown[][],
  filename: string = ''
): {
  schoolInfo: ExtractedRaporSchoolInfo;
  indicators: ExtractedRaporIndicatorRow[];
} {
  const schoolInfo: ExtractedRaporSchoolInfo = {};
  const indicatorMap = new Map<string, ExtractedRaporIndicatorRow>();

  // 1. Try filename hints for 8-digit NPSN
  const npsnFilenameMatch = filename.match(/\b(\d{8})\b/);
  if (npsnFilenameMatch) {
    schoolInfo.npsn = npsnFilenameMatch[1];
  }

  for (const row of rows) {
    if (!Array.isArray(row) || row.length === 0) continue;
    const cells = row.map((c) => (c === null || c === undefined ? '' : String(c).trim()));
    const joined = cells.join(' ');

    // Check school metadata pairs in rows
    for (let i = 0; i < cells.length; i++) {
      const cellLower = cells[i].toLowerCase();
      const nextVal = cells[i + 1] || '';

      if (!schoolInfo.npsn && (cellLower === 'npsn' || cellLower.startsWith('npsn:'))) {
        const inlineMatch = cells[i].match(/\b(\d{8})\b/) || nextVal.match(/\b(\d{8})\b/);
        if (inlineMatch) schoolInfo.npsn = inlineMatch[1];
      }

      if (
        !schoolInfo.name &&
        (cellLower === 'nama sekolah' ||
          cellLower === 'nama satuan pendidikan' ||
          cellLower === 'satuan pendidikan' ||
          cellLower === 'sekolah') &&
        nextVal
      ) {
        schoolInfo.name = nextVal.toUpperCase();
      }

      if (!schoolInfo.level && (cellLower === 'jenjang' || cellLower === 'bentuk pendidikan') && nextVal) {
        schoolInfo.level = nextVal.toUpperCase();
      }

      if (!schoolInfo.status && cellLower === 'status' && nextVal) {
        if (/swasta/i.test(nextVal)) schoolInfo.status = 'Swasta';
        else if (/negeri/i.test(nextVal)) schoolInfo.status = 'Negeri';
      }

      if (!schoolInfo.district && (cellLower === 'kecamatan' || cellLower === 'kec.') && nextVal) {
        schoolInfo.district = nextVal;
      }

      if (
        !schoolInfo.city &&
        (cellLower === 'kabupaten/kota' || cellLower === 'kab/kota' || cellLower === 'kota' || cellLower === 'kabupaten') &&
        nextVal
      ) {
        schoolInfo.city = nextVal;
      }

      if (!schoolInfo.province && cellLower === 'provinsi' && nextVal) {
        schoolInfo.province = nextVal;
      }

      if (!schoolInfo.address && cellLower === 'alamat' && nextVal) {
        schoolInfo.address = nextVal;
      }
    }

    // Also detect any standalone 8-digit NPSN if label wasn't exact
    if (!schoolInfo.npsn) {
      const npsnMatch = joined.match(/NPSN\s*[:\-]?\s*(\d{8})/i);
      if (npsnMatch) schoolInfo.npsn = npsnMatch[1];
    }

    // Check indicator codes (A.1, A.2, A.3, D.1, D.4, D.8, D.10, E.2)
    for (let i = 0; i < cells.length; i++) {
      const codeMatch = cells[i].match(/\b(A\.1|A\.2|A\.3|D\.1|D\.4|D\.8|D\.10|E\.2)\b/i);
      if (codeMatch) {
        const code = codeMatch[1].toUpperCase();
        // Look for a numeric score (0-100) in subsequent cells
        let foundScore: number | null = null;
        let foundName: string | undefined;
        let foundDelta: string | undefined;

        for (let j = i + 1; j < cells.length; j++) {
          const val = cells[j];
          if (!val) continue;
          const normalizedNum = Number(val.replace(',', '.').replace('%', ''));
          if (!Number.isNaN(normalizedNum) && normalizedNum >= 0 && normalizedNum <= 100 && foundScore === null) {
            foundScore = Math.round(normalizedNum * 10) / 10;
          } else if (/^[+-]\d+(\.\d+)?$/.test(val.replace(',', '.')) && !foundDelta) {
            foundDelta = val.replace(',', '.');
          } else if (!foundName && val.length > 4 && Number.isNaN(Number(val))) {
            foundName = val;
          }
        }

        if (foundScore !== null && !indicatorMap.has(code)) {
          indicatorMap.set(code, {
            code,
            name: foundName,
            score: foundScore,
            delta: foundDelta,
          });
        }
      }
    }
  }

  // Sort indicators cleanly in canonical order
  const indicators = Array.from(indicatorMap.values()).sort((a, b) => {
    const idxA = KNOWN_RAPOR_CODES.indexOf(a.code);
    const idxB = KNOWN_RAPOR_CODES.indexOf(b.code);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  return { schoolInfo, indicators };
}

/**
 * Synchronizes 8 SNP scores dynamically based on uploaded Rapor Pendidikan indicator values.
 */
export function syncSnpScoresFromRapor<
  T extends {
    code: string;
    score: number;
    scale7: number;
    score2026: number;
    category: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  }
>(standards: T[], raporIndicators: MinimalRaporIndicator[]): T[] {
  const getScore = (code: string, fallback: number) => {
    const found = raporIndicators.find((r) => r.code.toUpperCase() === code);
    return found ? found.score : fallback;
  };

  const a1 = getScore('A.1', 78.4);
  const a2 = getScore('A.2', 62.1);
  const a3 = getScore('A.3', 81.2);
  const d1 = getScore('D.1', 72.8);
  const d4 = getScore('D.4', 88.5);
  const d8 = getScore('D.8', 84.0);
  const d10 = getScore('D.10', 66.5);

  const round1 = (val: number) => Math.round(Math.min(100, Math.max(0, val)) * 10) / 10;

  return standards.map((std) => {
    let nextScore = std.score;
    switch (std.code) {
      case 'SKL':
        nextScore = round1((a1 + a2 + a3) / 3);
        break;
      case 'ISI':
        nextScore = round1(a1 * 0.45 + d1 * 0.35 + a3 * 0.2);
        break;
      case 'PROSES':
        nextScore = round1(d1 * 0.65 + a2 * 0.35);
        break;
      case 'PENILAIAN':
        nextScore = round1(d1 * 0.5 + a1 * 0.25 + a2 * 0.25);
        break;
      case 'PTK':
        nextScore = round1(d1 * 0.6 + d10 * 0.4);
        break;
      case 'PENGELOLAAN':
        nextScore = round1((d4 + d8 + d10) / 3);
        break;
      default:
        break;
    }

    return {
      ...std,
      score: nextScore,
      score2026: nextScore,
      scale7: convertTo7Scale(nextScore),
      category: getScoreCategory(nextScore),
    };
  });
}

export interface RktActionItem {
  id: string;
  raporCode: string;
  raporName: string;
  currentScore: number;
  category: 'Baik' | 'Sedang' | 'Kurang';
  priorityLevel: 'Prioritas Utama (P1)' | 'Prioritas Lanjutan (P2)' | 'Pemeliharaan Mutu (P3)';
  rootCause: string;
  programName: string;
  activityName: string;
  arkasCode: string;
  targetIndicator: string;
  estimatedBudget: number;
  fundingSource: 'BOS Reguler' | 'BOS Kinerja' | 'Non-Biaya' | 'APBD';
  isNonArkas?: boolean;
  quarterTimeline: ('TW1' | 'TW2' | 'TW3' | 'TW4')[];
  personInCharge: string;
  notes?: string;
}

export interface GeneratedRktData {
  title: string;
  academicYear: string;
  generatedAt: string;
  sourceNpsn: string;
  schoolName: string;
  summary: {
    totalPrograms: number;
    totalBudget: number;
    nonCostCount: number;
    p1Count: number;
    p2Count: number;
    priorityIndicators: string[];
  };
  items: RktActionItem[];
}

export interface MinimalRaporIndicator {
  code: string;
  name: string;
  score: number;
  label?: 'Baik' | 'Sedang' | 'Kurang';
}

/**
 * Generates structured RKT (Rencana Kerja Tahunan) based on uploaded/active Rapor Pendidikan indicators.
 * Produces both paid ARKAS activities and unpaid Non-ARKAS (Rp 0) activities conforming to PBD guidelines.
 */
export function generateRktFromRapor(
  indicators: MinimalRaporIndicator[],
  schoolInfo: { npsn: string; name: string },
  academicYear: string = '2026/2027'
): GeneratedRktData {
  const items: RktActionItem[] = [];
  const priorityIndicators: string[] = [];

  type BlueprintEntry = {
    rootCause: string;
    programName: string;
    activityName: string;
    arkasCode: string;
    targetIndicator: string;
    defaultBudget: number;
    defaultSource: 'BOS Reguler' | 'BOS Kinerja' | 'Non-Biaya';
    isNonArkas?: boolean;
    timeline: ('TW1' | 'TW2' | 'TW3' | 'TW4')[];
    pic: string;
  };

  const blueprintMap: Record<string, BlueprintEntry> = {
    'A.1': {
      rootCause: 'Rendahnya minat baca kritis & minim ragam buku non-teks ramah anak di perpustakaan/sudut baca kelas.',
      programName: 'Program Penguatan Gerakan Literasi Sekolah (GLS) & Revitalisasi Perpustakaan',
      activityName: 'Pengembangan Perpustakaan, Revitalisasi Pojok Baca Kelas, dan Pengadaan Buku Bacaan Bermutu Non-Teks',
      arkasCode: '02.02.01',
      targetIndicator: '100% kelas memiliki pojok baca aktif; skor literasi naik minimal +4.5 poin.',
      defaultBudget: 4500000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Koordinator Literasi & Kepala Perpustakaan',
    },
    'A.2': {
      rootCause: 'Guru belum terbiasa menerapkan strategi numerasi kontekstual & minim media manipulatif pemecahan masalah.',
      programName: 'Program Penguatan Kompetensi Pendidik & Kegiatan Pembelajaran Numerasi',
      activityName: 'Peningkatan Kompetensi Guru Numerasi & Pengembangan Media/Kit Peraga Matematika Kontekstual',
      arkasCode: '04.06.05',
      targetIndicator: 'Seluruh guru kelas menerapkan pembelajaran numerasi aktif; skor numerasi mencapai predikat Baik (>=72.0).',
      defaultBudget: 6500000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Waka Kurikulum & Tim Pengembang',
    },
    'A.3': {
      rootCause: 'Penanaman profil Pelajar Pancasila belum terinternalisasi maksimal dalam pembiasaan dan pembelajaran projek.',
      programName: 'Program Penguatan Karakter & Pembelajaran Berbasis Projek (P5)',
      activityName: 'Pengembangan Pembelajaran Berbasis Projek (P5) Kewirausahaan & Budaya Kearifan Lokal Daerah',
      arkasCode: '03.03.04',
      targetIndicator: '100% siswa aktif berpartisipasi dalam projek P5 tiap semester; gotong royong dan kemandirian meningkat.',
      defaultBudget: 3500000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW2', 'TW4'],
      pic: 'Koordinator P5 & Pembina Kesiswaan',
    },
    'D.1': {
      rootCause: 'Perencanaan perangkat ajar terdiferensiasi dan asesmen diagnostik lintas guru belum terstandar merata.',
      programName: 'Peningkatan Kualitas Perencanaan Pembelajaran Aktif & Asesmen Kelas',
      activityName: 'Workshop Penyusunan Perangkat Ajar Berdiferensiasi & Asesmen Formatif melalui Forum KKG/Kombel',
      arkasCode: '02.06.01',
      targetIndicator: '100% guru menyusun modul ajar berdiferensiasi dan melaksanakan asesmen awal diagnostik per semester.',
      defaultBudget: 1800000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW1', 'TW3'],
      pic: 'Waka Kurikulum & Ketua Kombel',
    },
    'D.4': {
      rootCause: 'Mekanisme pencegahan dan kanal pelaporan perundungan serta kekerasan belum tersosialisasi menyeluruh.',
      programName: 'Program Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP)',
      activityName: 'Penyelenggaraan Pencegahan Perundungan, Penguatan Kapasitas TPPK, dan Kampanye Sekolah Ramah Anak',
      arkasCode: '03.03.11',
      targetIndicator: 'Nol kasus perundungan; tersedianya kanal pelaporan aman dan SOP penanganan PPKSP aktif.',
      defaultBudget: 1500000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW1', 'TW3'],
      pic: 'Tim Pencegahan & Penanganan Kekerasan (TPPK)',
    },
    'D.8': {
      rootCause: 'Minimnya ruang perjumpaan lintas budaya dan kesadaran toleransi keberagaman sosial di sekolah.',
      programName: 'Program Penguatan Kebinekaan Global & Toleransi Inklusif',
      activityName: 'Penyelenggaraan Projek Kebinekaan: Gelar Budaya Nusantara, Kuliner Tradisional, dan Dialog Inklusif',
      arkasCode: '03.03.04',
      targetIndicator: 'Indeks iklim kebinekaan stabil pada predikat Sangat Baik (>85.0); kesadaran toleransi 100%.',
      defaultBudget: 2000000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW3', 'TW4'],
      pic: 'Guru PPKn & Pembina Kesiswaan',
    },
    'D.10': {
      rootCause: 'Pendidik belum terlatih menyusun modifikasi kurikulum individual serta keterbatasan media taktil bagi ABK.',
      programName: 'Program Peningkatan Layanan Pendidikan Inklusif & Ramah Disabilitas',
      activityName: 'Pengadaan Media Pembelajaran Adaptif Inklusif & Pengayaan TIK Layanan Disabilitas',
      arkasCode: '03.03.18',
      targetIndicator: 'Tersusunnya rencana pembelajaran individual (PPI) & tersedianya sarana belajar ramah disabilitas.',
      defaultBudget: 2500000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW2', 'TW3'],
      pic: 'Guru Pendamping Khusus & Waka Kesiswaan',
    },
    'E.2': {
      rootCause: 'Proporsi pembelanjaan BOSP untuk peningkatan mutu guru dan tenaga kependidikan perlu dioptimalkan.',
      programName: 'Kemampuan kepala sekolah dalam mengembangkan dan mengelola anggaran sekolah untuk peningkatan kompetensi PTK',
      activityName: 'Pengembangan Profesi Pendidik dan Tenaga Kependidikan Berbasis Kebutuhan Mutu Rapor Pendidikan',
      arkasCode: '04.06.05',
      targetIndicator: 'Minimal 10% porsi anggaran pembenahan diarahkan ke peningkatan kompetensi guru & tendik.',
      defaultBudget: 3000000,
      defaultSource: 'BOS Reguler',
      isNonArkas: false,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Kepala Sekolah & Bendahara BOS',
    },
  };

  // Kegiatan Tidak Berbayar (Non-ARKAS / Rp 0) pendamping setahun penuh (TW1-TW4) per indikator Rapor Pendidikan
  const nonArkasBlueprintMap: Record<string, BlueprintEntry> = {
    'A.1': {
      rootCause: 'Kebiasaan membaca harian sebelum pembelajaran belum terjadwal konsisten di seluruh kelas.',
      programName: 'Pembiasaan Literasi Sekolah Tanpa Biaya (Non-ARKAS)',
      activityName: 'Gerakan Membaca Senyap 15 Menit Sebelum Jam Pelajaran, Kunjungan Wajib Perpustakaan & Resensi Lisan Siswa',
      arkasCode: 'NON-ARKAS',
      targetIndicator: '100% rombel melaksanakan pembiasaan baca 15 menit setiap pagi sepanjang tahun tanpa beban anggaran.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Wali Kelas & Tim Literasi Sekolah',
    },
    'A.2': {
      rootCause: 'Guru membutuhkan pendampingan sejawat berkelanjutan dalam merancang soal pemecahan masalah numerasi.',
      programName: 'Pendampingan Sejawat & Belajar Mandiri Ruang GTK Numerasi (Non-ARKAS)',
      activityName: 'Peer-Coaching Guru & Bedah Topik Numerasi Kontekstual pada Pertemuan Kombel Dwi-Mingguan',
      arkasCode: 'NON-ARKAS',
      targetIndicator: 'Minimal 16 sesi peer-coaching per tahun ajaran (TW1–TW4) terlaksana secara swadaya dengan Rp 0.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Ketua Kombel & Guru Penggerak',
    },
    'A.3': {
      rootCause: 'Penguatan karakter gotong royong dan disiplin positif perlu pembiasaan harian yang konsisten.',
      programName: 'Pembiasaan Budaya Positif & Karakter Pelajar Pancasila (Non-ARKAS)',
      activityName: 'Program Jumat Bersih Gotong Royong, Piket Kepemimpinan Siswa, Ibadah Bersama & Apresiasi Perilaku Baik',
      arkasCode: 'NON-ARKAS',
      targetIndicator: 'Terlaksananya pembiasaan budaya positif mingguan sepanjang TW1–TW4 dengan partisipasi 100% siswa.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Pembina Kesiswaan & Wali Kelas',
    },
    'D.1': {
      rootCause: 'Refleksi pembelajaran dan supervisi klinis antar rekan sejawat perlu dijadwalkan rutin sepanjang tahun.',
      programName: 'Optimalisasi Komunitas Belajar (Kombel) Guru Intra-Satuan Pendidikan (Non-ARKAS)',
      activityName: 'Diseminasi Berbagi Praktik Baik Pembelajaran Berdiferensiasi, Observasi Kelas Sejawat & Supervisi Klinis',
      arkasCode: 'NON-ARKAS',
      targetIndicator: 'Pertemuan Kombel rutin dwi-mingguan (TW1–TW4) tanpa biaya; 100% guru melakukan refleksi praktik mengajar.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Ketua Komunitas Belajar & Kepala Sekolah',
    },
    'D.4': {
      rootCause: 'Pengawasan area rawan perundungan dan edukasi anti-kekerasan perlu keterlibatan rutin warga sekolah.',
      programName: 'Satgas & Edukasi Pencegahan Perundungan Berbasis Pembiasaan (Non-ARKAS)',
      activityName: 'Piket Pemantauan Lingkungan Ramah Anak, Apel Deklarasi Anti-Perundungan & Sesi Konseling Wali Kelas',
      arkasCode: 'NON-ARKAS',
      targetIndicator: 'Jadwal piket TPPK berjalan setiap pekan sepanjang TW1–TW4 dan kesepakatan kelas anti-perundungan aktif.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Satgas TPPK & Guru Piket',
    },
    'D.8': {
      rootCause: 'Sikap saling menghargai keberagaman perlu dipraktikkan terus-menerus dalam keseharian kelas.',
      programName: 'Pembiasaan Dialog Toleransi, Moderasi, dan Kebersamaan Warga Sekolah (Non-ARKAS)',
      activityName: 'Rotasi Kelompok Belajar Lintas Latar Belakang, Pojok Cerita Daerah Nusantara & Apel Kebangsaan Bulanan',
      arkasCode: 'NON-ARKAS',
      targetIndicator: 'Terwujudnya budaya kelas inklusif tanpa diskriminasi sepanjang TW1–TW4 secara mandiri (Rp 0).',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Guru PPKn & Seluruh Wali Kelas',
    },
    'D.10': {
      rootCause: 'Kolaborasi guru kelas, teman sebaya, dan orang tua ABK dapat dioptimalkan tanpa biaya tambahan.',
      programName: 'Pendampingan Teman Sebaya & Forum Konsultasi Orang Tua Inklusif (Non-ARKAS)',
      activityName: 'Penyusunan PPI Kolaboratif Bersama Orang Tua & Program Sahabat Inklusi Antar Peserta Didik',
      arkasCode: 'NON-ARKAS',
      targetIndicator: '100% siswa berkebutuhan khusus memiliki pendamping sebaya dan catatan perkembangan bulanan (TW1–TW4).',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Guru Kelas & Koordinator Inklusi',
    },
    'E.2': {
      rootCause: 'Transparansi dan refleksi pemanfaatan sumber daya sekolah perlu melibatkan dewan guru dan komite.',
      programName: 'Rapat Evaluasi Rutin Transparansi Mutu & Pemanfaatan Sumber Daya Sekolah (Non-ARKAS)',
      activityName: 'Forum Review Capaian Anggaran Triwulanan Bersama Komite Sekolah & Dewan Guru Tanpa Biaya Tambahan',
      arkasCode: 'NON-ARKAS',
      targetIndicator: 'Publikasi papan transparansi BOS/ARKAS serta berita acara evaluasi dilaksanakan tiap akhir triwulan.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      isNonArkas: true,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Kepala Sekolah & Komite Sekolah',
    },
  };

  let p1Count = 0;
  let p2Count = 0;
  let totalBudget = 0;
  let nonCostCount = 0;
  const timestamp = Date.now();

  for (const ind of indicators) {
    const blueprint = blueprintMap[ind.code] || {
      rootCause: `Analisis indikator ${ind.name} menunjukkan perlunya peningkatan strategi pengelolaan dan pembelajaran.`,
      programName: `Peningkatan Kualitas dan Ketercapaian Indikator ${ind.name}`,
      activityName: `Workshop Penyusunan Program Pembenahan Indikator ${ind.code}`,
      arkasCode: ind.score < 70 ? '04.06.05' : 'NON-ARKAS',
      targetIndicator: `Peningkatan capaian indikator ${ind.code} minimal +3.0 poin pada evaluasi berikutnya.`,
      defaultBudget: ind.score < 70 ? 3000000 : 0,
      defaultSource: ind.score < 70 ? 'BOS Reguler' : 'Non-Biaya',
      isNonArkas: ind.score >= 70,
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Tim Pengembang Kurikulum',
    };

    let priorityLevel: RktActionItem['priorityLevel'] = 'Pemeliharaan Mutu (P3)';
    const scoreCategory: 'Baik' | 'Sedang' | 'Kurang' =
      ind.score >= 70 ? 'Baik' : ind.score >= 55 ? 'Sedang' : 'Kurang';

    if (ind.score < 70 || ind.label === 'Kurang' || ind.label === 'Sedang') {
      priorityLevel = 'Prioritas Utama (P1)';
      p1Count += 1;
      priorityIndicators.push(`${ind.code} ${ind.name} (${ind.score})`);
    } else if (ind.score < 80) {
      priorityLevel = 'Prioritas Lanjutan (P2)';
      p2Count += 1;
    }

    const budget = blueprint.defaultBudget;
    const isNonArkasItem =
      Boolean(blueprint.isNonArkas) || budget === 0 || blueprint.defaultSource === 'Non-Biaya';
    totalBudget += budget;
    if (isNonArkasItem) {
      nonCostCount += 1;
    }

    items.push({
      id: `rkt-item-${ind.code.replace('.', '_')}-${timestamp}`,
      raporCode: ind.code,
      raporName: ind.name,
      currentScore: ind.score,
      category: scoreCategory,
      priorityLevel,
      rootCause: blueprint.rootCause,
      programName: blueprint.programName,
      activityName: blueprint.activityName,
      arkasCode: isNonArkasItem ? 'NON-ARKAS' : blueprint.arkasCode,
      targetIndicator: blueprint.targetIndicator,
      estimatedBudget: budget,
      fundingSource: blueprint.defaultSource,
      isNonArkas: isNonArkasItem,
      quarterTimeline: blueprint.timeline,
      personInCharge: blueprint.pic,
      notes: isNonArkasItem
        ? `Kegiatan Non-ARKAS (Rp 0) otomatis dari skor Rapor Pendidikan: ${ind.score} (${scoreCategory})`
        : `Kegiatan ARKAS 4 Kemendikdasmen dari skor Rapor Pendidikan: ${ind.score} (${scoreCategory})`,
    });

    // Add complementary unpaid Non-ARKAS activity for full-year sustainability
    const nonArkasEntry = nonArkasBlueprintMap[ind.code];
    if (nonArkasEntry && !isNonArkasItem) {
      if (priorityLevel === 'Prioritas Utama (P1)') {
        p1Count += 1;
      } else if (priorityLevel === 'Prioritas Lanjutan (P2)') {
        p2Count += 1;
      }
      nonCostCount += 1;

      items.push({
        id: `rkt-nonarkas-${ind.code.replace('.', '_')}-${timestamp}`,
        raporCode: ind.code,
        raporName: ind.name,
        currentScore: ind.score,
        category: scoreCategory,
        priorityLevel,
        rootCause: nonArkasEntry.rootCause,
        programName: nonArkasEntry.programName,
        activityName: nonArkasEntry.activityName,
        arkasCode: 'NON-ARKAS',
        targetIndicator: nonArkasEntry.targetIndicator,
        estimatedBudget: 0,
        fundingSource: 'Non-Biaya',
        isNonArkas: true,
        quarterTimeline: nonArkasEntry.timeline,
        personInCharge: nonArkasEntry.pic,
        notes: `Kegiatan Tidak Berbayar (Non-ARKAS / Rp 0) sepanjang tahun untuk indikator ${ind.code}`,
      });
    }
  }

  // Sort: P1 first, then P2, then P3 (and paid ARKAS before Non-ARKAS within same priority)
  items.sort((a, b) => {
    const priorityWeight: Record<string, number> = {
      'Prioritas Utama (P1)': 1,
      'Prioritas Lanjutan (P2)': 2,
      'Pemeliharaan Mutu (P3)': 3,
    };
    const pDiff = (priorityWeight[a.priorityLevel] || 3) - (priorityWeight[b.priorityLevel] || 3);
    if (pDiff !== 0) return pDiff;
    return Number(Boolean(a.isNonArkas)) - Number(Boolean(b.isNonArkas));
  });

  return {
    title: `Rencana Kegiatan Tahunan (RKT) ${schoolInfo.name} Tahun ${academicYear}`,
    academicYear,
    generatedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    sourceNpsn: schoolInfo.npsn,
    schoolName: schoolInfo.name,
    summary: {
      totalPrograms: items.length,
      totalBudget,
      nonCostCount,
      p1Count,
      p2Count,
      priorityIndicators,
    },
    items,
  };
}

export interface YearRoundInspirationItem {
  id: string;
  quarter: 'TW1' | 'TW2' | 'TW3' | 'TW4';
  quarterLabel: string;
  monthsLabel: string;
  raporCode: string;
  raporName: string;
  butuhBiaya: 'ya' | 'tidak';
  arkasCode: string;
  kegiatanBenahi: string;
  penjelasanImplementasi: string;
  kegiatanArkasNon: string;
  estimatedBudget: number;
  personInCharge: string;
}

/**
 * Generates curated 1-fiscal-year (TW1–TW4) activity inspirations grounded in active Rapor Pendidikan scores,
 * covering both paid ARKAS 4 Kemendikdasmen activities and zero-cost Non-ARKAS activities.
 */
export function buildFullYearRktInspirations(
  indicators: MinimalRaporIndicator[]
): YearRoundInspirationItem[] {
  const byCode = new Map(indicators.map((ind) => [ind.code.toUpperCase(), ind]));
  const nameOf = (code: string, fallback: string) => byCode.get(code)?.name || fallback;

  return [
    {
      id: 'insp-tw1-paid-numerasi',
      quarter: 'TW1',
      quarterLabel: 'Triwulan I',
      monthsLabel: 'Januari – Maret',
      raporCode: 'A.2',
      raporName: nameOf('A.2', 'Kemampuan Numerasi'),
      butuhBiaya: 'ya',
      arkasCode: '04.06.05',
      kegiatanBenahi: 'Peningkatan kompetensi PTK melalui pelatihan numerasi kontekstual & asesmen awal',
      penjelasanImplementasi: 'Bimtek guru kelas dalam penyusunan soal pemecahan masalah numerasi dan strategi diferensiasi awal tahun',
      kegiatanArkasNon: 'Peningkatan Kompetensi Guru (ARKAS 4 Kemendikdasmen)',
      estimatedBudget: 3500000,
      personInCharge: 'Waka Kurikulum & Tim Numerasi',
    },
    {
      id: 'insp-tw1-free-literasi',
      quarter: 'TW1',
      quarterLabel: 'Triwulan I',
      monthsLabel: 'Januari – Maret',
      raporCode: 'A.1',
      raporName: nameOf('A.1', 'Kemampuan Literasi'),
      butuhBiaya: 'tidak',
      arkasCode: 'NON-ARKAS',
      kegiatanBenahi: 'Pembiasaan budaya baca harian terjadwal tanpa pembiayaan anggaran',
      penjelasanImplementasi: 'Pelaksanaan membaca senyap 15 menit sebelum pembelajaran & diskusi resensi lisan bergiliran di kelas',
      kegiatanArkasNon: 'Penyelenggaraan (Non-ARKAS): Gerakan Literasi Sekolah Pagi Tanpa Biaya',
      estimatedBudget: 0,
      personInCharge: 'Wali Kelas & Tim Literasi',
    },
    {
      id: 'insp-tw2-paid-buku',
      quarter: 'TW2',
      quarterLabel: 'Triwulan II',
      monthsLabel: 'April – Juni',
      raporCode: 'A.1',
      raporName: nameOf('A.1', 'Kemampuan Literasi'),
      butuhBiaya: 'ya',
      arkasCode: '02.02.01',
      kegiatanBenahi: 'Pengembangan perpustakaan sekolah dan pojok baca kelas ramah anak',
      penjelasanImplementasi: 'Pengadaan koleksi buku bacaan bermutu non-teks berjenjang dan penataan sudut baca tiap rombel',
      kegiatanArkasNon: 'Pengembangan Perpustakaan & Penyediaan Buku Bacaan Bermutu',
      estimatedBudget: 4500000,
      personInCharge: 'Kepala Perpustakaan & Bendahara BOS',
    },
    {
      id: 'insp-tw2-free-kombel',
      quarter: 'TW2',
      quarterLabel: 'Triwulan II',
      monthsLabel: 'April – Juni',
      raporCode: 'D.1',
      raporName: nameOf('D.1', 'Kualitas Pembelajaran'),
      butuhBiaya: 'tidak',
      arkasCode: 'NON-ARKAS',
      kegiatanBenahi: 'Optimalisasi Komunitas Belajar (Kombel) dan observasi rekan sejawat',
      penjelasanImplementasi: 'Pertemuan Kombel dwi-mingguan membedah modul ajar Ruang GTK dan refleksi praktik baik tanpa anggaran BOS',
      kegiatanArkasNon: 'Penyelenggaraan (Non-ARKAS): Kombel Intra-Sekolah & Peer Coaching Guru',
      estimatedBudget: 0,
      personInCharge: 'Ketua Kombel & Kepala Sekolah',
    },
    {
      id: 'insp-tw3-paid-ppksp',
      quarter: 'TW3',
      quarterLabel: 'Triwulan III',
      monthsLabel: 'Juli – September',
      raporCode: 'D.4',
      raporName: nameOf('D.4', 'Iklim Keamanan Satuan Pendidikan'),
      butuhBiaya: 'ya',
      arkasCode: '03.03.11',
      kegiatanBenahi: 'Penguatan Tim Pencegahan dan Penanganan Kekerasan (TPPK) pada tahun ajaran baru',
      penjelasanImplementasi: 'Sosialisasi PPKSP kepada orang tua dan siswa baru serta pengadaan papan informasi/kanal aduan ramah anak',
      kegiatanArkasNon: 'Penerapan Program Pencegahan Perundungan & Penanganan Kekerasan (PPKSP)',
      estimatedBudget: 1500000,
      personInCharge: 'Satgas TPPK & Pembina Kesiswaan',
    },
    {
      id: 'insp-tw3-free-inklusi',
      quarter: 'TW3',
      quarterLabel: 'Triwulan III',
      monthsLabel: 'Juli – September',
      raporCode: 'D.10',
      raporName: nameOf('D.10', 'Iklim Inklusivitas & Disabilitas'),
      butuhBiaya: 'tidak',
      arkasCode: 'NON-ARKAS',
      kegiatanBenahi: 'Layanan pendampingan inklusif kolaboratif bersama teman sebaya & orang tua',
      penjelasanImplementasi: 'Penyusunan Program Pembelajaran Individual (PPI) swadaya dan program sahabat inklusi antar peserta didik',
      kegiatanArkasNon: 'Penyelenggaraan (Non-ARKAS): Sahabat Inklusi & Konsultasi Orang Tua ABK',
      estimatedBudget: 0,
      personInCharge: 'Koordinator Inklusi & Wali Kelas',
    },
    {
      id: 'insp-tw4-paid-p5',
      quarter: 'TW4',
      quarterLabel: 'Triwulan IV',
      monthsLabel: 'Oktober – Desember',
      raporCode: 'A.3',
      raporName: nameOf('A.3', 'Karakter Peserta Didik'),
      butuhBiaya: 'ya',
      arkasCode: '03.03.04',
      kegiatanBenahi: 'Pengembangan karakter Pelajar Pancasila melalui projek kontekstual dan gelar karya',
      penjelasanImplementasi: 'Pelaksanaan Gelar Karya P5 & Pekan Kebinekaan akhir tahun anggaran serta asesmen refleksi karakter siswa',
      kegiatanArkasNon: 'Pengembangan Pembelajaran Berbasis Projek (P5) & Kebinekaan',
      estimatedBudget: 3500000,
      personInCharge: 'Koordinator P5 & Guru PPKn',
    },
    {
      id: 'insp-tw4-free-evaluasi',
      quarter: 'TW4',
      quarterLabel: 'Triwulan IV',
      monthsLabel: 'Oktober – Desember',
      raporCode: 'D.8',
      raporName: nameOf('D.8', 'Iklim Kebinekaan'),
      butuhBiaya: 'tidak',
      arkasCode: 'NON-ARKAS',
      kegiatanBenahi: 'Refleksi iklim kebinekaan dan evaluasi akhir tahun RKT bersama komite sekolah',
      penjelasanImplementasi: 'Apel kebangsaan, rotasi kelompok belajar inklusif, dan forum tinjauan capaian RKT akhir tahun tanpa biaya',
      kegiatanArkasNon: 'Penyelenggaraan (Non-ARKAS): Dialog Toleransi & Evaluasi Mutu Akhir Tahun',
      estimatedBudget: 0,
      personInCharge: 'Kepala Sekolah, Guru PPKn & Komite',
    },
  ];
}



