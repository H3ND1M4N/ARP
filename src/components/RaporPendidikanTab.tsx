import React from 'react';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Compass,
  Sparkles,
} from 'lucide-react';
import { RaporIndicator } from '../data/simantapData';

interface RaporPendidikanTabProps {
  indicators: RaporIndicator[];
  onOpenAiRecommendation: (indicatorCode: string) => void;
}

export const RaporPendidikanTab: React.FC<RaporPendidikanTabProps> = ({
  indicators,
  onOpenAiRecommendation,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
            Rapor Pendidikan 2026
          </span>
          <h3 className="text-lg font-bold mt-1.5">
            Capaian Standar Pelayanan Minimal (SPM) Satuan Pendidikan
          </h3>
          <p className="text-xs text-blue-200 mt-0.5 max-w-2xl">
            Hasil evaluasi mutu berdasarkan Asesmen Nasional (ANBK), Survei Karakter, dan Survei Lingkungan Belajar (Sulinjar) yang diselaraskan dengan instrumen analitik Peta Mutu karya Hendy Firmansyah.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/60 p-3 rounded-xl border border-blue-700/50 text-xs shrink-0">
          <div className="text-center px-3 border-r border-blue-700">
            <span className="text-[10px] text-blue-300 block">Indikator Baik</span>
            <span className="text-lg font-bold text-emerald-400">5 Indikator</span>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] text-amber-300 block">Perlu Peningkatan</span>
            <span className="text-lg font-bold text-amber-400">2 Indikator</span>
          </div>
        </div>
      </div>

      {/* Grid of Rapor Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => {
          const isWarning = ind.label === 'Sedang' || ind.label === 'Kurang';

          return (
            <div
              key={ind.code}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isWarning
                  ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {ind.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        ind.label === 'Baik'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {ind.label === 'Baik' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      Capaian {ind.label}
                    </span>
                  </div>

                  {isWarning && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full uppercase">
                      Prioritas Benahi
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">{ind.name}</h4>

                <div className="my-3 flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-black ${
                      ind.score >= 70 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {ind.score}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                  <span className="text-xs font-semibold text-emerald-700 ml-auto flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {ind.delta} vs Thn Lalu
                  </span>
                </div>

                {/* Score bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${ind.score}%`,
                      backgroundColor: ind.score >= 70 ? '#16a34a' : '#d97706',
                    }}
                  ></div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{ind.definition}</p>
              </div>

              {/* Action Recommendation Button */}
              <button
                onClick={() => onOpenAiRecommendation(ind.code)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  isWarning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisis AI Solusi {ind.code}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
