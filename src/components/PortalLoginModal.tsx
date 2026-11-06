import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Megaphone,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { SIMANTAP_ANNOUNCEMENTS } from '../data/simantapData';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'school' | 'supervisor') => void;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('20536900');
  const [password, setPassword] = useState('••••••••');
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(true);
  const [openAnnouncementId, setOpenAnnouncementId] = useState<string>('ann-1');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleAnnouncement = (id: string) => {
    setOpenAnnouncementId(openAnnouncementId === id ? '' : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorNotice('Mohon isi Id Pengguna dan Kata Sandi.');
      return;
    }
    if (!isCaptchaChecked) {
      setErrorNotice('Silakan verifikasi reCAPTCHA terlebih dahulu.');
      return;
    }

    // If username is supervisor or contains pengawas
    if (username.toLowerCase().includes('pengawas') || username === '056800_pengawas') {
      onLoginSuccess('supervisor');
    } else {
      onLoginSuccess('school');
    }
    onClose();
  };

  const handleQuickPreset = (preset: 'school' | 'supervisor') => {
    if (preset === 'school') {
      setUsername('20536900');
      setPassword('gunungsari04');
    } else {
      setUsername('hendy.HF@gmail.com');
      setPassword('hendy2026');
    }
    setIsCaptchaChecked(true);
    setErrorNotice(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden relative text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center transition"
          aria-label="Tutup jendela login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">PORTAL MASUK APLIKASI ARP</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
              by Hendy Firmansyah
            </span>
          </div>
          <span className="text-xs text-slate-400 mr-8 hidden sm:inline">
            Aplikasi Optimal Dijalankan di Browser Chrome
          </span>
        </div>

        {/* Split Screen Container matching ARP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Kolom Kiri: Informasi & Video */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50 border-r border-slate-200 overflow-y-auto max-h-[85vh]">
            {/* Header Logos */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sistem Informasi Mutu Pendidikan Mandiri
                </p>
                <h4 className="text-sm font-bold text-slate-900">
                  Aplikasi Analitik & Audit Mutu buatan Hendy Firmansyah
                </h4>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
                  ARP
                </span>
              </div>
            </div>

            {/* Megaphone Title */}
            <div className="flex items-center gap-2 text-slate-900 mb-2">
              <Megaphone className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold">Informasi Ringkas</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Berikut adalah pembaruan informasi terkini yang perlu Anda ketahui:
            </p>

            {/* Announcement Accordions */}
            <div className="space-y-3">
              {SIMANTAP_ANNOUNCEMENTS.map((ann) => {
                const isOpen = openAnnouncementId === ann.id;
                return (
                  <div
                    key={ann.id}
                    className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden transition"
                  >
                    <button
                      onClick={() => handleToggleAnnouncement(ann.id)}
                      className="w-full px-4 py-3 text-left flex items-start justify-between gap-3 hover:bg-slate-50 transition"
                      aria-expanded={isOpen}
                    >
                      <div>
                        <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                          {ann.tag}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{ann.date}</span>
                        </div>
                      </div>
                      <div className="pt-1 text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-700 space-y-3">
                        <div className="p-3 bg-amber-50/70 rounded-lg border-l-4 border-amber-500 text-slate-700 leading-relaxed">
                          {ann.content}
                        </div>

                        {ann.hasVideo && ann.videoUrl && (
                          <div className="mt-3">
                            <p className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1">
                              <span>Video Sosialisasi Resmi:</span>
                            </p>
                            <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-slate-900">
                              <iframe
                                className="w-full h-full"
                                src={ann.videoUrl}
                                title="Webinar Peluncuran Aplikasi ARP"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Form Login */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-white flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Brand Logo Box */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-950/20 mb-3">
                  <span className="text-xl font-black">ARP</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  <span className="text-amber-600">ARP</span>{' '}
                  <span className="text-xs font-bold text-amber-700 border border-amber-300 bg-amber-50 px-1.5 py-0.5 rounded align-middle">
                    EduAnalytics
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Masuk untuk memulai sesi pengelolaan mutu</p>
              </div>

              {/* Error Notice if any */}
              {errorNotice && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Id Pengguna (NPSN / Email Akun)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan NPSN (misal: 20536900)"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan Kata Sandi"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Simulated Google reCAPTCHA widget */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCaptchaChecked}
                      onChange={(e) => setIsCaptchaChecked(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">Saya bukan robot</span>
                  </label>
                  <div className="text-right">
                    <img
                      src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                      alt="reCAPTCHA"
                      className="w-7 h-7 inline-block opacity-75"
                    />
                    <p className="text-[9px] text-slate-500">reCAPTCHA</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/30 transition transform active:scale-[0.99]"
                >
                  Masuk Sekarang
                </button>
              </form>

              {/* Single Device Session Advisory */}
              <div className="mt-5 p-3 rounded-xl bg-slate-900 text-slate-200 text-xs border border-slate-800 flex items-start gap-2.5 leading-relaxed">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-400">Pemberitahuan Sesi Tunggal:</span> Anda hanya
                  diperbolehkan login di satu perangkat dalam waktu bersamaan. Waktu tunggu untuk perangkat berikutnya
                  adalah 60 menit sejak perangkat pertama *idle*.
                </div>
              </div>

              {/* Quick Demo Credentials for Fast Testing */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Uji Akses Cepat (1-Klik):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickPreset('school')}
                    className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 text-left transition"
                  >
                    <p className="text-xs font-bold text-blue-700">Akun SDN Gunungsari 04</p>
                    <p className="text-[10px] text-slate-500">NPSN: 20536900</p>
                  </button>
                  <button
                    onClick={() => handleQuickPreset('supervisor')}
                    className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-left transition"
                  >
                    <p className="text-xs font-bold text-emerald-700">Akun Hendy Firmansyah</p>
                    <p className="text-[10px] text-slate-500">Auditor Mutu & Pengembang</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
