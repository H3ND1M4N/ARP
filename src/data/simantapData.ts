export interface SchoolProfile {
  npsn: string;
  name: string;
  level: string;
  status: 'Negeri' | 'Swasta';
  accreditation: string;
  accreditationScore: number;
  curriculum: string;
  address: string;
  village: string;
  district: string;
  districtCode: string;
  city: string;
  cityCode: string;
  province: string;
  provinceCode: string;
  postalCode: string;
  principal: string;
  supervisor: string;
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  roomsCount: number;
  electricity: string;
  internet: string;
  lat: number;
  lng: number;
}

export interface SnpDetailIndicator {
  code: string;
  name: string;
  score: number;
  target: number;
  category: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  description: string;
}

export interface SnpStandardData {
  id: string;
  code: string;
  name: string;
  score: number;
  scale7: number;
  target: number;
  score2024: number;
  score2025: number;
  score2026: number;
  category: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  color: string;
  indicators: SnpDetailIndicator[];
}

export interface RaporIndicator {
  code: string;
  name: string;
  score: number;
  label: 'Baik' | 'Sedang' | 'Kurang';
  trend: 'Meningkat' | 'Stabil' | 'Menurun';
  delta: string;
  color: string;
  definition: string;
  priorityOrder: number;
}

export interface RootCauseItem {
  id: string;
  issueIndicator: string;
  targetScore: number;
  currentScore: number;
  rootCauses: {
    level: string;
    factor: string;
    description: string;
    suggestedAction: string;
  }[];
}

export interface ArkasRecommendation {
  id: string;
  code: string;
  name: string;
  standardTarget: string;
  estimatedBudget: number;
  isNonCost: boolean;
  fundingSource: 'BOS Reguler' | 'BOS Kinerja' | 'APBD' | 'Non-Biaya';
  status: 'draft' | 'approved' | 'in_arkas';
  beneficiary: string;
  timeline: string;
}

export interface RktDocument {
  id: string;
  title: string;
  academicYear: string;
  uploadDate: string;
  fileSize: string;
  uploadedBy: string;
  status: 'Menunggu Validasi' | 'Disetujui' | 'Perlu Perbaikan';
  supervisorNotes: string;
  downloadUrl?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  tag: string;
  content: string;
  hasVideo?: boolean;
  videoUrl?: string;
}

// Announcements replicating ARP Hendy Firmansyah Edition
export const SIMANTAP_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Update Informasi Akun Pengawas & Gagal Unggah RKT',
    date: 'Senin, 31 Agustus 2026',
    tag: 'Pembaruan Sistem',
    content:
      'Bagi akun pengawas telah dilakukan penyesuaian halaman beranda sesuai kabupaten/kota masing-masing. Kami juga telah melakukan pembaruan pada fitur unggah RKT satuan pendidikan. Bagi sekolah yang sebelumnya mengalami kendala, dipersilakan melakukan submit ulang.',
  },
  {
    id: 'ann-2',
    title: 'Informasi Penyesuaian Akun dan Validasi NPSN',
    date: 'Senin, 24 Agustus 2026',
    tag: 'Bantuan Akun',
    content:
      'Bagi Satuan Pendidikan yang belum memiliki akun ataupun mengalami kendala login, silahkan menghubungi pihak Dinas Pendidikan atau Cabang Dinas Pendidikan kabupaten/kota masing-masing dengan membawa SK penetapan kepala satuan pendidikan.',
  },
  {
    id: 'ann-3',
    title: 'Webinar Sosialisasi & Peluncuran Aplikasi ARP',
    date: 'Kamis, 20 Agustus 2026',
    tag: 'Webinar Sosialisasi',
    content:
      'Rekaman webinar sosialisasi integrasi instrumen Peta Mutu, Rapor Pendidikan, dan Perencanaan Berbasis Data (PBD) untuk seluruh satuan pendidikan se-Jawa Timur.',
    hasVideo: true,
    videoUrl: 'https://www.youtube.com/embed/bQ8elBNJF1A?si=rWIkZ8aY20WgxJmD',
  },
];

// Target school: SD NEGERI GUNUNGSARI 04 BATU (20536900)
export const DEFAULT_SCHOOL: SchoolProfile = {
  npsn: '20536900',
  name: 'SD NEGERI GUNUNGSARI 04 BATU',
  level: 'SD',
  status: 'Negeri',
  accreditation: 'B',
  accreditationScore: 86.4,
  curriculum: 'Kurikulum Merdeka',
  address: 'Jl. Argomulyo 20 Brau, RT 02 / RW 10',
  village: 'Gunungsari',
  district: 'Kec. Bumiaji',
  districtCode: '056802',
  city: 'Kota Batu',
  cityCode: '056800',
  province: 'Provinsi Jawa Timur',
  provinceCode: '050000',
  postalCode: '65337',
  principal: 'Supardi, S.Pd., M.M.',
  supervisor: 'Drs. H. Bambang Irawan, M.Pd. (Pengawas Wilayah Bumiaji)',
  studentsCount: 148,
  teachersCount: 11,
  classesCount: 6,
  roomsCount: 6,
  electricity: 'PLN 2.200 VA',
  internet: 'Telkom Speedy / Fiber 50 Mbps',
  lat: -7.8242,
  lng: 112.5186,
};

// 8 Standar Nasional Pendidikan (SNP) for SDN Gunungsari 04
export const DEFAULT_SNP_STANDARDS: SnpStandardData[] = [
  {
    id: 'snp-1',
    code: 'SKL',
    name: 'Standar Kompetensi Lulusan',
    score: 81.5,
    scale7: 5.71,
    target: 85.0,
    score2024: 76.2,
    score2025: 79.1,
    score2026: 81.5,
    category: 'Baik',
    color: '#0284c7',
    indicators: [
      { code: '1.1', name: 'Kompetensi Sikap Beriman dan Budi Pekerti', score: 86.2, target: 88, category: 'Sangat Baik', description: 'Pelaksanaan pembiasaan doa bersama dan gotong royong berkala.' },
      { code: '1.2', name: 'Kompetensi Pengetahuan & Pemikiran Kritis', score: 79.4, target: 85, category: 'Baik', description: 'Pemahaman konsep dasar kurikulum tematik terintegrasi.' },
      { code: '1.3', name: 'Kompetensi Keterampilan & Kreativitas', score: 78.9, target: 82, category: 'Baik', description: 'Portofolio karya seni dan eksperimen sains dasar peserta didik.' },
    ],
  },
  {
    id: 'snp-2',
    code: 'ISI',
    name: 'Standar Isi',
    score: 79.0,
    scale7: 5.53,
    target: 84.0,
    score2024: 74.8,
    score2025: 77.2,
    score2026: 79.0,
    category: 'Baik',
    color: '#0d9488',
    indicators: [
      { code: '2.1', name: 'Kesesuaian Muatan Kurikulum Satuan Pendidikan (KSP)', score: 81.0, target: 85, category: 'Baik', description: 'Dokumen KSP telah selaras dengan capaian pembelajaran fase A, B, C.' },
      { code: '2.2', name: 'Beban Belajar dan Pembelajaran Kontekstual Pertanian Lokal', score: 80.5, target: 83, category: 'Baik', description: 'Integrasi kearifan lokal pertanian apel dan sayur Bumiaji.' },
      { code: '2.3', name: 'Pengembangan Perangkat Modul Ajar Berdiferensiasi', score: 75.5, target: 85, category: 'Baik', description: 'Sebagian modul ajar masih mengadopsi template umum tanpa adaptasi.' },
    ],
  },
  {
    id: 'snp-3',
    code: 'PROSES',
    name: 'Standar Proses',
    score: 68.1,
    scale7: 4.77,
    target: 85.0,
    score2024: 63.5,
    score2025: 66.0,
    score2026: 68.1,
    category: 'Cukup',
    color: '#eab308',
    indicators: [
      { code: '3.1', name: 'Perencanaan Pelaksanaan Pembelajaran Aktif', score: 73.0, target: 85, category: 'Baik', description: 'Rancangan skenario pembelajaran interaktif di kelas.' },
      { code: '3.2', name: 'Pemanfaatan Media Pembelajaran Digital & Manipulatif', score: 62.4, target: 82, category: 'Cukup', description: 'Penggunaan media interaktif dan alat peraga matematika masih terbatas.' },
      { code: '3.3', name: 'Pengawasan dan Evaluasi Proses Belajar Melalui Supervisi Klinis', score: 69.0, target: 85, category: 'Cukup', description: 'Frekuensi supervisi klinis oleh kepala sekolah perlu ditingkatkan.' },
    ],
  },
  {
    id: 'snp-4',
    code: 'PENILAIAN',
    name: 'Standar Penilaian Pendidikan',
    score: 76.4,
    scale7: 5.35,
    target: 83.0,
    score2024: 71.0,
    score2025: 74.2,
    score2026: 76.4,
    category: 'Baik',
    color: '#8b5cf6',
    indicators: [
      { code: '4.1', name: 'Bentuk Penilaian Formatif Berkala Berkelanjutan', score: 78.5, target: 85, category: 'Baik', description: 'Pemanfaatan rubrik observasi dan asesmen awal diagnostik.' },
      { code: '4.2', name: 'Pelaksanaan Asesmen Sumatif Akhir Semester', score: 81.2, target: 85, category: 'Baik', description: 'Kelengkapan instrumen soal berorientasi penalaran HOTS.' },
      { code: '4.3', name: 'Tindak Lanjut Remedial dan Pengayaan Berbasis Data', score: 69.5, target: 80, category: 'Cukup', description: 'Pencatatan program pengayaan siswa berbakat masih manual.' },
    ],
  },
  {
    id: 'snp-5',
    code: 'PTK',
    name: 'Standar Pendidik dan Tenaga Kependidikan',
    score: 71.8,
    scale7: 5.03,
    target: 85.0,
    score2024: 67.2,
    score2025: 69.8,
    score2026: 71.8,
    category: 'Baik',
    color: '#3b82f6',
    indicators: [
      { code: '5.1', name: 'Kualifikasi Akademik Guru S1/D4', score: 91.0, target: 100, category: 'Sangat Baik', description: '10 dari 11 guru telah memiliki gelar S1 Pendidikan.' },
      { code: '5.2', name: 'Sertifikasi Pendidik (Gr.)', score: 63.6, target: 85, category: 'Cukup', description: '7 dari 11 guru telah memiliki sertifikat pendidik profesional.' },
      { code: '5.3', name: 'Keaktifan Pengembangan Keprofesian Berkelanjutan (PKB/PMM)', score: 60.8, target: 80, category: 'Cukup', description: 'Aksi nyata di PMM masih minim pada topik diferensiasi pembelajaran.' },
    ],
  },
  {
    id: 'snp-6',
    code: 'SARPRAS',
    name: 'Standar Sarana dan Prasarana',
    score: 62.4,
    scale7: 4.37,
    target: 80.0,
    score2024: 58.0,
    score2025: 60.5,
    score2026: 62.4,
    category: 'Cukup',
    color: '#f97316',
    indicators: [
      { code: '6.1', name: 'Ketersediaan dan Kelayakan Ruang Kelas', score: 78.0, target: 85, category: 'Baik', description: '6 ruang kelas dalam kondisi baik dan terawat.' },
      { code: '6.2', name: 'Kelengkapan Perpustakaan dan Pojok Baca Ramah Anak', score: 54.2, target: 80, category: 'Kurang', description: 'Koleksi buku bacaan non-pelajaran dan buku literasi masih sangat terbatas.' },
      { code: '6.3', name: 'Laboratorium Komputer / Chromebook & Sanitasi Sekolah', score: 55.0, target: 75, category: 'Kurang', description: 'Jumlah Chromebook terbatas (hanya 8 unit untuk 148 siswa).' },
    ],
  },
  {
    id: 'snp-7',
    code: 'PENGELOLAAN',
    name: 'Standar Pengelolaan',
    score: 83.2,
    scale7: 5.82,
    target: 88.0,
    score2024: 79.0,
    score2025: 81.3,
    score2026: 83.2,
    category: 'Baik',
    color: '#10b981',
    indicators: [
      { code: '7.1', name: 'Penyusunan Rencana Kerja Jangka Menengah (RKJM) & RKT', score: 86.0, target: 90, category: 'Sangat Baik', description: 'Dokumen RKT dan Rencana Kerja Sekolah tersusun tepat waktu.' },
      { code: '7.2', name: 'Keterlibatan Komite Sekolah dan Orang Tua', score: 84.5, target: 88, category: 'Baik', description: 'Partisipasi orang tua dalam paguyuban kelas cukup aktif.' },
      { code: '7.3', name: 'Sistem Informasi Manajemen Sekolah (Dapodik & Arkas)', score: 79.1, target: 85, category: 'Baik', description: 'Sinkronisasi data Dapodik berkala tanpa keterlambatan.' },
    ],
  },
  {
    id: 'snp-8',
    code: 'PEMBIAYAAN',
    name: 'Standar Pembiayaan',
    score: 85.0,
    scale7: 5.95,
    target: 88.0,
    score2024: 82.5,
    score2025: 83.8,
    score2026: 85.0,
    category: 'Sangat Baik',
    color: '#059669',
    indicators: [
      { code: '8.1', name: 'Alokasi Anggaran Operasional Non-Personalia', score: 87.0, target: 90, category: 'Sangat Baik', description: 'Pemanfaatan dana BOS reguler sesuai juknis Permendikbudristek.' },
      { code: '8.2', name: 'Transparansi dan Akuntabilitas Laporan Keuangan RKAS', score: 85.5, target: 90, category: 'Sangat Baik', description: 'Laporan dipublikasikan di papan transparansi sekolah dan aplikasi ARKAS.' },
      { code: '8.3', name: 'Efisiensi Penggunaan Anggaran Pembenahan Mutu', score: 82.5, target: 85, category: 'Baik', description: 'Alokasi untuk pelatihan guru dan literasi perlu ditingkatkan proporsinya.' },
    ],
  },
];

// Rapor Pendidikan & Standar Pelayanan Minimal (SPM) Kemendikbudristek
export const DEFAULT_RAPOR_INDICATORS: RaporIndicator[] = [
  {
    code: 'A.1',
    name: 'Kemampuan Literasi',
    score: 78.4,
    label: 'Baik',
    trend: 'Meningkat',
    delta: '+5.3',
    color: '#16a34a',
    definition: 'Persentase peserta didik yang mencapai kompetensi minimum dalam membaca dan memahami teks informasi serta fiksi.',
    priorityOrder: 2,
  },
  {
    code: 'A.2',
    name: 'Kemampuan Numerasi',
    score: 62.1,
    label: 'Sedang',
    trend: 'Stabil',
    delta: '+1.4',
    color: '#eab308',
    definition: 'Persentase peserta didik yang mencapai batas minimal kecakapan matematika, logika berpikir, dan analisis kuantitatif.',
    priorityOrder: 1, // Highest priority root cause
  },
  {
    code: 'A.3',
    name: 'Karakter Peserta Didik',
    score: 81.2,
    label: 'Baik',
    trend: 'Meningkat',
    delta: '+4.1',
    color: '#16a34a',
    definition: 'Penerapan profil Pelajar Pancasila: beriman, mandiri, gotong royong, bernalar kritis, dan kreatif.',
    priorityOrder: 5,
  },
  {
    code: 'D.1',
    name: 'Kualitas Pembelajaran',
    score: 72.8,
    label: 'Baik',
    trend: 'Meningkat',
    delta: '+3.2',
    color: '#16a34a',
    definition: 'Keteraturan suasana kelas, interaksi pembelajaran aktif, dan penerapan umpan balik konstruktif guru.',
    priorityOrder: 3,
  },
  {
    code: 'D.4',
    name: 'Iklim Keamanan Satuan Pendidikan',
    score: 88.5,
    label: 'Baik',
    trend: 'Meningkat',
    delta: '+2.8',
    color: '#16a34a',
    definition: 'Bebas dari perundungan (bullying), kekerasan fisik/verbal, serta bebas dari narkoba dan diskriminasi.',
    priorityOrder: 7,
  },
  {
    code: 'D.8',
    name: 'Iklim Kebinekaan',
    score: 84.0,
    label: 'Baik',
    trend: 'Stabil',
    delta: '+0.9',
    color: '#16a34a',
    definition: 'Toleransi agama dan budaya, komitmen kebangsaan, dan kesetaraan hak seluruh warga satuan pendidikan.',
    priorityOrder: 6,
  },
  {
    code: 'D.10',
    name: 'Iklim Inklusivitas & Disabilitas',
    score: 66.5,
    label: 'Sedang',
    trend: 'Stabil',
    delta: '+1.1',
    color: '#eab308',
    definition: 'Layanan bagi peserta didik berkebutuhan khusus dan fasilitas ramah anak disabilitas.',
    priorityOrder: 4,
  },
];

// Root Cause Analysis (Akar Masalah)
export const DEFAULT_ROOT_CAUSES: RootCauseItem[] = [
  {
    id: 'rc-1',
    issueIndicator: 'A.2 Kemampuan Numerasi (Skor: 62.1 - Sedang)',
    currentScore: 62.1,
    targetScore: 80.0,
    rootCauses: [
      {
        level: 'Standar Proses (68.1)',
        factor: 'Metode Pembelajaran Masih Konvensional',
        description: 'Guru dominan menggunakan metode ceramah dan hafalan rumus tanpa melibatkan benda konkrit atau kontekstual lingkungan perkebunan Gunungsari.',
        suggestedAction: 'Pelatihan model pembelajaran Project-Based Learning (PjBL) tematik numerasi perkebunan apel.',
      },
      {
        level: 'Standar Sarpras (62.4)',
        factor: 'Ketiadaan Media Manipulatif Matematika',
        description: 'Alat peraga matematika seperti balok bangun ruang, pecahan magnetik, dan timbangan digital belum tersedia memadai.',
        suggestedAction: 'Pengadaan Paket Kit Alat Peraga Matematika Sekolah Dasar melalui BOS Reguler.',
      },
      {
        level: 'Standar PTK (71.8)',
        factor: 'Kombel Belum Membahas Modul Numerasi',
        description: 'Pertemuan Komunitas Belajar (Kombel) antar guru masih fokus pada administrasi daripada bedah asesmen awal numerasi.',
        suggestedAction: 'Jadwal rutin mingguan Kombel sekolah khusus bedah instrumen asesmen diagnostik numerasi.',
      },
    ],
  },
  {
    id: 'rc-2',
    issueIndicator: 'Standar Sarana & Prasarana (Skor: 62.4 - Cukup)',
    currentScore: 62.4,
    targetScore: 78.0,
    rootCauses: [
      {
        level: 'Perpustakaan & Pojok Baca (54.2)',
        factor: 'Buku Fiksi / Non-Pelajaran Terbatas',
        description: 'Koleksi perpustakaan 85% didominasi buku paket pelajaran yang sudah usang, kurang buku pengayaan bergambar untuk fase A.',
        suggestedAction: 'Pengalokasian minimal 15% dana belanja buku BOS untuk buku cerita bermutu Ramah Anak.',
      },
      {
        level: 'Digitalisasi Sekolah (55.0)',
        factor: 'Rasio Chromebook Hanya 8 Unit',
        description: 'Untuk pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK), sekolah masih harus membagi sesi hingga 3 gelombang.',
        suggestedAction: 'Usulan penambahan perangkat TIK melalui DAK Fisik atau Dana BOS Afirmasi/Kinerja.',
      },
    ],
  },
];

// Rekomendasi Program Benahi terhubung Kode ARKAS Kemendikbudristek
export const DEFAULT_ARKAS_PROGRAMS: ArkasRecommendation[] = [
  {
    id: 'ark-1',
    code: '02.04.03',
    name: 'Peningkatan Kompetensi Guru dalam Pembelajaran Numerasi dan Diferensiasi',
    standardTarget: 'Standar PTK & Standar Proses',
    estimatedBudget: 3500000,
    isNonCost: false,
    fundingSource: 'BOS Reguler',
    status: 'in_arkas',
    beneficiary: '11 Guru Kelas & Mapel',
    timeline: 'Triwulan I (Februari - Maret)',
  },
  {
    id: 'ark-2',
    code: '03.01.08',
    name: 'Pengadaan Alat Peraga Edukatif Matematika (Kit Manipulatif dan Geometri)',
    standardTarget: 'Standar Sarana Prasarana',
    estimatedBudget: 5200000,
    isNonCost: false,
    fundingSource: 'BOS Reguler',
    status: 'in_arkas',
    beneficiary: 'Siswa Rombel 1 s.d. 6 (148 Siswa)',
    timeline: 'Triwulan I (Januari)',
  },
  {
    id: 'ark-3',
    code: '03.04.02',
    name: 'Pengadaan Buku Bacaan Bermutu / Literasi Non-Teks Ramah Anak untuk Pojok Baca',
    standardTarget: 'Standar Sarana Prasarana & Standar Isi',
    estimatedBudget: 6800000,
    isNonCost: false,
    fundingSource: 'BOS Reguler',
    status: 'approved',
    beneficiary: 'Seluruh Siswa & Perpustakaan',
    timeline: 'Triwulan II (April - Mei)',
  },
  {
    id: 'ark-4',
    code: 'NON-BIAYA-01',
    name: 'Optimalisasi Komunitas Belajar (Kombel) Guru "Argomulyo Hebat" Setiap Jumat Pekan 2 & 4',
    standardTarget: 'Standar Proses & Standar Pendidik',
    estimatedBudget: 0,
    isNonCost: true,
    fundingSource: 'Non-Biaya',
    status: 'in_arkas',
    beneficiary: 'Dewan Guru SDN Gunungsari 04',
    timeline: 'Sepanjang Tahun Ajaran (Berkala)',
  },
  {
    id: 'ark-5',
    code: '04.02.01',
    name: 'Pelaksanaan Asesmen Diagnostik Awal dan Pemantauan Hasil Belajar Siswa',
    standardTarget: 'Standar Penilaian Pendidikan',
    estimatedBudget: 1800000,
    isNonCost: false,
    fundingSource: 'BOS Reguler',
    status: 'approved',
    beneficiary: 'Siswa Kelas 1 s.d 6',
    timeline: 'Triwulan I & III',
  },
  {
    id: 'ark-6',
    code: 'NON-BIAYA-02',
    name: 'Gerakan Kamis Membaca 15 Menit dan Jurnal Numerasi Pertanian Lokal',
    standardTarget: 'Standar Kompetensi Lulusan (SKL)',
    estimatedBudget: 0,
    isNonCost: true,
    fundingSource: 'Non-Biaya',
    status: 'approved',
    beneficiary: 'Seluruh Peserta Didik',
    timeline: 'Setiap Hari Kamis',
  },
  {
    id: 'ark-7',
    code: '05.01.03',
    name: 'Pemeliharaan Ringan Sarana Sanitasi dan Pengadaan Handwash Antiseptik Ramah Anak',
    standardTarget: 'Standar Sarana Prasarana',
    estimatedBudget: 2400000,
    isNonCost: false,
    fundingSource: 'BOS Reguler',
    status: 'draft',
    beneficiary: 'Lingkungan Sekolah',
    timeline: 'Triwulan II',
  },
];

// Dokumen RKT and Pengawas Verification
export const DEFAULT_RKT_DOCUMENTS: RktDocument[] = [
  {
    id: 'rkt-2026',
    title: 'Rencana Kerja Tahunan (RKT) SDN Gunungsari 04 Tahun Anggaran 2026',
    academicYear: '2025/2026',
    uploadDate: '28 Agustus 2026, 14:22 WIB',
    fileSize: '4.8 MB (PDF)',
    uploadedBy: 'Supardi, S.Pd., M.M. (Kepala Sekolah)',
    status: 'Disetujui',
    supervisorNotes:
      'Dokumen RKT telah diverifikasi. Program benahi fokus numerasi telah terpetakan dengan baik pada sub kegiatan ARKAS 02.04.03 dan 03.01.08. Catatan: agar pelaksanaan Kombel rutin dilaporkan per triwulan.',
  },
  {
    id: 'rkt-2025',
    title: 'Rencana Kerja Tahunan (RKT) SDN Gunungsari 04 Tahun Anggaran 2025',
    academicYear: '2024/2025',
    uploadDate: '15 September 2025, 09:10 WIB',
    fileSize: '3.9 MB (PDF)',
    uploadedBy: 'Supardi, S.Pd., M.M. (Kepala Sekolah)',
    status: 'Disetujui',
    supervisorNotes: 'RKT disetujui tanpa catatan revisi mayor.',
  },
];

// District Schools Directory for Kota Batu
export interface DistrictDirectory {
  code: string;
  name: string;
  schools: { npsn: string; name: string; level: string; status: 'Negeri' | 'Swasta'; score: number }[];
}

export const KOTA_BATU_DISTRICTS: DistrictDirectory[] = [
  {
    code: '056802',
    name: 'Kecamatan Bumiaji',
    schools: [
      { npsn: '20536900', name: 'SD NEGERI GUNUNGSARI 04 BATU', level: 'SD', status: 'Negeri', score: 76.8 },
      { npsn: '20536897', name: 'SD NEGERI GUNUNGSARI 01', level: 'SD', status: 'Negeri', score: 78.2 },
      { npsn: '20536912', name: 'SD NEGERI TULUNGREJO 01', level: 'SD', status: 'Negeri', score: 81.5 },
      { npsn: '20536914', name: 'SD NEGERI PUNCAKWANGI', level: 'SD', status: 'Negeri', score: 74.0 },
      { npsn: '20536920', name: 'SMP NEGERI 4 BATU', level: 'SMP', status: 'Negeri', score: 82.4 },
    ],
  },
  {
    code: '056801',
    name: 'Kecamatan Batu',
    schools: [
      { npsn: '20536850', name: 'SD NEGERI SISIR 03', level: 'SD', status: 'Negeri', score: 83.1 },
      { npsn: '20536855', name: 'SD NEGERI TEMAS 01', level: 'SD', status: 'Negeri', score: 80.4 },
      { npsn: '20536862', name: 'SMP NEGERI 1 BATU', level: 'SMP', status: 'Negeri', score: 87.6 },
    ],
  },
  {
    code: '056803',
    name: 'Kecamatan Junrejo',
    schools: [
      { npsn: '20536870', name: 'SD NEGERI JUNREJO 01', level: 'SD', status: 'Negeri', score: 79.5 },
      { npsn: '20536875', name: 'SD NEGERI MOJOREJO 01', level: 'SD', status: 'Negeri', score: 81.0 },
      { npsn: '20536880', name: 'SMP NEGERI 3 BATU', level: 'SMP', status: 'Negeri', score: 84.2 },
    ],
  },
];
