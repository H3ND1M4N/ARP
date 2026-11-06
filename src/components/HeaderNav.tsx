import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  LogIn,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Printer,
  Compass,
} from 'lucide-react';
import { SchoolProfile } from '../data/simantapData';

interface HeaderNavProps {
  currentSchool: SchoolProfile;
  currentRole: 'public' | 'school' | 'supervisor';
  onRoleChange: (role: 'public' | 'school' | 'supervisor') => void;
  onOpenRegionalSelector: () => void;
  onOpenLogin: () => void;
  onQuickSearchNpsn: (npsn: string) => void;
  onPrintReport: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentSchool,
  currentRole,
  onRoleChange,
  onOpenRegionalSelector,
  onOpenLogin,
  onQuickSearchNpsn,
  onPrintReport,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onQuickSearchNpsn(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Gov Agency Brand Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 text-xs text-slate-300 flex flex-wrap justify-between items-center">
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
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Status Peran:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                currentRole === 'public'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : currentRole === 'school'
                  ? 'bg-blue-900/80 text-blue-200 border border-blue-600'
                  : 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
              }`}
            >
              {currentRole === 'public'
                ? 'Pengunjung Publik'
                : currentRole === 'school'
                ? 'Operator Satuan Pendidikan'
                : 'Pengawas Pembina / Auditor Mutu'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => onRoleChange('public')}
              className={`px-2 py-0.5 rounded transition ${
                currentRole === 'public' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Ganti ke peran Publik"
            >
              Publik
            </button>
            <button
              onClick={() => onRoleChange('school')}
              className={`px-2 py-0.5 rounded transition ${
                currentRole === 'school' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Ganti ke peran Sekolah (SDN Gunungsari 04)"
            >
              Sekolah
            </button>
            <button
              onClick={() => onRoleChange('supervisor')}
              className={`px-2 py-0.5 rounded transition ${
                currentRole === 'supervisor' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Ganti ke peran Pengawas Pembina"
            >
              Pengawas
            </button>
          </div>
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

        {/* Quick NPSN & School Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari NPSN (misal: 20536900) atau nama sekolah..."
              className="w-full pl-9 pr-20 py-2 bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              aria-label="Cari NPSN atau nama sekolah"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold transition"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Actions Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegionalSelector}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Pilih Wilayah / Sekolah Lain"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Ganti Sekolah / Wilayah</span>
            <span className="md:hidden">Wilayah</span>
          </button>

          <button
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Cetak Lembar Peta Mutu Satuan Pendidikan"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 transition shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Portal Masuk</span>
          </button>
        </div>
      </div>

      {/* Hierarchical Breadcrumb Route bar */}
      <div className="bg-slate-950/80 px-4 sm:px-6 py-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center flex-wrap gap-1.5">
        <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-amber-500" />
          Rute Kode:
        </span>
        <button
          onClick={onOpenRegionalSelector}
          className="text-slate-300 hover:text-amber-400 transition underline-offset-2 hover:underline"
        >
          {currentSchool.province} ({currentSchool.provinceCode})
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button
          onClick={onOpenRegionalSelector}
          className="text-slate-300 hover:text-amber-400 transition underline-offset-2 hover:underline"
        >
          {currentSchool.city} ({currentSchool.cityCode})
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button
          onClick={onOpenRegionalSelector}
          className="text-slate-300 hover:text-amber-400 transition underline-offset-2 hover:underline"
        >
          {currentSchool.district} ({currentSchool.districtCode})
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
          {currentSchool.name} (NPSN: {currentSchool.npsn})
        </span>
      </div>
    </header>
  );
};
