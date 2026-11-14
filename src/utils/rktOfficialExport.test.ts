import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {
  OFFICIAL_RKT_COLUMNS,
  mapRaporCodeToSnp,
  mapRktItemsToOfficialRows,
  buildOfficialRktSheetMatrix,
  createOfficialRktWorkbook,
  createOfficialRktBuffer,
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
  assert.equal(mapRaporCodeToSnp('A.1', '02.02.01'), 'STANDAR ISI');
  assert.equal(mapRaporCodeToSnp('A.2', '04.06.05'), 'STANDAR PTK');
  assert.equal(mapRaporCodeToSnp('D.1', 'NON-ARKAS'), 'STANDAR PROSES');
  assert.equal(mapRaporCodeToSnp('D.4', '03.03.11'), 'STANDAR PENGELOLAAN');
  assert.equal(mapRaporCodeToSnp('E.2', '04.06.05'), 'STANDAR PEMBIAYAAN');
});

test('mapRktItemsToOfficialRows preserves indicators and applies ya/tidak and empty Kode for Non-ARKAS', () => {
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

  // Paid ARKAS 4 Kemendikdasmen row checks
  const paidRow = rows.find((r) => r.identifikasi === 'A.2 Kemampuan Numerasi' && r.butuhBiaya === 'ya');
  assert.ok(paidRow);
  assert.equal(paidRow?.butuhBiaya, 'ya');
  assert.equal(paidRow?.kodeArkasNon, '04.06.05. (Standar PTK)');
  assert.equal(paidRow?.namaSnp, 'STANDAR PTK');
  assert.equal(paidRow?.kegiatanArkasNon, 'Peningkatan Kompetensi Guru');

  // Unpaid Non-ARKAS row checks: Kode ARKAS/NON must be empty per sheet instructions
  const unpaidRow = rows.find(
    (r) => r.identifikasi === 'D.1 Kualitas Pembelajaran' && r.butuhBiaya === 'tidak'
  );
  assert.ok(unpaidRow);
  assert.equal(unpaidRow?.butuhBiaya, 'tidak');
  assert.equal(unpaidRow?.kodeArkasNon, '');
  assert.match(unpaidRow!.kegiatanArkasNon, /Non-ARKAS/);
});

test('createOfficialRktWorkbook creates ExcelJS sheet RKT matching Format_RKT_2026.xlsx merges, styles, and round-trip buffer', async () => {
  const rkt = generateRktFromRapor(
    [
      { code: 'A.1', name: 'Kemampuan Literasi', score: 78.4, label: 'Baik' },
      { code: 'A.2', name: 'Kemampuan Numerasi', score: 62.1, label: 'Sedang' },
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

  // Every row in the matrix has exact 9 columns and school identity aligns at column D (index 3)
  for (const row of matrix) {
    assert.equal(row.length, 9);
  }
  assert.equal(matrix[0][0], 'LEMBAR RENCANA KERJA TAHUNAN (RKT)');
  assert.equal(matrix[2][0], 'Nama Satuan');
  assert.equal(matrix[2][3], 'SD NEGERI GUNUNGSARI 04 BATU');
  assert.equal(matrix[3][0], 'NPSN');
  assert.equal(matrix[3][3], '20536900');

  // Generate real ExcelJS .xlsx buffer and load back to inspect styles, merges, and borders
  const buffer = await createOfficialRktBuffer(
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU' },
    rkt.items
  );
  assert.ok(buffer.byteLength > 2000);

  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(buffer.buffer as ArrayBuffer);

  assert.equal(loaded.worksheets.length, 1);
  const sheet = loaded.getWorksheet('RKT');
  assert.ok(sheet);

  // Column count must be strictly 9
  assert.equal(sheet.columnCount, 9);

  // Merges: A1:I2, A3:C3, D3:I3, A4:C4, D4:I4
  const merges = sheet.model.merges || [];
  assert.ok(merges.includes('A1:I2'));
  assert.ok(merges.includes('A3:C3'));
  assert.ok(merges.includes('D3:I3'));
  assert.ok(merges.includes('A4:C4'));
  assert.ok(merges.includes('D4:I4'));

  // Title styling
  const titleCell = sheet.getCell('A1');
  assert.equal(titleCell.value, 'LEMBAR RENCANA KERJA TAHUNAN (RKT)');
  assert.equal(titleCell.font?.bold, true);
  assert.equal(titleCell.font?.underline, true);
  assert.equal(titleCell.alignment?.horizontal, 'center');

  // Identity values
  assert.equal(sheet.getCell('A3').value, 'Nama Satuan');
  assert.equal(sheet.getCell('D3').value, 'SD NEGERI GUNUNGSARI 04 BATU');
  assert.equal(sheet.getCell('A4').value, 'NPSN');
  assert.equal(sheet.getCell('D4').value, '20536900');

  // Row 6 Header RichText & Fill & Borders
  const b6 = sheet.getCell('B6');
  assert.equal(b6.border?.top?.style, 'thin');
  assert.equal(b6.border?.left?.style, 'thin');
  assert.equal(b6.alignment?.wrapText, true);

  // Verify Row 7 data border & wrapText
  const a7 = sheet.getCell('A7');
  assert.equal(a7.value, '1.');
  assert.equal(a7.border?.bottom?.style, 'thin');
  assert.equal(sheet.getCell('G7').alignment?.horizontal, 'center');

  // Verify direct workbook API as well
  const wb = await createOfficialRktWorkbook(
    { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU' },
    rkt.items
  );
  assert.equal(wb.getWorksheet('RKT')?.rowCount, 6 + rkt.items.length);
});
