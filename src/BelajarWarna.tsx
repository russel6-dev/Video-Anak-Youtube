import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { MusikLatar } from "./components/MusikLatar";
import { buatTimeline } from "./data/timeline";
import { DURASI_TRANSISI, type Warna } from "./data/warna";
import { AdeganWarna } from "./scenes/AdeganWarna";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";

export type BelajarWarnaProps = {
  judul: string;
  daftarWarna: Warna[];
  /** Matikan untuk versi tanpa musik (mis. kalau ingin pakai musik dari YouTube Audio Library) */
  pakaiMusik: boolean;
};

const timing = linearTiming({ durationInFrames: DURASI_TRANSISI });
const arah = ["from-right", "from-bottom", "from-left", "from-top"] as const;

export const BelajarWarna: React.FC<BelajarWarnaProps> = ({ judul, daftarWarna, pakaiMusik }) => {
  const tl = useMemo(() => buatTimeline(daftarWarna), [daftarWarna]);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {pakaiMusik && <MusikLatar intervalNarasi={tl.intervalNarasi} />}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={tl.intro.durasi} name="Intro">
          <Intro judul={judul} timing={tl.intro} />
        </TransitionSeries.Sequence>

        {daftarWarna.map((w, i) => (
          <React.Fragment key={w.id}>
            {i % 2 === 0 ? (
              <TransitionSeries.Transition presentation={slide({ direction: arah[i % 4] })} timing={timing} />
            ) : (
              <TransitionSeries.Transition presentation={wipe({ direction: arah[i % 4] })} timing={timing} />
            )}
            <TransitionSeries.Sequence durationInFrames={tl.warna[i].durasi} name={w.nama}>
              <AdeganWarna warna={w} timing={tl.warna[i]} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}

        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={tl.outro.durasi} name="Outro">
          <Outro daftarWarna={daftarWarna} timing={tl.outro} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
