"""Membuat file narasi dengan ElevenLabs dari src/data/naskah.json.

Hasil:
  public/narasi/<id>.mp3          satu file per kalimat
  src/data/durasi-narasi.json     durasi tiap kalimat (detik), dipakai untuk timing video
  tools/narasi-cache.json         catatan teks & suara tiap file, supaya kalimat yang
                                  tidak berubah tidak dibuat ulang (hemat kuota)

Pemakaian:
  export ELEVENLABS_API_KEY=sk_...        # di Claude Code cloud: tidak perlu, key dipasang otomatis
  python tools/buat_narasi_elevenlabs.py              # hanya kalimat yang berubah
  python tools/buat_narasi_elevenlabs.py merah-nama   # paksa buat ulang kalimat tertentu
  python tools/buat_narasi_elevenlabs.py --semua      # paksa buat ulang semuanya

Hanya butuh Python 3 (tanpa paket tambahan) dan ffmpeg.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
NASKAH = AKAR / "src" / "data" / "naskah.json"
DURASI = AKAR / "src" / "data" / "durasi-narasi.json"
CACHE = AKAR / "tools" / "narasi-cache.json"
KELUARAN = AKAR / "public" / "narasi"

# ---- Pengaturan suara ----
SUARA_ID = "cgSgspJ2msm6clMCkdW9"   # Jessica - Playful, Bright, Warm
MODEL = "eleven_v3"                 # v3 mendukung tag gaya seperti [excited]
GAYA = "[excited]"                  # tag gaya di depan tiap kalimat; "" untuk normal
BAHASA = "id"
SEED = 1234                         # hasil lebih konsisten antar kalimat
# Seed per kalimat yang hasilnya lebih jelas (dipilih dengan mencoba beberapa seed).
# Kalau satu kalimat kurang bagus, ganti/tambah seed di sini lalu jalankan skrip lagi.
SEED_KHUSUS = {
    "merah-nama": 42,
    "oranye-kalimat": 42,
    "outro-oranye": 99,
}
LOUDNESS = -16                      # target LUFS

# Suara Jessica berlogat Amerika; beberapa kata Indonesia perlu ejaan "sesuai bunyi"
# supaya terucap benar. Hanya untuk suara — tulisan di layar tidak berubah.
EJAAN_TTS = {
    "ungu": "u-ngu",       # "unggu" malah terdengar ada bunyi g; "u-ngu" paling pas
    "oranye": "oranyé",
}


def kunci_api() -> str:
    # Di lingkungan Claude Code cloud, proxy jaringan mengganti nilai ini dengan key asli.
    return os.environ.get("ELEVENLABS_API_KEY", "sk_proxy-injected")


def ejaan_tts(teks: str) -> str:
    for asli, bunyi in EJAAN_TTS.items():
        teks = re.sub(rf"\b{asli}\b", bunyi, teks, flags=re.IGNORECASE)
    return teks


def teks_diucapkan(teks: str) -> str:
    return f"{GAYA} {ejaan_tts(teks)}".strip()


def sidik(id_: str, teks: str) -> str:
    seed = SEED_KHUSUS.get(id_, SEED)
    return hashlib.sha256(json.dumps([SUARA_ID, MODEL, BAHASA, seed, teks_diucapkan(teks)]).encode()).hexdigest()[:16]


def tts(id_: str, teks: str) -> bytes:
    isi = teks_diucapkan(teks)
    body = json.dumps({
        "text": isi,
        "model_id": MODEL,
        "language_code": BAHASA,
        "seed": SEED_KHUSUS.get(id_, SEED),
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{SUARA_ID}?output_format=mp3_44100_128",
        data=body,
        headers={"xi-api-key": kunci_api(), "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs menolak permintaan ({e.code}): {e.read().decode()[:500]}")


def rapikan(mentah: Path, tujuan: Path):
    """Potong hening di awal/akhir dan samakan kerasnya suara."""
    potong = (
        "silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.05,"
        "areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.1,areverse"
    )
    af = f"{potong},loudnorm=I={LOUDNESS}:TP=-1.5:LRA=11,{potong}"
    subprocess.run([
        "ffmpeg", "-loglevel", "error", "-y", "-i", str(mentah), "-af", af,
        "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-q:a", "2", str(tujuan),
    ], check=True)


def durasi_mp3(path: Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path),
    ])
    return round(float(out), 3)


def main():
    naskah = {k: v for k, v in json.loads(NASKAH.read_text()).items() if not k.startswith("_")}
    argumen = [a for a in sys.argv[1:] if not a.startswith("--")]
    paksa_semua = "--semua" in sys.argv
    tidak_dikenal = set(argumen) - set(naskah)
    if tidak_dikenal:
        sys.exit(f"ID tidak ada di naskah: {', '.join(sorted(tidak_dikenal))}")

    KELUARAN.mkdir(parents=True, exist_ok=True)
    durasi = json.loads(DURASI.read_text()) if DURASI.exists() else {}
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    karakter = 0

    for id_, teks in naskah.items():
        tujuan = KELUARAN / f"{id_}.mp3"
        perlu = paksa_semua or id_ in argumen or cache.get(id_) != sidik(id_, teks) or not tujuan.exists()
        if not perlu:
            continue
        with tempfile.TemporaryDirectory() as tmp:
            mentah = Path(tmp) / "mentah.mp3"
            mentah.write_bytes(tts(id_, teks))
            rapikan(mentah, tujuan)
        karakter += len(teks_diucapkan(teks))
        cache[id_] = sidik(id_, teks)
        durasi[id_] = durasi_mp3(tujuan)
        print(f"{id_:16s} {durasi[id_]:5.2f}s  {teks}", flush=True)
        # simpan tiap langkah supaya kalau gagal di tengah, yang sudah jadi tidak hilang
        DURASI.write_text(json.dumps({k: durasi[k] for k in naskah if k in durasi}, indent=2) + "\n")
        CACHE.write_text(json.dumps({k: cache[k] for k in naskah if k in cache}, indent=2) + "\n")

    DURASI.write_text(json.dumps({k: durasi[k] for k in naskah if k in durasi}, indent=2) + "\n")
    print(f"\nSelesai. Karakter terpakai kira-kira: {karakter}" if karakter else "Semua narasi sudah terbaru.")


if __name__ == "__main__":
    main()
