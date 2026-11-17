import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Warna } from "../data/warna";
import { fontFamily } from "../fonts";

export const Outro: React.FC<{ daftarWarna: Warna[] }> = ({ daftarWarna }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const teksMasuk = spring({ frame: frame - 40, fps, config: { damping: 10 } });

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
      <div style={{ fontSize: 110, fontWeight: 700, color: "#5D4037", transform: `scale(${teksMasuk})` }}>
        Hebat! Kamu sudah belajar warna!
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 70 }}>
        {daftarWarna.map((w, i) => {
          const s = spring({ frame: frame - i * 5, fps, config: { damping: 8 } });
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
                  transform: `scale(${s}) translateY(${loncat}px)`,
                }}
              />
              <div style={{ marginTop: 18, fontSize: 48, fontWeight: 600, color: w.hex, opacity: s }}>{w.nama}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
