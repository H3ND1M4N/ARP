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

const KNOWN_RAPOR_CODES = ['A.1', 'A.2', 'A.3', 'D.1', 'D.4', 'D.8', 'D.10'];

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

    // Check indicator codes (A.1, A.2, A.3, D.1, D.4, D.8, D.10)
    for (let i = 0; i < cells.length; i++) {
      const codeMatch = cells[i].match(/\b(A\.1|A\.2|A\.3|D\.1|D\.4|D\.8|D\.10)\b/i);
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
 * Conforms to authentic Kemendikdasmen Perencanaan Berbasis Data (PBD) guidelines and ARKAS nomenclature.
 */
export function generateRktFromRapor(
  indicators: MinimalRaporIndicator[],
  schoolInfo: { npsn: string; name: string },
  academicYear: string = '2026/2027'
): GeneratedRktData {
  const items: RktActionItem[] = [];
  const priorityIndicators: string[] = [];

  const blueprintMap: Record<
    string,
    {
      rootCause: string;
      programName: string;
      activityName: string;
      arkasCode: string;
      targetIndicator: string;
      defaultBudget: number;
      defaultSource: 'BOS Reguler' | 'BOS Kinerja' | 'Non-Biaya';
      timeline: ('TW1' | 'TW2' | 'TW3' | 'TW4')[];
      pic: string;
    }
  > = {
    'A.1': {
      rootCause: 'Rendahnya minat baca kritis & minim ragam buku non-teks ramah anak di perpustakaan/sudut baca kelas.',
      programName: 'Program Penguatan Gerakan Literasi Sekolah (GLS)',
      activityName: 'Revitalisasi Pojok Baca Kelas & Pengadaan Buku Cerita Bergambar Ramah Anak Non-Teks',
      arkasCode: '03.05.01',
      targetIndicator: '100% kelas memiliki pojok baca aktif; skor literasi naik minimal +4.5 poin.',
      defaultBudget: 4500000,
      defaultSource: 'BOS Reguler',
      timeline: ['TW1', 'TW2'],
      pic: 'Koordinator Literasi & Guru Kelas',
    },
    'A.2': {
      rootCause: 'Guru belum terbiasa menerapkan strategi numerasi kontekstual & minim media manipulatif pemecahan masalah.',
      programName: 'Program Penguatan Kompetensi Pendidik Bidang Numerasi & Penalaran Logika',
      activityName: 'Pelatihan Bimtek Modul Ajar Numerasi & Pengadaan Kit Peraga Matematika Kontekstual',
      arkasCode: '02.04.03',
      targetIndicator: 'Seluruh guru kelas 1-6 menerapkan modul numerasi PMM; skor numerasi mencapai predikat Baik (>=72.0).',
      defaultBudget: 6500000,
      defaultSource: 'BOS Reguler',
      timeline: ['TW1', 'TW2', 'TW3'],
      pic: 'Waka Kurikulum & Tim Pengembang',
    },
    'A.3': {
      rootCause: 'Penanaman profil Pelajar Pancasila belum terinternalisasi maksimal dalam pembiasaan dan iklim kelas.',
      programName: 'Program Penguatan Karakter & Gelar Karya Projek Penguatan Profil Pelajar Pancasila (P5)',
      activityName: 'Penyelenggaraan Gelar Karya P5 Kewirausahaan & Budaya Kearifan Lokal Kota Batu',
      arkasCode: '03.04.02',
      targetIndicator: '100% siswa aktif berpartisipasi dalam pameran P5; pembiasaan gotong royong dan kemandirian meningkat.',
      defaultBudget: 3500000,
      defaultSource: 'BOS Reguler',
      timeline: ['TW2', 'TW4'],
      pic: 'Koordinator P5 & Pembina Kesiswaan',
    },
    'D.1': {
      rootCause: 'Refleksi pembelajaran dan supervisi klinis antar rekan sejawat belum berjalan berkala dan terstruktur.',
      programName: 'Optimalisasi Komunitas Belajar (Kombel) Guru Intra-Satuan Pendidikan',
      activityName: 'Diseminasi Berbagi Praktik Baik Pembelajaran Berdiferensiasi & Telaah Modul Ajar di Kombel',
      arkasCode: '02.02.04',
      targetIndicator: 'Pertemuan Kombel rutin dwimingguan; 100% guru menyusun asesmen formatif berdiferensiasi.',
      defaultBudget: 0,
      defaultSource: 'Non-Biaya',
      timeline: ['TW1', 'TW2', 'TW3', 'TW4'],
      pic: 'Ketua Komunitas Belajar Guru',
    },
    'D.4': {
      rootCause: 'Mekanisme pencegahan dan kanal pelaporan perundungan serta kekerasan belum tersosialisasi menyeluruh.',
      programName: 'Program Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP)',
      activityName: 'Penguatan Kapasitas TPPK Satuan Pendidikan & Kampanye Terpadu Sekolah Ramah Anak',
      arkasCode: '02.06.01',
      targetIndicator: 'Nol kasus perundungan; tersedianya kotak curhat aman dan SOP penanganan PPKSP aktif.',
      defaultBudget: 1500000,
      defaultSource: 'BOS Reguler',
      timeline: ['TW1', 'TW3'],
      pic: 'Tim Pencegahan & Penanganan Kekerasan (TPPK)',
    },
    'D.8': {
      rootCause: 'Minimnya ruang perjumpaan lintas budaya dan kesadaran toleransi keberagaman sosial di sekolah.',
      programName: 'Program Penguatan Kebinekaan Global & Toleransi Inklusif',
      activityName: 'Pekan Festival Kebinekaan: Busana Adat Nusantara, Kuliner Tradisional, dan Dialog Inklusif',
      arkasCode: '03.04.05',
      targetIndicator: 'Indeks iklim kebinekaan stabil pada predikat Sangat Baik (>85.0); kesadaran toleransi 100%.',
      defaultBudget: 2000000,
      defaultSource: 'BOS Reguler',
      timeline: ['TW3'],
      pic: 'Guru PPKn & Kesiswaan',
    },
    'D.10': {
      rootCause: 'Pendidik belum terlatih menyusun modifikasi kurikulum individual bagi peserta didik berkebutuhan khusus.',
      programName: 'Program Peningkatan Layanan Pendidikan Inklusif & Ramah Disabilitas',
      activityName: 'Bimtek Identifikasi Asesmen ABK & Pengadaan Media Pembelajaran Taktil / Visual Ramah Anak',
      arkasCode: '02.04.05',
      targetIndicator: 'Tersusunnya rencana pembelajaran individual (PPI) untuk seluruh anak disabilitas & sarana ramah anak.',
      defaultBudget: 2500000,
      defaultSource: 'BOS Reguler',
      timeline: ['TW2', 'TW3'],
      pic: 'Guru Pendamping Khusus & Waka Kesiswaan',
    },
  };

  let p1Count = 0;
  let p2Count = 0;
  let totalBudget = 0;
  let nonCostCount = 0;

  for (const ind of indicators) {
    const blueprint = blueprintMap[ind.code] || {
      rootCause: `Analisis indikator ${ind.name} menunjukkan perlunya peningkatan strategi pengelolaan dan pembelajaran.`,
      programName: `Peningkatan Kualitas dan Ketercapaian Indikator ${ind.name}`,
      activityName: `Workshop Penyusunan Program Pembenahan Indikator ${ind.code}`,
      arkasCode: '02.04.09',
      targetIndicator: `Peningkatan capaian indikator ${ind.code} minimal +3.0 poin pada evaluasi berikutnya.`,
      defaultBudget: ind.score < 70 ? 3000000 : 1500000,
      defaultSource: ind.score < 70 ? 'BOS Reguler' : 'Non-Biaya',
      timeline: ['TW1', 'TW2'],
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
    totalBudget += budget;
    if (budget === 0 || blueprint.defaultSource === 'Non-Biaya') {
      nonCostCount += 1;
    }

    items.push({
      id: `rkt-item-${ind.code.replace('.', '_')}-${Date.now()}`,
      raporCode: ind.code,
      raporName: ind.name,
      currentScore: ind.score,
      category: scoreCategory,
      priorityLevel,
      rootCause: blueprint.rootCause,
      programName: blueprint.programName,
      activityName: blueprint.activityName,
      arkasCode: blueprint.arkasCode,
      targetIndicator: blueprint.targetIndicator,
      estimatedBudget: budget,
      fundingSource: blueprint.defaultSource,
      quarterTimeline: blueprint.timeline,
      personInCharge: blueprint.pic,
      notes: `Dihasilkan otomatis dari skor Rapor Pendidikan: ${ind.score} (${scoreCategory})`,
    });
  }

  // Sort: P1 first, then P2, then P3
  items.sort((a, b) => {
    const priorityWeight: Record<string, number> = {
      'Prioritas Utama (P1)': 1,
      'Prioritas Lanjutan (P2)': 2,
      'Pemeliharaan Mutu (P3)': 3,
    };
    return (priorityWeight[a.priorityLevel] || 3) - (priorityWeight[b.priorityLevel] || 3);
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


