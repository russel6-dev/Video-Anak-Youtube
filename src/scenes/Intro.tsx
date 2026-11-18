import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Gelembung } from "../components/Gelembung";
import { Efek, Narasi } from "../components/Narasi";
import type { TimingIntro } from "../data/timeline";
import { DAFTAR_WARNA } from "../data/warna";
import { fontFamily } from "../fonts";

export const Intro: React.FC<{ judul: string; timing: TimingIntro }> = ({ judul, timing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const huruf = judul.split("");

  const subMuncul = spring({ frame: frame - 35, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFF8E1 0%, #E1F5FE 100%)", fontFamily }}>
      <Gelembung warna="#FFB300" seed="intro" />
      <Efek nama="ting" frame={huruf.length * 3 + 8} volume={0.35} />
      <Narasi klip={timing.narasi} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 190, fontWeight: 700 }}>
          {huruf.map((h, i) => {
            const s = spring({ frame: frame - i * 3, fps, config: { damping: 9, stiffness: 120 } });
            const warna = DAFTAR_WARNA[i % DAFTAR_WARNA.length].hex;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  color: warna,
                  transform: `translateY(${interpolate(s, [0, 1], [-400, 0])}px) rotate(${Math.sin(frame / 10 + i) * 4}deg)`,
                  textShadow: "0 8px 0 rgba(0,0,0,0.12)",
                  WebkitTextStroke: "6px white",
                  paintOrder: "stroke fill",
                  minWidth: h === " " ? 60 : undefined,
                }}
              >
                {h}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 70,
            fontWeight: 600,
            color: "#5D4037",
            opacity: subMuncul,
            transform: `scale(${subMuncul})`,
          }}
        >
          Ayo kenali warna-warni di sekitar kita!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
