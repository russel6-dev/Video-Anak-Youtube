# Video Anak YouTube — Belajar Warna

Video edukasi anak untuk mengenal warna, dibuat dengan [Remotion](https://www.remotion.dev/) (video dari kode React).

## Isi video (± 41 detik, 1920×1080, 30 fps)

1. **Intro** — judul "Belajar Warna" dengan huruf warna-warni yang jatuh dan memantul.
2. **6 adegan warna** — Merah (apel), Kuning (matahari), Biru (ikan), Hijau (daun), Oranye (jeruk), Ungu (anggur). Tiap adegan menampilkan objek lucu, nama warna, nama dalam Bahasa Inggris, dan kalimat contoh.
3. **Outro** — "Hebat! Kamu sudah belajar warna!" dengan rangkuman semua warna.

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
  data/warna.ts       # ⭐ daftar warna & durasi — edit di sini
  scenes/             # Intro, AdeganWarna, Outro
  components/         # Objek (gambar SVG), Gelembung (latar animasi)
  fonts.ts            # font Fredoka (lokal, di public/fonts)
public/               # aset statis: font, nanti musik/suara narasi
```

## Mengubah konten

- **Tambah/ubah warna:** edit `DAFTAR_WARNA` di `src/data/warna.ts`. Durasi video menyesuaikan otomatis.
- **Objek baru:** tambah gambar SVG di `src/components/Objek.tsx` dan nama objeknya di tipe `NamaObjek`.
- **Durasi:** ubah `DURASI_INTRO`, `DURASI_PER_WARNA`, `DURASI_OUTRO` di `src/data/warna.ts`.
- **Musik / narasi:** taruh file mp3 di `public/`, lalu pakai `<Audio src={staticFile("musik.mp3")} />` dari `remotion` (atau `@remotion/media`).

## Catatan

- Render pertama kali akan mengunduh Chrome Headless Shell. Jika jaringan dibatasi, pakai browser yang sudah ada:
  `npx remotion render BelajarWarna out/belajar-warna.mp4 --browser-executable=/path/ke/chrome`
- Remotion gratis untuk individu & tim kecil; perusahaan besar butuh lisensi — lihat https://www.remotion.dev/license.
