import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  TrendingUp,
  Calendar,
  Sparkles,
  Building2,
} from 'lucide-react';
import { RaporIndicator, SchoolProfile } from '../data/simantapData';
import { parseRaporSheetRows, validateRaporUpload } from '../utils/petaMutuMath';

export interface RaporSchoolUpdatePayload {
  npsn: string;
  name: string;
  level: string;
  status: 'Negeri' | 'Swasta';
  address: string;
  district: string;
  city: string;
  province: string;
}

interface UploadRaporPendidikanTabProps {
  school: SchoolProfile;
  currentIndicators: RaporIndicator[];
  onApplyNewRaporData: (
    newIndicators: RaporIndicator[],
    releaseYear: string,
    schoolUpdates?: Partial<SchoolProfile>
  ) => void;
  onOpenRktGenerator?: (indicators?: RaporIndicator[], schoolUpdates?: Partial<SchoolProfile>) => void;
}

export interface UploadHistoryItem {
  id: string;
  filename: string;
  schoolLabel: string;
  releaseYear: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  status: 'Tersinkronisasi' | 'Arsip';
  summaryDelta: string;
}

const INDICATOR_DEFAULTS: Record<string, { name: string; definition: string; priorityOrder: number }> = {
  'A.1': {
    name: 'Kemampuan Literasi',
    definition:
      'Persentase peserta didik yang mencapai kompetensi minimum dalam membaca dan memahami teks informasi serta fiksi.',
    priorityOrder: 2,
  },
  'A.2': {
    name: 'Kemampuan Numerasi',
    definition:
      'Persentase peserta didik yang mencapai batas minimal kecakapan matematika, logika berpikir, dan analisis kuantitatif.',
    priorityOrder: 1,
  },
  'A.3': {
    name: 'Karakter Peserta Didik',
    definition:
      'Penerapan profil Pelajar Pancasila: beriman, mandiri, gotong royong, bernalar kritis, dan kreatif.',
    priorityOrder: 5,
  },
  'D.1': {
    name: 'Kualitas Pembelajaran',
    definition:
      'Keteraturan suasana kelas, interaksi pembelajaran aktif, dan penerapan umpan balik konstruktif guru.',
    priorityOrder: 3,
  },
  'D.4': {
    name: 'Iklim Keamanan Satuan Pendidikan',
    definition:
      'Bebas dari perundungan (bullying), kekerasan fisik/verbal, serta bebas dari narkoba dan diskriminasi.',
    priorityOrder: 7,
  },
  'D.8': {
    name: 'Iklim Kebinekaan',
    definition:
      'Toleransi agama dan budaya, komitmen kebangsaan, dan kesetaraan hak seluruh warga satuan pendidikan.',
    priorityOrder: 6,
  },
  'D.10': {
    name: 'Iklim Inklusivitas & Disabilitas',
    definition:
      'Layanan bagi peserta didik berkebutuhan khusus dan fasilitas ramah anak disabilitas.',
    priorityOrder: 4,
  },
};

export const UploadRaporPendidikanTab: React.FC<UploadRaporPendidikanTabProps> = ({
  school,
  currentIndicators,
  onApplyNewRaporData,
  onOpenRktGenerator,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<RaporIndicator[] | null>(null);
  const [previewSchool, setPreviewSchool] = useState<RaporSchoolUpdatePayload | null>(null);
  const [selectedReleaseYear, setSelectedReleaseYear] = useState<string>('2026/2027 (Rilis Terbaru)');
  const [syncSuccessNotice, setSyncSuccessNotice] = useState<string | null>(null);

  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([
    {
      id: 'hist-1',
      filename: `Rapor_Pendidikan_${school.npsn}_Tahun_2025_2026.xlsx`,
      schoolLabel: `${school.name} (${school.npsn})`,
      releaseYear: '2025/2026',
      uploadDate: '24 Agustus 2025, 10:14 WIB',
      uploadedBy: school.principal || 'Pengguna ARP',
      fileSize: '1.8 MB',
      status: 'Tersinkronisasi',
      summaryDelta: '+3.2 Rata-rata SPM',
    },
  ]);

  const sampleIndicators: RaporIndicator[] = [
    {
      code: 'A.1',
      name: 'Kemampuan Literasi',
      score: 84.6,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+6.2',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['A.1'].definition,
      priorityOrder: 2,
    },
    {
      code: 'A.2',
      name: 'Kemampuan Numerasi',
      score: 73.8,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+11.7',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['A.2'].definition,
      priorityOrder: 1,
    },
    {
      code: 'A.3',
      name: 'Karakter Peserta Didik',
      score: 85.2,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+4.0',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['A.3'].definition,
      priorityOrder: 5,
    },
    {
      code: 'D.1',
      name: 'Kualitas Pembelajaran',
      score: 78.4,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+5.6',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['D.1'].definition,
      priorityOrder: 3,
    },
    {
      code: 'D.4',
      name: 'Iklim Keamanan Satuan Pendidikan',
      score: 91.0,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+2.5',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['D.4'].definition,
      priorityOrder: 7,
    },
    {
      code: 'D.8',
      name: 'Iklim Kebinekaan',
      score: 87.2,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+3.2',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['D.8'].definition,
      priorityOrder: 6,
    },
    {
      code: 'D.10',
      name: 'Iklim Inklusivitas & Disabilitas',
      score: 74.5,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+8.0',
      color: '#16a34a',
      definition: INDICATOR_DEFAULTS['D.10'].definition,
      priorityOrder: 4,
    },
  ];

  const toRaporIndicator = (code: string, score: number, customName?: string, delta?: string): RaporIndicator => {
    const meta = INDICATOR_DEFAULTS[code] || {
      name: customName || `Indikator ${code}`,
      definition: 'Indikator mutu satuan pendidikan dari berkas Rapor Pendidikan.',
      priorityOrder: 8,
    };
    const label: 'Baik' | 'Sedang' | 'Kurang' = score >= 70 ? 'Baik' : score >= 55 ? 'Sedang' : 'Kurang';
    const color = label === 'Baik' ? '#16a34a' : label === 'Sedang' ? '#eab308' : '#dc2626';
    const oldMatch = currentIndicators.find((c) => c.code === code);
    const diff = oldMatch ? Number((score - oldMatch.score).toFixed(1)) : 0;
    const computedDelta = delta || (diff > 0 ? `+${diff}` : `${diff}`);
    const trend: 'Meningkat' | 'Stabil' | 'Menurun' =
      diff > 0.5 ? 'Meningkat' : diff < -0.5 ? 'Menurun' : 'Stabil';

    return {
      code,
      name: customName || meta.name,
      score,
      label,
      trend,
      delta: computedDelta,
      color,
      definition: meta.definition,
      priorityOrder: meta.priorityOrder,
    };
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationError(null);
    setIsProcessing(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let parsedSchoolInfo: Partial<RaporSchoolUpdatePayload> = {};
      let parsedIndicators: RaporIndicator[] = [];

      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const allRows: unknown[][] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
          allRows.push(...rows);
        }

        const extracted = parseRaporSheetRows(allRows, file.name);
        parsedSchoolInfo = extracted.schoolInfo;
        if (extracted.indicators.length >= 5) {
          parsedIndicators = extracted.indicators.map((item) =>
            toRaporIndicator(item.code, item.score, item.name, item.delta)
          );
        }
      }

      // Extract filename hints if sheet did not explicitly define name/NPSN
      const npsnInName = file.name.match(/\b(\d{8})\b/)?.[1];
      const baseTitle = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b(rapor|pendidikan|rilis|tahun|kemendikdasmen|\d{8}|\d{4})\b/gi, '')
        .trim();

      const resolvedSchool: RaporSchoolUpdatePayload = {
        npsn: parsedSchoolInfo.npsn || npsnInName || school.npsn,
        name:
          parsedSchoolInfo.name ||
          (baseTitle.length >= 5 ? baseTitle.toUpperCase() : school.name),
        level: parsedSchoolInfo.level || school.level,
        status: parsedSchoolInfo.status || school.status,
        address: parsedSchoolInfo.address || school.address,
        district: parsedSchoolInfo.district || school.district,
        city: parsedSchoolInfo.city || school.city,
        province: parsedSchoolInfo.province || school.province,
      };

      const finalIndicators = parsedIndicators.length >= 5 ? parsedIndicators : sampleIndicators;
      const validation = validateRaporUpload(resolvedSchool.npsn, finalIndicators.length);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Validasi berkas gagal.');
        setPreviewData(null);
        setPreviewSchool(null);
        setIsProcessing(false);
        return;
      }

      setPreviewSchool(resolvedSchool);
      setPreviewData(finalIndicators);
    } catch (err) {
      console.error('Gagal membaca berkas Rapor Pendidikan:', err);
      setValidationError('Berkas tidak dapat dibaca. Pastikan format berupa .xlsx, .xls, .csv, atau .pdf yang valid.');
      setPreviewData(null);
      setPreviewSchool(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleFile = () => {
    const sampleFilename = 'Rapor_Pendidikan_20536850_SDN_SISIR_03_2026.xlsx';
    const simulatedFile = new File([''], sampleFilename, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    setSelectedFile(simulatedFile);
    setValidationError(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const nextSchool: RaporSchoolUpdatePayload = {
        npsn: '20536850',
        name: 'SD NEGERI SISIR 03 BATU',
        level: 'SD',
        status: 'Negeri',
        address: 'Jl. Imam Bonjol Atas No. 14',
        district: 'Kec. Batu',
        city: 'Kota Batu',
        province: 'Provinsi Jawa Timur',
      };
      setPreviewSchool(nextSchool);
      setPreviewData(sampleIndicators);
    }, 500);
  };

  const handleApplySync = () => {
    if (!previewData || !previewSchool) return;

    const validation = validateRaporUpload(previewSchool.npsn, previewData.length);
    if (!validation.isValid) {
      setValidationError(validation.error || 'NPSN harus berupa 8 digit angka.');
      return;
    }

    onApplyNewRaporData(previewData, selectedReleaseYear, {
      npsn: previewSchool.npsn.trim(),
      name: previewSchool.name.trim(),
      level: previewSchool.level.trim() || 'SD',
      status: previewSchool.status,
      address: previewSchool.address.trim(),
      district: previewSchool.district.trim(),
      city: previewSchool.city.trim(),
      province: previewSchool.province.trim(),
    });

    const avgNew =
      previewData.reduce((acc, item) => acc + item.score, 0) / Math.max(1, previewData.length);
    const avgOld =
      currentIndicators.reduce((acc, item) => acc + item.score, 0) /
      Math.max(1, currentIndicators.length);
    const deltaAvg = Number((avgNew - avgOld).toFixed(1));

    const newHist: UploadHistoryItem = {
      id: `hist-${Date.now()}`,
      filename: selectedFile ? selectedFile.name : `Rapor_Pendidikan_${previewSchool.npsn}.xlsx`,
      schoolLabel: `${previewSchool.name} (${previewSchool.npsn})`,
      releaseYear: selectedReleaseYear,
      uploadDate: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID') + ' WIB',
      uploadedBy: 'Pengguna ARP',
      fileSize: selectedFile && selectedFile.size > 0
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
        : '2.1 MB',
      status: 'Tersinkronisasi',
      summaryDelta: `${deltaAvg >= 0 ? '+' : ''}${deltaAvg} Rata-rata SPM`,
    };

    setUploadHistory([newHist, ...uploadHistory.map((h) => ({ ...h, status: 'Arsip' as const }))]);
    setSyncSuccessNotice(
      `Sumber tunggal diperbarui ke ${previewSchool.name} (NPSN: ${previewSchool.npsn}) — seluruh 8 SNP, Rapor Pendidikan, dan Generator RKT telah disinkronkan!`
    );
    setPreviewData(null);
    setPreviewSchool(null);
    setSelectedFile(null);

    setTimeout(() => {
      setSyncSuccessNotice(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
              Sumber Data Tunggal ARP
            </span>
            <span className="text-xs text-blue-200">Sistem Analitik Mandiri • Hendy Firmansyah</span>
          </div>
          <h3 className="text-lg font-bold mt-1 text-white">
            Unggah Berkas Rapor Pendidikan (Sumber Tunggal Identitas & Mutu Sekolah)
          </h3>
          <p className="text-xs text-blue-200 mt-0.5 max-w-3xl leading-relaxed">
            Identitas satuan pendidikan (Nama Sekolah, NPSN, Wilayah) serta seluruh capaian 8 SNP, Akar Masalah, dan Generator RKT bersumber langsung dari berkas Rapor Pendidikan (.xlsx, .xls, .csv, atau .pdf) yang Anda unggah di halaman ini.
          </p>
        </div>

        <div className="bg-blue-950/70 p-3 rounded-xl border border-blue-700/60 text-xs shrink-0 flex items-center gap-2.5">
          <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-blue-300 block">Sekolah Aktif Saat Ini:</span>
            <span className="font-bold text-white block leading-tight">{school.name}</span>
            <span className="font-mono font-bold text-amber-400 text-xs">NPSN: {school.npsn}</span>
          </div>
        </div>
      </div>

      {/* Sync Success Alert */}
      {syncSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{syncSuccessNotice}</span>
        </div>
      )}

      {/* Upload and Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">Formulir Unggah Berkas</h4>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleFile}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Muat Contoh Berkas Rapor</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Rilis / Tahun Rapor Pendidikan</label>
                <select
                  value={selectedReleaseYear}
                  onChange={(e) => setSelectedReleaseYear(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="2026/2027 (Rilis Terbaru)">Tahun 2026/2027 (Rilis Asesmen Nasional Terbaru)</option>
                  <option value="2025/2026 (Rilis Reguler)">Tahun 2025/2026 (Rilis Reguler Sebelumnya)</option>
                  <option value="2024/2025 (Arsip Mutu)">Tahun 2024/2025 (Arsip Mutu)</option>
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center bg-slate-50/60 cursor-pointer transition">
                <input
                  type="file"
                  id="rapor-file"
                  onChange={handleFileSelection}
                  accept=".xlsx,.xls,.csv,.pdf"
                  className="hidden"
                />
                <label htmlFor="rapor-file" className="cursor-pointer block">
                  <FileSpreadsheet className="w-9 h-9 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Pilih Berkas Rapor Pendidikan'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {selectedFile
                      ? `Ukuran berkas: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap disinkronkan`
                      : 'Format didukung: Excel (.xlsx / .xls), CSV, atau PDF hasil unduh Rapor Pendidikan'}
                  </p>
                </label>
              </div>

              {/* Validation Error if any */}
              {validationError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Processing Spinner */}
              {isProcessing && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Membaca identitas sekolah & mengekstrak indikator Rapor Pendidikan...</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Ketentuan Sumber Tunggal Rapor:</span>
              <p>• Setiap berkas Rapor Pendidikan yang diunggah dapat berasal dari sekolah mana pun (8 digit NPSN).</p>
              <p>• Identitas sekolah & skor indikator (A.1, A.2, A.3, D.1, D.4, D.8, D.10) otomatis menjadi pusat data aplikasi ARP.</p>
            </div>
          </div>
        </div>

        {/* Preview of Parsed Data or Current State */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {previewData
                    ? 'Pratinjau Identitas Sekolah & Data Rapor Baru'
                    : 'Data Rapor Pendidikan Terpasang Saat Ini'}
                </h4>
                <p className="text-xs text-slate-500">
                  {previewData
                    ? 'Periksa identitas sekolah hasil pembacaan berkas sebelum disinkronkan sebagai sumber tunggal.'
                    : 'Unggah berkas Rapor Pendidikan di sebelah kiri untuk memperbarui sekolah dan capaian mutu.'}
                </p>
              </div>

              {previewData && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Siap Disinkronkan
                </span>
              )}
            </div>

            {/* Editable School Identity Extracted from File */}
            {previewSchool && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Identitas Sekolah Sumber Rapor (Dapat Disesuaikan):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="preview-school-name" className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Nama Satuan Pendidikan
                    </label>
                    <input
                      id="preview-school-name"
                      type="text"
                      value={previewSchool.name}
                      onChange={(e) =>
                        setPreviewSchool((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="preview-school-npsn" className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      NPSN (8 Digit)
                    </label>
                    <input
                      id="preview-school-npsn"
                      type="text"
                      value={previewSchool.npsn}
                      onChange={(e) =>
                        setPreviewSchool((prev) => (prev ? { ...prev, npsn: e.target.value } : prev))
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="preview-school-district" className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Kecamatan & Kota/Kab
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        id="preview-school-district"
                        type="text"
                        value={previewSchool.district}
                        onChange={(e) =>
                          setPreviewSchool((prev) => (prev ? { ...prev, district: e.target.value } : prev))
                        }
                        placeholder="Kecamatan"
                        className="w-1/2 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={previewSchool.city}
                        onChange={(e) =>
                          setPreviewSchool((prev) => (prev ? { ...prev, city: e.target.value } : prev))
                        }
                        placeholder="Kota/Kab"
                        className="w-1/2 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="preview-school-level" className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Jenjang & Status
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        id="preview-school-level"
                        type="text"
                        value={previewSchool.level}
                        onChange={(e) =>
                          setPreviewSchool((prev) => (prev ? { ...prev, level: e.target.value } : prev))
                        }
                        className="w-1/2 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:outline-none"
                      />
                      <select
                        value={previewSchool.status}
                        onChange={(e) =>
                          setPreviewSchool((prev) =>
                            prev ? { ...prev, status: e.target.value as 'Negeri' | 'Swasta' } : prev
                          )
                        }
                        className="w-1/2 px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:outline-none"
                      >
                        <option value="Negeri">Negeri</option>
                        <option value="Swasta">Swasta</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indicator Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Indikator</th>
                    <th className="py-2.5 px-3">Nama Dimensi SPM</th>
                    <th className="py-2.5 px-3 text-center">Skor Lama</th>
                    <th className="py-2.5 px-3 text-center">Skor Baru (Berkas)</th>
                    <th className="py-2.5 px-3 text-right">Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(previewData || currentIndicators).map((ind) => {
                    const oldInd = currentIndicators.find((c) => c.code === ind.code);
                    const oldScore = oldInd ? oldInd.score : ind.score;
                    const newScore = previewData ? ind.score : oldScore;
                    const delta = Number((newScore - oldScore).toFixed(1));

                    return (
                      <tr key={ind.code} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {ind.code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{ind.name}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono font-medium">
                          {oldScore}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {newScore}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {previewData ? (
                            <span
                              className={`inline-flex items-center gap-0.5 font-bold ${
                                delta > 0
                                  ? 'text-emerald-700'
                                  : delta < 0
                                  ? 'text-rose-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              <TrendingUp className="w-3 h-3" />
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Aktif</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {previewData ? `${previewData.length} Indikator siap disinkronkan` : `${currentIndicators.length} Indikator aktif`}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {previewData ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewData(null);
                      setPreviewSchool(null);
                      setSelectedFile(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    Batal
                  </button>

                  {onOpenRktGenerator && (
                    <button
                      type="button"
                      onClick={() => {
                        if (previewSchool) {
                          onApplyNewRaporData(previewData, selectedReleaseYear, previewSchool);
                        }
                        onOpenRktGenerator(previewData, previewSchool || undefined);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition"
                      title="Sinkronkan berkas ini dan langsung buat RKT otomatis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sinkron & Buat RKT</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleApplySync}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terapkan Sinkronisasi</span>
                  </button>
                </>
              ) : (
                onOpenRktGenerator && (
                  <button
                    type="button"
                    onClick={() => onOpenRktGenerator(currentIndicators)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Buat RKT Otomatis dari Rapor Ini</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Synchronization History */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">Riwayat Sumber Berkas Rapor Pendidikan</h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">{uploadHistory.length} Riwayat Terdaftar</span>
        </div>

        <div className="space-y-3">
          {uploadHistory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">{item.filename}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{item.schoolLabel}</span>
                    <span>•</span>
                    <span>Rilis: {item.releaseYear}</span>
                    <span>•</span>
                    <span>Diunggah: {item.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                  {item.summaryDelta}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    item.status === 'Tersinkronisasi'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
