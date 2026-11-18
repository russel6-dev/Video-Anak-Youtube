import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Efek, Narasi } from "../components/Narasi";
import type { TimingOutro } from "../data/timeline";
import type { Warna } from "../data/warna";
import { fontFamily } from "../fonts";

export const Outro: React.FC<{ daftarWarna: Warna[]; timing: TimingOutro }> = ({ daftarWarna, timing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tutupMasuk = spring({ frame: frame - timing.tutup.mulai, fps, config: { damping: 10 } });
  const teksMasuk = spring({ frame: frame - timing.buka.mulai, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #E1F5FE 0%, #FFF8E1 100%)",
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Narasi klip={timing.buka} />
      {timing.warna.map((k) => (
        <React.Fragment key={k.id}>
          <Narasi klip={k} />
          <Efek nama="pop" frame={k.mulai} volume={0.25} />
        </React.Fragment>
      ))}
      <Narasi klip={timing.tutup} />
      <Efek nama="ting" frame={timing.tutup.mulai} volume={0.3} />
      <div style={{ fontSize: 110, fontWeight: 700, color: "#5D4037", transform: `scale(${teksMasuk})` }}>
        Hebat! Kamu sudah belajar warna!
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 70 }}>
        {daftarWarna.map((w, i) => {
          const s = spring({ frame: frame - timing.warna[i].mulai, fps, config: { damping: 8 } });
          // Lingkaran membesar sebentar saat namanya diucapkan
          const sorot = spring({ frame: frame - timing.warna[i].mulai, fps, config: { damping: 6 }, durationInFrames: 20 });
          const aktif = frame >= timing.warna[i].mulai && frame < timing.warna[i].mulai + timing.warna[i].durasi;
          const loncat = Math.sin(frame / 6 + i) * 15;
          return (
            <div key={w.nama} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  background: w.hex,
                  border: "10px solid white",
                  boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                  transform: `scale(${s * (aktif ? 1 + 0.25 * sorot : 1)}) translateY(${loncat}px)`,
                }}
              />
              <div style={{ marginTop: 18, fontSize: 48, fontWeight: 600, color: w.hex, opacity: s }}>{w.nama}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 70,
          fontSize: 80,
          fontWeight: 700,
          color: "white",
          background: "#FB8C00",
          padding: "12px 60px",
          borderRadius: 999,
          opacity: tutupMasuk,
          transform: `scale(${tutupMasuk}) rotate(${Math.sin(frame / 8) * 3}deg)`,
        }}
      >
        Sampai jumpa lagi!
      </div>
    </AbsoluteFill>
  );
};
