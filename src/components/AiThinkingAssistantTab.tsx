import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Send,
  Copy,
  Check,
  RotateCw,
  FileDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { SchoolProfile, SnpStandardData, RaporIndicator } from '../data/simantapData';

interface AiThinkingAssistantTabProps {
  school: SchoolProfile;
  standards: SnpStandardData[];
  raporIndicators: RaporIndicator[];
  initialQuery?: string;
}

export const AiThinkingAssistantTab: React.FC<AiThinkingAssistantTabProps> = ({
  school,
  standards,
  raporIndicators,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(
    initialQuery ||
      `Analisis mendalam akar masalah capaian numerasi dan sarpras ${school.name} serta buat rekomendasi RKT 2027 lengkap dengan kode kegiatan ARKAS`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-4-argon (Thinking Level: HIGH)');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preset query prompts
  const presets = [
    {
      label: 'Akar Masalah Numerasi & Sarpras',
      prompt:
        `Lakukan diagnosis akar masalah mendalam mengapa Standar Sarpras dan Numerasi ${school.name} perlu penguatan, lalu petakan program benahi RKT dengan kode anggaran ARKAS.`,
    },
    {
      label: 'Optimalisasi Kombel Non-Biaya',
      prompt:
        `Susun program kerja Komunitas Belajar (Kombel) Guru ${school.name} berbasis kegiatan non-biaya untuk percepatan adopsi Asesmen Diagnostik Numerasi dan PMM.`,
    },
    {
      label: 'Format Narasi Rekomendasi Mandiri',
      prompt:
        `Buatkan draf laporan telaah dan catatan rekomendasi strategis terhadap pemenuhan 8 SNP untuk ${school.name}.`,
    },
  ];

  const handleGenerate = async (queryText?: string) => {
    const textToSend = queryText || query;
    if (!textToSend.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/peta-mutu-analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: school.name,
          npsn: school.npsn,
          snpScores: standards.map((s) => ({
            code: s.code,
            name: s.name,
            score: s.score,
            scale7: s.scale7,
            category: s.category,
          })),
          raporPendidikan: raporIndicators.map((r) => ({
            code: r.code,
            name: r.name,
            score: r.score,
            label: r.label,
          })),
          userQuery: textToSend,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
        setModelUsed(data.modelUsed ? `${data.modelUsed} (Thinking Level: HIGH)` : 'gemini-4-argon (Thinking Level: HIGH)');
      } else {
        setErrorMsg(data.error || 'Terjadi kendala saat memproses analisis.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMsg('Gagal menghubungi server analisis AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* High Thinking Mode Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-950/50">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase font-mono">
                  High Thinking Mode
                </span>
                <span className="text-xs text-amber-300 font-mono">Model: gemini-4-argon</span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">
                Konsultasi & Analisis Mutu Cerdas Personal by Hendy Firmansyah
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Asisten AI menggunakan model penalaran tinggi (gemini-4-argon dengan mode berpikir mendalam) untuk mengurai interkoneksi kompleks antara 8 Standar Nasional Pendidikan, indikator Rapor Pendidikan, dan regulasi anggaran ARKAS.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700 text-xs shrink-0 text-slate-300">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Basis Data Terpadu:</span>
            <span className="font-semibold text-amber-400">
              8 SNP • Rapor Pendidikan • Juknis ARKAS
            </span>
          </div>
        </div>
      </div>

      {/* Preset Quick Prompts */}
      <div>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Pilihan Topik Analisis Cepat:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p.prompt);
                handleGenerate(p.prompt);
              }}
              className="p-3 bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-xl text-left text-xs transition shadow-2xs group"
            >
              <div className="flex items-center gap-1.5 text-amber-600 font-bold mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition" />
                <span>{p.label}</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">{p.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Instruksi Khusus untuk Asisten AI (Thinking Level: High):
        </label>
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="Tuliskan fokus analisis yang Anda butuhkan (misal: strategi penguatan sarana TIK, penyusunan RKT 2027)..."
            className="w-full p-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 pr-28 resize-none"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !query.trim()}
            className="absolute right-2.5 bottom-3 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-lg shadow-md shadow-amber-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jalankan AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thinking Indicator Animation */}
      {isGenerating && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 animate-pulse space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <BrainCircuit className="w-5 h-5 animate-spin" />
            <span className="font-bold text-sm">Gemini 4 Argon sedang melakukan penalaran mendalam...</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-400 pl-7">
            <p>1. Menautkan 8 Standar Nasional Pendidikan (SNP) dengan rapor numerasi {school.name}...</p>
            <p>2. Mengidentifikasi rantai kausalitas antara Standar Sarpras (62.4) dan Standar Proses (68.1)...</p>
            <p>3. Merumuskan kode rekening ARKAS Kemendikbudristek dan opsi Kombel non-biaya...</p>
          </div>
        </div>
      )}

      {/* Generated Analysis Result Card */}
      {analysisResult && !isGenerating && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          {/* Output Card Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-sm text-white">
                  Laporan Telaah Mutu & Rekomendasi RKT
                </h4>
                <p className="text-[11px] text-slate-400">
                  Dihasilkan melalui model: <strong className="text-amber-400">{modelUsed}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Laporan'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content Body */}
          <div className="p-6 text-sm text-slate-800 leading-relaxed font-sans prose prose-slate max-w-none space-y-4">
            <div className="whitespace-pre-line bg-slate-50/70 p-5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed">
              {analysisResult}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
