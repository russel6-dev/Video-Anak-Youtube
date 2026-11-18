"""Membuat musik latar ceria (loop mulus) dan efek suara, 100% disintesis di sini.

Karena dibuat sendiri dari nol, musik ini bebas hak cipta dan aman untuk YouTube.

Hasil:
  public/audio/musik-ceria.mp3   8 birama, 124 BPM, C mayor, diulang ±2 menit
  public/audio/pop.mp3           efek "pop" saat objek muncul
  public/audio/ting.mp3          efek "ting" berkilau

Pemakaian: python tools/buat_musik.py   (butuh numpy dan ffmpeg)
"""
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

AKAR = Path(__file__).resolve().parent.parent
KELUARAN = AKAR / "public" / "audio"
SR = 44100
BPM = 124
KETUK = 60 / BPM            # durasi 1 ketukan (detik)
LANGKAH = KETUK / 2         # not 1/8
BIRAMA = 8
PANJANG = int(round(BIRAMA * 4 * KETUK * SR))
ULANG = 8                   # 8 x 15,5 detik ≈ 2 menit
rng = np.random.default_rng(7)

NADA = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def frek(nama: str) -> float:
    """'C5' -> frekuensi Hz."""
    midi = 12 * (int(nama[-1]) + 1) + NADA[nama[0]]
    return 440.0 * 2 ** ((midi - 69) / 12)


def tambah(buf: np.ndarray, mulai_detik: float, sinyal: np.ndarray, pan: float = 0.0):
    """Tambah sinyal mono ke buffer stereo secara melingkar (supaya loop mulus)."""
    i = int(round(mulai_detik * SR)) % PANJANG
    idx = (np.arange(len(sinyal)) + i) % PANJANG
    kiri, kanan = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    np.add.at(buf[:, 0], idx, sinyal * kiri)
    np.add.at(buf[:, 1], idx, sinyal * kanan)


def amplop(n: int, serang: float, peluruhan: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.minimum(t / serang, 1.0)
    return a * np.exp(-t / peluruhan)


def marimba(f: float, dur: float = 0.9) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) * amplop(n, 0.002, 0.35)
         + 0.35 * np.sin(2 * np.pi * f * 4 * t) * amplop(n, 0.001, 0.06)
         + 0.15 * np.sin(2 * np.pi * f * 10 * t) * amplop(n, 0.001, 0.02))
    return s


def glock(f: float, dur: float = 1.2) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15)) * amplop(n, 0.001, 0.45)


def petik(f: float, dur: float = 0.6) -> np.ndarray:
    """Suara mirip ukulele: gelombang gergaji lembut yang cepat meredup."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum((0.7 ** k) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + 4 * k)) for k in range(1, 7))
    return s * amplop(n, 0.003, 10)


def bas(f: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return s * amplop(n, 0.005, 0.25) * np.clip((dur - t) / 0.03, 0, 1)


def kick() -> np.ndarray:
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 50 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.08)


def tepuk() -> np.ndarray:
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = np.diff(noise, prepend=0)  # high-pass sederhana
    return noise * np.exp(-t / 0.05) * 0.5


def shaker() -> np.ndarray:
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    noise = np.diff(np.diff(rng.standard_normal(n), prepend=0), prepend=0)
    return noise * np.minimum(t / 0.01, 1) * np.exp(-t / 0.025) * 0.15


# Progresi akor 8 birama: C G Am F | C F G C
AKOR = [
    ["C4", "E4", "G4"], ["B3", "D4", "G4"], ["A3", "C4", "E4"], ["A3", "C4", "F4"],
    ["C4", "E4", "G4"], ["A3", "C4", "F4"], ["B3", "D4", "G4"], ["C4", "E4", "G4"],
]
AKAR_BAS = ["C2", "G2", "A2", "F2", "C2", "F2", "G2", "C2"]

# Melodi: 8 langkah (not 1/8) per birama, "." = diam
MELODI = [
    "E5 . G5 . A5 G5 E5 .",
    "D5 . G5 . B4 . D5 .",
    "C5 . E5 . A5 . G5 E5",
    "F5 . A5 . G5 . . .",
    "E5 G5 C6 . G5 . E5 .",
    "F5 . A5 . C6 . A5 .",
    "G5 . B5 . D6 . B5 G5",
    "C6 . G5 . E5 . C5 .",
]


def buat_musik() -> np.ndarray:
    buf = np.zeros((PANJANG, 2))
    for b in range(BIRAMA):
        awal = b * 4 * KETUK
        # Melodi marimba + glockenspiel tipis
        for k, nada in enumerate(MELODI[b].split()):
            if nada != ".":
                t = awal + k * LANGKAH
                tambah(buf, t, 0.30 * marimba(frek(nada)), pan=0.15)
                tambah(buf, t, 0.07 * glock(frek(nada) * 2), pan=0.4)
        # Genjrengan ala ukulele: pola D . D U . U D U
        for k, arah in enumerate(["D", ".", "D", "U", ".", "U", "D", "U"]):
            if arah == ".":
                continue
            nada = AKOR[b] if arah == "D" else AKOR[b][::-1]
            for j, n in enumerate(nada):
                tambah(buf, awal + k * LANGKAH + j * 0.012, (0.10 if arah == "D" else 0.07) * petik(frek(n)), pan=-0.3)
        # Bas: ketuk 1 dan 3 (+ ayunan di ketuk 4 setengah)
        f = frek(AKAR_BAS[b])
        tambah(buf, awal, 0.35 * bas(f, KETUK * 1.5))
        tambah(buf, awal + 2 * KETUK, 0.35 * bas(f, KETUK * 1.2))
        tambah(buf, awal + 3.5 * KETUK, 0.25 * bas(f * 1.5, KETUK * 0.45))
        # Perkusi
        for ketuk in range(4):
            t = awal + ketuk * KETUK
            if ketuk in (0, 2):
                tambah(buf, t, 0.45 * kick())
            else:
                tambah(buf, t, 0.30 * tepuk(), pan=0.1)
            tambah(buf, t, shaker(), pan=0.5)
            tambah(buf, t + LANGKAH, 1.4 * shaker(), pan=0.5)
    # Normalisasi puncak ke -1 dBFS
    return buf / np.max(np.abs(buf)) * 0.89


def buat_pop() -> np.ndarray:
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    f = 300 + 900 * (t / t[-1]) ** 0.5
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05) * np.minimum(t / 0.003, 1)
    return np.column_stack([s, s]) * 0.8


def buat_ting() -> np.ndarray:
    n = int(1.0 * SR)
    s = np.zeros(n)
    for i, nada in enumerate(["C6", "E6", "G6", "C7"]):
        g = glock(frek(nada), 0.9)
        mulai = int(i * 0.06 * SR)
        s[mulai:mulai + len(g)] += g[: n - mulai] * 0.35
    return np.column_stack([s, s]) / np.max(np.abs(s)) * 0.7


def simpan_mp3(nama: str, data: np.ndarray):
    KELUARAN.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "a.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(data, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav),
                        "-c:a", "libmp3lame", "-b:a", "192k", str(KELUARAN / nama)], check=True)
    print(f"public/audio/{nama}  ({len(data) / SR:.2f} detik)")


if __name__ == "__main__":
    # Loop diulang di dalam file (MP3 punya jeda kecil di awal, jadi loop
    # di pemutar bisa tersendat). Video yang lebih panjang tetap aman: <Audio loop>.
    simpan_mp3("musik-ceria.mp3", np.tile(buat_musik(), (ULANG, 1)))
    simpan_mp3("pop.mp3", buat_pop())
    simpan_mp3("ting.mp3", buat_ting())
