import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { SchoolProfile, SnpStandardData, RaporIndicator } from '../data/simantapData';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  standards: SnpStandardData[];
  raporIndicators: RaporIndicator[];
  overallScore: number;
  category: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  school,
  standards,
  raporIndicators,
  overallScore,
  category,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 border border-slate-300">
        {/* Action Top Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Pratinjau Lembar Evaluasi Peta Mutu Pendidikan (by Hendy Firmansyah)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto bg-white font-serif print:p-0 print:overflow-visible text-xs leading-normal">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-700">
              SISTEM INFORMASI MANAJEMEN PETA MUTU PENDIDIKAN (ARP)
            </p>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-950 mt-0.5">
              APLIKASI PETA MUTU & PERENCANAAN BERBASIS DATA SEKOLAH
            </h2>
            <p className="text-[11px] text-slate-600 font-sans mt-0.5">
              Aplikasi Mandiri buatan: <strong>Hendy Firmansyah</strong> | Surel: hendy.HF@gmail.com | Sistem Audit Mutu Terpadu
            </p>
            <div className="border-t border-slate-900 mt-2 pt-1 font-sans">
              <span className="font-bold text-xs uppercase tracking-wider bg-slate-100 px-3 py-0.5 rounded border border-slate-300">
                LEMBAR EVALUASI PETA MUTU & REKOMENDASI ANGGARAN SEKOLAH
              </span>
            </div>
          </div>

          {/* School Identity Table */}
          <div className="mb-4 font-sans">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">
              I. IDENTITAS SATUAN PENDIDIKAN
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <div>
                <strong>Nama Sekolah:</strong> {school.name}
              </div>
              <div>
                <strong>NPSN:</strong> {school.npsn}
              </div>
              <div>
                <strong>Bentuk & Status:</strong> {school.level} ({school.status})
              </div>
              <div>
                <strong>Akreditasi:</strong> {school.accreditation} (Nilai: {school.accreditationScore})
              </div>
              <div>
                <strong>Alamat:</strong> {school.address}, Desa {school.village}
              </div>
              <div>
                <strong>Kecamatan / Kota:</strong> {school.district}, {school.city}
              </div>
              <div>
                <strong>Kepala Sekolah:</strong> {school.principal}
              </div>
              <div>
                <strong>Pengawas Pembina:</strong> {school.supervisor}
              </div>
            </div>
          </div>

          {/* 8 SNP Standard Summary Table */}
          <div className="mb-4 font-sans">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">
              II. CAPAIAN 8 STANDAR NASIONAL PENDIDIKAN (SNP)
            </h4>
            <table className="w-full border-collapse border border-slate-400 text-[11px]">
              <thead className="bg-slate-100 font-bold text-center">
                <tr>
                  <th className="border border-slate-400 p-1.5">No</th>
                  <th className="border border-slate-400 p-1.5 text-left">Standar Nasional Pendidikan</th>
                  <th className="border border-slate-400 p-1.5">Skor (0-100)</th>
                  <th className="border border-slate-400 p-1.5">Skala Bintang (0-7)</th>
                  <th className="border border-slate-400 p-1.5">Kategori</th>
                </tr>
              </thead>
              <tbody>
                {standards.map((std, i) => (
                  <tr key={std.id} className="text-center">
                    <td className="border border-slate-300 p-1">{i + 1}</td>
                    <td className="border border-slate-300 p-1 text-left font-medium">
                      {std.name} ({std.code})
                    </td>
                    <td className="border border-slate-300 p-1 font-bold">{std.score}</td>
                    <td className="border border-slate-300 p-1">{std.scale7}</td>
                    <td className="border border-slate-300 p-1 font-semibold">{std.category}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold text-center">
                  <td colSpan={2} className="border border-slate-400 p-1.5 text-right pr-3">
                    RATA-RATA INDEKS MUTU SATUAN PENDIDIKAN:
                  </td>
                  <td className="border border-slate-400 p-1.5 text-blue-800 font-black">{overallScore}</td>
                  <td className="border border-slate-400 p-1.5">
                    {((overallScore / 100) * 7).toFixed(2)}
                  </td>
                  <td className="border border-slate-400 p-1.5 text-emerald-800 uppercase font-black">
                    {category}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rapor Pendidikan SPM Table */}
          <div className="mb-4 font-sans">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">
              III. INDIKATOR PRIORITAS RAPOR PENDIDIKAN & SPM
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {raporIndicators.map((ind) => (
                <div key={ind.code} className="border border-slate-300 p-2 rounded">
                  <div className="flex justify-between font-bold">
                    <span>
                      {ind.code} - {ind.name}
                    </span>
                    <span className={ind.score >= 70 ? 'text-emerald-700' : 'text-amber-700'}>
                      {ind.score} ({ind.label})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">{ind.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 font-sans grid grid-cols-2 text-center text-xs">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Pengawas Pembina / Auditor Mutu</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{school.supervisor}</p>
              <p className="text-[10px] text-slate-500">NIP. 19680415 199303 1 004</p>
            </div>

            <div>
              <p>Kota Batu, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Kepala Satuan Pendidikan</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{school.principal}</p>
              <p className="text-[10px] text-slate-500">NIP. 19740922 199807 1 002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
