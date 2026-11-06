import React from 'react';
import {
  GitMerge,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_ROOT_CAUSES } from '../data/simantapData';

interface RootCauseTabProps {
  onSelectActionToArkas: (actionText: string) => void;
  onLaunchAiThinking: (focus: string) => void;
}

export const RootCauseTab: React.FC<RootCauseTabProps> = ({
  onSelectActionToArkas,
  onLaunchAiThinking,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Analisis Akar Masalah (Root Cause Analysis PBD)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            ARP mengidentifikasi korelasi kausalitas antar 8 Standar Nasional Pendidikan (SNP) untuk menemukan akar permasalahan sesungguhnya di balik capaian indikator yang masih berwarna kuning/merah.
          </p>
        </div>

        <button
          onClick={() => onLaunchAiThinking('Akar Masalah Numerasi & Sarpras')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/20 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analisis Mendalam AI (Thinking Mode)</span>
        </button>
      </div>

      {/* Root Cause Cards */}
      <div className="space-y-6">
        {DEFAULT_ROOT_CAUSES.map((rc) => (
          <div
            key={rc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header of Issue */}
            <div className="bg-amber-500/10 px-6 py-4 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Masalah Teridentifikasi (Level Output)
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{rc.issueIndicator}</h4>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Skor Sekarang</span>
                  <span className="font-bold text-amber-700 text-sm">{rc.currentScore}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Target Minimal</span>
                  <span className="font-bold text-emerald-700 text-sm">{rc.targetScore}</span>
                </div>
              </div>
            </div>

            {/* Tree Branching of Root Causes */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Faktor Penyebab Berdasarkan Standar Terkait:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rc.rootCauses.map((cause, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {cause.level}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Penyebab #{idx + 1}</span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 mb-1.5">{cause.factor}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {cause.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80">
                      <div className="flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mb-2.5">
                        <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] text-emerald-900">Rekomendasi Pembenahan:</strong>
                          <span className="text-[11px] leading-tight text-emerald-800">
                            {cause.suggestedAction}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectActionToArkas(cause.suggestedAction)}
                        className="w-full py-1.5 text-xs text-slate-700 hover:text-amber-700 font-semibold flex items-center justify-center gap-1 hover:bg-slate-100 rounded transition"
                      >
                        <span>Lihat Alokasi di ARKAS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
