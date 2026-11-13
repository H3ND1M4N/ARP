import React from 'react';
import {
  Building2,
  MapPin,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  LogOut,
  UserCircle2,
} from 'lucide-react';
import { SchoolProfile } from '../data/simantapData';

interface HeaderNavProps {
  currentSchool: SchoolProfile;
  loggedInUser: string;
  onOpenUploadRapor: () => void;
  onPrintReport: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentSchool,
  loggedInUser,
  onOpenUploadRapor,
  onPrintReport,
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Brand Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 text-xs text-slate-300 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Peta Mutu Sekolah Mandiri
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Aplikasi Pengembangan Mutu Pendidikan buatan <span className="text-amber-300 font-bold">Hendy Firmansyah</span>
          </span>
        </div>
        <div className="text-slate-400 text-[11px] flex items-center gap-2 font-mono">
          <UserCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pengguna: <strong className="text-slate-200">{loggedInUser}</strong></span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-950/40 border border-amber-400/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                <span className="text-amber-400">ARP</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                by Hendy Firmansyah
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Aplikasi Rekomendasi & Peta Mutu Pendidikan • Dikembangkan oleh Hendy Firmansyah
            </p>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenUploadRapor}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition"
            title="Sumber Data Tunggal dari Upload File Rapor Pendidikan"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sumber Data: Upload Rapor Pendidikan</span>
          </button>

          <button
            type="button"
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Cetak Lembar Peta Mutu Satuan Pendidikan"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-700/70 transition"
            title="Keluar ke Halaman Login"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Single-source School Identity Breadcrumb bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center flex-wrap gap-1.5">
        <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          Identitas Rapor Aktif:
        </span>
        <span className="text-slate-300">{currentSchool.province}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-300">{currentSchool.city}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-300">{currentSchool.district}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
          {currentSchool.name} (NPSN: {currentSchool.npsn})
        </span>
      </div>
    </header>
  );
};
