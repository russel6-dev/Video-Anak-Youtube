import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Gelembung } from "../components/Gelembung";
import { Efek, Narasi } from "../components/Narasi";
import { Objek } from "../components/Objek";
import type { TimingWarna } from "../data/timeline";
import type { Warna } from "../data/warna";
import { fontFamily } from "../fonts";

const MUNCUL_OBJEK = 5;

export const AdeganWarna: React.FC<{ warna: Warna; timing: TimingWarna }> = ({ warna, timing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const objekMasuk = spring({ frame: frame - MUNCUL_OBJEK, fps, config: { damping: 10 } });
  const namaMasuk = spring({ frame: frame - timing.nama.mulai, fps, config: { damping: 8, stiffness: 150 } });
  const englishMasuk = spring({ frame: frame - timing.english.mulai, fps, config: { damping: 12 } });
  const kalimatMasuk = spring({ frame: frame - timing.kalimat.mulai, fps, config: { damping: 14 } });

  const memantul = Math.abs(Math.sin(frame / 9)) * -25;
  const denyut = 1 + Math.sin(frame / 7) * 0.03;

  return (
    <AbsoluteFill style={{ backgroundColor: warna.latar, fontFamily }}>
      <Gelembung warna={warna.hex} seed={warna.nama} />
      <Efek nama="pop" frame={MUNCUL_OBJEK} volume={0.45} />
      <Narasi klip={timing.nama} />
      <Narasi klip={timing.english} />
      <Narasi klip={timing.kalimat} />

      {/* Objek contoh */}
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 180 }}>
        <div
          style={{
            transform: `translateY(${memantul}px) scale(${objekMasuk}) rotate(${interpolate(objekMasuk, [0, 1], [-180, 0])}deg)`,
            filter: "drop-shadow(0 20px 20px rgba(0,0,0,0.15))",
          }}
        >
          <Objek objek={warna.objek} warna={warna.hex} ukuran={620} />
        </div>
      </AbsoluteFill>

      {/* Nama warna */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", paddingRight: 200 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 820 }}>
          <div
            style={{
              fontSize: 230,
              fontWeight: 700,
              color: warna.hex,
              WebkitTextStroke: "10px white",
              paintOrder: "stroke fill",
              textShadow: "0 10px 0 rgba(0,0,0,0.12)",
              transform: `scale(${namaMasuk * denyut})`,
              lineHeight: 1,
            }}
          >
            {warna.nama}
          </div>
          <div
            style={{
              marginTop: 30,
              fontSize: 80,
              fontWeight: 600,
              color: "white",
              background: warna.hex,
              padding: "10px 50px",
              borderRadius: 999,
              opacity: englishMasuk,
              transform: `translateY(${interpolate(englishMasuk, [0, 1], [60, 0])}px)`,
            }}
          >
            {warna.english}
          </div>
        </div>
      </AbsoluteFill>

      {/* Kalimat contoh */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#3E2723",
            background: "rgba(255,255,255,0.85)",
            padding: "16px 48px",
            borderRadius: 30,
            opacity: kalimatMasuk,
            transform: `translateY(${interpolate(kalimatMasuk, [0, 1], [120, 0])}px)`,
          }}
        >
          {warna.kalimat}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
