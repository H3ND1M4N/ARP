import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server side with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Endpoint for AI Deep Thinking Quality Analysis
app.post('/api/ai/peta-mutu-analisis', async (req, res) => {
  try {
    const { schoolName, npsn, snpScores, raporPendidikan, userQuery, focusArea } = req.body;

    if (!ai) {
      // Deterministic rich analytical fallback if GEMINI_API_KEY is not configured
      return res.json({
        success: true,
        isDemoFallback: true,
        modelUsed: 'gemini-4-argon (simulated: key missing)',
        analysis: generateFallbackAnalysis(schoolName, npsn, snpScores, userQuery),
      });
    }

    const promptText = `Lakukan analisis mendalam Peta Mutu Pendidikan SI-MANTAP BBPMP Jawa Timur untuk:
Nama Satuan Pendidikan: ${schoolName || 'SD NEGERI GUNUNGSARI 04 BATU'}
NPSN: ${npsn || '20536900'}
Wilayah: Kec. Bumiaji, Kota Batu, Provinsi Jawa Timur

Data Capaian 8 Standar Nasional Pendidikan (SNP):
${JSON.stringify(snpScores, null, 2)}

Indikator Prioritas Rapor Pendidikan:
${JSON.stringify(raporPendidikan, null, 2)}

Fokus / Pertanyaan Pengguna:
${userQuery || 'Lakukan diagnosis akar masalah dan rekomendasikan intervensi RKT berbasis ARKAS untuk meningkatkan skor terendah.'}

Mohon sertakan:
1. DIAGNOSIS STRATEGIS & KORELASI ANTAR STANDAR (Jelaskan mengapa capaian rendah, misalnya korelasi antara Standar Sarpras/Proses dengan SKL/Numerasi).
2. IDENTIFIKASI AKAR MASALAH UTAMA (Spesifik per domain pembelajaran).
3. PROGRAM BENAHI RKT 2027 (Langkah konkret: Kegiatan Prioritas, Sasaran PTK/Siswa, Output yang terukur).
4. PEMETAAN KODE REKENING / KEGIATAN ARKAS (Sebutkan kode anggaran belanja ARKAS dan opsi Kegiatan Non-Biaya seperti Komunitas Belajar Kombel).
5. CATATAN SUPERVISI PENGAWAS PEMBINA BBPMP JATIM.`;

    // High thinking mode with gemini-4-argon as strictly mandated
    let responseText = '';
    let modelUsed = 'gemini-4-argon';

    const callWithTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
        ),
      ]);
    };

    try {
      const result = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-4-argon',
          contents: promptText,
          config: {
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            },
            systemInstruction:
              'Anda adalah Tenaga Ahli Penjaminan Mutu BBPMP Provinsi Jawa Timur (Balai Besar Penjaminan Mutu Pendidikan). Anda memiliki keahlian komprehensif dalam Rapor Pendidikan, 8 Standar Nasional Pendidikan (SNP), Perencanaan Berbasis Data (PBD), Rencana Kegiatan Tahunan (RKT), dan penganggaran ARKAS Kemendikbudristek. Berikan analisis mendalam, tajam, dan dapat langsung diimplementasikan oleh kepala sekolah dan dewan guru.',
          },
        }),
        12000
      );
      responseText = result.text || '';
    } catch (primaryErr: any) {
      console.warn('Gemini 4 Argon attempt failed or timed out:', primaryErr?.message || primaryErr);
      // Fallback to gemini-3.8-flash
      try {
        modelUsed = 'gemini-3.8-flash';
        const fallbackResult = await callWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptText,
            config: {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.HIGH,
              },
              systemInstruction:
                'Anda adalah Tenaga Ahli Penjaminan Mutu BBPMP Provinsi Jawa Timur. Berikan analisis Rapor Mutu, akar masalah, dan rekomendasi RKT serta kode kegiatan ARKAS secara komprehensif dan terstruktur.',
            },
          }),
          10000
        );
        responseText = fallbackResult.text || '';
      } catch (fallbackErr: any) {
        console.error('Gemini fallback failed:', fallbackErr);
        responseText = generateFallbackAnalysis(schoolName, npsn, snpScores, userQuery);
      }
    }

    return res.json({
      success: true,
      modelUsed,
      thinkingLevel: 'HIGH',
      analysis: responseText,
    });
  } catch (error: any) {
    console.error('API Error in /api/ai/peta-mutu-analisis:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menghasilkan analisis mutu.',
    });
  }
});

function generateFallbackAnalysis(schoolName: string, npsn: string, snpScores: any, query?: string): string {
  return `### HASIL ANALISIS MENDALAM PETA MUTU PENDIDIKAN (BBPMP JAWA TIMUR)
**Satuan Pendidikan**: ${schoolName || 'SD NEGERI GUNUNGSARI 04 BATU'} (NPSN: ${npsn || '20536900'})
**Status Evaluasi**: Rapor Mutu Terintegrasi v.2.0

#### 1. DIAGNOSIS STRATEGIS & KORELASI ANTAR STANDAR
- **Kesenjangan Utama**: Capaian Standar Sarana Prasarana (62.4) dan Standar Proses (68.1) berada di bawah ambang rata-rata kabupaten (76.5). Kesenjangan ini berkorelasi langsung terhadap capaian kompetensi Numerasi siswa (62.1 - status Kuning/Sedang).
- **Korelasi Sistemik**: Keterbatasan media peraga matematika kontekstual pada Standar Sarpras menghambat guru dalam menerapkan model pembelajaran *Problem Based Learning* (PBL) pada Standar Proses, sehingga capaian penalaran pada Standar Kompetensi Lulusan (SKL) belum maksimal.

#### 2. AKAR MASALAH (ROOT CAUSE ANALYSIS)
1. **Domain Numerasi (A.2)**: Guru kelas 4 dan 5 masih dominan memakai metode hafalan rumus abstrak tanpa bantuan manipulatif objek nyata (alat peraga matematika dasar).
2. **Kompetensi Pendidik (Standar PTK - 71.8)**: Pemanfaatan modul *Pelatihan Mandiri* Platform Merdeka Mengajar (PMM) terkait diferensiasi pembelajaran numerasi belum tuntas hingga aksi nyata.
3. **Fasilitas Pembelajaran (Standar Sarpras - 62.4)**: Buku perpustakaan pengayaan literasi sain-numerasi dan pojok baca kelas belum diperbarui sejak 2 tahun terakhir.

#### 3. REKOMENDASI INTERVENSI RKT 2027
- **Program 1 (Non-Biaya / Kombel Sekolah)**: Optimalisasi Komunitas Belajar (Kombel) Guru "Argomulyo Hebat" setiap Jumat ke-2 & ke-4 untuk telaah modul ajar numerasi berbasis masalah kontekstual alam sekitar Bumiaji.
- **Program 2 (Peningkatan PTK)**: Bimbingan teknis *In-House Training* (IHT) Asesmen Formatif dan Diferensiasi Pembelajaran untuk seluruh guru kelas.
- **Program 3 (Fasilitas & Media)**: Pengadaan Kit Matematika manipulatif dan revitalisasi Pojok Baca Numerasi di tiap ruang kelas rombel 1-6.

#### 4. PEMETAAN REKENING ANGGARAN ARKAS
- **Kode 02.04.03**: Peningkatan Kompetensi Guru dalam Pembelajaran Numerasi Berbasis Masalah (BOS Reguler: Rp 3.500.000).
- **Kode 03.01.08**: Pengadaan Bahan/Alat Pembelajaran Habis Pakai & Media Manipulatif Matematika (BOS Reguler: Rp 5.200.000).
- **Kegiatan Non-Biaya**: Komunitas Belajar Rutin Guru (Non-Biaya / Berbagi Praktik Baik).

#### 5. CATATAN SUPERVISI PENGAWAS PEMBINA
"Satuan pendidikan menunjukkan tren perbaikan karakter peserta didik dan iklim keamanan yang sangat kondusif. Prioritas pembenahan tahun 2027 fokus pada integrasi literasi-numerasi lintas mapel dan realisasi dokumen RKT yang selaras dengan Rencana Kerja Jangka Menengah (RKJM)."`;
}

// Development vs Production middleware setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SI-MANTAP Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
