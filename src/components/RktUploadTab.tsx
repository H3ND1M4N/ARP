import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck2,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Send,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { RktDocument, SchoolProfile, RaporIndicator } from '../data/simantapData';
import { RktActionItem } from '../utils/petaMutuMath';
import { RktGeneratorWorkbench } from './RktGeneratorWorkbench';
import { RktOfficialOutputTab } from './RktOfficialOutputTab';

interface RktUploadTabProps {
  documents: RktDocument[];
  school: SchoolProfile;
  indicators: RaporIndicator[];
  rktItems?: RktActionItem[];
  onRktItemsChange?: (items: RktActionItem[]) => void;
  onOpenOfficialOutput?: () => void;
  onUploadNewDocument: (doc: Omit<RktDocument, 'id'>) => void;
  onUpdateValidationStatus: (
    id: string,
    status: 'Menunggu Validasi' | 'Disetujui' | 'Perlu Perbaikan',
    notes: string
  ) => void;
  onTriggerAiRefinement?: (prompt: string) => void;
  activeSubView?: 'generator' | 'output' | 'upload';
  onChangeSubView?: (view: 'generator' | 'output' | 'upload') => void;
}

export const RktUploadTab: React.FC<RktUploadTabProps> = ({
  documents,
  school,
  indicators,
  rktItems,
  onRktItemsChange,
  onOpenOfficialOutput,
  onUploadNewDocument,
  onUpdateValidationStatus,
  onTriggerAiRefinement,
  activeSubView,
  onChangeSubView,
}) => {
  const [internalSubView, setInternalSubView] = useState<'generator' | 'output' | 'upload'>('generator');
  const subView = activeSubView ?? internalSubView;
  const setSubView = (v: 'generator' | 'output' | 'upload') => {
    if (onChangeSubView) onChangeSubView(v);
    setInternalSubView(v);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState(`Rencana Kegiatan Tahunan (RKT) ${school.name} Tahun 2027`);
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Supervisor review state
  const [reviewDocId, setReviewDocId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Disetujui' | 'Perlu Perbaikan'>('Disetujui');
  const [reviewNotes, setReviewNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      onUploadNewDocument({
        title: uploadTitle,
        academicYear,
        uploadDate: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID') + ' WIB',
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB (PDF)` : '4.2 MB (PDF)',
        uploadedBy: school.principal || 'Pengguna ARP',
        status: 'Menunggu Validasi',
        supervisorNotes: 'Dokumen baru diunggah. Menunggu verifikasi pengawas pembina.',
      });

      setSelectedFile(null);
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1200);
  };

  const handleSupervisorSubmitReview = (docId: string) => {
    onUpdateValidationStatus(docId, reviewStatus, reviewNotes || 'Dokumen telah diverifikasi sesuai instrumen audit mutu mandiri.');
    setReviewDocId(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Sub-view Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSubView('generator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              subView === 'generator'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generator RKT Otomatis (Rapor Pendidikan)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('output')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              subView === 'output'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Hasil Output RKT (Format 9 Kolom)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              subView === 'upload'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>Unggah Manual & Arsip Dokumen RKT ({documents.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          NPSN: <strong className="text-slate-800">{school.npsn}</strong> • {school.name}
        </span>
      </div>

      {subView === 'generator' ? (
        <RktGeneratorWorkbench
          school={school}
          indicators={indicators}
          academicYear="2026/2027"
          externalItems={rktItems}
          onItemsChange={onRktItemsChange}
          onOpenOfficialOutput={onOpenOfficialOutput ?? (() => setSubView('output'))}
          onSaveToDocuments={onUploadNewDocument}
          onNavigateToDocuments={() => setSubView('upload')}
          onTriggerAiRefinement={onTriggerAiRefinement}
        />
      ) : subView === 'output' ? (
        <RktOfficialOutputTab
          school={school}
          indicators={indicators}
          rktItems={rktItems ?? []}
          academicYear="2026/2027"
        />
      ) : (
        <>
          {/* Quick Callout in Upload View */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block font-bold text-amber-950">
                  Ingin menyusun RKT otomatis tanpa membuat dokumen manual?
                </strong>
                <p className="text-amber-900 mt-0.5">
                  Gunakan fitur Generator RKT untuk memetakan capaian Rapor Pendidikan langsung ke program ARKAS dan target triwulan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubView('generator')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <span>Buka Generator RKT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notice Banner */}
          <div className="bg-amber-500/10 border border-amber-300/80 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-900 font-bold">
                Informasi Sistem Unggah RKT ARP:
              </strong>
              Format dokumen yang didukung adalah PDF atau Excel (maksimal 20 MB). Pastikan dokumen telah mencantumkan
              lembar pengesahan Kepala Sekolah dan Komite Sekolah sebelum diajukan ke Pengawas Pembina.
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <UploadCloud className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Unggah Dokumen RKT Baru</h3>
          </div>

          {uploadSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Dokumen RKT berhasil diunggah dan dikirim ke antrean verifikasi pengawas.</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Judul Dokumen Perencanaan</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran / Anggaran</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="2026/2027">Tahun Ajaran 2026 / 2027</option>
                <option value="2025/2026">Tahun Ajaran 2025 / 2026</option>
                <option value="2024/2025">Tahun Ajaran 2024 / 2025</option>
              </select>
            </div>

            {/* Drag & Drop Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-5 text-center bg-slate-50/60 cursor-pointer transition">
              <input
                type="file"
                id="rkt-file"
                onChange={handleFileChange}
                accept=".pdf,.xlsx,.xls,.docx"
                className="hidden"
              />
              <label htmlFor="rkt-file" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Pilih Berkas RKT (PDF/XLSX)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {selectedFile
                    ? `Ukuran: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : 'Seret dan lepas berkas ke sini, atau klik untuk menelusuri'}
                </p>
              </label>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Mengunggah Dokumen...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Dokumen RKT</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* History of Uploaded RKT Documents */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Riwayat Berkas RKT & Status Verifikasi</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{documents.length} Dokumen</span>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{doc.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                        <span>Tahun: {doc.academicYear}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      doc.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : doc.status === 'Perlu Perbaikan'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* Supervisor Review Notes */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Catatan Pengawas Pembina:</span>
                  </div>
                  <p className="italic text-slate-600 leading-relaxed">{doc.supervisorNotes}</p>
                </div>

                {/* Supervisor Review Action */}
                <div className="pt-2 border-t border-slate-200">
                  {reviewDocId === doc.id ? (
                    <div className="space-y-2 text-xs bg-slate-100 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800">Ubah Status Validasi:</label>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Pengawas: <strong className="text-slate-800">{school.supervisor}</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewStatus('Disetujui')}
                          className={`px-3 py-1 rounded font-bold transition ${
                            reviewStatus === 'Disetujui'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300'
                          }`}
                        >
                          Setujui RKT
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewStatus('Perlu Perbaikan')}
                          className={`px-3 py-1 rounded font-bold transition ${
                            reviewStatus === 'Perlu Perbaikan'
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300'
                          }`}
                        >
                          Minta Revisi
                        </button>
                      </div>

                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Tuliskan catatan arahan pengawas..."
                        className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 mt-2"
                        rows={2}
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReviewDocId(null)}
                          className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSupervisorSubmitReview(doc.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                        >
                          Kirim Hasil Validasi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReviewDocId(doc.id);
                        setReviewNotes(doc.supervisorNotes);
                      }}
                      className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Validasi & Catatan Pengawas ({school.supervisor})</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};
