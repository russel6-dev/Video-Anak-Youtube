#!/usr/bin/env bash
# Mengunduh model suara TTS bahasa Indonesia (Piper, format sherpa-onnx) ke tools/model/
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p model
cd model
NAMA=vits-piper-id_ID-news_tts-medium
if [ ! -d "$NAMA" ]; then
  curl -L -o "$NAMA.tar.bz2" "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/$NAMA.tar.bz2"
  tar xjf "$NAMA.tar.bz2"
  rm "$NAMA.tar.bz2"
fi
echo "Model siap di tools/model/$NAMA"

# Model pengenal suara (Whisper small) untuk memilih rekaman narasi yang paling jelas
ASR=sherpa-onnx-whisper-small
if [ ! -d "$ASR" ]; then
  curl -L -o "$ASR.tar.bz2" "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/$ASR.tar.bz2"
  tar xjf "$ASR.tar.bz2"
  rm "$ASR.tar.bz2"
fi
echo "Model Whisper siap di tools/model/$ASR"
