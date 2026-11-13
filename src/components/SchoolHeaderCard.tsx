import React from 'react';
import {
  MapPin,
  CheckCircle,
  Building,
  User,
  UserCheck,
} from 'lucide-react';
import { SchoolProfile } from '../data/simantapData';

interface SchoolHeaderCardProps {
  school: SchoolProfile;
  overallScore: number;
  scaled7: number;
  category: string;
  onUpdateSchool?: (updates: Partial<SchoolProfile>) => void;
}

export const SchoolHeaderCard: React.FC<SchoolHeaderCardProps> = ({
  school,
  overallScore,
  scaled7,
  category,
  onUpdateSchool,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* School Info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 shrink-0">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Jenjang {school.level} ({school.status})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                NPSN: {school.npsn}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Akreditasi {school.accreditation} ({school.accreditationScore})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {school.curriculum}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {school.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {school.address}, Desa {school.village}, {school.district}, {school.city}, {school.province} ({school.postalCode})
              </span>
            </div>

            {/* Input Manual Kepala Sekolah, Pengawas, dan NIP */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl">
              <div className="bg-slate-50/90 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-kepala-sekolah" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 cursor-pointer">
                    <User className="w-3 h-3 text-amber-600" />
                    <span>Kepala Sekolah</span>
                  </label>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    Input Manual
                  </span>
                </div>
                <input
                  id="input-kepala-sekolah"
                  type="text"
                  value={school.principal}
                  onChange={(e) => onUpdateSchool?.({ principal: e.target.value })}
                  placeholder="Ketik nama Kepala Sekolah..."
                  className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                  aria-label="Input manual nama kepala sekolah"
                />
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                  <label htmlFor="input-nip-kepala-sekolah" className="text-[10px] font-bold text-slate-500 shrink-0 cursor-pointer">
                    NIP.
                  </label>
                  <input
                    id="input-nip-kepala-sekolah"
                    type="text"
                    value={school.principalNip}
                    onChange={(e) => onUpdateSchool?.({ principalNip: e.target.value })}
                    placeholder="Ketik NIP Kepala Sekolah..."
                    className="w-full bg-transparent text-[11px] font-mono font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    aria-label="Input manual NIP kepala sekolah"
                  />
                </div>
              </div>

              <div className="bg-slate-50/90 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-pengawas" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1 cursor-pointer">
                    <UserCheck className="w-3 h-3 text-blue-600" />
                    <span>Pengawas Pembina</span>
                  </label>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    Input Manual
                  </span>
                </div>
                <input
                  id="input-pengawas"
                  type="text"
                  value={school.supervisor}
                  onChange={(e) => onUpdateSchool?.({ supervisor: e.target.value })}
                  placeholder="Ketik nama Pengawas Pembina..."
                  className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                  aria-label="Input manual nama pengawas"
                />
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                  <label htmlFor="input-nip-pengawas" className="text-[10px] font-bold text-slate-500 shrink-0 cursor-pointer">
                    NIP.
                  </label>
                  <input
                    id="input-nip-pengawas"
                    type="text"
                    value={school.supervisorNip}
                    onChange={(e) => onUpdateSchool?.({ supervisorNip: e.target.value })}
                    placeholder="Ketik NIP Pengawas Pembina..."
                    className="w-full bg-transparent text-[11px] font-mono font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    aria-label="Input manual NIP pengawas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score Badge Card */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-inner border border-slate-700 shrink-0 min-w-[240px]">
          <div className="text-center border-r border-slate-700 pr-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Indeks Peta Mutu
            </span>
            <span className="text-3xl font-black text-amber-400 leading-none block my-1">
              {overallScore}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Predikat {category}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Skala 7 Bintang SNP:</span>
              <span className="font-bold text-white text-base">⭐ {scaled7} / 7.00</span>
            </div>
            <p className="text-[10px] text-amber-300 font-medium">Audit Mutu Mandiri HF</p>
          </div>
        </div>
      </div>
    </div>
  );
};
