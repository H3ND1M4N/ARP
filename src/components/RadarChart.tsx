import React, { useState } from 'react';
import { SnpStandardData } from '../data/simantapData';

interface RadarChartProps {
  standards: SnpStandardData[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ standards }) => {
  const [activeStandard, setActiveStandard] = useState<SnpStandardData | null>(null);

  const size = 420;
  const center = size / 2;
  const radius = 150;
  const numAxes = standards.length; // 8 standards
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric polygon levels (20, 40, 60, 80, 100)
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate SVG polygon points for current 2026 scores
  const currentPoints = standards
    .map((std, i) => {
      const { x, y } = getCoordinates(i, std.score);
      return `${x},${y}`;
    })
    .join(' ');

  // Generate SVG polygon points for 2025 scores
  const prevPoints = standards
    .map((std, i) => {
      const { x, y } = getCoordinates(i, std.score2025);
      return `${x},${y}`;
    })
    .join(' ');

  // Generate SVG polygon points for Target (85)
  const targetPoints = standards
    .map((std, i) => {
      const { x, y } = getCoordinates(i, std.target);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Radar 8 Standar Nasional Pendidikan</h3>
          <p className="text-xs text-slate-500">Visualisasi Capaian Komparatif Peta Mutu Sekolah</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-blue-600">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Tahun 2026
          </span>
          <span className="flex items-center gap-1.5 font-medium text-teal-600">
            <span className="w-3 h-3 rounded-full bg-teal-400"></span>
            Tahun 2025
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-600">
            <span className="w-3 h-0.5 bg-amber-500"></span>
            Target SNP
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {/* Concentric Polygons */}
          {levels.map((lvl) => {
            const pts = Array.from({ length: numAxes })
              .map((_, i) => {
                const { x, y } = getCoordinates(i, lvl);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <g key={lvl}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={lvl === 100 ? 'none' : '3 3'}
                />
                <text
                  x={center + 4}
                  y={center - (lvl / 100) * radius + 3}
                  fontSize="9"
                  fill="#94a3b8"
                  className="font-mono"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Radial Axis Lines */}
          {standards.map((std, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={std.id}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Target SNP Polygon (Gold Dashed) */}
          <polygon
            points={targetPoints}
            fill="rgba(245, 158, 11, 0.04)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Previous Year 2025 Polygon (Teal) */}
          <polygon
            points={prevPoints}
            fill="rgba(20, 184, 166, 0.12)"
            stroke="#14b8a6"
            strokeWidth="1.8"
            strokeDasharray="2 2"
          />

          {/* Current Year 2026 Polygon (Blue Solid) */}
          <polygon
            points={currentPoints}
            fill="rgba(37, 99, 235, 0.22)"
            stroke="#2563eb"
            strokeWidth="2.5"
          />

          {/* Data Points and Axis Labels */}
          {standards.map((std, i) => {
            const { x, y } = getCoordinates(i, std.score);
            const labelCoord = getCoordinates(i, 122);
            const isHovered = activeStandard?.id === std.id;

            return (
              <g key={std.id} className="cursor-pointer" onMouseEnter={() => setActiveStandard(std)}>
                {/* Data Point Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Standard Code Label */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '600'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHovered ? '#1d4ed8' : '#334155'}
                  className="select-none"
                >
                  {std.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Info Tooltip */}
        {activeStandard && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-slate-700 pointer-events-none z-10 whitespace-nowrap">
            <p className="font-bold text-amber-400">
              {activeStandard.name} ({activeStandard.code})
            </p>
            <div className="flex items-center gap-3 mt-1 text-slate-300">
              <span>
                Skor 2026: <strong className="text-white">{activeStandard.score}</strong>
              </span>
              <span>
                Skor 2025: <strong className="text-teal-300">{activeStandard.score2025}</strong>
              </span>
              <span>
                Target: <strong className="text-amber-300">{activeStandard.target}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-4 border-t border-slate-100 text-center">
        {standards.map((std) => (
          <div
            key={std.id}
            onMouseEnter={() => setActiveStandard(std)}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              activeStandard?.id === std.id
                ? 'bg-blue-50 border-blue-300'
                : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-500 block">{std.code}</span>
            <span
              className={`text-xs font-black ${
                std.score >= 80 ? 'text-emerald-600' : std.score >= 70 ? 'text-blue-600' : 'text-amber-600'
              }`}
            >
              {std.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
