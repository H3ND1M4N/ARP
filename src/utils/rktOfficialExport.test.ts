import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {
  OFFICIAL_RKT_COLUMNS,
  mapRaporCodeToSnp,
  mapRktItemsToOfficialRows,
  buildOfficialRktSheetMatrix,
  createOfficialRktWorkbook,
} from './rktOfficialExport';
import { generateRktFromRapor } from './petaMutuMath';

test('OFFICIAL_RKT_COLUMNS preserves exact 9 columns from Format_RKT_2026.xlsx', () => {
  assert.equal(OFFICIAL_RKT_COLUMNS.length, 9);
  assert.deepEqual(
    OFFICIAL_RKT_COLUMNS.map((c) => c.title),
    [
      'No',
      'Nama SNP',
      'Identifikasi',
      'Akar Masalah',
      'Kegiatan Benahi',
      'Penjelasan Implementasi Kegiatan',
      'Apakah Kegiatan Membutuhkan Biaya?',
      'Kode ARKAS/NON',
      'Kegiatan ARKAS/NON',
    ]
  );
});

test('mapRaporCodeToSnp maps Rapor Pendidikan codes to SNP names correctly', () => {
  assert.equal(mapRaporCodeToSnp('A.1', '03.05.01'), 'STANDAR SARANA DAN PRASARANA');
  assert.equal(mapRaporCodeToSnp('A.2', '02.04.03'), 'STANDAR PTK');
  assert.equal(mapRaporCodeToSnp('D.1', 'NON-ARKAS'), 'STANDAR PROSES');
  assert.equal(mapRaporCodeToSnp('D.4', '02.06.01'), 'STANDAR PENGELOLAAN');
  assert.equal(mapRaporCodeToSnp('E.2', '04.06.05'), 'STANDAR PEMBIAYAAN');
});

test('mapRktItemsToOfficialRows preserves indicators and applies Ya/Tidak and empty Kode for Non-ARKAS', () => {
  const rkt = generateRktFromRapor(
    [
      { code: 'A.1', name: 'Kemampuan Literasi', score: 78.4, label: 'Baik' },
      { code: 'A.2', name: 'Kemampuan Numerasi', score: 62.1, label: 'Sedang' },
      { code: 'D.1', name: 'Kualitas Pembelajaran', score: 72.8, label: 'Baik' },
      { code: 'D.4', name: 'Iklim Keamanan Satuan Pendidikan', score: 88.5, label: 'Baik' },
    ],
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU' },
    '2026/2027'
  );

  const rows = mapRktItemsToOfficialRows(rkt.items);
  assert.equal(rows.length, rkt.items.length);

  // Paid ARKAS row checks
  const paidRow = rows.find((r) => r.identifikasi === 'A.2 Kemampuan Numerasi' && r.butuhBiaya === 'Ya');
  assert.ok(paidRow);
  assert.equal(paidRow?.butuhBiaya, 'Ya');
  assert.match(paidRow!.kodeArkasNon, /^02\.04\.03/);
  assert.equal(paidRow?.namaSnp, 'STANDAR PTK');

  // Unpaid Non-ARKAS row checks: Kode ARKAS/NON must be empty per sheet instructions
  const unpaidRow = rows.find(
    (r) => r.identifikasi === 'D.1 Kualitas Pembelajaran' && r.butuhBiaya === 'Tidak'
  );
  assert.ok(unpaidRow);
  assert.equal(unpaidRow?.butuhBiaya, 'Tidak');
  assert.equal(unpaidRow?.kodeArkasNon, '');
  assert.match(unpaidRow!.kegiatanArkasNon, /Non-ARKAS/);
});

test('createOfficialRktWorkbook creates sheet RKT with 9 columns and school metadata', () => {
  const rkt = generateRktFromRapor(
    [
      { code: 'A.1', name: 'Kemampuan Literasi', score: 78.4, label: 'Baik' },
      { code: 'D.1', name: 'Kualitas Pembelajaran', score: 72.8, label: 'Baik' },
    ],
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU' },
    '2026/2027'
  );

  const officialRows = mapRktItemsToOfficialRows(rkt.items);
  const matrix = buildOfficialRktSheetMatrix(
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU' },
    officialRows
  );

  // Every row in the matrix has exact 9 columns
  for (const row of matrix) {
    assert.equal(row.length, 9);
  }

  assert.equal(matrix[0][0], 'LEMBAR RENCANA KERJA TAHUNAN (RKT)');
  assert.equal(matrix[2][0], 'Nama Satuan');
  assert.equal(matrix[2][2], 'SD NEGERI GUNUNGSARI 04 BATU');
  assert.equal(matrix[3][0], 'NPSN');
  assert.equal(matrix[3][2], '20536900');

  const wb = createOfficialRktWorkbook(
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU' },
    rkt.items
  );
  assert.deepEqual(wb.SheetNames, ['RKT']);

  const sheet = wb.Sheets['RKT'];
  assert.ok(sheet);
  const range = XLSX.utils.decode_range(sheet['!ref']!);
  // Columns 0..8 -> exact 9 columns (A..I)
  assert.equal(range.s.c, 0);
  assert.equal(range.e.c, 8);
});
