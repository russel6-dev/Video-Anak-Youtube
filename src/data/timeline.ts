import durasiNarasi from "./durasi-narasi.json";
import { DURASI_TRANSISI, FPS, type Warna } from "./warna";

/**
 * Semua waktu di video dihitung dari panjang narasi, supaya teks/animasi muncul
 * tepat saat diucapkan. Satuan: frame. `mulai` relatif terhadap awal adegan.
 */
export type Klip = { id: string; src: string; mulai: number; durasi: number };

export type TimingIntro = { durasi: number; narasi: Klip };
export type TimingWarna = { durasi: number; nama: Klip; english: Klip; kalimat: Klip };
export type TimingOutro = { durasi: number; buka: Klip; warna: Klip[]; tutup: Klip };

export type Timeline = {
  intro: TimingIntro;
  warna: TimingWarna[];
  outro: TimingOutro;
  /** Frame awal tiap adegan di video utuh: [intro, warna..., outro] */
  awalAdegan: number[];
  /** Interval narasi di video utuh, untuk mengecilkan musik saat ada suara */
  intervalNarasi: [number, number][];
  total: number;
};

// Jeda (frame) — atur di sini kalau ingin tempo lebih santai / lebih cepat
const JEDA = {
  introMulai: 25, // narasi intro mulai setelah huruf judul mendarat
  introAkhir: 20,
  warnaMulai: DURASI_TRANSISI + 5, // tunggu transisi selesai
  antarKalimat: 12,
  warnaAkhir: 35,
  outroMulai: 15,
  antarWarnaOutro: 6,
  outroAkhir: 45,
};

const durasiDetik = durasiNarasi as Record<string, number>;

const klip = (id: string, mulai: number): Klip => {
  const d = durasiDetik[id];
  if (d === undefined) {
    throw new Error(`Narasi "${id}" belum dibuat. Jalankan: python tools/buat_narasi.py`);
  }
  return { id, src: `narasi/${id}.mp3`, mulai, durasi: Math.ceil(d * FPS) };
};

const akhir = (k: Klip) => k.mulai + k.durasi;

export const buatTimeline = (daftarWarna: Warna[]): Timeline => {
  const narasiIntro = klip("intro", JEDA.introMulai);
  const intro: TimingIntro = {
    narasi: narasiIntro,
    durasi: Math.max(4 * FPS, akhir(narasiIntro) + JEDA.introAkhir),
  };

  const warna = daftarWarna.map((w): TimingWarna => {
    const nama = klip(`${w.id}-nama`, JEDA.warnaMulai);
    const english = klip(`${w.id}-english`, akhir(nama) + JEDA.antarKalimat);
    const kalimat = klip(`${w.id}-kalimat`, akhir(english) + JEDA.antarKalimat);
    return { nama, english, kalimat, durasi: akhir(kalimat) + JEDA.warnaAkhir };
  });

  const buka = klip("outro-buka", JEDA.outroMulai);
  const klipWarnaOutro: Klip[] = [];
  let t = akhir(buka) + JEDA.antarKalimat;
  for (const w of daftarWarna) {
    const k = klip(`outro-${w.id}`, t);
    klipWarnaOutro.push(k);
    t = akhir(k) + JEDA.antarWarnaOutro;
  }
  const tutup = klip("outro-tutup", t + JEDA.antarKalimat);
  const outro: TimingOutro = { buka, warna: klipWarnaOutro, tutup, durasi: akhir(tutup) + JEDA.outroAkhir };

  const durasiAdegan = [intro.durasi, ...warna.map((w) => w.durasi), outro.durasi];
  const awalAdegan: number[] = [];
  let posisi = 0;
  for (const d of durasiAdegan) {
    awalAdegan.push(posisi);
    posisi += d - DURASI_TRANSISI;
  }
  const total = posisi + DURASI_TRANSISI;

  const klipPerAdegan: Klip[][] = [
    [intro.narasi],
    ...warna.map((w) => [w.nama, w.english, w.kalimat]),
    [outro.buka, ...outro.warna, outro.tutup],
  ];
  const intervalNarasi = klipPerAdegan.flatMap((daftar, i) =>
    daftar.map((k): [number, number] => [awalAdegan[i] + k.mulai, awalAdegan[i] + akhir(k)]),
  );

  return { intro, warna, outro, awalAdegan, intervalNarasi, total };
};
