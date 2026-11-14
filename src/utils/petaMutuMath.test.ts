import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseRegionalPath,
  formatRegionalPath,
  getScoreCategory,
  convertTo7Scale,
  calculateOverallSnpScore,
  identifyPriorityGaps,
  calculateArkasSummary,
  calculateSchoolBudgetAdjustment,
  validateRaporUpload,
  parseRaporSheetRows,
  syncSnpScoresFromRapor,
  generateRktFromRapor,
  buildFullYearRktInspirations,
  SnpStandardScore,
  ArkasProgramItem,
} from './petaMutuMath';

test('parseRegionalPath parses deep link correctly', () => {
  const result = parseRegionalPath('/simantap/050000/056800/056802/20536900');
  assert.deepEqual(result, {
    provinsiCode: '050000',
    kabupatenCode: '056800',
    kecamatanCode: '056802',
    npsn: '20536900',
  });

  const withoutPrefix = parseRegionalPath('050000/056800/056802/20536900');
  assert.deepEqual(withoutPrefix, {
    provinsiCode: '050000',
    kabupatenCode: '056800',
    kecamatanCode: '056802',
    npsn: '20536900',
  });

  const invalid = parseRegionalPath('invalid/path');
  assert.equal(invalid, null);
});

test('formatRegionalPath produces canonical URL', () => {
  const formatted = formatRegionalPath({
    provinsiCode: '050000',
    kabupatenCode: '056800',
    kecamatanCode: '056802',
    npsn: '20536900',
  });
  assert.equal(formatted, '/simantap/050000/056800/056802/20536900');
});

test('getScoreCategory classifies thresholds correctly', () => {
  assert.equal(getScoreCategory(88), 'Sangat Baik');
  assert.equal(getScoreCategory(85), 'Sangat Baik');
  assert.equal(getScoreCategory(75), 'Baik');
  assert.equal(getScoreCategory(70), 'Baik');
  assert.equal(getScoreCategory(60), 'Cukup');
  assert.equal(getScoreCategory(54), 'Kurang');
});

test('convertTo7Scale scales 0-100 to 0-7 correctly', () => {
  assert.equal(convertTo7Scale(100), 7);
  assert.equal(convertTo7Scale(0), 0);
  assert.equal(convertTo7Scale(85), 5.95);
});

test('calculateOverallSnpScore calculates weighted average', () => {
  const standards = [
    { score: 80, weight: 1 },
    { score: 90, weight: 1 },
    { score: 70, weight: 2 },
  ];
  // (80*1 + 90*1 + 70*2) / 4 = (80 + 90 + 140) / 4 = 310 / 4 = 77.5
  const result = calculateOverallSnpScore(standards);
  assert.equal(result.averageScore, 77.5);
  assert.equal(result.category, 'Baik');
  assert.equal(result.scaled7, 5.43);
});

test('identifyPriorityGaps sorts and returns lowest scores', () => {
  const standards: SnpStandardScore[] = [
    { id: '1', name: 'SKL', shortCode: 'SKL', score: 82, target: 85, previousYearScore: 78, weight: 1, category: 'Baik' },
    { id: '2', name: 'Sarpras', shortCode: 'SARPRAS', score: 62, target: 80, previousYearScore: 60, weight: 1, category: 'Cukup' },
    { id: '3', name: 'PTK', shortCode: 'PTK', score: 71, target: 85, previousYearScore: 68, weight: 1, category: 'Baik' },
    { id: '4', name: 'Proses', shortCode: 'PROSES', score: 65, target: 85, previousYearScore: 64, weight: 1, category: 'Cukup' },
  ];
  const gaps = identifyPriorityGaps(standards, 2);
  assert.equal(gaps.length, 2);
  assert.equal(gaps[0].shortCode, 'SARPRAS');
  assert.equal(gaps[1].shortCode, 'PROSES');
});

test('calculateArkasSummary tallies budgets and non-cost activities', () => {
  const programs: ArkasProgramItem[] = [
    { id: 'p1', code: '02.01', name: 'Workshop Guru', snpStandardId: 'ptk', estimatedBudget: 5000000, isNonCost: false, status: 'approved' },
    { id: 'p2', code: '03.04', name: 'Pengadaan Buku', snpStandardId: 'sarpras', estimatedBudget: 12000000, isNonCost: false, status: 'in_arkas' },
    { id: 'p3', code: '04.01', name: 'Kombel Berbagi', snpStandardId: 'proses', estimatedBudget: 0, isNonCost: true, status: 'approved' },
    { id: 'p4', code: '05.02', name: 'Draf Rencana', snpStandardId: 'isi', estimatedBudget: 3000000, isNonCost: false, status: 'draft' },
  ];

  const summary = calculateArkasSummary(programs);
  assert.equal(summary.totalBudget, 20000000);
  assert.equal(summary.approvedBudget, 17000000); // 5jt + 12jt
  assert.equal(summary.totalPrograms, 4);
  assert.equal(summary.nonCostCount, 1);
});

test('calculateSchoolBudgetAdjustment calculates surplus and deficit scenarios', () => {
  const programs: ArkasProgramItem[] = [
    { id: 'p1', code: '02.04.03', name: 'Pelatihan Numerasi', snpStandardId: 'ptk', estimatedBudget: 4000000, isNonCost: false, status: 'approved' },
    { id: 'p2', code: '03.01.08', name: 'Kit Matematika', snpStandardId: 'sarpras', estimatedBudget: 6000000, isNonCost: false, status: 'in_arkas' },
    { id: 'p3', code: '05.01.03', name: 'Pemeliharaan', snpStandardId: 'sarpras', estimatedBudget: 3000000, isNonCost: false, status: 'draft' },
  ];

  // Scenario 1: Budget is enough (20.000.000 available vs 13.000.000 proposed)
  const surplusResult = calculateSchoolBudgetAdjustment({
    availableBudgetForMutu: 20000000,
    totalSchoolBosBudget: 133200000,
    programs,
  });
  assert.equal(surplusResult.isBalanced, true);
  assert.equal(surplusResult.remainingBudget, 7000000);
  assert.equal(surplusResult.recommendedSurplusActions.length > 0, true);

  // Scenario 2: Budget deficit (10.000.000 available vs 13.000.000 proposed)
  const deficitResult = calculateSchoolBudgetAdjustment({
    availableBudgetForMutu: 10000000,
    totalSchoolBosBudget: 133200000,
    programs,
  });
  assert.equal(deficitResult.isBalanced, false);
  assert.equal(deficitResult.remainingBudget, -3000000);
  assert.equal(deficitResult.recommendedReductions.length > 0, true);
});

test('validateRaporUpload checks valid 8-digit NPSN and indicators count', () => {
  const valid = validateRaporUpload('20536900', 7);
  assert.equal(valid.isValid, true);

  const anotherSchoolValid = validateRaporUpload('20536850', 7);
  assert.equal(anotherSchoolValid.isValid, true);

  const invalidNpsn = validateRaporUpload('1234', 7);
  assert.equal(invalidNpsn.isValid, false);
  assert.match(invalidNpsn.error!, /8 digit/);

  const tooFewIndicators = validateRaporUpload('20536900', 3);
  assert.equal(tooFewIndicators.isValid, false);
  assert.match(tooFewIndicators.error!, /kurang dari 5 indikator/);
});

test('parseRaporSheetRows extracts school metadata and indicators', () => {
  const rows = [
    ['NPSN', '20536850'],
    ['Nama Sekolah', 'SD Negeri Sisir 03'],
    ['Jenjang', 'SD'],
    ['Status', 'Negeri'],
    ['Kecamatan', 'Kec. Batu'],
    ['Kabupaten/Kota', 'Kota Batu'],
    ['Provinsi', 'Provinsi Jawa Timur'],
    ['Kode', 'Indikator', 'Skor'],
    ['A.1', 'Kemampuan Literasi', '86.4', '+3.1'],
    ['A.2', 'Kemampuan Numerasi', '74.2', '+5.0'],
    ['A.3', 'Karakter Peserta Didik', '85.0'],
    ['D.1', 'Kualitas Pembelajaran', '79.5'],
    ['D.4', 'Iklim Keamanan', '91.0'],
    ['D.8', 'Iklim Kebinekaan', '88.0'],
    ['D.10', 'Iklim Inklusivitas', '75.0'],
  ];

  const parsed = parseRaporSheetRows(rows, 'Rapor_Pendidikan_20536850.xlsx');
  assert.equal(parsed.schoolInfo.npsn, '20536850');
  assert.equal(parsed.schoolInfo.name, 'SD NEGERI SISIR 03');
  assert.equal(parsed.schoolInfo.district, 'Kec. Batu');
  assert.equal(parsed.indicators.length, 7);
  assert.equal(parsed.indicators[0].code, 'A.1');
  assert.equal(parsed.indicators[0].score, 86.4);
  assert.equal(parsed.indicators[1].score, 74.2);
});

test('syncSnpScoresFromRapor updates SNP standards dynamically', () => {
  const snp = [
    { code: 'SKL', score: 70, scale7: 4.9, score2026: 70, category: 'Baik' as const },
    { code: 'PROSES', score: 65, scale7: 4.55, score2026: 65, category: 'Cukup' as const },
    { code: 'SARPRAS', score: 62.4, scale7: 4.37, score2026: 62.4, category: 'Cukup' as const },
  ];
  const updated = syncSnpScoresFromRapor(snp, [
    { code: 'A.1', name: 'Literasi', score: 90 },
    { code: 'A.2', name: 'Numerasi', score: 84 },
    { code: 'A.3', name: 'Karakter', score: 90 },
    { code: 'D.1', name: 'Kualitas Pembelajaran', score: 86 },
  ]);
  assert.equal(updated[0].score, 88);
  assert.equal(updated[0].category, 'Sangat Baik');
  assert.equal(updated[1].score, 85.3);
  assert.equal(updated[2].score, 62.4);
});

test('generateRktFromRapor produces structured RKT with prioritized items, ARKAS 4 Kemendikdasmen codes, and Non-ARKAS pairs', () => {
  const sampleIndicators = [
    { code: 'A.1', name: 'Kemampuan Literasi', score: 78.4, label: 'Baik' as const },
    { code: 'A.2', name: 'Kemampuan Numerasi', score: 62.1, label: 'Sedang' as const }, // Priority 1 (< 70)
    { code: 'A.3', name: 'Karakter Peserta Didik', score: 81.2, label: 'Baik' as const },
    { code: 'D.1', name: 'Kualitas Pembelajaran', score: 72.8, label: 'Baik' as const },
    { code: 'D.4', name: 'Iklim Keamanan Satuan Pendidikan', score: 88.5, label: 'Baik' as const },
    { code: 'D.8', name: 'Iklim Kebinekaan', score: 84.0, label: 'Baik' as const },
    { code: 'D.10', name: 'Iklim Inklusivitas & Disabilitas', score: 66.5, label: 'Sedang' as const }, // Priority 1 (< 70)
  ];

  const rkt = generateRktFromRapor(
    sampleIndicators,
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04' },
    '2026/2027'
  );

  assert.equal(rkt.schoolName, 'SD NEGERI GUNUNGSARI 04');
  assert.equal(rkt.sourceNpsn, '20536900');
  assert.equal(rkt.academicYear, '2026/2027');
  assert.equal(rkt.summary.totalPrograms, 14); // 7 paid ARKAS 4 + 7 complementary Non-ARKAS
  assert.equal(rkt.summary.p1Count, 4); // A.2 & D.10 each have paid + Non-ARKAS activity
  assert.equal(rkt.items.length, 14);
  assert.equal(rkt.summary.nonCostCount, 7); // All 7 indicators have full-year Non-ARKAS activity

  // The first item should be a Priority 1 item
  assert.equal(rkt.items[0].priorityLevel, 'Prioritas Utama (P1)');

  // Numerasi paid ARKAS 4 Kemendikdasmen action check
  const numerasiPaidItem = rkt.items.find((i) => i.raporCode === 'A.2' && !i.isNonArkas);
  assert.ok(numerasiPaidItem);
  assert.equal(numerasiPaidItem?.arkasCode, '04.06.05');
  assert.equal(numerasiPaidItem?.fundingSource, 'BOS Reguler');
  assert.equal(numerasiPaidItem?.estimatedBudget, 6500000);

  // Numerasi complementary unpaid Non-ARKAS check
  const numerasiNonArkas = rkt.items.find((i) => i.raporCode === 'A.2' && i.isNonArkas);
  assert.ok(numerasiNonArkas);
  assert.equal(numerasiNonArkas?.arkasCode, 'NON-ARKAS');
  assert.equal(numerasiNonArkas?.fundingSource, 'Non-Biaya');
  assert.equal(numerasiNonArkas?.estimatedBudget, 0);

  // D.1 Kombel non-cost Non-ARKAS check + paid 02.06.01 KKG/Kombel check
  const kombelItem = rkt.items.find((i) => i.raporCode === 'D.1' && i.isNonArkas);
  assert.ok(kombelItem);
  assert.equal(kombelItem?.arkasCode, 'NON-ARKAS');
  assert.equal(kombelItem?.fundingSource, 'Non-Biaya');
  assert.equal(kombelItem?.estimatedBudget, 0);
  assert.equal(kombelItem?.isNonArkas, true);

  assert.ok(rkt.summary.totalBudget > 0);
});

test('buildFullYearRktInspirations covers all 4 quarters with paid ARKAS 4 and zero-cost Non-ARKAS options', () => {
  const inspirations = buildFullYearRktInspirations([
    { code: 'A.1', name: 'Kemampuan Literasi', score: 78.4 },
    { code: 'A.2', name: 'Kemampuan Numerasi', score: 62.1 },
    { code: 'D.1', name: 'Kualitas Pembelajaran', score: 72.8 },
  ]);
  const quarters = new Set(inspirations.map((i) => i.quarter));
  assert.deepEqual(Array.from(quarters).sort(), ['TW1', 'TW2', 'TW3', 'TW4']);
  assert.ok(inspirations.some((i) => i.butuhBiaya === 'ya' && i.arkasCode === '04.06.05'));
  assert.ok(inspirations.some((i) => i.butuhBiaya === 'tidak' && i.estimatedBudget === 0));
});
