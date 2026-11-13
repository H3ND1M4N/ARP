import React, { useMemo, useState } from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { SchoolProfile, RaporIndicator } from '../data/simantapData';
import { RktActionItem } from '../utils/petaMutuMath';
import {
  OFFICIAL_RKT_COLUMNS,
  mapRktItemsToOfficialRows,
  downloadOfficialRktXlsx,
} from '../utils/rktOfficialExport';

interface RktOfficialOutputTabProps {
  school: SchoolProfile;
  indicators: RaporIndicator[];
  rktItems: RktActionItem[];
  academicYear?: string;
}

export const RktOfficialOutputTab: React.FC<RktOfficialOutputTabProps> = ({
  school,
  indicators,
  rktItems,
  academicYear = '2026/2027',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [costFilter, setCostFilter] = useState<'all' | 'Ya' | 'Tidak'>('all');
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(null);

  const officialRows = useMemo(() => mapRktItemsToOfficialRows(rktItems), [rktItems]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return officialRows.filter((row) => {
      const matchCost = costFilter === 'all' || row.butuhBiaya === costFilter;
      if (!q) return matchCost;
      const matchQuery =
        row.namaSnp.toLowerCase().includes(q) ||
        row.identifikasi.toLowerCase().includes(q) ||
        row.akarMasalah.toLowerCase().includes(q) ||
        row.kegiatanBenahi.toLowerCase().includes(q) ||
        row.penjelasanImplementasi.toLowerCase().includes(q) ||
        row.kodeArkasNon.toLowerCase().includes(q) ||
        row.kegiatanArkasNon.toLowerCase().includes(q);
      return matchCost && matchQuery;
    });
  }, [officialRows, searchQuery, costFilter]);

  const stats = useMemo(() => {
    const paidCount = officialRows.filter((r) => r.butuhBiaya === 'Ya').length;
    const unpaidCount = officialRows.filter((r) => r.butuhBiaya === 'Tidak').length;
    const uniqueIndicators = new Set(officialRows.map((r) => r.identifikasi)).size;
    return {
      totalRows: officialRows.length,
      paidCount,
      unpaidCount,
      uniqueIndicators,
    };
  }, [officialRows]);

  const handleDownloadExcel = () => {
    const filename = downloadOfficialRktXlsx(school, rktItems, academicYear);
    setDownloadedFilename(filename);
    setTimeout(() => {
      setDownloadedFilename(null);
    }, 6000);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs font-semibold text-amber-400">
            Output RKT Format Resmi · 9 Kolom Tetap (Sheet RKT)
          </p>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Hasil Output Lembar Rencana Kerja Tahunan (RKT)
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Menampilkan format standar 9 kolom (No, Nama SNP, Identifikasi, Akar Masalah, Kegiatan Benahi,
            Penjelasan Implementasi Kegiatan, Apakah Kegiatan Membutuhkan Biaya?, Kode ARKAS/NON, dan Kegiatan ARKAS/NON)
            sesuai seluruh indikator Rapor Pendidikan {school.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Cetak Lembar RKT</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {downloadedFilename && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            File Excel resmi <strong className="font-mono">{downloadedFilename}</strong> berhasil dibuat dan diunduh (9 kolom standar, sheet <strong className="font-mono">RKT</strong>).
          </span>
        </div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Struktur Kolom File</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">9 Kolom</span>
          <span className="text-[11px] text-slate-500">Kolom A–I sesuai template RKT</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Indikator Rapor</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
            {stats.uniqueIndicators || indicators.length} Indikator
          </span>
          <span className="text-[11px] text-slate-500">{stats.totalRows} baris kegiatan benahi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Butuh Biaya ("Ya")</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block tabular-nums">
            {stats.paidCount} Baris
          </span>
          <span className="text-[11px] text-slate-500">Terpetakan kode rekening ARKAS</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Non-Biaya ("Tidak")</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block tabular-nums">
            {stats.unpaidCount} Baris
          </span>
          <span className="text-[11px] text-slate-500">Non-ARKAS (kode dikosongkan)</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SNP, indikator identifikasi, akar masalah, atau kode ARKAS/NON..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-600 font-medium whitespace-nowrap">Kebutuhan Biaya:</span>
          <select
            aria-label="Filter Kebutuhan Biaya Output RKT"
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value as 'all' | 'Ya' | 'Tidak')}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua ({officialRows.length})</option>
            <option value="Ya">Ya — Berbayar ARKAS ({stats.paidCount})</option>
            <option value="Tidak">Tidak — Non-ARKAS ({stats.unpaidCount})</option>
          </select>
        </div>
      </div>

      {/* Official Format_RKT_2026 Sheet Preview */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        {/* Sheet Banner mimicking Format_RKT_2026.xlsx */}
        <div className="p-5 border-b border-slate-300 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-300">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Sheet: RKT</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 underline underline-offset-4 tracking-wide text-center">
              LEMBAR RENCANA KERJA TAHUNAN (RKT)
            </h4>
            <div className="text-[11px] font-semibold text-slate-600 text-right">
              Identifikasi · Refleksi · Benahi
            </div>
          </div>

          <div className="mt-3 border border-slate-300 text-xs">
            <div className="grid grid-cols-12 border-b border-slate-300">
              <div className="col-span-4 sm:col-span-3 px-3 py-2 bg-slate-100 font-bold text-slate-800 border-r border-slate-300">
                Nama Satuan
              </div>
              <div className="col-span-8 sm:col-span-9 px-3 py-2 font-semibold text-slate-900">
                {school.name}
              </div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-4 sm:col-span-3 px-3 py-2 bg-slate-100 font-bold text-slate-800 border-r border-slate-300">
                NPSN
              </div>
              <div className="col-span-8 sm:col-span-9 px-3 py-2 font-mono font-semibold text-slate-900">
                {school.npsn}
              </div>
            </div>
          </div>
        </div>

        {/* Exact 9-Column Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 align-top">
                {OFFICIAL_RKT_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 px-3 border-r last:border-r-0 border-slate-300 ${
                      col.key === 'no'
                        ? 'w-12 text-center'
                        : col.key === 'butuhBiaya'
                        ? 'w-32 text-center'
                        : col.key === 'kodeArkasNon'
                        ? 'min-w-[160px]'
                        : 'min-w-[180px]'
                    }`}
                  >
                    <div className="font-bold text-slate-900 leading-snug">{col.title}</div>
                    {col.subtitle && (
                      <div className="font-normal italic text-[10px] text-slate-600 mt-1 leading-relaxed">
                        {col.subtitle}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-300 text-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Tidak ada baris RKT yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={`${row.identifikasi}-${idx}`} className="hover:bg-slate-50/80 align-top">
                    <td className="py-3 px-3 border-r border-slate-300 text-center font-mono font-semibold tabular-nums">
                      {row.no}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 font-bold text-slate-900 leading-snug">
                      {row.namaSnp}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 font-medium text-slate-900 leading-snug">
                      {row.identifikasi}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 text-slate-700 leading-relaxed">
                      {row.akarMasalah}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 font-medium text-slate-900 leading-relaxed">
                      {row.kegiatanBenahi}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 text-slate-700 leading-relaxed">
                      {row.penjelasanImplementasi}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 text-center font-bold whitespace-nowrap">
                      <span
                        className={
                          row.butuhBiaya === 'Ya' ? 'text-emerald-700' : 'text-teal-700'
                        }
                      >
                        {row.butuhBiaya}
                      </span>
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300 font-mono text-[11px] text-slate-900">
                      {row.kodeArkasNon || (
                        <span
                          className="text-slate-400 italic font-sans"
                          title="Dikosongkan sesuai petunjuk kolom Kode ARKAS/NON untuk kegiatan tanpa biaya"
                        >
                          (kosong · non-biaya)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-800 leading-relaxed">
                      {row.kegiatanArkasNon}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
