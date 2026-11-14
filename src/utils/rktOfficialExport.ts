import ExcelJS from 'exceljs';
import { ARKAS_KEMENDIKDASMEN_CATALOG } from '../data/simantapData';
import { RktActionItem } from './petaMutuMath';

export interface OfficialRktColumnDef {
  colLetter: string;
  key: keyof OfficialRktRow;
  title: string;
  subtitle: string;
  width: number;
}

export interface OfficialRktRow {
  no: string;
  namaSnp: string;
  identifikasi: string;
  akarMasalah: string;
  kegiatanBenahi: string;
  penjelasanImplementasi: string;
  butuhBiaya: 'ya' | 'tidak';
  kodeArkasNon: string;
  kegiatanArkasNon: string;
  quarterTimeline?: ('TW1' | 'TW2' | 'TW3' | 'TW4')[];
  estimatedBudget?: number;
}

/**
 * Exact 9 columns matching Format_RKT_2026.xlsx (sheet "RKT") without adding or removing any column.
 */
export const OFFICIAL_RKT_COLUMNS: readonly OfficialRktColumnDef[] = [
  {
    colLetter: 'A',
    key: 'no',
    title: 'No',
    subtitle: '',
    width: 6,
  },
  {
    colLetter: 'B',
    key: 'namaSnp',
    title: 'Nama SNP',
    subtitle: 'Tuliskan nama Standar Nasional Pendidikan',
    width: 22,
  },
  {
    colLetter: 'C',
    key: 'identifikasi',
    title: 'Identifikasi',
    subtitle: 'Nama indikator yang menjadi prioritas perbaikan layanan di tahun mendatang',
    width: 28,
  },
  {
    colLetter: 'D',
    key: 'akarMasalah',
    title: 'Akar Masalah',
    subtitle:
      'Identifikasi akar masalah dari indikator yang ingin diperbaiki (dapat ditinjau dari indikator Rapor Pendidikan atau penyebab lain yang menurut Anda relevan)',
    width: 34,
  },
  {
    colLetter: 'E',
    key: 'kegiatanBenahi',
    title: 'Kegiatan Benahi',
    subtitle: 'Kegiatan untuk menyelesaikan akar masalah',
    width: 38,
  },
  {
    colLetter: 'F',
    key: 'penjelasanImplementasi',
    title: 'Penjelasan Implementasi Kegiatan',
    subtitle: 'Rincian kegiatan yang lebih spesifik sebagai turunan dari kegiatan benahi.',
    width: 34,
  },
  {
    colLetter: 'G',
    key: 'butuhBiaya',
    title: 'Apakah Kegiatan Membutuhkan Biaya?',
    subtitle: 'Diisi dengan "Ya" / "Tidak".',
    width: 20,
  },
  {
    colLetter: 'H',
    key: 'kodeArkasNon',
    title: 'Kode ARKAS/NON',
    subtitle:
      'Masukkan kode rekening ARKAS jika Anda ingin menganggarkan kegiatan benahi ke ARKAS. Kosongi kode ini juga kegiatan tidak dibutuhkan biaya.',
    width: 24,
  },
  {
    colLetter: 'I',
    key: 'kegiatanArkasNon',
    title: 'Kegiatan ARKAS/NON',
    subtitle:
      'Padanan nama kegiatan jika Anda ingin menganggarkan kegiatan benahi ke ARKAS/NON.',
    width: 34,
  },
] as const;

export function mapRaporCodeToSnp(raporCode: string, arkasCode?: string): string {
  const code = raporCode.trim().toUpperCase();
  const arkas = (arkasCode || '').trim();

  if (code.startsWith('E.')) return 'STANDAR PEMBIAYAAN';
  if (code === 'A.1') {
    if (arkas.startsWith('02.02')) return 'STANDAR ISI';
    if (arkas.startsWith('03.05') || arkas.startsWith('05.')) return 'STANDAR SARANA DAN PRASARANA';
    return 'STANDAR KOMPETENSI LULUSAN';
  }
  if (code === 'A.2') {
    if (arkas.startsWith('04.06') || arkas.startsWith('02.04')) return 'STANDAR PTK';
    if (arkas.startsWith('03.')) return 'STANDAR PROSES';
    return 'STANDAR KOMPETENSI LULUSAN';
  }
  if (code === 'A.3') return 'STANDAR KOMPETENSI LULUSAN';
  if (code.startsWith('C.')) return 'STANDAR PTK';
  if (code === 'D.1' || code === 'D.2' || code === 'D.3') return 'STANDAR PROSES';
  if (code === 'D.4' || code === 'D.6' || code === 'D.8') return 'STANDAR PENGELOLAAN';
  if (code === 'D.10') return 'STANDAR PROSES';
  if (code.startsWith('B.')) return 'STANDAR PENILAIAN';
  return 'STANDAR PENGELOLAAN';
}

function resolveArkasStandardLabel(arkasCode: string, fallbackSnp: string): string {
  const clean = arkasCode.trim();
  const found = ARKAS_KEMENDIKDASMEN_CATALOG.find((entry) => entry.code === clean);
  if (found) return found.standardLabel;

  if (clean.startsWith('01.')) return 'Standar Kompetensi Lulusan';
  if (clean.startsWith('02.')) return 'Standar Isi';
  if (clean.startsWith('03.')) return 'Standar Proses';
  if (clean.startsWith('04.')) return 'Standar PTK';
  if (clean.startsWith('05.')) return 'Standar Sarpras';
  if (clean.startsWith('06.')) return 'Standar Pengelolaan';
  if (clean.startsWith('07.')) return 'Standar Pembiayaan';
  if (clean.startsWith('08.')) return 'Standar Penilaian';

  return fallbackSnp
    .replace('STANDAR ', 'Standar ')
    .replace(/\b\w+/g, (w) =>
      w === 'PTK'
        ? 'PTK'
        : w === 'DAN'
        ? 'dan'
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
}

function getAkarMasalahSubCode(raporCode: string, rootCause: string): string {
  const code = raporCode.trim().toUpperCase();
  const subMap: Record<string, string> = {
    'A.1': 'A.1.1 Kompetensi membaca teks informasi dan sastra',
    'A.2': 'A.2.1 Kompetensi pada domain Bilangan, Aljabar, Geometri, dan Data',
    'A.3': 'A.3.1 Beriman, bertakwa kepada Tuhan YME, berakhlak mulia, dan gotong royong',
    'D.1': 'D.1.1 Manajemen kelas, dukungan psikologis, dan metode pembelajaran',
    'D.4': 'D.4.1 Kesejahteraan psikologis murid, perundungan, dan keamanan sekolah',
    'D.8': 'D.8.1 Toleransi agama, budaya, komitmen kebangsaan, dan kesetaraan',
    'D.10': 'D.10.1 Layanan disabilitas, cerdas istimewa, dan sikap inklusif',
    'E.2': 'E.2.1 Proporsi Pembelanjaan Peningkatan Mutu Guru dan Tenaga Kependidikan',
  };

  const prefix = subMap[code];
  if (!prefix) return rootCause;
  if (rootCause.toUpperCase().startsWith(code)) return rootCause;
  return `${prefix} — ${rootCause}`;
}

function getOfficialEquivalentActivityName(item: RktActionItem, needsCost: boolean): string {
  if (!needsCost) {
    return `Penyelenggaraan (Non-ARKAS): ${item.activityName}`;
  }
  const cleanArkas = (item.arkasCode || '').trim();
  const catalogMatch = ARKAS_KEMENDIKDASMEN_CATALOG.find((c) => c.code === cleanArkas);
  if (catalogMatch) {
    if (cleanArkas === '04.06.05') return 'Peningkatan Kompetensi Guru';
    return catalogMatch.name;
  }

  const code = item.raporCode.trim().toUpperCase();
  const lookup: Record<string, string> = {
    'A.1': 'Pengembangan Perpustakaan dan Penyediaan Buku Bacaan Bermutu',
    'A.2': 'Peningkatan Kompetensi Guru & Pengembangan Kegiatan Literasi dan Numerasi',
    'A.3': 'Pengembangan Pembelajaran Berbasis Projek (P5)',
    'D.1': 'Kegiatan Diskusi Kolaborasi Pengembangan RPP/Modul Ajar (Kombel/KKG)',
    'D.4': 'Penerapan Program Pencegahan Perundungan dan Penanganan Kekerasan (PPKSP)',
    'D.8': 'Penyelenggaraan Pembelajaran Berbasis Projek Kebinekaan & Toleransi',
    'D.10': 'Pengadaan Media Pembelajaran Adaptif & Pengayaan TIK Layanan Inklusif',
    'E.2': 'Peningkatan Kompetensi Guru',
  };
  return lookup[code] || item.activityName;
}

/**
 * Converts active RKT items into exact 9-column Format_RKT_2026 rows
 * while preserving every indicator and obeying the ya/tidak + Kode ARKAS/NON rules.
 */
export function mapRktItemsToOfficialRows(items: RktActionItem[]): OfficialRktRow[] {
  return items.map((item, idx) => {
    const isZeroCost =
      Boolean(item.isNonArkas) || item.fundingSource === 'Non-Biaya' || item.estimatedBudget <= 0;
    const needsCost: 'ya' | 'tidak' = isZeroCost ? 'tidak' : 'ya';
    const snpName = mapRaporCodeToSnp(item.raporCode, item.arkasCode);
    const arkasClean = (item.arkasCode || '').trim().replace(/\.$/, '');
    const cleanedArkas =
      needsCost === 'tidak'
        ? ''
        : arkasClean && !arkasClean.toUpperCase().includes('NON-ARKAS')
        ? `${arkasClean}. (${resolveArkasStandardLabel(arkasClean, snpName)})`
        : '';

    return {
      no: `${idx + 1}.`,
      namaSnp: snpName,
      identifikasi: `${item.raporCode} ${item.raporName}`.trim(),
      akarMasalah: getAkarMasalahSubCode(item.raporCode, item.rootCause),
      kegiatanBenahi: item.programName,
      penjelasanImplementasi: item.activityName,
      butuhBiaya: needsCost,
      kodeArkasNon: cleanedArkas,
      kegiatanArkasNon: getOfficialEquivalentActivityName(item, needsCost === 'ya'),
      quarterTimeline: item.quarterTimeline,
      estimatedBudget: item.estimatedBudget,
    };
  });
}

/**
 * Builds the exact 2D cell matrix matching Format_RKT_2026.xlsx (9 columns A-I).
 */
export function buildOfficialRktSheetMatrix(
  school: { name: string; npsn: string },
  rows: OfficialRktRow[]
): (string | number)[][] {
  const matrix: (string | number)[][] = [
    ['LEMBAR RENCANA KERJA TAHUNAN (RKT)', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['Nama Satuan', '', '', school.name, '', '', '', '', ''],
    ['NPSN', '', '', school.npsn, '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    OFFICIAL_RKT_COLUMNS.map((col) =>
      col.subtitle ? `${col.title}\n${col.subtitle}` : col.title
    ),
  ];

  for (const r of rows) {
    matrix.push([
      r.no,
      r.namaSnp,
      r.identifikasi,
      r.akarMasalah,
      r.kegiatanBenahi,
      r.penjelasanImplementasi,
      r.butuhBiaya,
      r.kodeArkasNon,
      r.kegiatanArkasNon,
    ]);
  }

  return matrix;
}

const THIN_BLACK_BORDER: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FF000000' },
};

const ALL_THIN_BORDERS: Partial<ExcelJS.Borders> = {
  top: THIN_BLACK_BORDER,
  left: THIN_BLACK_BORDER,
  bottom: THIN_BLACK_BORDER,
  right: THIN_BLACK_BORDER,
};

const GRAY_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF2F2F2' },
};

const WHITE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFFFFF' },
};

function estimateRowHeight(rowValues: string[]): number {
  let maxLines = 2;
  rowValues.forEach((val, idx) => {
    const colWidth = OFFICIAL_RKT_COLUMNS[idx]?.width ?? 24;
    const effectiveChars = Math.max(colWidth - 2, 6);
    const segments = String(val || '').split('\n');
    let lines = 0;
    for (const seg of segments) {
      lines += Math.max(1, Math.ceil(seg.length / effectiveChars));
    }
    if (lines > maxLines) maxLines = lines;
  });
  return Math.max(46, maxLines * 14 + 14);
}

/**
 * Generates an ExcelJS workbook faithfully matching Format_RKT_2026.xlsx (Screenshot 147):
 * - Sheet "RKT", strict 9 columns (A–I)
 * - Arial font, bold+underlined title A1:I2
 * - Merged A3:C3 "Nama Satuan" & D3:I3 school name, A4:C4 "NPSN" & D4:I4 npsn with #F2F2F2 labels
 * - Gray #F2F2F2 Row 6 headers with RichText (Bold title + Italic subtitle)
 * - Thin black cell borders, wrapText, middle vertical alignment, and landscape fit-to-page setup
 */
export async function createOfficialRktWorkbook(
  school: { name: string; npsn: string },
  items: RktActionItem[]
): Promise<ExcelJS.Workbook> {
  const rows = mapRktItemsToOfficialRows(items);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ARP Kemendikdasmen RKT Exporter';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('RKT', {
    views: [{ state: 'frozen', ySplit: 6, showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.25,
        footer: 0.25,
      },
    },
  });

  // Set exact 9 column widths (A-I)
  sheet.columns = OFFICIAL_RKT_COLUMNS.map((col) => ({
    key: col.key,
    width: col.width,
  }));

  // Row 1-2: Title A1:I2
  sheet.getRow(1).height = 24;
  sheet.getRow(2).height = 24;
  sheet.mergeCells('A1:I2');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'LEMBAR RENCANA KERJA TAHUNAN (RKT)';
  titleCell.font = {
    name: 'Arial',
    size: 12,
    bold: true,
    underline: true,
    color: { argb: 'FF000000' },
  };
  titleCell.alignment = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  };
  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 9; c++) {
      const cell = sheet.getCell(r, c);
      cell.fill = WHITE_FILL;
      cell.border = {
        top: r === 1 ? THIN_BLACK_BORDER : undefined,
        bottom: r === 2 ? THIN_BLACK_BORDER : undefined,
        left: c === 1 ? THIN_BLACK_BORDER : undefined,
        right: c === 9 ? THIN_BLACK_BORDER : undefined,
      };
    }
  }

  // Row 3: Nama Satuan (A3:C3 gray bold label, D3:I3 white value)
  sheet.getRow(3).height = 22;
  sheet.mergeCells('A3:C3');
  sheet.mergeCells('D3:I3');
  sheet.getCell('A3').value = 'Nama Satuan';
  sheet.getCell('D3').value = school.name || '';
  for (let c = 1; c <= 9; c++) {
    const cell = sheet.getCell(3, c);
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: c <= 3,
      color: { argb: 'FF000000' },
    };
    cell.fill = c <= 3 ? GRAY_FILL : WHITE_FILL;
    cell.border = ALL_THIN_BORDERS;
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  }

  // Row 4: NPSN (A4:C4 gray bold label, D4:I4 white value)
  sheet.getRow(4).height = 22;
  sheet.mergeCells('A4:C4');
  sheet.mergeCells('D4:I4');
  sheet.getCell('A4').value = 'NPSN';
  sheet.getCell('D4').value = school.npsn || '';
  for (let c = 1; c <= 9; c++) {
    const cell = sheet.getCell(4, c);
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: c <= 3,
      color: { argb: 'FF000000' },
    };
    cell.fill = c <= 3 ? GRAY_FILL : WHITE_FILL;
    cell.border = ALL_THIN_BORDERS;
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  }

  // Row 5: Blank spacer row matching Format_RKT_2026.xlsx
  sheet.getRow(5).height = 12;

  // Row 6: Table Column Headers (9 columns A-I with RichText Bold title + Italic subtitle)
  const headerRow = sheet.getRow(6);
  headerRow.height = 114;
  OFFICIAL_RKT_COLUMNS.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    if (col.subtitle) {
      cell.value = {
        richText: [
          {
            text: `${col.title}\n`,
            font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } },
          },
          {
            text: col.subtitle,
            font: { name: 'Arial', size: 10, italic: true, color: { argb: 'FF000000' } },
          },
        ],
      };
    } else {
      cell.value = col.title;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    }
    cell.fill = GRAY_FILL;
    cell.border = ALL_THIN_BORDERS;
    cell.alignment = {
      horizontal: col.key === 'no' ? 'center' : 'left',
      vertical: 'middle',
      wrapText: true,
    };
  });

  // Row 7+: RKT Data Rows
  rows.forEach((r, idx) => {
    const rowNumber = 7 + idx;
    const values = [
      r.no,
      r.namaSnp,
      r.identifikasi,
      r.akarMasalah,
      r.kegiatanBenahi,
      r.penjelasanImplementasi,
      r.butuhBiaya,
      r.kodeArkasNon,
      r.kegiatanArkasNon,
    ];
    const excelRow = sheet.getRow(rowNumber);
    excelRow.height = estimateRowHeight(values);

    values.forEach((val, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1);
      cell.value = val;
      cell.font = {
        name: 'Arial',
        size: 10,
        color: { argb: 'FF000000' },
      };
      cell.fill = WHITE_FILL;
      cell.border = ALL_THIN_BORDERS;
      cell.alignment = {
        horizontal:
          colIdx === 0 || colIdx === 1 || colIdx === 6 ? 'center' : 'left',
        vertical: 'middle',
        wrapText: true,
      };
    });
  });

  return workbook;
}

export async function createOfficialRktBuffer(
  school: { name: string; npsn: string },
  items: RktActionItem[]
): Promise<Uint8Array> {
  const workbook = await createOfficialRktWorkbook(school, items);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

export async function downloadOfficialRktXlsx(
  school: { name: string; npsn: string },
  items: RktActionItem[],
  academicYear: string = '2026'
): Promise<string> {
  const bytes = await createOfficialRktBuffer(school, items);
  const yearTag = academicYear.replace(/[^0-9]/g, '').slice(0, 4) || '2026';
  const safeNpsn = (school.npsn || 'SEKOLAH').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `Format_RKT_${yearTag}_${safeNpsn}.xlsx`;

  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
}
