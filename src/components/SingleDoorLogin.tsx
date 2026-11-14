import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export interface ArpSession {
  username: string;
  accessRole: 'Admin & Peserta' | 'Admin' | 'Peserta';
}

interface SingleDoorLoginProps {
  onLogin: (session: ArpSession) => void;
}

export const SingleDoorLogin: React.FC<SingleDoorLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('hendy');
  const [password, setPassword] = useState('hendy');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg('Silakan isi Username terlebih dahulu.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan Kata Sandi untuk masuk ke aplikasi ARP.');
      return;
    }
    if (cleanUser !== 'hendy' || password !== 'hendy') {
      setErrorMsg('Username atau kata sandi salah. Silakan periksa kembali.');
      return;
    }
    setErrorMsg(null);
    onLogin({
      username: cleanUser,
      accessRole: 'Admin & Peserta',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans relative overflow-hidden">
      {/* Subtle architectural background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.10),transparent_45%)] pointer-events-none" />

      {/* Top identity strip */}
      <div className="relative z-10 border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-amber-400">
          ARP · Aplikasi Rekomendasi & Peta Mutu Pendidikan
        </span>
        <span className="hidden sm:inline text-slate-400">
          Dikembangkan oleh <strong className="text-amber-300">Hendy Firmansyah</strong>
        </span>
      </div>

      {/* Main unified login card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 border border-amber-400/30 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-2xl font-black tracking-tight text-amber-400">ARP</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-semibold text-emerald-300">Akses Terpadu Satu Pintu</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aplikasi Rekomendasi & Peta Mutu Sekolah
                </p>
              </div>
            </div>

            <h1 className="text-lg font-bold text-white leading-snug">
              Masuk Satu Pintu
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Gerbang masuk tunggal aplikasi ARP. Seluruh modul analisis Rapor Pendidikan, perencanaan RKT, dan laporan mutu terbuka dalam satu akses terpadu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700/70 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-username" className="block text-xs font-bold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Aplikasi ARP</span>
            </button>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Satu akses login terpadu — data sekolah bersumber langsung dari berkas Rapor Pendidikan yang diunggah.
              </span>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 px-4 py-4 text-center text-[11px] text-slate-500">
        Aplikasi Mandiri ARP · Karya <span className="text-amber-400 font-semibold">Hendy Firmansyah</span> (hendy.HF@gmail.com)
      </footer>
    </div>
  );
};
