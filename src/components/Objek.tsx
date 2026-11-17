import React from "react";
import type { NamaObjek } from "../data/warna";

type Props = { objek: NamaObjek; warna: string; ukuran?: number };

/** Gambar objek sederhana (SVG) yang dipakai sebagai contoh warna. */
export const Objek: React.FC<Props> = ({ objek, warna, ukuran = 420 }) => {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 200 200">
      {GAMBAR[objek](warna)}
    </svg>
  );
};

const mata = (x: number, y: number) => (
  <g>
    <circle cx={x} cy={y} r={7} fill="#fff" />
    <circle cx={x + 1.5} cy={y + 1} r={4} fill="#222" />
  </g>
);

const senyum = (cx: number, cy: number) => (
  <path
    d={`M ${cx - 12} ${cy} Q ${cx} ${cy + 12} ${cx + 12} ${cy}`}
    stroke="#222"
    strokeWidth={4}
    fill="none"
    strokeLinecap="round"
  />
);

const GAMBAR: Record<NamaObjek, (w: string) => React.ReactNode> = {
  apel: (w) => (
    <g>
      <path d="M100 55 Q 98 35 110 22" stroke="#6D4C41" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={122} cy={40} rx={18} ry={9} fill="#43A047" transform="rotate(-25 122 40)" />
      <path
        d="M100 60 C 70 40, 25 55, 30 105 C 35 155, 70 180, 100 168 C 130 180, 165 155, 170 105 C 175 55, 130 40, 100 60 Z"
        fill={w}
      />
      <ellipse cx={65} cy={90} rx={10} ry={18} fill="#fff" opacity={0.35} />
      {mata(80, 110)}
      {mata(120, 110)}
      {senyum(100, 132)}
    </g>
  ),
  matahari: (w) => (
    <g>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={96}
          y={8}
          width={8}
          height={30}
          rx={4}
          fill={w}
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
      <circle cx={100} cy={100} r={55} fill={w} />
      {mata(82, 92)}
      {mata(118, 92)}
      {senyum(100, 116)}
    </g>
  ),
  ikan: (w) => (
    <g>
      <path d="M150 100 L 190 70 L 185 100 L 190 130 Z" fill={w} />
      <ellipse cx={95} cy={100} rx={65} ry={45} fill={w} />
      <path d="M90 58 Q 105 35 125 62" fill={w} />
      <path d="M115 85 Q 125 100 115 115" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
      {mata(60, 90)}
      {senyum(55, 112)}
    </g>
  ),
  daun: (w) => (
    <g>
      <path d="M100 185 L 100 150" stroke="#6D4C41" strokeWidth={7} strokeLinecap="round" />
      <path d="M100 155 C 30 140, 30 50, 100 15 C 170 50, 170 140, 100 155 Z" fill={w} />
      <path d="M100 150 L 100 35" stroke="#fff" strokeWidth={4} opacity={0.5} strokeLinecap="round" />
      {mata(78, 85)}
      {mata(122, 85)}
      {senyum(100, 110)}
    </g>
  ),
  jeruk: (w) => (
    <g>
      <ellipse cx={112} cy={35} rx={18} ry={9} fill="#43A047" transform="rotate(-20 112 35)" />
      <circle cx={100} cy={108} r={70} fill={w} />
      <circle cx={100} cy={42} r={5} fill="#8D6E63" />
      <ellipse cx={65} cy={80} rx={10} ry={16} fill="#fff" opacity={0.3} />
      {mata(80, 105)}
      {mata(120, 105)}
      {senyum(100, 128)}
    </g>
  ),
  anggur: (w) => (
    <g>
      <path d="M100 30 L 100 10" stroke="#6D4C41" strokeWidth={7} strokeLinecap="round" />
      <ellipse cx={125} cy={22} rx={20} ry={9} fill="#43A047" transform="rotate(-20 125 22)" />
      {[
        [70, 50], [100, 45], [130, 50],
        [55, 82], [85, 80], [115, 80], [145, 82],
        [70, 112], [100, 112], [130, 112],
        [85, 142], [115, 142],
        [100, 170],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={19} fill={w} stroke="#fff" strokeOpacity={0.25} strokeWidth={3} />
      ))}
      {mata(85, 108)}
      {mata(115, 108)}
      {senyum(100, 130)}
    </g>
  ),
};
