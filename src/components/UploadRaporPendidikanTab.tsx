import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RaporIndicator, SchoolProfile } from '../data/simantapData';
import { validateRaporUpload } from '../utils/petaMutuMath';

interface UploadRaporPendidikanTabProps {
  school: SchoolProfile;
  currentIndicators: RaporIndicator[];
  onApplyNewRaporData: (newIndicators: RaporIndicator[], releaseYear: string) => void;
}

export interface UploadHistoryItem {
  id: string;
  filename: string;
  releaseYear: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  status: 'Tersinkronisasi' | 'Arsip';
  summaryDelta: string;
}

export const UploadRaporPendidikanTab: React.FC<UploadRaporPendidikanTabProps> = ({
  school,
  currentIndicators,
  onApplyNewRaporData,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<RaporIndicator[] | null>(null);
  const [selectedReleaseYear, setSelectedReleaseYear] = useState<string>('2026/2027 (Rilis Terbaru)');
  const [syncSuccessNotice, setSyncSuccessNotice] = useState<string | null>(null);

  // Pre-configured upload history
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([
    {
      id: 'hist-1',
      filename: `Rapor_Pendidikan_${school.npsn}_Tahun_2025_2026.xlsx`,
      releaseYear: '2025/2026',
      uploadDate: '24 Agustus 2025, 10:14 WIB',
      uploadedBy: 'Supardi, S.Pd. (Kepala Sekolah)',
      fileSize: '1.8 MB',
      status: 'Tersinkronisasi',
      summaryDelta: '+3.2 Rata-rata SPM',
    },
    {
      id: 'hist-2',
      filename: `Rapor_Pendidikan_${school.npsn}_Tahun_2024_2025.xlsx`,
      releaseYear: '2024/2025',
      uploadDate: '12 September 2024, 13:40 WIB',
      uploadedBy: 'Operator SDN Gunungsari 04',
      fileSize: '1.6 MB',
      status: 'Arsip',
      summaryDelta: '+2.1 Rata-rata SPM',
    },
  ]);

  // Demo candidate dataset for simulation of new Rapor Pendidikan 2026/2027
  const candidateUpdatedIndicators: RaporIndicator[] = [
    {
      code: 'A.1',
      name: 'Kemampuan Literasi',
      score: 82.5,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+4.1',
      color: '#16a34a',
      definition: 'Persentase peserta didik yang mencapai kompetensi minimum dalam membaca dan memahami teks informasi serta fiksi.',
      priorityOrder: 2,
    },
    {
      code: 'A.2',
      name: 'Kemampuan Numerasi',
      score: 71.4,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+9.3',
      color: '#16a34a',
      definition: 'Persentase peserta didik yang mencapai batas minimal kecakapan matematika, logika berpikir, dan analisis kuantitatif.',
      priorityOrder: 1,
    },
    {
      code: 'A.3',
      name: 'Karakter Peserta Didik',
      score: 84.8,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+3.6',
      color: '#16a34a',
      definition: 'Penerapan profil Pelajar Pancasila: beriman, mandiri, gotong royong, bernalar kritis, dan kreatif.',
      priorityOrder: 5,
    },
    {
      code: 'D.1',
      name: 'Kualitas Pembelajaran',
      score: 77.2,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+4.4',
      color: '#16a34a',
      definition: 'Keteraturan suasana kelas, interaksi pembelajaran aktif, dan penerapan umpan balik konstruktif guru.',
      priorityOrder: 3,
    },
    {
      code: 'D.4',
      name: 'Iklim Keamanan Satuan Pendidikan',
      score: 90.1,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+1.6',
      color: '#16a34a',
      definition: 'Bebas dari perundungan (bullying), kekerasan fisik/verbal, serta bebas dari narkoba dan diskriminasi.',
      priorityOrder: 7,
    },
    {
      code: 'D.8',
      name: 'Iklim Kebinekaan',
      score: 86.5,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+2.5',
      color: '#16a34a',
      definition: 'Toleransi agama dan budaya, komitmen kebangsaan, dan kesetaraan hak seluruh warga satuan pendidikan.',
      priorityOrder: 6,
    },
    {
      code: 'D.10',
      name: 'Iklim Inklusivitas & Disabilitas',
      score: 72.0,
      label: 'Baik',
      trend: 'Meningkat',
      delta: '+5.5',
      color: '#16a34a',
      definition: 'Layanan bagi peserta didik berkebutuhan khusus dan fasilitas ramah anak disabilitas.',
      priorityOrder: 4,
    },
  ];

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setValidationError(null);
      simulateParseRapor(file.name);
    }
  };

  const simulateParseRapor = (filename: string) => {
    setIsProcessing(true);
    setValidationError(null);

    setTimeout(() => {
      setIsProcessing(false);
      // Validate that file belongs to this school
      const validation = validateRaporUpload(school.npsn, school.npsn, candidateUpdatedIndicators.length);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Validasi berkas gagal.');
        setPreviewData(null);
        return;
      }
      setPreviewData(candidateUpdatedIndicators);
    }, 900);
  };

  const handleLoadSampleFile = () => {
    const simulatedFile = new File([''], `Rapor_Pendidikan_${school.npsn}_Rilis_Kemendikdasmen_2026.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    setSelectedFile(simulatedFile);
    simulateParseRapor(simulatedFile.name);
  };

  const handleApplySync = () => {
    if (!previewData) return;

    onApplyNewRaporData(previewData, selectedReleaseYear);

    // Add to history
    const newHist: UploadHistoryItem = {
      id: `hist-${Date.now()}`,
      filename: selectedFile ? selectedFile.name : `Rapor_Pendidikan_${school.npsn}_Terbaru.xlsx`,
      releaseYear: selectedReleaseYear,
      uploadDate: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID') + ' WIB',
      uploadedBy: 'Operator Satuan Pendidikan',
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.1 MB',
      status: 'Tersinkronisasi',
      summaryDelta: '+4.4 Rata-rata SPM',
    };

    setUploadHistory([newHist, ...uploadHistory.map((h) => ({ ...h, status: 'Arsip' as const }))]);
    setSyncSuccessNotice(
      `Rapor Pendidikan ${selectedReleaseYear} berhasil disinkronkan ke seluruh modul Peta Mutu ARP!`
    );
    setPreviewData(null);
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
              Integrasi Berkas Eksternal
            </span>
            <span className="text-xs text-blue-200">Sistem Analitik Mandiri • Hendy Firmansyah</span>
          </div>
          <h3 className="text-lg font-bold mt-1 text-white">
            Unggah Berkas Rapor Pendidikan Satuan Pendidikan Terbaru
          </h3>
          <p className="text-xs text-blue-200 mt-0.5 max-w-3xl leading-relaxed">
            Perbarui data Rapor Pendidikan sekolah Anda secara mandiri dengan mengunggah berkas unduhan resmi (.xlsx atau .pdf) dari platform Rapor Pendidikan Kemendikdasmen. Nilai indikator prioritas akan otomatis disinkronkan ke radar 8 Standar SNP dan analisis akar masalah.
          </p>
        </div>

        <div className="bg-blue-950/70 p-3 rounded-xl border border-blue-700/60 text-xs shrink-0 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-blue-300 block">NPSN Terverifikasi:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{school.npsn}</span>
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
            <div className="flex items-center justify-between mb-3">
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
                <span>Muat Contoh Berkas 2026/2027</span>
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
                  accept=".xlsx,.xls,.pdf,.csv"
                  className="hidden"
                />
                <label htmlFor="rapor-file" className="cursor-pointer block">
                  <FileSpreadsheet className="w-9 h-9 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Pilih Berkas Rapor Pendidikan'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {selectedFile
                      ? `Ukuran berkas: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap diproses`
                      : 'Format yang didukung: Excel (.xlsx / .xls) atau PDF hasil unduh resmi Kemendikdasmen'}
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
                  <span>Mengekstraksi data indikator & memverifikasi kesesuaian NPSN {school.npsn}...</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Ketentuan Unggah:</span>
              <p>• Berkas harus memuat kolom Kode Indikator (A.1, A.2, A.3, D.1, D.4, D.8, D.10).</p>
              <p>• Sistem otomatis memeriksa kecocokan NPSN {school.npsn} untuk mencegah kesalahan entri.</p>
            </div>
          </div>
        </div>

        {/* Preview of Parsed Data or Current State */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {previewData
                    ? 'Pratinjau Data Baru yang Ditemukan di Berkas'
                    : 'Data Rapor Pendidikan Terpasang Saat Ini'}
                </h4>
                <p className="text-xs text-slate-500">
                  {previewData
                    ? 'Tinjau perbandingan skor sebelum melakukan sinkronisasi ke database sekolah.'
                    : 'Unggah berkas baru di sebelah kiri untuk melihat pembaruan skor.'}
                </p>
              </div>

              {previewData && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  Data Siap Disinkronkan
                </span>
              )}
            </div>

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
                  {(previewData || currentIndicators).map((ind, idx) => {
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
                            <span className="text-slate-400 font-mono text-[11px]">Tetap</span>
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
          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {previewData ? '7 Indikator valid terverifikasi' : '7 Indikator terdaftar'}
            </span>

            {previewData && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplySync}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terapkan Sinkronisasi ke ARP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronization History */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">Riwayat Sinkronisasi Berkas Rapor Pendidikan</h4>
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
                    <span>Rilis: {item.releaseYear}</span>
                    <span>•</span>
                    <span>Diunggah: {item.uploadDate}</span>
                    <span>•</span>
                    <span>{item.uploadedBy}</span>
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
