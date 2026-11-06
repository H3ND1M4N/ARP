import React from 'react';
import {
  GraduationCap,
  Users,
  Award,
  BookOpen,
  MapPin,
  CheckCircle,
  Building,
  UserCheck,
  Zap,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import { SchoolProfile } from '../data/simantapData';

interface SchoolHeaderCardProps {
  school: SchoolProfile;
  overallScore: number;
  scaled7: number;
  category: string;
}

export const SchoolHeaderCard: React.FC<SchoolHeaderCardProps> = ({
  school,
  overallScore,
  scaled7,
  category,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
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
                <CheckCircle className="w-3 h-3 text-emerald-600" />
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

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span>
                <strong className="text-slate-700">Kepala Sekolah:</strong> {school.principal}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                <strong className="text-slate-700">Pengawas:</strong> {school.supervisor}
              </span>
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

      {/* Facilities & Metrics Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 text-xs text-slate-700">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Peserta Didik</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Users className="w-4 h-4 text-blue-600" />
            {school.studentsCount} Siswa
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Pendidik & PTK</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            {school.teachersCount} Orang
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Rombel & Kelas</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            {school.classesCount} Rombel
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Ruang Kelas</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Building className="w-4 h-4 text-purple-600" />
            {school.roomsCount} Ruang Baik
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Daya Listrik</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Zap className="w-4 h-4 text-amber-500" />
            {school.electricity}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Akses Internet</span>
          <span className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Wifi className="w-4 h-4 text-teal-600" />
            50 Mbps
          </span>
        </div>
      </div>
    </div>
  );
};
