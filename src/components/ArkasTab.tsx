import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  DollarSign,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ArkasRecommendation,
  ARKAS_KEMENDIKDASMEN_VERSION,
  ARKAS_KEMENDIKDASMEN_CATALOG,
} from '../data/simantapData';
import { calculateArkasSummary } from '../utils/petaMutuMath';

interface ArkasTabProps {
  programs: ArkasRecommendation[];
  onToggleStatus: (id: string) => void;
  onAddNewProgram: (prog: Omit<ArkasRecommendation, 'id'>) => void;
  onOpenAiArkasGenerator: () => void;
}

export const ArkasTab: React.FC<ArkasTabProps> = ({
  programs,
  onToggleStatus,
  onAddNewProgram,
  onOpenAiArkasGenerator,
}) => {
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Program form state
  const [newCode, setNewCode] = useState('04.06.05');
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('Standar PTK');
  const [newBudget, setNewBudget] = useState(2500000);
  const [newIsNonCost, setNewIsNonCost] = useState(false);
  const [newTimeline, setNewTimeline] = useState('Triwulan II');

  const summary = calculateArkasSummary(
    programs.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      snpStandardId: p.standardTarget,
      estimatedBudget: p.estimatedBudget,
      isNonCost: p.isNonCost,
      status: p.status,
    }))
  );

  const filteredPrograms = programs.filter((p) => {
    if (filterSource === 'all') return true;
    if (filterSource === 'paid') return !p.isNonCost;
    if (filterSource === 'non-cost') return p.isNonCost;
    return p.fundingSource === filterSource;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenAddModal = (asNonArkas: boolean) => {
    setNewIsNonCost(asNonArkas);
    setNewCode(asNonArkas ? 'NON-ARKAS' : '04.06.05');
    setNewBudget(asNonArkas ? 0 : 2500000);
    setIsAddModalOpen(true);
  };

  const handleToggleNonCostCheckbox = (checked: boolean) => {
    setNewIsNonCost(checked);
    if (checked) {
      setNewCode((prev) => (prev.toUpperCase().includes('NON-ARKAS') ? prev : 'NON-ARKAS'));
      setNewBudget(0);
    } else {
      setNewCode((prev) => (prev.toUpperCase().includes('NON-ARKAS') ? '04.06.05' : prev));
      setNewBudget((prev) => (prev === 0 ? 2500000 : prev));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddNewProgram({
      code: newIsNonCost ? (newCode.trim() || 'NON-ARKAS') : newCode.trim(),
      name: newName,
      standardTarget: newTarget,
      estimatedBudget: newIsNonCost ? 0 : Number(newBudget),
      isNonCost: newIsNonCost,
      fundingSource: newIsNonCost ? 'Non-Biaya' : 'BOS Reguler',
      status: 'approved',
      beneficiary: 'Siswa & Guru',
      timeline: newTimeline,
    });

    setNewName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Estimasi RKT
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block tabular-nums">
            {formatRupiah(summary.totalBudget)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {summary.totalPrograms} Kegiatan Terpetakan
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Dialokasikan ke ARKAS
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
            {formatRupiah(summary.approvedBudget)}
          </span>
          <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
            Siap Masuk Kertas Kerja RKAS
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Tidak Berbayar (Non-ARKAS)
          </span>
          <span className="text-2xl font-black text-teal-700 mt-1 block tabular-nums">
            {summary.nonCostCount} Kegiatan
          </span>
          <span className="text-xs text-teal-700 font-medium mt-0.5 block">
            Rp 0 • Tanpa Beban Anggaran ARKAS
          </span>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-600 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Bantuan AI
            </span>
            <h4 className="text-sm font-bold mt-1">Rekomendasi Cerdas ARKAS</h4>
            <p className="text-[11px] text-amber-100 mt-0.5">
              Generate kode rekening belanja otomatis berdasarkan SNP.
            </p>
          </div>
          <button
            onClick={onOpenAiArkasGenerator}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-50 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate Program Baru AI</span>
          </button>
        </div>
      </div>

      {/* ARKAS 4 Kemendikdasmen Sync Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs font-bold text-white">
                Sinkronisasi Kode Rekening {ARKAS_KEMENDIKDASMEN_VERSION.appVersion}
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                {ARKAS_KEMENDIKDASMEN_VERSION.lastSyncDate}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Menggunakan referensi resmi {ARKAS_KEMENDIKDASMEN_VERSION.regulation} ({ARKAS_KEMENDIKDASMEN_VERSION.fiscalYear}) beserta dukungan kegiatan swadaya Non-ARKAS (Rp 0).
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-300 shrink-0">
          {ARKAS_KEMENDIKDASMEN_CATALOG.length} Kode Prioritas PBD Aktif
        </span>
      </div>

      {/* Filter and Add Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Jenis Pembiayaan:</span>
          <select
            aria-label="Filter Jenis Pembiayaan"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Program (ARKAS &amp; Non-ARKAS)</option>
            <option value="paid">Berbayar (ARKAS / BOS)</option>
            <option value="non-cost">Tidak Berbayar (Non-ARKAS)</option>
            <option value="BOS Reguler">BOS Reguler</option>
            <option value="BOS Kinerja">BOS Kinerja</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-teal-200" />
            <span>Tambah Kegiatan Non-ARKAS</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal(false)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Tambah Usulan Program RKT</span>
          </button>
        </div>
      </div>

      {/* Program Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode / Kategori</th>
                <th className="py-3 px-4">Program Pembenahan Mutu</th>
                <th className="py-3 px-4">Sasaran SNP</th>
                <th className="py-3 px-4">Jadwal & Target</th>
                <th className="py-3 px-4">Estimasi Biaya</th>
                <th className="py-3 px-4">Status Usulan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.map((prog) => (
                <tr key={prog.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {prog.isNonCost ? (
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {prog.code}
                        </span>
                        <span className="block text-[10px] font-sans font-semibold text-teal-700">
                          Non-ARKAS
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {prog.code}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-bold text-slate-900 leading-snug">{prog.name}</p>
                    <span className="text-[11px] text-slate-500">Penerima: {prog.beneficiary}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                      {prog.standardTarget}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      {prog.timeline}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                    {prog.isNonCost ? (
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          Tidak Berbayar (Rp 0)
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">
                          Non-ARKAS · Tanpa Dana
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-900 font-mono text-xs tabular-nums block">
                          {formatRupiah(prog.estimatedBudget)}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700">
                          {prog.fundingSource}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        prog.status === 'in_arkas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : prog.status === 'approved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {prog.status === 'in_arkas' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {prog.isNonCost ? 'Tersinkron RKT (Non-ARKAS)' : 'Dianggarkan ARKAS'}
                        </>
                      ) : prog.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Disetujui di RKT
                        </>
                      ) : (
                        'Draf Usulan'
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(prog.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Ubah status persetujuan program"
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Program */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {newIsNonCost
                ? 'Tambah Kegiatan Tidak Berbayar (Non-ARKAS)'
                : 'Tambah Usulan Program RKT / ARKAS'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Petakan program berbayar (ARKAS) maupun kegiatan pembiasaan/swadaya tidak berbayar (Non-ARKAS) selaras Peta Mutu ARP.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsNonCost}
                    onChange={(e) => handleToggleNonCostCheckbox(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-800">
                    Kegiatan Tidak Berbayar (Non-ARKAS · Rp 0)
                  </span>
                </label>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">
                  Centang untuk kegiatan tanpa dana BOS/ARKAS (mis. Kombel, pembiasaan pagi, supervisi klinis, satgas sekolah).
                </p>
              </div>

              {!newIsNonCost && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pilih Cepat Referensi {ARKAS_KEMENDIKDASMEN_VERSION.appVersion}
                  </label>
                  <select
                    aria-label="Pilih Kode Resmi ARKAS 4 Kemendikdasmen"
                    value={newCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setNewCode(code);
                      const found = ARKAS_KEMENDIKDASMEN_CATALOG.find((c) => c.code === code);
                      if (found) {
                        if (!newName.trim()) setNewName(found.name);
                        setNewTarget(found.standardLabel);
                      }
                    }}
                    className="w-full p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-slate-900 text-xs"
                  >
                    {ARKAS_KEMENDIKDASMEN_CATALOG.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.standardLabel}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {newIsNonCost ? 'Kode Penanda Non-ARKAS' : 'Kode Kegiatan ARKAS 4'}
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  placeholder={newIsNonCost ? 'NON-ARKAS' : 'Misal: 04.06.05'}
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan Pembenahan</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  placeholder={
                    newIsNonCost
                      ? 'Misal: Gerakan Jumat Membaca & Refleksi Sejawat Tanpa Biaya'
                      : 'Misal: Workshop Penyusunan Media Interaktif Numerasi'
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sasaran Standar (SNP)</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Standar Kompetensi Lulusan">Standar Kompetensi Lulusan</option>
                    <option value="Standar Isi">Standar Isi</option>
                    <option value="Standar Proses">Standar Proses</option>
                    <option value="Standar Penilaian">Standar Penilaian</option>
                    <option value="Standar PTK">Standar PTK</option>
                    <option value="Standar Sarana Prasarana">Standar Sarana Prasarana</option>
                    <option value="Standar Pengelolaan">Standar Pengelolaan</option>
                    <option value="Standar Pembiayaan">Standar Pembiayaan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jadwal Pelaksanaan</label>
                  <input
                    type="text"
                    value={newTimeline}
                    onChange={(e) => setNewTimeline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="Misal: Triwulan II"
                  />
                </div>
              </div>

              {!newIsNonCost && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    step={500000}
                    min={0}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Simpan ke Draf RKT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
