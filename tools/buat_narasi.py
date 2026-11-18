"""Membuat file narasi dengan suara TTS LOKAL (gratis, offline) dari src/data/naskah.json.

Suara utama video memakai ElevenLabs (tools/buat_narasi_elevenlabs.py).
Skrip ini adalah alternatif tanpa API key.

Hasil:
  public/narasi/<id>.mp3          satu file per kalimat
  src/data/durasi-narasi.json     durasi tiap kalimat (detik), dipakai untuk timing video

Pemakaian:
  pip install -r tools/requirements.txt
  bash tools/unduh_model_suara.sh
  python tools/buat_narasi.py            # buat ulang semua
  python tools/buat_narasi.py merah-nama # buat ulang kalimat tertentu saja

Butuh ffmpeg (dengan filter rubberband) di PATH.

Pemilihan otomatis (opsional, sangat disarankan):
  Suara TTS ini sedikit acak, jadi satu kalimat bisa terdengar jelas atau kurang jelas.
  Jika model pengenal suara Whisper ada di tools/model/sherpa-onnx-whisper-small
  (diunduh oleh tools/unduh_model_suara.sh), skrip membuat beberapa kandidat per
  kalimat lalu memilih yang paling cocok dengan teks aslinya menurut Whisper.
"""
import difflib
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
import sherpa_onnx

AKAR = Path(__file__).resolve().parent.parent
MODEL = AKAR / "tools" / "model" / "vits-piper-id_ID-news_tts-medium"
MODEL_ASR = AKAR / "tools" / "model" / "sherpa-onnx-whisper-small"
JUMLAH_KANDIDAT = 8
SKOR_CUKUP = 0.97     # berhenti lebih awal jika kandidat sudah sejelas ini

# Suara lokal ini salah melafalkan beberapa kata, jadi sebelum diucapkan
# kata-kata ini diganti dengan ejaan "sesuai bunyi".
EJAAN_TTS = {
    "ungu": "unggu", "Yellow": "Yelou", "Blue": "Blu", "Green": "Grin",
    "Orange": "Orens", "Purple": "Perpel",
}
NASKAH = AKAR / "src" / "data" / "naskah.json"
DURASI = AKAR / "src" / "data" / "durasi-narasi.json"
KELUARAN = AKAR / "public" / "narasi"

# Pengaturan "suara ceria": sedikit lebih cepat & nada lebih tinggi.
KECEPATAN = 1.0       # >1 = lebih cepat
NADA = 1.08           # faktor pitch (>1 = lebih tinggi & ceria; terlalu tinggi mengurangi kejelasan)
LOUDNESS = -16        # target LUFS


def buat_tts():
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=str(MODEL / "id_ID-news_tts-medium.onnx"),
                tokens=str(MODEL / "tokens.txt"),
                data_dir=str(MODEL / "espeak-ng-data"),
                noise_scale=0.667,
                length_scale=1.0,
            ),
            num_threads=4,
        )
    )
    return sherpa_onnx.OfflineTts(cfg)


def simpan_wav(path: Path, sampel: np.ndarray, sr: int):
    sampel = np.clip(sampel, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((sampel * 32767).astype(np.int16).tobytes())


def potong_hening(x: np.ndarray, sr: int, ambang=0.01, sisa=0.05) -> np.ndarray:
    idx = np.where(np.abs(x) > ambang)[0]
    if len(idx) == 0:
        return x
    pad = int(sisa * sr)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def normalisasi(teks: str) -> str:
    return " ".join(re.sub(r"[^a-z\s]", " ", teks.lower()).split())


def ejaan_tts(teks: str) -> str:
    for asli, bunyi in EJAAN_TTS.items():
        teks = re.sub(rf"\b{asli}\b", bunyi, teks)
    return teks


def buat_asr():
    if not (MODEL_ASR / "small-encoder.int8.onnx").exists():
        print("(Model Whisper tidak ditemukan: tiap kalimat dibuat sekali tanpa pemilihan otomatis)")
        return None
    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(MODEL_ASR / "small-encoder.int8.onnx"),
        decoder=str(MODEL_ASR / "small-decoder.int8.onnx"),
        tokens=str(MODEL_ASR / "small-tokens.txt"),
        language="id", task="transcribe", num_threads=4,
    )


def dengar(asr, x: np.ndarray, sr: int) -> str:
    s = asr.create_stream()
    s.accept_waveform(sr, x)
    asr.decode_stream(s)
    return s.result.text.strip()


def proses_audio(masukan: Path, tujuan: Path, filter_tambahan: str = ""):
    af = f"rubberband=pitch={NADA}" + filter_tambahan
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(masukan), "-af", af, str(tujuan)], check=True)


def baca_wav(path: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return x, w.getframerate()


def durasi_mp3(path: Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path),
    ])
    return round(float(out), 3)


def main():
    naskah: dict[str, str] = {k: v for k, v in json.loads(NASKAH.read_text()).items() if not k.startswith("_")}
    pilihan = set(sys.argv[1:]) or set(naskah)
    tidak_dikenal = pilihan - set(naskah)
    if tidak_dikenal:
        sys.exit(f"ID tidak ada di naskah: {', '.join(sorted(tidak_dikenal))}")

    KELUARAN.mkdir(parents=True, exist_ok=True)
    durasi = json.loads(DURASI.read_text()) if DURASI.exists() else {}
    tts = buat_tts()
    asr = buat_asr()
    rng = np.random.default_rng()

    for id_, teks in naskah.items():
        if id_ not in pilihan:
            continue
        target = normalisasi(teks)
        terbaik = None  # (skor, wav_path, transkrip)
        tmp = Path(tempfile.mkdtemp())
        n = JUMLAH_KANDIDAT if asr else 1
        for i in range(n):
            # variasi kecepatan kecil supaya kandidat berbeda-beda
            kec = KECEPATAN if i == 0 else KECEPATAN * rng.uniform(0.94, 1.04)
            audio = tts.generate(ejaan_tts(teks), sid=0, speed=kec)
            x = potong_hening(np.array(audio.samples, dtype=np.float32), audio.sample_rate)
            mentah, bernada = tmp / f"m{i}.wav", tmp / f"p{i}.wav"
            simpan_wav(mentah, x, audio.sample_rate)
            proses_audio(mentah, bernada)
            if not asr:
                terbaik = (1.0, bernada, "")
                break
            transkrip = dengar(asr, *baca_wav(bernada))
            skor = difflib.SequenceMatcher(None, target, normalisasi(transkrip)).ratio()
            if terbaik is None or skor > terbaik[0]:
                terbaik = (skor, bernada, transkrip)
            if skor >= SKOR_CUKUP:
                break

        skor, sumber, transkrip = terbaik
        tujuan = KELUARAN / f"{id_}.mp3"
        subprocess.run([
            "ffmpeg", "-loglevel", "error", "-y", "-i", str(sumber),
            "-af", f"loudnorm=I={LOUDNESS}:TP=-1.5:LRA=11",
            "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-q:a", "3", str(tujuan),
        ], check=True)
        durasi[id_] = durasi_mp3(tujuan)
        info = f"  [skor {skor:.2f}: \"{transkrip}\"]" if asr else ""
        print(f"{id_:16s} {durasi[id_]:5.2f}s  {teks}{info}", flush=True)

    # Buang entri lama yang sudah tidak ada di naskah
    durasi = {k: durasi[k] for k in naskah if k in durasi}
    DURASI.write_text(json.dumps(durasi, indent=2, ensure_ascii=False) + "\n")
    print(f"\nDurasi disimpan di {DURASI.relative_to(AKAR)}")


if __name__ == "__main__":
    main()
