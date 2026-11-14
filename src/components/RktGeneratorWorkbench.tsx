import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Wallet,
  Building2,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { SchoolProfile, RaporIndicator, RktDocument } from '../data/simantapData';
import {
  generateRktFromRapor,
  RktActionItem,
  GeneratedRktData,
} from '../utils/petaMutuMath';

interface RktGeneratorWorkbenchProps {
  school: SchoolProfile;
  indicators: RaporIndicator[];
  academicYear?: string;
  externalItems?: RktActionItem[];
  onItemsChange?: (items: RktActionItem[]) => void;
  onOpenOfficialOutput?: () => void;
  onSaveToDocuments: (doc: Omit<RktDocument, 'id'>) => void;
  onNavigateToDocuments?: () => void;
  onTriggerAiRefinement?: (prompt: string) => void;
}

export const RktGeneratorWorkbench: React.FC<RktGeneratorWorkbenchProps> = ({
  school,
  indicators,
  academicYear = '2026/2027',
  externalItems,
  onItemsChange,
  onOpenOfficialOutput,
  onSaveToDocuments,
  onNavigateToDocuments,
  onTriggerAiRefinement,
}) => {
  // Generate initial RKT data from indicators
  const initialGenerated = useMemo(() => {
    return generateRktFromRapor(indicators, school, academicYear);
  }, [indicators, school, academicYear]);

  const [internalItems, setInternalItems] = useState<RktActionItem[]>(initialGenerated.items);

  useEffect(() => {
    if (!externalItems) {
      setInternalItems(initialGenerated.items);
    }
  }, [initialGenerated, externalItems]);

  const items = externalItems ?? internalItems;
  const setItems: React.Dispatch<React.SetStateAction<RktActionItem[]>> = (updater) => {
    const next = typeof updater === 'function' ? updater(items) : updater;
    if (onItemsChange) {
      onItemsChange(next);
    }
    if (!externalItems) {
      setInternalItems(next);
    }
  };

  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<string>('all');
  const [selectedFundingTypeFilter, setSelectedFundingTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing state for an item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<RktActionItem>>({});

  // Adding new custom item state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIsNonArkas, setNewIsNonArkas] = useState(false);
  const [newItemData, setNewItemData] = useState({
    raporCode: 'A.2',
    raporName: 'Kemampuan Numerasi',
    programName: 'Program Penguatan Numerasi Kelas Awal',
    activityName: '',
    arkasCode: '04.06.05',
    targetIndicator: '',
    estimatedBudget: 2500000,
    fundingSource: 'BOS Reguler' as 'BOS Reguler' | 'BOS Kinerja' | 'Non-Biaya' | 'APBD',
    quarterTimeline: ['TW1', 'TW2'] as ('TW1' | 'TW2' | 'TW3' | 'TW4')[],
    personInCharge: 'Guru Kelas & Tim Numerasi',
    priorityLevel: 'Prioritas Utama (P1)' as 'Prioritas Utama (P1)' | 'Prioritas Lanjutan (P2)' | 'Pemeliharaan Mutu (P3)',
  });

  // Success notice when saved to documents
  const [savedSuccessDocTitle, setSavedSuccessDocTitle] = useState<string | null>(null);

  // Recalculate summary stats based on current edited items
  const stats = useMemo(() => {
    let totalBudget = 0;
    let nonCostCount = 0;
    let p1Count = 0;
    let p2Count = 0;

    for (const item of items) {
      totalBudget += item.estimatedBudget;
      if (item.isNonArkas || item.fundingSource === 'Non-Biaya' || item.estimatedBudget === 0) {
        nonCostCount += 1;
      }
      if (item.priorityLevel === 'Prioritas Utama (P1)') {
        p1Count += 1;
      } else if (item.priorityLevel === 'Prioritas Lanjutan (P2)') {
        p2Count += 1;
      }
    }

    return {
      totalPrograms: items.length,
      totalBudget,
      nonCostCount,
      p1Count,
      p2Count,
    };
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.raporName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.arkasCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPriority =
        selectedPriorityFilter === 'all' || item.priorityLevel === selectedPriorityFilter;

      const matchQuarter =
        selectedQuarterFilter === 'all' ||
        item.quarterTimeline.includes(selectedQuarterFilter as any);

      const isItemNonArkas =
        Boolean(item.isNonArkas) || item.fundingSource === 'Non-Biaya' || item.estimatedBudget === 0;
      const matchFundingType =
        selectedFundingTypeFilter === 'all' ||
        (selectedFundingTypeFilter === 'non-arkas' && isItemNonArkas) ||
        (selectedFundingTypeFilter === 'arkas' && !isItemNonArkas);

      return matchSearch && matchPriority && matchQuarter && matchFundingType;
    });
  }, [items, searchQuery, selectedPriorityFilter, selectedQuarterFilter, selectedFundingTypeFilter]);

  // Start editing row
  const handleStartEdit = (item: RktActionItem) => {
    setEditingId(item.id);
    setEditFormData({ ...item });
  };

  // Save row edit
  const handleSaveEdit = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? ({ ...item, ...editFormData } as RktActionItem) : item))
    );
    setEditingId(null);
    setEditFormData({});
  };

  // Delete row
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to default auto-generated
  const handleResetToGenerated = () => {
    if (confirm('Kembalikan seluruh daftar program RKT ke rekomendasi standar Rapor Pendidikan?')) {
      const fresh = generateRktFromRapor(indicators, school, academicYear);
      setItems(fresh.items);
    }
  };

  const handleOpenAddModal = (asNonArkas: boolean) => {
    setNewIsNonArkas(asNonArkas);
    setNewItemData((prev) => ({
      ...prev,
      programName: asNonArkas
        ? 'Pembiasaan & Kolaborasi Mutu Sekolah (Non-ARKAS)'
        : 'Program Penguatan Numerasi Kelas Awal',
      arkasCode: asNonArkas ? 'NON-ARKAS' : '04.06.05',
      estimatedBudget: asNonArkas ? 0 : 2500000,
      fundingSource: asNonArkas ? 'Non-Biaya' : 'BOS Reguler',
    }));
    setIsAddModalOpen(true);
  };

  const handleToggleNewNonArkas = (checked: boolean) => {
    setNewIsNonArkas(checked);
    setNewItemData((prev) => ({
      ...prev,
      arkasCode: checked ? 'NON-ARKAS' : prev.arkasCode === 'NON-ARKAS' ? '04.06.05' : prev.arkasCode,
      estimatedBudget: checked ? 0 : prev.estimatedBudget === 0 ? 2500000 : prev.estimatedBudget,
      fundingSource: checked ? 'Non-Biaya' : prev.fundingSource === 'Non-Biaya' ? 'BOS Reguler' : prev.fundingSource,
    }));
  };

  // Add new item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.activityName) return;

    const isNonArkasItem =
      newIsNonArkas || newItemData.fundingSource === 'Non-Biaya' || Number(newItemData.estimatedBudget) === 0;

    const newItem: RktActionItem = {
      id: `rkt-custom-${Date.now()}`,
      raporCode: newItemData.raporCode,
      raporName: newItemData.raporName,
      currentScore: 70,
      category: 'Sedang',
      priorityLevel: newItemData.priorityLevel,
      rootCause: isNonArkasItem
        ? 'Optimalisasi pembiasaan harian, supervisi, atau komunitas belajar tanpa membebani dana BOS.'
        : 'Kebutuhan pemenuhan program kerja strategis satuan pendidikan.',
      programName: newItemData.programName,
      activityName: newItemData.activityName,
      arkasCode: isNonArkasItem ? (newItemData.arkasCode.trim() || 'NON-ARKAS') : newItemData.arkasCode,
      targetIndicator:
        newItemData.targetIndicator || 'Tercapainya target program kerja tepat waktu.',
      estimatedBudget: isNonArkasItem ? 0 : Number(newItemData.estimatedBudget) || 0,
      fundingSource: isNonArkasItem ? 'Non-Biaya' : newItemData.fundingSource,
      isNonArkas: isNonArkasItem,
      quarterTimeline: newItemData.quarterTimeline,
      personInCharge: newItemData.personInCharge,
      notes: isNonArkasItem
        ? 'Kegiatan Tidak Berbayar (Non-ARKAS / Rp 0) usulan tim penyusun RKT.'
        : 'Program usulan tambahan tim penyusun RKT.',
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewIsNonArkas(false);
    setNewItemData({
      raporCode: 'A.2',
      raporName: 'Kemampuan Numerasi',
      programName: 'Program Penguatan Numerasi Kelas Awal',
      activityName: '',
      arkasCode: '04.06.05',
      targetIndicator: '',
      estimatedBudget: 2500000,
      fundingSource: 'BOS Reguler',
      quarterTimeline: ['TW1', 'TW2'],
      personInCharge: 'Guru Kelas & Tim Numerasi',
      priorityLevel: 'Prioritas Utama (P1)',
    });
  };

  // Save to school RKT documents repository
  const handleSaveToOfficialDocuments = () => {
    const docTitle = `Rencana Kegiatan Tahunan (RKT) Berbasis Rapor Pendidikan ${academicYear}`;
    onSaveToDocuments({
      title: docTitle,
      academicYear,
      uploadDate: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID') + ' WIB',
      fileSize: `${(stats.totalPrograms * 0.4 + 1.2).toFixed(1)} MB (PBD RKT)`,
      uploadedBy: `${school.principal || 'Kepala Sekolah'} (ARP Hendy Firmansyah)`,
      status: 'Menunggu Validasi',
      supervisorNotes: `Dokumen RKT otomatis disusun dari hasil analisis Rapor Pendidikan terkini (${stats.totalPrograms} kegiatan termasuk ${stats.nonCostCount} kegiatan Non-ARKAS tidak berbayar, alokasi berbayar Rp ${stats.totalBudget.toLocaleString('id-ID')}). Siap diverifikasi pengawas.`,
    });

    setSavedSuccessDocTitle(docTitle);
    setTimeout(() => {
      setSavedSuccessDocTitle(null);
    }, 8000);
  };

  // Export to CSV / Excel
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Prioritas',
      'Indikator Rapor',
      'Skor Rapor',
      'Akar Masalah (Refleksi)',
      'Program PBD',
      'Kegiatan RKT (Benahi)',
      'Kode ARKAS / Kategori',
      'Target Keberhasilan',
      'Jadwal Triwulan',
      'Estimasi Anggaran (Rp)',
      'Sumber Dana',
      'Penanggung Jawab',
    ];

    const rows = items.map((item, idx) => {
      const isNonArkasItem =
        Boolean(item.isNonArkas) || item.fundingSource === 'Non-Biaya' || item.estimatedBudget === 0;
      return [
        idx + 1,
        `"${item.priorityLevel}"`,
        `"${item.raporCode} ${item.raporName}"`,
        item.currentScore,
        `"${item.rootCause.replace(/"/g, '""')}"`,
        `"${item.programName.replace(/"/g, '""')}"`,
        `"${item.activityName.replace(/"/g, '""')}"`,
        `"${isNonArkasItem ? 'NON-ARKAS' : item.arkasCode}"`,
        `"${item.targetIndicator.replace(/"/g, '""')}"`,
        `"${item.quarterTimeline.join(', ')}"`,
        item.estimatedBudget,
        `"${isNonArkasItem ? 'Non-Biaya (Non-ARKAS)' : item.fundingSource}"`,
        `"${item.personInCharge}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `RKT_PBD_${school.npsn}_${academicYear.replace('/', '_')}_ARP.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print layout trigger
  const handlePrintMatrix = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-2xl shadow-sm border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
              Generator RKT Berbasis Data (PBD)
            </span>
            <span className="text-xs text-blue-200">
              Sistem ARP • Hendy Firmansyah
            </span>
          </div>
          <h3 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
            Matriks Rencana Kerja Tahunan (RKT) Otomatis
          </h3>
          <p className="text-xs text-blue-200 mt-0.5 max-w-3xl leading-relaxed">
            Dihasilkan secara cerdas dari indikator prioritas Rapor Pendidikan{' '}
            <strong className="text-amber-300">{school.name}</strong> (NPSN: {school.npsn}).
            Menerapkan tahapan Identifikasi, Refleksi, dan Benahi dengan pemetaan langsung ke kode rekening sub-kegiatan ARKAS Kemendikdasmen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenOfficialOutput && (
            <button
              type="button"
              onClick={onOpenOfficialOutput}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
              title="Buka tampilan Hasil Output RKT 9 kolom & Download Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Hasil Output RKT (.xlsx)</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 shadow-xs whitespace-nowrap"
            title="Unduh berkas spreadsheet CSV/Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrintMatrix}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 shadow-xs whitespace-nowrap"
            title="Cetak matriks dokumen RKT"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak Matriks</span>
          </button>

          <button
            onClick={handleSaveToOfficialDocuments}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Simpan ke Berkas RKT</span>
          </button>
        </div>
      </div>

      {/* Success Notification after Saving */}
      {savedSuccessDocTitle && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold text-emerald-950 text-sm">
                RKT Berhasil Disimpan ke Dokumen Sekolah!
              </strong>
              <p className="text-emerald-800 mt-0.5">
                Dokumen <em>&quot;{savedSuccessDocTitle}&quot;</em> telah diajukan ke repositori dokumen satuan pendidikan dengan status{' '}
                <span className="font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[11px]">
                  Menunggu Validasi Pengawas
                </span>.
              </p>
            </div>
          </div>

          {onNavigateToDocuments && (
            <button
              onClick={onNavigateToDocuments}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <span>Lihat di Tab Dokumen RKT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Total Kegiatan RKT
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">
              {stats.totalPrograms}
            </span>
            <span className="text-[10px] text-slate-500">Program Terpetakan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Estimasi Pagu Anggaran
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 block">
              Rp {(stats.totalBudget / 1000000).toFixed(1)} Jt
            </span>
            <span className="text-[10px] text-slate-500">
              Rp {stats.totalBudget.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 block">
              Intervensi Utama (P1)
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5 block">
              {stats.p1Count} Program
            </span>
            <span className="text-[10px] text-amber-700">Skor Rapor &lt; 70</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 block">
              Tidak Berbayar (Non-ARKAS)
            </span>
            <span className="text-xl sm:text-2xl font-black text-teal-800 mt-0.5 block tabular-nums">
              {stats.nonCostCount} Kegiatan
            </span>
            <span className="text-[10px] text-teal-700">Rp 0 • Kombel &amp; Pembiasaan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kegiatan RKT, indikator, atau kode ARKAS/Non-ARKAS..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Pembiayaan:</span>
            <select
              aria-label="Filter Pembiayaan RKT"
              value={selectedFundingTypeFilter}
              onChange={(e) => setSelectedFundingTypeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua (ARKAS &amp; Non-ARKAS)</option>
              <option value="arkas">Berbayar (ARKAS)</option>
              <option value="non-arkas">Tidak Berbayar (Non-ARKAS)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Prioritas:</span>
            <select
              aria-label="Filter Prioritas RKT"
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Prioritas</option>
              <option value="Prioritas Utama (P1)">Prioritas Utama (P1)</option>
              <option value="Prioritas Lanjutan (P2)">Prioritas Lanjutan (P2)</option>
              <option value="Pemeliharaan Mutu (P3)">Pemeliharaan Mutu (P3)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Jadwal:</span>
            <select
              aria-label="Filter Jadwal Triwulan"
              value={selectedQuarterFilter}
              onChange={(e) => setSelectedQuarterFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Triwulan</option>
              <option value="TW1">Triwulan 1 (Jan-Mar)</option>
              <option value="TW2">Triwulan 2 (Apr-Jun)</option>
              <option value="TW3">Triwulan 3 (Jul-Sep)</option>
              <option value="TW4">Triwulan 4 (Okt-Des)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddModal(true)}
            className="px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Non-ARKAS</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal(false)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kegiatan</span>
          </button>

          <button
            onClick={handleResetToGenerated}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Reset ke rekomendasi standar Rapor Pendidikan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table: RKT PBD Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Daftar Program & Kegiatan RKT Tahun {academicYear}
            </h4>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredItems.length} dari {items.length} kegiatan
            </p>
          </div>

          {onTriggerAiRefinement && (
            <button
              onClick={() =>
                onTriggerAiRefinement(
                  `Buat narasi telaah reflektif dan pembenahan program RKT untuk ${school.name} berdasarkan capaian Rapor Pendidikan terkini (total ${items.length} kegiatan, pagu Rp ${stats.totalBudget.toLocaleString('id-ID')}).`
                )
              }
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Analisis AI Thinking untuk RKT</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-36">Indikator Rapor</th>
                <th className="py-3 px-3 w-44">Akar Masalah (Refleksi)</th>
                <th className="py-3 px-3 min-w-[200px]">Program & Kegiatan RKT (Benahi)</th>
                <th className="py-3 px-3 w-28">Kode ARKAS</th>
                <th className="py-3 px-3 min-w-[160px]">Target Kuantitatif</th>
                <th className="py-3 px-3 w-28 text-center">Jadwal TW</th>
                <th className="py-3 px-3 w-32 text-right">Anggaran (Rp)</th>
                <th className="py-3 px-3 w-32">Penanggung Jawab</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada kegiatan RKT yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition ${
                        item.priorityLevel === 'Prioritas Utama (P1)'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      {/* No & Priority */}
                      <td className="py-3 px-3 text-center align-top">
                        <span className="font-mono text-slate-500 font-bold block">
                          {index + 1}
                        </span>
                        <span
                          className={`mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.priorityLevel === 'Prioritas Utama (P1)'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : item.priorityLevel === 'Prioritas Lanjutan (P2)'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.priorityLevel === 'Prioritas Utama (P1)'
                            ? 'P1'
                            : item.priorityLevel === 'Prioritas Lanjutan (P2)'
                            ? 'P2'
                            : 'P3'}
                        </span>
                      </td>

                      {/* Indikator Rapor */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold text-slate-900">{item.raporCode}</div>
                        <div className="text-slate-600 font-medium leading-snug">
                          {item.raporName}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                            Skor: {item.currentScore}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.category === 'Baik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Akar Masalah (Refleksi) */}
                      <td className="py-3 px-3 align-top text-slate-600 leading-relaxed text-[11px]">
                        {isEditing ? (
                          <textarea
                            value={editFormData.rootCause ?? item.rootCause}
                            onChange={(e) =>
                              setEditFormData((prev) => ({ ...prev, rootCause: e.target.value }))
                            }
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                            rows={3}
                          />
                        ) : (
                          item.rootCause
                        )}
                      </td>

                      {/* Program & Kegiatan (Benahi) */}
                      <td className="py-3 px-3 align-top">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editFormData.programName ?? item.programName}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  programName: e.target.value,
                                }))
                              }
                              placeholder="Nama Program PBD"
                              className="w-full p-1.5 border border-slate-300 rounded text-xs font-semibold"
                            />
                            <textarea
                              value={editFormData.activityName ?? item.activityName}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  activityName: e.target.value,
                                }))
                              }
                              placeholder="Rincian Kegiatan RKT"
                              className="w-full p-1.5 border border-slate-300 rounded text-xs"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 uppercase block tracking-wider">
                              {item.programName}
                            </span>
                            <span className="font-bold text-slate-900 block mt-0.5 leading-snug">
                              {item.activityName}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Kode ARKAS */}
                      <td className="py-3 px-3 align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.arkasCode ?? item.arkasCode}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                arkasCode: e.target.value,
                              }))
                            }
                            className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                          />
                        ) : item.isNonArkas || item.fundingSource === 'Non-Biaya' || item.estimatedBudget === 0 ? (
                          <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] block text-center whitespace-nowrap">
                            NON-ARKAS
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] block text-center whitespace-nowrap">
                            {item.arkasCode}
                          </span>
                        )}
                      </td>

                      {/* Target Kuantitatif */}
                      <td className="py-3 px-3 align-top text-slate-600 text-[11px]">
                        {isEditing ? (
                          <textarea
                            value={editFormData.targetIndicator ?? item.targetIndicator}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                targetIndicator: e.target.value,
                              }))
                            }
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                            rows={2}
                          />
                        ) : (
                          item.targetIndicator
                        )}
                      </td>

                      {/* Jadwal Triwulan */}
                      <td className="py-3 px-3 align-top text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {['TW1', 'TW2', 'TW3', 'TW4'].map((tw) => {
                            const isActive = item.quarterTimeline.includes(tw as any);
                            return (
                              <span
                                key={tw}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {tw}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Anggaran & Sumber Dana */}
                      <td className="py-3 px-3 align-top text-right">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={editFormData.estimatedBudget ?? item.estimatedBudget}
                              disabled={editFormData.fundingSource === 'Non-Biaya'}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  estimatedBudget: Number(e.target.value),
                                }))
                              }
                              className="w-full p-1.5 border border-slate-300 rounded text-xs text-right disabled:bg-slate-100"
                            />
                            <select
                              value={editFormData.fundingSource ?? item.fundingSource}
                              onChange={(e) => {
                                const src = e.target.value as RktActionItem['fundingSource'];
                                setEditFormData((prev) => ({
                                  ...prev,
                                  fundingSource: src,
                                  isNonArkas: src === 'Non-Biaya',
                                  estimatedBudget: src === 'Non-Biaya' ? 0 : prev.estimatedBudget || 1500000,
                                  arkasCode: src === 'Non-Biaya' ? 'NON-ARKAS' : prev.arkasCode === 'NON-ARKAS' ? '04.06.05' : prev.arkasCode,
                                }));
                              }}
                              className="w-full p-1 border border-slate-300 rounded text-[10px]"
                            >
                              <option value="BOS Reguler">BOS Reguler</option>
                              <option value="BOS Kinerja">BOS Kinerja</option>
                              <option value="Non-Biaya">Non-Biaya (Non-ARKAS)</option>
                              <option value="APBD">APBD</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono font-bold text-slate-900 block tabular-nums whitespace-nowrap">
                              {item.estimatedBudget > 0
                                ? `Rp ${item.estimatedBudget.toLocaleString('id-ID')}`
                                : 'Rp 0 (Gratis)'}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block whitespace-nowrap ${
                                item.isNonArkas || item.fundingSource === 'Non-Biaya' || item.estimatedBudget === 0
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {item.isNonArkas || item.fundingSource === 'Non-Biaya' || item.estimatedBudget === 0
                                ? 'Tidak Berbayar · Non-ARKAS'
                                : item.fundingSource}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Penanggung Jawab */}
                      <td className="py-3 px-3 align-top text-slate-700 text-[11px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.personInCharge ?? item.personInCharge}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                personInCharge: e.target.value,
                              }))
                            }
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                        ) : (
                          item.personInCharge
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition"
                              title="Simpan Perubahan"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded transition"
                              title="Edit Kegiatan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Hapus Kegiatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Totals */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Total Baris Kegiatan: <strong className="text-slate-900">{items.length}</strong>
            </span>
            <span>
              Kegiatan Tidak Berbayar (Non-ARKAS):{' '}
              <strong className="text-teal-700">{stats.nonCostCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Total Estimasi Anggaran RKT:</span>
            <span className="text-sm font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
              Rp {stats.totalBudget.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Kegiatan RKT Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsNonArkas}
                    onChange={(e) => handleToggleNewNonArkas(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-800">
                    Kegiatan Tidak Berbayar (Non-ARKAS · Rp 0)
                  </span>
                </label>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">
                  Otomatis mengatur anggaran Rp 0, kode NON-ARKAS, dan sumber dana Non-Biaya.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Indikator Rapor Sasaran
                  </label>
                  <select
                    value={newItemData.raporCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const ind = indicators.find((i) => i.code === code);
                      setNewItemData((prev) => ({
                        ...prev,
                        raporCode: code,
                        raporName: ind ? ind.name : 'Indikator Khusus',
                      }));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {indicators.map((ind) => (
                      <option key={ind.code} value={ind.code}>
                        {ind.code} - {ind.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={newItemData.priorityLevel}
                    onChange={(e) =>
                      setNewItemData((prev) => ({
                        ...prev,
                        priorityLevel: e.target.value as any,
                      }))
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Prioritas Utama (P1)">Prioritas Utama (P1)</option>
                    <option value="Prioritas Lanjutan (P2)">Prioritas Lanjutan (P2)</option>
                    <option value="Pemeliharaan Mutu (P3)">Pemeliharaan Mutu (P3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Program Kerja (PBD)
                </label>
                <input
                  type="text"
                  required
                  value={newItemData.programName}
                  onChange={(e) =>
                    setNewItemData((prev) => ({ ...prev, programName: e.target.value }))
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Contoh: Program Penguatan Mutu Pembelajaran Numerasi"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rincian Kegiatan RKT (Benahi)
                </label>
                <textarea
                  required
                  rows={2}
                  value={newItemData.activityName}
                  onChange={(e) =>
                    setNewItemData((prev) => ({ ...prev, activityName: e.target.value }))
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder={
                    newIsNonArkas
                      ? 'Contoh: Gerakan Membaca 15 Menit Sebelum Belajar & Diskusi Sejawat Kombel'
                      : 'Contoh: Pengadaan media peraga balok matematika kontekstual kelas 1-3'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {newIsNonArkas ? 'Kategori / Kode Non-ARKAS' : 'Kode Rekening ARKAS'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemData.arkasCode}
                    onChange={(e) =>
                      setNewItemData((prev) => ({ ...prev, arkasCode: e.target.value }))
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder={newIsNonArkas ? 'NON-ARKAS' : '04.06.05'}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estimasi Anggaran (Rp)
                  </label>
                  <input
                    type="number"
                    disabled={newIsNonArkas}
                    value={newIsNonArkas ? 0 : newItemData.estimatedBudget}
                    onChange={(e) =>
                      setNewItemData((prev) => ({
                        ...prev,
                        estimatedBudget: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="0 jika non-biaya"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Sumber Dana
                  </label>
                  <select
                    value={newIsNonArkas ? 'Non-Biaya' : newItemData.fundingSource}
                    onChange={(e) => {
                      const val = e.target.value as RktActionItem['fundingSource'];
                      handleToggleNewNonArkas(val === 'Non-Biaya');
                      setNewItemData((prev) => ({
                        ...prev,
                        fundingSource: val,
                      }));
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="BOS Reguler">BOS Reguler</option>
                    <option value="BOS Kinerja">BOS Kinerja</option>
                    <option value="Non-Biaya">Non-Biaya (Tidak Berbayar / Non-ARKAS)</option>
                    <option value="APBD">APBD</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={newItemData.personInCharge}
                    onChange={(e) =>
                      setNewItemData((prev) => ({
                        ...prev,
                        personInCharge: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Koordinator Kurikulum / Guru Kelas"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Target Kuantitatif / Output
                </label>
                <input
                  type="text"
                  value={newItemData.targetIndicator}
                  onChange={(e) =>
                    setNewItemData((prev) => ({ ...prev, targetIndicator: e.target.value }))
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Contoh: 100% siswa kelas 1-3 menggunakan media peraga; skor naik +5.0"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Tambahkan ke RKT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
