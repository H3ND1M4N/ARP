import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  School,
  ChevronRight,
  Search,
  ExternalLink,
} from 'lucide-react';
import { KOTA_BATU_DISTRICTS } from '../data/simantapData';

interface RegionalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNpsn: string;
  onSelectSchool: (npsn: string) => void;
}

export const RegionalSelectorModal: React.FC<RegionalSelectorModalProps> = ({
  isOpen,
  onClose,
  currentNpsn,
  onSelectSchool,
}) => {
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('056802'); // Default Bumiaji
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentDistrict =
    KOTA_BATU_DISTRICTS.find((d) => d.code === selectedDistrictCode) || KOTA_BATU_DISTRICTS[0];

  const filteredSchools = currentDistrict.schools.filter((sch) => {
    return (
      sch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.npsn.includes(searchTerm)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full overflow-hidden animate-fadeIn text-slate-800">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Pilih Wilayah & Satuan Pendidikan Jawa Timur
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Rute: 050000 (Prov. Jatim) &gt; 056800 (Kota Batu)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* District Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kecamatan di Wilayah Kota Batu:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {KOTA_BATU_DISTRICTS.map((dist) => (
                <button
                  key={dist.code}
                  onClick={() => setSelectedDistrictCode(dist.code)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedDistrictCode === dist.code
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{dist.name}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Kode: {dist.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search in Current District */}
          <div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari sekolah atau NPSN di kecamatan terpilih..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* School List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Daftar Satuan Pendidikan ({currentDistrict.name}):
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredSchools.map((sch) => {
                const isSelected = sch.npsn === currentNpsn;

                return (
                  <div
                    key={sch.npsn}
                    onClick={() => {
                      onSelectSchool(sch.npsn);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <School className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{sch.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {sch.level} - {sch.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NPSN: {sch.npsn} | Kode Rute: /050000/056800/{currentDistrict.code}/{sch.npsn}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 block">
                        Skor Mutu: {sch.score}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Aktif Dipilih
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center justify-end gap-0.5 mt-0.5">
                          Buka Rapor <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Menampilkan data pemetaan wilayah & satuan pendidikan • Aplikasi buatan Hendy Firmansyah</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
