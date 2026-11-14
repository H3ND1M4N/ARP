import React, { useMemo, useState } from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Filter,
  Calendar,
  Sparkles,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import {
  SchoolProfile,
  RaporIndicator,
  ARKAS_KEMENDIKDASMEN_VERSION,
  ARKAS_KEMENDIKDASMEN_CATALOG,
} from '../data/simantapData';
import {
  RktActionItem,
  buildFullYearRktInspirations,
  YearRoundInspirationItem,
} from '../utils/petaMutuMath';
import {
  OFFICIAL_RKT_COLUMNS,
  mapRktItemsToOfficialRows,
  downloadOfficialRktXlsx,
} from '../utils/rktOfficialExport';

interface RktOfficialOutputTabProps {
  school: SchoolProfile;
  indicators: RaporIndicator[];
  rktItems: RktActionItem[];
  onAddInspirationItem?: (item: RktActionItem) => void;
  academicYear?: string;
}

export const RktOfficialOutputTab: React.FC<RktOfficialOutputTabProps> = ({
  school,
  indicators,
  rktItems,
  onAddInspirationItem,
  academicYear = '2026/2027',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [costFilter, setCostFilter] = useState<'all' | 'ya' | 'tidak'>('all');
  const [quarterFilter, setQuarterFilter] = useState<'all' | 'TW1' | 'TW2' | 'TW3' | 'TW4'>('all');
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [inspQuarterFilter, setInspQuarterFilter] = useState<'all' | 'TW1' | 'TW2' | 'TW3' | 'TW4'>('all');
  const [inspCostFilter, setInspCostFilter] = useState<'all' | 'ya' | 'tidak'>('all');
  const [showArkasCatalog, setShowArkasCatalog] = useState(false);
  const [addedInspirationIds, setAddedInspirationIds] = useState<string[]>([]);

  const officialRows = useMemo(() => mapRktItemsToOfficialRows(rktItems), [rktItems]);

  const inspirations = useMemo(
    () => buildFullYearRktInspirations(indicators),
    [indicators]
  );

  const filteredInspirations = useMemo(() => {
    return inspirations.filter((insp) => {
      const matchQ = inspQuarterFilter === 'all' || insp.quarter === inspQuarterFilter;
      const matchC = inspCostFilter === 'all' || insp.butuhBiaya === inspCostFilter;
      return matchQ && matchC;
    });
  }, [inspirations, inspQuarterFilter, inspCostFilter]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return officialRows.filter((row) => {
      const matchCost = costFilter === 'all' || row.butuhBiaya === costFilter;
      const matchQuarter =
        quarterFilter === 'all' ||
        (row.quarterTimeline && row.quarterTimeline.includes(quarterFilter));
      if (!q) return matchCost && matchQuarter;
      const matchQuery =
        row.namaSnp.toLowerCase().includes(q) ||
        row.identifikasi.toLowerCase().includes(q) ||
        row.akarMasalah.toLowerCase().includes(q) ||
        row.kegiatanBenahi.toLowerCase().includes(q) ||
        row.penjelasanImplementasi.toLowerCase().includes(q) ||
        row.kodeArkasNon.toLowerCase().includes(q) ||
        row.kegiatanArkasNon.toLowerCase().includes(q);
      return matchCost && matchQuarter && matchQuery;
    });
  }, [officialRows, searchQuery, costFilter, quarterFilter]);

  const stats = useMemo(() => {
    const paidCount = officialRows.filter((r) => r.butuhBiaya === 'ya').length;
    const unpaidCount = officialRows.filter((r) => r.butuhBiaya === 'tidak').length;
    const uniqueIndicators = new Set(officialRows.map((r) => r.identifikasi)).size;
    return {
      totalRows: officialRows.length,
      paidCount,
      unpaidCount,
      uniqueIndicators,
    };
  }, [officialRows]);

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      const filename = await downloadOfficialRktXlsx(school, rktItems, academicYear);
      setDownloadedFilename(filename);
      setTimeout(() => {
        setDownloadedFilename(null);
      }, 6000);
    } catch (err) {
      setDownloadError(
        err instanceof Error
          ? err.message
          : 'Gagal mengekspor file Excel Format RKT. Silakan coba lagi.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddInspirationToRkt = (insp: YearRoundInspirationItem) => {
    if (!onAddInspirationItem) return;
    const isFree = insp.butuhBiaya === 'tidak';
    const matchedInd = indicators.find((i) => i.code.toUpperCase() === insp.raporCode.toUpperCase());
    const score = matchedInd?.score ?? 72;
    const newItem: RktActionItem = {
      id: `rkt-insp-${insp.id}-${Date.now()}`,
      raporCode: insp.raporCode,
      raporName: insp.raporName,
      currentScore: score,
      category: score >= 70 ? 'Baik' : score >= 55 ? 'Sedang' : 'Kurang',
      priorityLevel: score < 70 ? 'Prioritas Utama (P1)' : 'Prioritas Lanjutan (P2)',
      rootCause: `Kebutuhan optimalisasi ${insp.raporName} pada ${insp.quarterLabel} (${insp.monthsLabel})`,
      programName: insp.kegiatanBenahi,
      activityName: insp.penjelasanImplementasi,
      arkasCode: isFree ? 'NON-ARKAS' : insp.arkasCode,
      targetIndicator: `Terlaksana pada ${insp.quarterLabel} (${insp.monthsLabel}) untuk mendukung capaian ${insp.raporCode}`,
      estimatedBudget: isFree ? 0 : insp.estimatedBudget,
      fundingSource: isFree ? 'Non-Biaya' : 'BOS Reguler',
      isNonArkas: isFree,
      quarterTimeline: [insp.quarter],
      personInCharge: insp.personInCharge,
      notes: isFree
        ? `Inspirasi Setahun Anggaran Non-ARKAS (${insp.quarterLabel})`
        : `Inspirasi Setahun Anggaran ARKAS 4 Kemendikdasmen (${insp.quarterLabel})`,
    };
    onAddInspirationItem(newItem);
    setAddedInspirationIds((prev) => [...prev, insp.id]);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-amber-400">
              Format Mutlak 9 Kolom (Sheet RKT)
            </span>
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 rounded">
              {ARKAS_KEMENDIKDASMEN_VERSION.appVersion} · {ARKAS_KEMENDIKDASMEN_VERSION.fiscalYear}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            Hasil Output Lembar Rencana Kerja Tahunan (RKT)
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Ekspor Excel (.xlsx) disusun persis mengikuti format resmi 9 kolom (A–I), lengkap dengan
            garis batas tabel, header dua baris (tebal &amp; miring), penggabungan kolom Nama Satuan / NPSN
            (A–C / D–I), serta pemetaan kode rekening terbaru {ARKAS_KEMENDIKDASMEN_VERSION.appVersion} &amp; Non-ARKAS.
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
            disabled={isDownloading}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Menyiapkan File...' : 'Download Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {downloadedFilename && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            File Excel terformat resmi <strong className="font-mono">{downloadedFilename}</strong> berhasil dibuat dan diunduh (9 kolom standar A–I, sheet <strong className="font-mono">RKT</strong>, referensi {ARKAS_KEMENDIKDASMEN_VERSION.appVersion}).
          </span>
        </div>
      )}

      {downloadError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 print:hidden">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Struktur Kolom Mutlak</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">9 Kolom</span>
          <span className="text-[11px] text-slate-500">Kolom A–I (Format_RKT_2026)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Indikator Rapor Aktif</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block tabular-nums">
            {stats.uniqueIndicators || indicators.length} Indikator
          </span>
          <span className="text-[11px] text-slate-500">{stats.totalRows} baris kegiatan terpetakan</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Butuh Biaya ("ya")</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block tabular-nums">
            {stats.paidCount} Baris
          </span>
          <span className="text-[11px] text-slate-500">Kode rekening ARKAS 4 Kemendikdasmen</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Non-Biaya ("tidak")</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block tabular-nums">
            {stats.unpaidCount} Baris
          </span>
          <span className="text-[11px] text-slate-500">Non-ARKAS · kolom kode dikosongkan</span>
        </div>
      </div>

      {/* ARKAS 4 Kemendikdasmen Reference Banner + Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Standar Kode Rekening {ARKAS_KEMENDIKDASMEN_VERSION.appVersion} · {ARKAS_KEMENDIKDASMEN_VERSION.lastSyncDate}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Seluruh kegiatan berbayar mengacu pada pembaruan Juknis BOSP Kemendikdasmen ({ARKAS_KEMENDIKDASMEN_VERSION.fiscalYear}),
                sedangkan kegiatan tanpa anggaran ditandai <span className="font-mono font-bold">tidak</span> dan kolom kode dikosongkan sesuai petunjuk lembar kerja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowArkasCatalog((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>{showArkasCatalog ? 'Tutup Referensi ARKAS 4' : 'Lihat Katalog Kode ARKAS 4'}</span>
            {showArkasCatalog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showArkasCatalog && (
          <div className="mt-3 pt-3 border-t border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-2.5 font-bold">Kode ARKAS 4</th>
                  <th className="py-2 px-2.5 font-bold">Standar (Label RKT)</th>
                  <th className="py-2 px-2.5 font-bold">Nama Kegiatan Resmi Kemendikdasmen</th>
                  <th className="py-2 px-2.5 font-bold">Indikator Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ARKAS_KEMENDIKDASMEN_CATALOG.map((entry) => (
                  <tr key={entry.code} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2.5 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {entry.code}. ({entry.standardLabel})
                    </td>
                    <td className="py-2 px-2.5 font-semibold text-slate-700 whitespace-nowrap">
                      {entry.snpCategory}
                    </td>
                    <td className="py-2 px-2.5 text-slate-800">{entry.name}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-600 whitespace-nowrap">
                      {entry.raporCodes.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filter & Search Bar for 9-Column Sheet */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 print:hidden">
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

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-600 font-medium">Triwulan:</span>
            <select
              aria-label="Filter Triwulan Output RKT"
              value={quarterFilter}
              onChange={(e) => setQuarterFilter(e.target.value as 'all' | 'TW1' | 'TW2' | 'TW3' | 'TW4')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Setahun Penuh (TW1–TW4)</option>
              <option value="TW1">TW 1 (Jan–Mar)</option>
              <option value="TW2">TW 2 (Apr–Jun)</option>
              <option value="TW3">TW 3 (Jul–Sep)</option>
              <option value="TW4">TW 4 (Okt–Des)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-600 font-medium">Biaya:</span>
            <select
              aria-label="Filter Kebutuhan Biaya Output RKT"
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value as 'all' | 'ya' | 'tidak')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua ({officialRows.length})</option>
              <option value="ya">ya — Berbayar ARKAS ({stats.paidCount})</option>
              <option value="tidak">tidak — Non-ARKAS ({stats.unpaidCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exact Format_RKT_2026 Sheet Preview */}
      <div className="bg-white rounded-xl border-2 border-slate-800 overflow-hidden shadow-xs">
        {/* Sheet Row 1-2 Banner matching Format_RKT_2026.xlsx */}
        <div className="px-5 py-4 border-b border-slate-800 bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-mono">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Sheet: RKT</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-black underline underline-offset-4 tracking-wide text-center font-sans">
            LEMBAR RENCANA KERJA TAHUNAN (RKT)
          </h4>
          <div className="text-[11px] font-bold text-slate-700 text-right">
            Identifikasi · Refleksi · Benahi
          </div>
        </div>

        {/* Sheet Row 3-4: Nama Satuan & NPSN matching A3:C3 / D3:I3 & A4:C4 / D4:I4 */}
        <div className="border-b border-slate-800 text-xs bg-white">
          <div className="grid grid-cols-12 border-b border-slate-800">
            <div className="col-span-4 sm:col-span-3 px-3 py-2 bg-[#F2F2F2] font-bold text-black border-r border-slate-800">
              Nama Satuan
            </div>
            <div className="col-span-8 sm:col-span-9 px-3 py-2 font-semibold text-black bg-white">
              {school.name}
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-4 sm:col-span-3 px-3 py-2 bg-[#F2F2F2] font-bold text-black border-r border-slate-800">
              NPSN
            </div>
            <div className="col-span-8 sm:col-span-9 px-3 py-2 font-mono font-semibold text-black bg-white">
              {school.npsn}
            </div>
          </div>
        </div>

        {/* Row 5 Blank Spacer */}
        <div className="h-3 bg-white border-b border-slate-800" aria-hidden="true" />

        {/* Exact 9-Column Table (Columns A-I) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#F2F2F2] text-black border-b border-slate-800 align-middle">
                {OFFICIAL_RKT_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2.5 px-2 border-r last:border-r-0 border-slate-800 ${
                      col.key === 'no'
                        ? 'w-10 text-center'
                        : col.key === 'namaSnp'
                        ? 'w-28'
                        : col.key === 'identifikasi'
                        ? 'w-32'
                        : col.key === 'akarMasalah'
                        ? 'min-w-[160px]'
                        : col.key === 'kegiatanBenahi'
                        ? 'min-w-[160px]'
                        : col.key === 'penjelasanImplementasi'
                        ? 'min-w-[155px]'
                        : col.key === 'butuhBiaya'
                        ? 'w-28'
                        : col.key === 'kodeArkasNon'
                        ? 'w-36'
                        : 'min-w-[155px]'
                    }`}
                  >
                    <div className="font-bold text-black leading-snug">{col.title}</div>
                    {col.subtitle && (
                      <div className="font-normal italic text-[10px] text-black mt-1 leading-snug">
                        {col.subtitle}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-black bg-white">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    Tidak ada baris RKT yang cocok dengan filter pencarian atau triwulan.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={`${row.identifikasi}-${idx}`} className="hover:bg-slate-50 align-middle">
                    <td className="py-3 px-2.5 border-r border-slate-800 text-center tabular-nums">
                      {row.no}
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 text-center text-black leading-snug">
                      {row.namaSnp}
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 text-black leading-snug">
                      {row.identifikasi}
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 text-black leading-relaxed">
                      {row.akarMasalah}
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 text-black leading-relaxed">
                      {row.kegiatanBenahi}
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 text-black leading-relaxed">
                      {row.penjelasanImplementasi}
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 text-center font-semibold whitespace-nowrap">
                      <span
                        className={
                          row.butuhBiaya === 'ya' ? 'text-emerald-800' : 'text-teal-800'
                        }
                      >
                        {row.butuhBiaya}
                      </span>
                    </td>
                    <td className="py-3 px-2.5 border-r border-slate-800 font-mono text-[11px] text-black">
                      {row.kodeArkasNon || (
                        <span
                          className="text-slate-400 italic font-sans"
                          title="Dikosongkan sesuai petunjuk kolom Kode ARKAS/NON untuk kegiatan tidak membutuhkan biaya"
                        >
                          (dikosongkan)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2.5 text-black leading-relaxed">
                      {row.kegiatanArkasNon}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curated Full-Year Inspiration Panel (TW1-TW4 Paid ARKAS 4 + Unpaid Non-ARKAS) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Inspirasi Kegiatan Setahun Anggaran (Triwulan I – IV) Berbasis Rapor Pendidikan
              </h4>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Rekomendasi kegiatan tahunan untuk {school.name} yang menyeimbangkan kegiatan berbayar ({ARKAS_KEMENDIKDASMEN_VERSION.appVersion}) dan tidak berbayar (Non-ARKAS).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              aria-label="Filter Triwulan Inspirasi"
              value={inspQuarterFilter}
              onChange={(e) => setInspQuarterFilter(e.target.value as 'all' | 'TW1' | 'TW2' | 'TW3' | 'TW4')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              <option value="all">Semua Triwulan (TW1–TW4)</option>
              <option value="TW1">Triwulan I (Jan–Mar)</option>
              <option value="TW2">Triwulan II (Apr–Jun)</option>
              <option value="TW3">Triwulan III (Jul–Sep)</option>
              <option value="TW4">Triwulan IV (Okt–Des)</option>
            </select>

            <select
              aria-label="Filter Pembiayaan Inspirasi"
              value={inspCostFilter}
              onChange={(e) => setInspCostFilter(e.target.value as 'all' | 'ya' | 'tidak')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              <option value="all">ARKAS &amp; Non-ARKAS</option>
              <option value="ya">Berbayar (ARKAS 4)</option>
              <option value="tidak">Tidak Berbayar (Non-ARKAS)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredInspirations.map((insp) => {
            const isFree = insp.butuhBiaya === 'tidak';
            const isAdded = addedInspirationIds.includes(insp.id);

            return (
              <div
                key={insp.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
                      {insp.quarterLabel} · {insp.monthsLabel}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isFree
                          ? 'bg-teal-100 text-teal-900 border border-teal-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {isFree ? 'Non-ARKAS · Rp 0 (tidak)' : `ARKAS ${insp.arkasCode} · Rp ${insp.estimatedBudget.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-indigo-800">
                      Indikator {insp.raporCode} · {insp.raporName}
                    </p>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                      {insp.kegiatanBenahi}
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {insp.penjelasanImplementasi}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">PJ: {insp.personInCharge}</span>
                  {onAddInspirationItem && (
                    <button
                      type="button"
                      onClick={() => handleAddInspirationToRkt(insp)}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition whitespace-nowrap ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Masuk ke RKT</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Tambahkan ke RKT</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
