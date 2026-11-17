import React from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  DURASI_INTRO,
  DURASI_OUTRO,
  DURASI_PER_WARNA,
  DURASI_TRANSISI,
  type Warna,
} from "./data/warna";
import { AdeganWarna } from "./scenes/AdeganWarna";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";

export type BelajarWarnaProps = {
  judul: string;
  daftarWarna: Warna[];
};

const timing = linearTiming({ durationInFrames: DURASI_TRANSISI });
const arah = ["from-right", "from-bottom", "from-left", "from-top"] as const;

export const BelajarWarna: React.FC<BelajarWarnaProps> = ({ judul, daftarWarna }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={DURASI_INTRO}>
          <Intro judul={judul} />
        </TransitionSeries.Sequence>

        {daftarWarna.map((w, i) => (
          <React.Fragment key={w.nama}>
            {i % 2 === 0 ? (
              <TransitionSeries.Transition presentation={slide({ direction: arah[i % 4] })} timing={timing} />
            ) : (
              <TransitionSeries.Transition presentation={wipe({ direction: arah[i % 4] })} timing={timing} />
            )}
            <TransitionSeries.Sequence durationInFrames={DURASI_PER_WARNA}>
              <AdeganWarna warna={w} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}

        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={DURASI_OUTRO}>
          <Outro daftarWarna={daftarWarna} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
