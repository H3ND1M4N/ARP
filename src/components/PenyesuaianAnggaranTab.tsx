import React, { useState } from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Coins,
  Check,
} from 'lucide-react';
import { ArkasRecommendation, SchoolProfile } from '../data/simantapData';
import { calculateSchoolBudgetAdjustment } from '../utils/petaMutuMath';

interface PenyesuaianAnggaranTabProps {
  school: SchoolProfile;
  programs: ArkasRecommendation[];
  onUpdateProgramBudget: (id: string, newBudget: number) => void;
  onSyncToArkasPlan: () => void;
}

export const PenyesuaianAnggaranTab: React.FC<PenyesuaianAnggaranTabProps> = ({
  school,
  programs,
  onUpdateProgramBudget,
  onSyncToArkasPlan,
}) => {
  // Total BOS standard calculation: 148 students * Rp 900.000
  const totalBosReguler = school.studentsCount * 900000; // Rp 133.200.000

  // State for user's available budget for PBD / Mutu (default: Rp 20.000.000)
  const [availableBudget, setAvailableBudget] = useState<number>(20000000);
  const [fundingSourceNote, setFundingSourceNote] = useState<string>('BOS Reguler (Alokasi Pembenahan Mutu)');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const budgetResult = calculateSchoolBudgetAdjustment({
    availableBudgetForMutu: availableBudget,
    totalSchoolBosBudget: totalBosReguler,
    programs: programs.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      snpStandardId: p.standardTarget,
      estimatedBudget: p.estimatedBudget,
      isNonCost: p.isNonCost,
      status: p.status,
    })),
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApplyPreset = (presetAmount: number, sourceLabel: string) => {
    setAvailableBudget(presetAmount);
    setFundingSourceNote(sourceLabel);
    setAppliedNotice(`Pagu anggaran disesuaikan ke: ${formatRupiah(presetAmount)} (${sourceLabel})`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-emerald-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded font-mono">
              Kalkulator Rekomendasi Anggaran
            </span>
            <span className="text-xs text-emerald-300 font-mono">Penyesuaian Berbasis Dana Sekolah</span>
          </div>
          <h3 className="text-lg font-bold mt-1 text-white">
            Rekomendasi Penyesuaian Anggaran Sesuai Kemampuan Finansial Sekolah
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
            Menyelaraskan kebutuhan belanja pembenahan mutu (RKT) dengan pagu dana riil yang dimiliki oleh {school.name}. Sistem secara cerdas mengidentifikasi program prioritas wajib (pantang pangkas), opsi efisiensi belanja, dan inisiatif tanpa biaya (Non-Biaya Kombel).
          </p>
        </div>

        <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-700/60 text-xs shrink-0 space-y-1">
          <span className="text-emerald-300 block text-[10px] uppercase font-bold">
            Total Dana BOS Reguler Sekolah:
          </span>
          <span className="text-lg font-black text-amber-400 font-mono block">
            {formatRupiah(totalBosReguler)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            148 Siswa × Rp 900.000 / tahun (Kota Batu)
          </span>
        </div>
      </div>

      {/* Applied preset toast notification */}
      {appliedNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Interactive Budget Adjustment Control Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Tentukan Pagu Anggaran Pembenahan Mutu (PBD) yang Dimiliki:</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Geser penggeser atau ketikkan langsung nominal dana yang siap dialokasikan sekolah.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sumber Dana Terpilih:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {fundingSourceNote}
            </span>
          </div>
        </div>

        {/* Input & Range Slider */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-7 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Batas Minimum (Rp 5.000.000)</span>
              <span className="text-emerald-700 font-bold">Pagu: {formatRupiah(availableBudget)}</span>
              <span>Maksimum PBD (Rp 50.000.000)</span>
            </div>
            <input
              type="range"
              min={5000000}
              max={50000000}
              step={500000}
              value={availableBudget}
              onChange={(e) => setAvailableBudget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0">Input Nominal (Rp):</label>
            <div className="relative flex-1">
              <input
                type="number"
                value={availableBudget}
                onChange={(e) => setAvailableBudget(Math.max(0, Number(e.target.value)))}
                step={500000}
                className="w-full py-2 px-3 pl-8 text-sm font-bold font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Simulation Scenario Presets */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pilihan Skenario Kapasitas Finansial Sekolah (1-Klik):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleApplyPreset(14000000, 'Skenario Anggaran Hemat (BOS Terbatas)')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                availableBudget === 14000000
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-900">1. Skenario Pagu Hemat</span>
                <span className="font-mono font-bold text-amber-700">Rp 14.000.000</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Fokus intervensi prioritas utama numerasi & efisiensi operasional.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(20000000, 'Skenario Standar BOS Reguler (20-25% Belanja Mutu)')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                availableBudget === 20000000
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-900">2. Skenario Standar BOS</span>
                <span className="font-mono font-bold text-emerald-700">Rp 20.000.000</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Kebutuhan program RKT saat ini (Rp 19.700.000) terpenuhi seimbang.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(35000000, 'Skenario Optimal (BOS Reguler + BOS Kinerja / BPOPP)')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                availableBudget === 35000000
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900">3. Skenario Optimal PBD</span>
                <span className="font-mono font-bold text-blue-700">Rp 35.000.000</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Pagu surplus untuk akselerasi pengadaan buku perpustakaan & media TIK.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Balance Summary Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Pagu Dana Tersedia Sekolah
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {formatRupiah(budgetResult.availableBudget)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">Kapasitas belanja mutu</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Usulan Kebutuhan RKT
          </span>
          <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">
            {formatRupiah(budgetResult.totalProposed)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">Dari 7 program pembenahan</span>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            budgetResult.isBalanced
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block">
            {budgetResult.isBalanced ? 'Surplus / Sisa Anggaran' : 'Defisit Anggaran'}
          </span>
          <span
            className={`text-2xl font-black font-mono mt-1 block ${
              budgetResult.isBalanced ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {budgetResult.isBalanced
              ? `+ ${formatRupiah(budgetResult.remainingBudget)}`
              : `- ${formatRupiah(Math.abs(budgetResult.remainingBudget))}`}
          </span>
          <span className="text-xs font-semibold mt-0.5 block">
            {budgetResult.isBalanced ? 'Status Pagu Terpenuhi' : 'Perlu Penyesuaian Program'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Alokasi Wajib (Tier 1)
            </span>
            <span className="text-xl font-black text-amber-700 font-mono mt-1 block">
              {formatRupiah(budgetResult.tier1Budget)}
            </span>
            <span className="text-[11px] text-slate-500">Numerasi & Sarpras Utama</span>
          </div>

          <button
            type="button"
            onClick={onSyncToArkasPlan}
            className="mt-2 w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Sinkron ke ARKAS</span>
          </button>
        </div>
      </div>

      {/* Detailed Recommendations Plan Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Rencana Tindak Lanjut Penyesuaian Anggaran Otomatis
              </h4>
              <p className="text-[11px] text-slate-400">
                Strategi penyesuaian yang disusun secara berjenjang berdasarkan tingkat urgensi mutu
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              budgetResult.isBalanced
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {budgetResult.isBalanced ? 'Mode Alokasi Aman & Optimal' : 'Mode Efisiensi Terarah'}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Tier 1 Mandatory Programs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prioritas Utama / Tier 1 (Wajib Dianggarkan Sesuai Kemampuan Sekolah):
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    ARKAS: 03.01.08
                  </span>
                  <span className="font-mono font-black text-emerald-800">Rp 5.200.000</span>
                </div>
                <p className="font-bold text-slate-900">
                  Pengadaan Alat Peraga Edukatif Matematika (Kit Manipulatif dan Geometri)
                </p>
                <p className="text-[11px] text-slate-600">
                  <strong>Justifikasi:</strong> Langsung mengatasi akar masalah skor terendah Standar Sarpras (62.4) dan kompetensi Numerasi (62.1).
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    ARKAS: 02.04.03
                  </span>
                  <span className="font-mono font-black text-emerald-800">Rp 3.500.000</span>
                </div>
                <p className="font-bold text-slate-900">
                  Peningkatan Kompetensi Guru dalam Pembelajaran Numerasi dan Diferensiasi
                </p>
                <p className="text-[11px] text-slate-600">
                  <strong>Justifikasi:</strong> Memperbaiki Standar Proses (68.1) agar guru tidak hanya ceramah rumus melainkan PBL kontekstual.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Non-Cost Initiatives (Non-ARKAS / Tidak Berbayar) */}
          <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-teal-700" />
                <h5 className="font-bold text-teal-950">
                  Kegiatan Tidak Berbayar / Non-ARKAS (Rp 0 - Tanpa Membebani BOS):
                </h5>
              </div>
              <span className="px-2 py-0.5 bg-teal-200/80 text-teal-900 font-bold rounded text-[10px]">
                {programs.filter((p) => p.isNonCost).length} Program Non-ARKAS
              </span>
            </div>
            <ul className="text-slate-700 leading-relaxed text-[11px] space-y-1 list-disc pl-4">
              {programs
                .filter((p) => p.isNonCost)
                .map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong> ({p.code} · Rp 0)
                  </li>
                ))}
            </ul>
          </div>

          {/* Section 3: Conditional Guidance (Deficit Reductions vs Surplus Expansions) */}
          {!budgetResult.isBalanced ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Rekomendasi Penyesuaian Pemangkasan Biaya (Mengatasi Defisit):</span>
              </div>

              <div className="space-y-2 text-xs">
                {budgetResult.recommendedReductions.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-900 bg-white px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                          {rec.code}
                        </span>
                        <span className="font-bold text-slate-900">{rec.programName}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{rec.recommendation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">Potensi Penghematan</span>
                      <span className="font-mono font-bold text-rose-700">
                        {formatRupiah(rec.savedAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Rekomendasi Pemanfaatan Sisa Pagu ({formatRupiah(budgetResult.remainingBudget)}):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {budgetResult.recommendedSurplusActions.map((action, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-slate-800 flex flex-col justify-between"
                  >
                    <p className="text-[11px] leading-relaxed mb-2">{action}</p>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Rekomendasi Analitik HF #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
