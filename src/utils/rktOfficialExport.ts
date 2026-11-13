import * as XLSX from 'xlsx';
import { RktActionItem } from './petaMutuMath';

export interface OfficialRktColumnDef {
  colLetter: string;
  key: keyof OfficialRktRow;
  title: string;
  subtitle: string;
}

export interface OfficialRktRow {
  no: string;
  namaSnp: string;
  identifikasi: string;
  akarMasalah: string;
  kegiatanBenahi: string;
  penjelasanImplementasi: string;
  butuhBiaya: 'Ya' | 'Tidak';
  kodeArkasNon: string;
  kegiatanArkasNon: string;
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
  },
  {
    colLetter: 'B',
    key: 'namaSnp',
    title: 'Nama SNP',
    subtitle: 'Tuliskan nama Standar Nasional Pendidikan',
  },
  {
    colLetter: 'C',
    key: 'identifikasi',
    title: 'Identifikasi',
    subtitle: 'Nama indikator yang menjadi prioritas perbaikan layanan di tahun mendatang',
  },
  {
    colLetter: 'D',
    key: 'akarMasalah',
    title: 'Akar Masalah',
    subtitle:
      'Identifikasi akar masalah dari indikator yang ingin diperbaiki (dapat ditinjau dari indikator Rapor Pendidikan atau penyebab lain yang menurut Anda relevan)',
  },
  {
    colLetter: 'E',
    key: 'kegiatanBenahi',
    title: 'Kegiatan Benahi',
    subtitle: 'Kegiatan untuk menyelesaikan akar masalah',
  },
  {
    colLetter: 'F',
    key: 'penjelasanImplementasi',
    title: 'Penjelasan Implementasi Kegiatan',
    subtitle: 'Rincian kegiatan yang lebih spesifik sebagai turunan dari kegiatan benahi.',
  },
  {
    colLetter: 'G',
    key: 'butuhBiaya',
    title: 'Apakah Kegiatan Membutuhkan Biaya?',
    subtitle: 'Diisi dengan "Ya" / "Tidak".',
  },
  {
    colLetter: 'H',
    key: 'kodeArkasNon',
    title: 'Kode ARKAS/NON',
    subtitle:
      'Masukkan kode rekening ARKAS jika Anda ingin menganggarkan kegiatan benahi ke ARKAS. Kosongi kode ini juga kegiatan tidak dibutuhkan biaya.',
  },
  {
    colLetter: 'I',
    key: 'kegiatanArkasNon',
    title: 'Kegiatan ARKAS/NON',
    subtitle:
      'Padanan nama kegiatan jika Anda ingin menganggarkan kegiatan benahi ke ARKAS/NON.',
  },
] as const;

export function mapRaporCodeToSnp(raporCode: string, arkasCode?: string): string {
  const code = raporCode.trim().toUpperCase();
  const arkas = (arkasCode || '').trim();

  if (code.startsWith('E.')) return 'STANDAR PEMBIAYAAN';
  if (code === 'A.1') {
    return arkas.startsWith('03.05') ? 'STANDAR SARANA DAN PRASARANA' : 'STANDAR KOMPETENSI LULUSAN';
  }
  if (code === 'A.2') {
    return arkas.startsWith('02.04') ? 'STANDAR PTK' : 'STANDAR KOMPETENSI LULUSAN';
  }
  if (code === 'A.3') return 'STANDAR KOMPETENSI LULUSAN';
  if (code.startsWith('C.')) return 'STANDAR PTK';
  if (code === 'D.1' || code === 'D.2' || code === 'D.3') return 'STANDAR PROSES';
  if (code === 'D.4' || code === 'D.6' || code === 'D.8') return 'STANDAR PENGELOLAAN';
  if (code === 'D.10') return 'STANDAR PROSES';
  if (code.startsWith('B.')) return 'STANDAR PENILAIAN';
  return 'STANDAR PENGELOLAAN';
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
  const code = item.raporCode.trim().toUpperCase();
  const lookup: Record<string, string> = {
    'A.1': 'Pengadaan Buku Pengayaan Literasi Non-Teks dan Revitalisasi Pojok Baca',
    'A.2': 'Peningkatan Kompetensi Guru Numerasi & Pengadaan Alat Peraga Edukatif',
    'A.3': 'Penyelenggaraan Kegiatan Projek Penguatan Profil Pelajar Pancasila (P5)',
    'D.4': 'Penyelenggaraan: Pencegahan Perundungan, Kekerasan, dan Kampanye Sekolah Ramah Anak',
    'D.8': 'Penyelenggaraan Pekan Budaya, Kebinekaan, dan Dialog Toleransi Inklusif',
    'D.10': 'Pengembangan Layanan Pendidikan Inklusif & Penyediaan Media Ramah Disabilitas',
  };
  return lookup[code] || item.activityName;
}

/**
 * Converts active RKT items into exact 9-column Format_RKT_2026 rows
 * while preserving every indicator and obeying the Ya/Tidak + Kode ARKAS/NON rules.
 */
export function mapRktItemsToOfficialRows(items: RktActionItem[]): OfficialRktRow[] {
  return items.map((item, idx) => {
    const isZeroCost =
      Boolean(item.isNonArkas) || item.fundingSource === 'Non-Biaya' || item.estimatedBudget <= 0;
    const needsCost: 'Ya' | 'Tidak' = isZeroCost ? 'Tidak' : 'Ya';
    const snpName = mapRaporCodeToSnp(item.raporCode, item.arkasCode);
    const cleanedArkas =
      needsCost === 'Tidak'
        ? ''
        : item.arkasCode && item.arkasCode !== 'NON-ARKAS'
        ? `${item.arkasCode}. (${snpName
            .replace('STANDAR ', 'Standar ')
            .replace(/\b\w+/g, (w) =>
              w === 'PTK' || w === 'DAN'
                ? w === 'DAN'
                  ? 'dan'
                  : 'PTK'
                : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            )})`
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
      kegiatanArkasNon: getOfficialEquivalentActivityName(item, needsCost === 'Ya'),
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
    ['Nama Satuan', '', school.name, '', '', '', '', '', ''],
    ['NPSN', '', school.npsn, '', '', '', '', '', ''],
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

export function createOfficialRktWorkbook(
  school: { name: string; npsn: string },
  items: RktActionItem[]
): XLSX.WorkBook {
  const rows = mapRktItemsToOfficialRows(items);
  const matrix = buildOfficialRktSheetMatrix(school, rows);
  const worksheet = XLSX.utils.aoa_to_sheet(matrix);

  // Merge title and school identity fields exactly as in Format_RKT_2026.xlsx
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 8 } }, // A1:I2 Title
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // A3:B3 Nama Satuan label
    { s: { r: 2, c: 2 }, e: { r: 8, c: 8 } }, // fallback fixed below
  ];

  // Fix exact merges carefully (row 2 col 2..8, row 3 col 0..1, row 3 col 2..8)
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 8 } }, // A1:I2 Title
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // A3:B3 Nama Satuan label
    { s: { r: 2, c: 2 }, e: { r: 2, c: 8 } }, // C3:I3 Nama Satuan value
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, // A4:B4 NPSN label
    { s: { r: 3, c: 2 }, e: { r: 3, c: 8 } }, // C4:I4 NPSN value
  ];

  // Column widths proportional to Format_RKT_2026.xlsx
  worksheet['!cols'] = [
    { wch: 6 },  // A: No
    { wch: 24 }, // B: Nama SNP
    { wch: 30 }, // C: Identifikasi
    { wch: 36 }, // D: Akar Masalah
    { wch: 38 }, // E: Kegiatan Benahi
    { wch: 42 }, // F: Penjelasan Implementasi Kegiatan
    { wch: 18 }, // G: Apakah Kegiatan Membutuhkan Biaya?
    { wch: 24 }, // H: Kode ARKAS/NON
    { wch: 40 }, // I: Kegiatan ARKAS/NON
  ];

  // Row heights
  worksheet['!rows'] = [
    { hpt: 28 }, // Row 1
    { hpt: 20 }, // Row 2
    { hpt: 22 }, // Row 3 Nama Satuan
    { hpt: 22 }, // Row 4 NPSN
    { hpt: 10 }, // Row 5 blank spacer
    { hpt: 90 }, // Row 6 multiline column headers
    ...rows.map(() => ({ hpt: 54 })),
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'RKT');
  return workbook;
}

export function downloadOfficialRktXlsx(
  school: { name: string; npsn: string },
  items: RktActionItem[],
  academicYear: string = '2026'
): string {
  const workbook = createOfficialRktWorkbook(school, items);
  const yearTag = academicYear.replace(/[^0-9]/g, '').slice(0, 4) || '2026';
  const safeNpsn = (school.npsn || 'SEKOLAH').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = `Format_RKT_${yearTag}_${safeNpsn}.xlsx`;
  XLSX.writeFile(workbook, filename);
  return filename;
}
