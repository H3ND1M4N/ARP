import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  GitMerge,
  Coins,
  UploadCloud,
  Sparkles,
  BarChart3,
  Calendar,
  Building2,
  CheckCircle2,
  HelpCircle,
  Compass,
  FileSpreadsheet,
  Wallet,
} from 'lucide-react';
import {
  DEFAULT_SCHOOL,
  DEFAULT_SNP_STANDARDS,
  DEFAULT_RAPOR_INDICATORS,
  DEFAULT_ARKAS_PROGRAMS,
  DEFAULT_RKT_DOCUMENTS,
  SchoolProfile,
  SnpStandardData,
  RaporIndicator,
  ArkasRecommendation,
  RktDocument,
  KOTA_BATU_DISTRICTS,
} from './data/simantapData';
import { calculateOverallSnpScore, parseRegionalPath } from './utils/petaMutuMath';
import { HeaderNav } from './components/HeaderNav';
import { SchoolHeaderCard } from './components/SchoolHeaderCard';
import { RadarChart } from './components/RadarChart';
import { SnpStandardsTab } from './components/SnpStandardsTab';
import { RaporPendidikanTab } from './components/RaporPendidikanTab';
import { UploadRaporPendidikanTab } from './components/UploadRaporPendidikanTab';
import { RootCauseTab } from './components/RootCauseTab';
import { ArkasTab } from './components/ArkasTab';
import { PenyesuaianAnggaranTab } from './components/PenyesuaianAnggaranTab';
import { RktUploadTab } from './components/RktUploadTab';
import { AiThinkingAssistantTab } from './components/AiThinkingAssistantTab';
import { PortalLoginModal } from './components/PortalLoginModal';
import { RegionalSelectorModal } from './components/RegionalSelectorModal';
import { PrintReportModal } from './components/PrintReportModal';

export type ActiveTab =
  | 'snp'
  | 'rapor'
  | 'upload-rapor'
  | 'rootcause'
  | 'arkas'
  | 'penyesuaian-anggaran'
  | 'rkt'
  | 'ai-thinking';

export default function App() {
  const [currentSchool, setCurrentSchool] = useState<SchoolProfile>(DEFAULT_SCHOOL);
  const [snpStandards, setSnpStandards] = useState<SnpStandardData[]>(DEFAULT_SNP_STANDARDS);
  const [raporIndicators, setRaporIndicators] = useState<RaporIndicator[]>(DEFAULT_RAPOR_INDICATORS);
  const [arkasPrograms, setArkasPrograms] = useState<ArkasRecommendation[]>(DEFAULT_ARKAS_PROGRAMS);
  const [rktDocuments, setRktDocuments] = useState<RktDocument[]>(DEFAULT_RKT_DOCUMENTS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('snp');
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025' | '2024'>('2026');
  const [currentRole, setCurrentRole] = useState<'public' | 'school' | 'supervisor'>('public');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // AI Prompt preset query trigger
  const [aiFocusPrompt, setAiFocusPrompt] = useState<string>('');

  // Overall Score & SNP Predicate calculation
  const overallCalc = calculateOverallSnpScore(snpStandards);

  // Check URL pathname for deep link if present (e.g. /simantap/050000/056800/056802/20536900)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseRegionalPath(window.location.pathname);
      if (parsed && parsed.npsn) {
        handleQuickSearchNpsn(parsed.npsn);
      }
    }
  }, []);

  const handleQuickSearchNpsn = (npsnQuery: string) => {
    // Find school in Kota Batu districts
    for (const dist of KOTA_BATU_DISTRICTS) {
      const match = dist.schools.find(
        (s) => s.npsn === npsnQuery || s.name.toLowerCase().includes(npsnQuery.toLowerCase())
      );
      if (match) {
        if (match.npsn === '20536900') {
          setCurrentSchool(DEFAULT_SCHOOL);
        } else {
          setCurrentSchool({
            ...DEFAULT_SCHOOL,
            npsn: match.npsn,
            name: match.name,
            level: match.level,
            district: dist.name,
            districtCode: dist.code,
          });
        }
        return;
      }
    }

    // If query is an 8 digit NPSN not in demo list, simulate school
    if (/^\d{8}$/.test(npsnQuery)) {
      setCurrentSchool({
        ...DEFAULT_SCHOOL,
        npsn: npsnQuery,
        name: `SD NEGERI WILAYAH JAWA TIMUR (${npsnQuery})`,
      });
    }
  };

  const handleToggleArkasStatus = (id: string) => {
    setArkasPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id !== id) return prog;
        const nextStatus =
          prog.status === 'draft' ? 'approved' : prog.status === 'approved' ? 'in_arkas' : 'draft';
        return { ...prog, status: nextStatus };
      })
    );
  };

  const handleAddNewArkasProgram = (newProg: Omit<ArkasRecommendation, 'id'>) => {
    const item: ArkasRecommendation = {
      ...newProg,
      id: `ark-${Date.now()}`,
    };
    setArkasPrograms((prev) => [item, ...prev]);
  };

  const handleUploadRkt = (doc: Omit<RktDocument, 'id'>) => {
    const item: RktDocument = {
      ...doc,
      id: `rkt-${Date.now()}`,
    };
    setRktDocuments((prev) => [item, ...prev]);
  };

  const handleUpdateRktValidation = (
    id: string,
    status: 'Menunggu Validasi' | 'Disetujui' | 'Perlu Perbaikan',
    notes: string
  ) => {
    setRktDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status, supervisorNotes: notes } : doc))
    );
  };

  const handleTriggerAiFromOtherTab = (promptText: string) => {
    setAiFocusPrompt(promptText);
    setActiveTab('ai-thinking');
  };

  const handleApplyNewRaporData = (newIndicators: RaporIndicator[], releaseYear: string) => {
    setRaporIndicators(newIndicators);
    // Sync to SNP standards
    const numerasi = newIndicators.find((i) => i.code === 'A.2');
    if (numerasi && numerasi.score >= 70) {
      setSnpStandards((prev) =>
        prev.map((s) => {
          if (s.code === 'SKL') return { ...s, score: 84.5, scale7: 5.92 };
          if (s.code === 'PROSES') return { ...s, score: 73.0, scale7: 5.11, category: 'Baik' as const };
          return s;
        })
      );
    }
  };

  const handleUpdateProgramBudget = (id: string, newBudget: number) => {
    setArkasPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estimatedBudget: newBudget } : p))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Official Government Header Nav */}
      <HeaderNav
        currentSchool={currentSchool}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenRegionalSelector={() => setIsRegionalModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onQuickSearchNpsn={handleQuickSearchNpsn}
        onPrintReport={() => setIsPrintModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* School Identity Header Card */}
        <SchoolHeaderCard
          school={currentSchool}
          overallScore={overallCalc.averageScore}
          scaled7={overallCalc.scaled7}
          category={overallCalc.category}
        />

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs mb-6 overflow-x-auto flex items-center gap-1">
          <button
            onClick={() => setActiveTab('snp')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'snp'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Peta 8 Standar Mutu (SNP)</span>
          </button>

          <button
            onClick={() => setActiveTab('rapor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'rapor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Rapor Pendidikan & SPM</span>
          </button>

          <button
            onClick={() => setActiveTab('upload-rapor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'upload-rapor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Upload Rapor Terbaru</span>
          </button>

          <button
            onClick={() => setActiveTab('rootcause')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'rootcause'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitMerge className="w-4 h-4 text-orange-400" />
            <span>Analisis Akar Masalah (PBD)</span>
          </button>

          <button
            onClick={() => setActiveTab('arkas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'arkas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Rekomendasi Program & ARKAS</span>
          </button>

          <button
            onClick={() => setActiveTab('penyesuaian-anggaran')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'penyesuaian-anggaran'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-teal-700 hover:text-teal-800 hover:bg-teal-50 border border-teal-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-teal-400" />
            <span>Penyesuaian Anggaran Sekolah</span>
          </button>

          <button
            onClick={() => setActiveTab('rkt')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'rkt'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>Unggah RKT & Verifikasi</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-thinking')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ml-auto ${
              activeTab === 'ai-thinking'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Asisten AI Thinking</span>
          </button>
        </div>

        {/* Tab 1: Peta 8 Standar Mutu Pendidikan (SNP) */}
        {activeTab === 'snp' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Radar Chart */}
              <div className="lg:col-span-5">
                <RadarChart standards={snpStandards} />
              </div>

              {/* Right Column: Key SNP Summary Metrics */}
              <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Ringkasan Capaian Standar Mutu Pendidikan
                      </h3>
                      <p className="text-xs text-slate-500">
                        Evaluasi komprehensif berdasarkan 8 Standar Nasional Pendidikan (SNP)
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Tingkat Capaian: {overallCalc.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Standar Tertinggi
                      </span>
                      <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                        Pembiayaan (85.0)
                      </span>
                      <span className="text-[10px] text-slate-500">Akuntabilitas BOS tinggi</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Standar Terendah
                      </span>
                      <span className="text-sm font-bold text-amber-700 block mt-0.5">
                        Sarpras (62.4)
                      </span>
                      <span className="text-[10px] text-slate-500">Koleksi buku & TIK minim</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Kualitas Proses
                      </span>
                      <span className="text-sm font-bold text-blue-700 block mt-0.5">
                        Proses (68.1)
                      </span>
                      <span className="text-[10px] text-slate-500">Perlu media interaktif</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Rata-Rata Kota Batu
                      </span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">
                        77.4 / 100
                      </span>
                      <span className="text-[10px] text-slate-500">Tolok ukur daerah</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Satuan pendidikan telah memenuhi standar kompetensi lulusan dan pengelolaan dengan sangat baik. Fokus pembenahan tahun 2026-2027 diarahkan pada penyediaan alat peraga matematika dan revitalisasi pojok baca kelas untuk mendukung lonjakan capaian numerasi.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Sumber data: Dapodik & Supervisi Mutu Mandiri HF 2026
                  </span>
                  <button
                    onClick={() => setActiveTab('rootcause')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    Buka Analisis Akar Masalah &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* 8 SNP Standard Cards Component */}
            <SnpStandardsTab
              standards={snpStandards}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
        )}

        {/* Tab 2: Rapor Pendidikan & SPM */}
        {activeTab === 'rapor' && (
          <RaporPendidikanTab
            indicators={raporIndicators}
            onOpenAiRecommendation={(code) =>
              handleTriggerAiFromOtherTab(
                `Berikan rekomendasi pembenahan mendalam untuk indikator Rapor Pendidikan ${code} SDN Gunungsari 04 beserta integrasi program kegiatan ARKAS.`
              )
            }
          />
        )}

        {/* Tab 2.5: Upload Rapor Pendidikan Terbaru */}
        {activeTab === 'upload-rapor' && (
          <UploadRaporPendidikanTab
            school={currentSchool}
            currentIndicators={raporIndicators}
            onApplyNewRaporData={handleApplyNewRaporData}
          />
        )}

        {/* Tab 3: Analisis Akar Masalah (PBD) */}
        {activeTab === 'rootcause' && (
          <RootCauseTab
            onSelectActionToArkas={() => setActiveTab('arkas')}
            onLaunchAiThinking={(focus) =>
              handleTriggerAiFromOtherTab(
                `Lakukan analisis berpikir tingkat tinggi (High Thinking) mengenai ${focus} SDN Gunungsari 04 dan rekomendasikan langkah taktis RKT serta ARKAS.`
              )
            }
          />
        )}

        {/* Tab 4: Rekomendasi Program & ARKAS */}
        {activeTab === 'arkas' && (
          <ArkasTab
            programs={arkasPrograms}
            onToggleStatus={handleToggleArkasStatus}
            onAddNewProgram={handleAddNewArkasProgram}
            onOpenAiArkasGenerator={() =>
              handleTriggerAiFromOtherTab(
                'Generate usulan program kegiatan baru yang berbasis ARKAS untuk pembenahan Standar Sarana Prasarana dan Standar Proses SDN Gunungsari 04.'
              )
            }
          />
        )}

        {/* Tab 4.5: Penyesuaian Anggaran Sesuai Keuangan Sekolah */}
        {activeTab === 'penyesuaian-anggaran' && (
          <PenyesuaianAnggaranTab
            school={currentSchool}
            programs={arkasPrograms}
            onUpdateProgramBudget={handleUpdateProgramBudget}
            onSyncToArkasPlan={() => setActiveTab('arkas')}
          />
        )}

        {/* Tab 5: Unggah RKT & Verifikasi Pengawas */}
        {activeTab === 'rkt' && (
          <RktUploadTab
            documents={rktDocuments}
            currentRole={currentRole}
            onUploadNewDocument={handleUploadRkt}
            onUpdateValidationStatus={handleUpdateRktValidation}
          />
        )}

        {/* Tab 6: Asisten AI Thinking (gemini-4-argon with ThinkingLevel.HIGH) */}
        {activeTab === 'ai-thinking' && (
          <AiThinkingAssistantTab
            school={currentSchool}
            standards={snpStandards}
            raporIndicators={raporIndicators}
            initialQuery={aiFocusPrompt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                ARP • Aplikasi Rekomendasi & Peta Mutu Sekolah by Hendy Firmansyah
              </p>
              <p className="text-[11px] text-slate-400">
                Sistem Analitik Manajemen Mutu & Penyesuaian Anggaran Sekolah Mandiri
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            <p>
              Aplikasi personal dikembangkan oleh <span className="text-amber-400 font-bold">Hendy Firmansyah</span> (hendy.HF@gmail.com)
            </p>
            <p className="text-slate-500 mt-0.5">
              SD NEGERI GUNUNGSARI 04 • NPSN: 20536900 • Kec. Bumiaji, Kota Batu
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PortalLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(role) => setCurrentRole(role)}
      />

      <RegionalSelectorModal
        isOpen={isRegionalModalOpen}
        onClose={() => setIsRegionalModalOpen(false)}
        currentNpsn={currentSchool.npsn}
        onSelectSchool={handleQuickSearchNpsn}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        school={currentSchool}
        standards={snpStandards}
        raporIndicators={raporIndicators}
        overallScore={overallCalc.averageScore}
        category={overallCalc.category}
      />
    </div>
  );
}
