# Video Anak YouTube — Belajar Warna

Video edukasi anak untuk mengenal warna, dibuat dengan [Remotion](https://www.remotion.dev/) (video dari kode React).

## Isi video (± 87 detik, 1920×1080, 30 fps, dengan narasi & musik)

1. **Intro** — judul "Belajar Warna" dengan huruf warna-warni + narasi *"Halo teman-teman! Ayo kita belajar warna bersama-sama!"*
2. **6 adegan warna** — Merah (apel), Kuning (matahari), Biru (ikan), Hijau (daun), Oranye (jeruk), Ungu (anggur). Narasi mengucapkan nama warna, nama Inggrisnya, dan kalimat contoh; teks muncul tepat saat diucapkan.
3. **Outro** — *"Hebat! Kamu sudah belajar warna! Ayo kita ulangi!"*, lalu tiap warna disebut sambil lingkarannya membesar, ditutup *"Sampai jumpa lagi, dadah!"*

Audio: musik latar ceria (otomatis mengecil saat narasi berbicara), efek "pop" & "ting". Loudness akhir ±-14 LUFS (standar YouTube).

## Cara pakai

```bash
npm install
npm run dev      # buka Remotion Studio untuk preview & edit
npm run render   # render ke out/belajar-warna.mp4
npm run still    # buat gambar thumbnail ke out/thumbnail.png
```

## Struktur

```
src/
  index.ts            # registerRoot
  Root.tsx            # daftar composition (BelajarWarna 1920x1080)
  BelajarWarna.tsx    # menyusun intro → adegan warna → outro dengan transisi
  data/warna.ts       # ⭐ daftar warna (tampilan) — edit di sini
  data/naskah.json    # ⭐ teks narasi yang diucapkan
  data/timeline.ts    # menghitung timing dari durasi narasi
  scenes/             # Intro, AdeganWarna, Outro
  components/         # Objek (SVG), Gelembung, MusikLatar, Narasi/Efek
  fonts.ts            # font Fredoka (lokal, di public/fonts)
public/               # font, narasi/, audio/ (musik & efek)
tools/                # skrip Python pembuat narasi & musik
```

## Audio

| File | Isi | Dibuat oleh |
|---|---|---|
| `public/narasi/*.mp3` | Narasi per kalimat (suara **Jessica**, ElevenLabs, gaya *excited*) | `tools/buat_narasi_elevenlabs.py` |
| `src/data/durasi-narasi.json` | Durasi tiap narasi → menentukan timing video | skrip narasi |
| `public/audio/musik-ceria.mp3` | Musik latar (marimba, ukulele, bas, perkusi; 124 BPM) | `tools/buat_musik.py` |
| `public/audio/pop.mp3`, `ting.mp3` | Efek suara | `tools/buat_musik.py` |

File audio sudah disertakan di repo, jadi `npm run render` langsung jalan. Buat ulang hanya jika ingin mengubah narasi/musik.

### Mengubah narasi (ElevenLabs)

1. Edit teks yang diucapkan di `src/data/naskah.json`.
2. Buat ulang suaranya:
   ```bash
   export ELEVENLABS_API_KEY=sk_...                 # di Claude Code cloud tidak perlu (key dipasang otomatis)
   python tools/buat_narasi_elevenlabs.py           # hanya kalimat yang berubah (hemat kuota)
   python tools/buat_narasi_elevenlabs.py merah-nama   # paksa buat ulang kalimat tertentu
   ```
   Hanya butuh Python 3 dan ffmpeg. `tools/narasi-cache.json` mencatat kalimat yang sudah dibuat.
3. Durasi video menyesuaikan otomatis.

Pengaturan di `tools/buat_narasi_elevenlabs.py`:
- `SUARA_ID`, `MODEL`, `GAYA` — suara, model (`eleven_v3`), dan tag gaya (`[excited]`).
- `EJAAN_TTS` — ejaan khusus suara agar kata Indonesia terucap benar (mis. `ungu` → `unggu`). Tulisan di layar tidak berubah.
- `SEED_KHUSUS` — kalau satu kalimat terdengar kurang jelas, coba seed lain untuk kalimat itu.

Biaya: naskah ini ±1.000 karakter. Paket Free ElevenLabs (10.000 karakter/bulan) **tidak untuk pemakaian komersial** — untuk video yang dimonetisasi, pakai paket berbayar (minimal Starter) saat membuat narasi final.

### Alternatif: suara lokal gratis (tanpa API key)

```bash
pip install -r tools/requirements.txt
bash tools/unduh_model_suara.sh          # model suara Indonesia + Whisper (±600 MB)
python tools/buat_narasi.py
```
Kualitasnya di bawah ElevenLabs (suara gaya pembaca berita), tapi gratis & offline.

**Mau suara manusia sungguhan?** Rekam sendiri dengan nama file yang sama (mis. `public/narasi/merah-nama.mp3`), lalu perbarui angka detiknya di `src/data/durasi-narasi.json`.

### Mengubah musik

Edit `MELODI`, `AKOR`, atau `BPM` di `tools/buat_musik.py`, lalu `python tools/buat_musik.py`.
Volume musik & ducking: `src/components/MusikLatar.tsx`. Untuk mematikan musik, set `pakaiMusik: false` di `src/Root.tsx`.

## Mengubah konten

- **Tambah/ubah warna:** edit `DAFTAR_WARNA` di `src/data/warna.ts`, tambahkan kalimat `<id>-nama`, `<id>-english`, `<id>-kalimat`, `outro-<id>` di `src/data/naskah.json`, lalu jalankan `python tools/buat_narasi_elevenlabs.py`.
- **Objek baru:** tambah gambar SVG di `src/components/Objek.tsx` dan nama objeknya di tipe `NamaObjek`.
- **Tempo / jeda antar kalimat:** ubah `JEDA` di `src/data/timeline.ts`.

## Catatan

- Render pertama kali akan mengunduh Chrome Headless Shell. Jika jaringan dibatasi, pakai browser yang sudah ada:
  `npx remotion render BelajarWarna out/belajar-warna.mp4 --browser-executable=/path/ke/chrome`
- **Lisensi audio:** musik & efek suara dibuat sendiri dari nol oleh `tools/buat_musik.py`, jadi bebas hak cipta. Narasi dibuat dengan ElevenLabs: lisensi komersial hanya berlaku jika dibuat dengan paket berbayar.
- Remotion gratis untuk individu & tim kecil; perusahaan besar butuh lisensi — lihat https://www.remotion.dev/license.
