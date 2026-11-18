import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import type { Klip } from "../data/timeline";

/** Memutar satu klip narasi pada waktunya (relatif terhadap adegan). */
export const Narasi: React.FC<{ klip: Klip }> = ({ klip }) => (
  <Sequence from={klip.mulai} durationInFrames={klip.durasi + 5} name={`Narasi: ${klip.id}`} layout="none">
    <Audio src={staticFile(klip.src)} />
  </Sequence>
);

/** Efek suara pendek (pop, ting) pada frame tertentu. */
export const Efek: React.FC<{ nama: "pop" | "ting"; frame: number; volume?: number }> = ({
  nama,
  frame,
  volume = 0.5,
}) => (
  <Sequence from={frame} durationInFrames={30} name={`Efek: ${nama}`} layout="none">
    <Audio src={staticFile(`audio/${nama}.mp3`)} volume={volume} />
  </Sequence>
);
