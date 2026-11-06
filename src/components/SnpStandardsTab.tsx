import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { SnpStandardData } from '../data/simantapData';

interface SnpStandardsTabProps {
  standards: SnpStandardData[];
  selectedYear: '2026' | '2025' | '2024';
  onYearChange: (year: '2026' | '2025' | '2024') => void;
}

export const SnpStandardsTab: React.FC<SnpStandardsTabProps> = ({
  standards,
  selectedYear,
  onYearChange,
}) => {
  const [expandedStandardId, setExpandedStandardId] = useState<string | null>('snp-6'); // Default expand Sarpras
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const toggleExpand = (id: string) => {
    setExpandedStandardId(expandedStandardId === id ? null : id);
  };

  const filteredStandards = standards.filter((std) => {
    if (filterCategory === 'all') return true;
    return std.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Capaian 8 Standar Nasional Pendidikan</h3>
            <p className="text-xs text-slate-500">Klik kartu standar untuk melihat rincian indikator penilaian</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {(['2026', '2025', '2024'] as const).map((yr) => (
              <button
                key={yr}
                onClick={() => onYearChange(yr)}
                className={`px-3 py-1 rounded-md transition ${
                  selectedYear === yr
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tahun {yr}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="Sangat Baik">Sangat Baik (≥ 85)</option>
              <option value="Baik">Baik (70 - 84)</option>
              <option value="Cukup">Cukup (55 - 69)</option>
              <option value="Kurang">Kurang (&lt; 55)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of 8 Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStandards.map((std, idx) => {
          const isExpanded = expandedStandardId === std.id;
          const currentScore =
            selectedYear === '2026' ? std.score : selectedYear === '2025' ? std.score2025 : std.score2024;
          const delta = (std.score - std.score2025).toFixed(1);
          const isPositiveDelta = Number(delta) >= 0;

          return (
            <div
              key={std.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isExpanded ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(std.id)}
                className="p-5 cursor-pointer hover:bg-slate-50/60 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {std.name} ({std.code})
                      </h4>
                      <span className="text-[11px] text-slate-500">Target SNP: {std.target}.0</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-black ${
                        currentScore >= 80
                          ? 'text-emerald-600'
                          : currentScore >= 70
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {currentScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 100</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 my-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentScore}%`,
                      backgroundColor: std.color,
                    }}
                  ></div>
                </div>

                {/* Badges footer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        std.category === 'Sangat Baik'
                          ? 'bg-emerald-100 text-emerald-800'
                          : std.category === 'Baik'
                          ? 'bg-blue-100 text-blue-800'
                          : std.category === 'Cukup'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {std.category}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      ⭐ {((currentScore / 100) * 7).toFixed(2)}/7.00
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="flex items-center gap-0.5 text-[11px]">
                      <TrendingUp className={`w-3 h-3 ${isPositiveDelta ? 'text-emerald-600' : 'text-rose-600'}`} />
                      <span className={isPositiveDelta ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                        {isPositiveDelta ? `+${delta}` : delta} vs 2025
                      </span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Indicators Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 bg-slate-50/80 border-t border-slate-100 space-y-2.5 animate-fadeIn">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Indikator Instrumen Peta Mutu:
                  </p>
                  {std.indicators.map((ind) => (
                    <div
                      key={ind.code}
                      className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-bold text-slate-800 px-1.5 py-0.5 rounded bg-slate-100 text-[11px]">
                            {ind.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{ind.name}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{ind.description}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900 text-sm">{ind.score}</span>
                          <span className="text-[10px] text-slate-400 block">Target: {ind.target}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
