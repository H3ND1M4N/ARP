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
import { ArkasRecommendation } from '../data/simantapData';
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
  const [newCode, setNewCode] = useState('02.05.01');
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('Standar Proses');
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddNewProgram({
      code: newCode,
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
          <span className="text-2xl font-black text-slate-900 mt-1 block">
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
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {formatRupiah(summary.approvedBudget)}
          </span>
          <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
            Siap Masuk Kertas Kerja RKAS
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Kegiatan Non-Biaya (Kombel)
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {summary.nonCostCount} Inisiatif
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Optimalisasi Komunitas Belajar Sekolah
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

      {/* Filter and Add Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Sumber Dana:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Sumber Dana</option>
            <option value="BOS Reguler">BOS Reguler</option>
            <option value="non-cost">Kegiatan Non-Biaya</option>
            <option value="BOS Kinerja">BOS Kinerja</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
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
                <th className="py-3 px-4">Kode ARKAS</th>
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
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {prog.code}
                    </span>
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
                      <Clock className="w-3 h-3 text-slate-400" />
                      {prog.timeline}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    {prog.isNonCost ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Non-Biaya
                      </span>
                    ) : (
                      <span className="text-slate-900 font-mono text-xs">
                        {formatRupiah(prog.estimatedBudget)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
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
                          Dianggarkan ARKAS
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
                  <td className="py-3.5 px-4 text-right">
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
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Usulan Program RKT / ARKAS</h3>
            <p className="text-xs text-slate-500 mb-4">
              Petakan program baru yang selaras dengan rekomendasi Peta Mutu ARP.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Kegiatan ARKAS</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  placeholder="Misal: 02.04.05"
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
                  placeholder="Misal: Workshop Penyusunan Media Interaktif Numerasi"
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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={newIsNonCost}
                    onChange={(e) => setNewIsNonCost(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800">Kegiatan Non-Biaya (Kombel / Praktik Baik)</span>
                </label>

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
              </div>

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
