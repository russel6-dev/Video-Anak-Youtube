import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

/** Gelembung/bola warna yang melayang pelan di latar. */
export const Gelembung: React.FC<{ warna: string; jumlah?: number; seed?: string }> = ({
  warna,
  jumlah = 14,
  seed = "gelembung",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: jumlah }).map((_, i) => {
        const r = 30 + random(`${seed}-r-${i}`) * 90;
        const x = random(`${seed}-x-${i}`) * width;
        const kecepatan = 0.6 + random(`${seed}-v-${i}`) * 1.4;
        const y = height + r - ((frame * kecepatan + random(`${seed}-y-${i}`) * (height + 2 * r)) % (height + 2 * r));
        const goyang = Math.sin(frame / 25 + i) * 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + goyang - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: warna,
              opacity: 0.18,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
