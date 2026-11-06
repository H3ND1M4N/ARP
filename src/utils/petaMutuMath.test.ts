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

test('validateRaporUpload checks NPSN and indicators count', () => {
  const valid = validateRaporUpload('20536900', '20536900', 7);
  assert.equal(valid.isValid, true);

  const mismatchNpsn = validateRaporUpload('20536897', '20536900', 7);
  assert.equal(mismatchNpsn.isValid, false);
  assert.match(mismatchNpsn.error!, /NPSN berkas/);

  const tooFewIndicators = validateRaporUpload('20536900', '20536900', 3);
  assert.equal(tooFewIndicators.isValid, false);
  assert.match(tooFewIndicators.error!, /kurang dari 5 indikator/);
});

