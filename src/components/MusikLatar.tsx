import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";

const VOLUME_NORMAL = 0.3;
const VOLUME_SAAT_NARASI = 0.1; // musik mengecil supaya suara narasi jelas
const RAMP = 8; // frame untuk naik/turun volume

/** Musik latar yang otomatis mengecil (ducking) saat narasi berbicara. */
export const MusikLatar: React.FC<{ intervalNarasi: [number, number][] }> = ({ intervalNarasi }) => {
  const { durationInFrames } = useVideoConfig();

  const volume = (f: number) => {
    // 1 = sedang ada narasi, 0 = tidak ada; dengan transisi halus
    let duck = 0;
    for (const [a, b] of intervalNarasi) {
      if (f < a - RAMP || f > b + RAMP) continue;
      const v = interpolate(f, [a - RAMP, a, b, b + RAMP], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      duck = Math.max(duck, v);
    }
    const dasar = interpolate(duck, [0, 1], [VOLUME_NORMAL, VOLUME_SAAT_NARASI]);
    const fade = interpolate(f, [0, 15, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return dasar * fade;
  };

  return <Audio src={staticFile("audio/musik-ceria.mp3")} volume={volume} loop />;
};
