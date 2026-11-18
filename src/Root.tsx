import React from "react";
import { Composition } from "remotion";
import { BelajarWarna, type BelajarWarnaProps } from "./BelajarWarna";
import { buatTimeline } from "./data/timeline";
import { DAFTAR_WARNA, FPS } from "./data/warna";

const defaultProps: BelajarWarnaProps = {
  judul: "Belajar Warna",
  daftarWarna: DAFTAR_WARNA,
  pakaiMusik: true,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video utama YouTube (16:9, Full HD). Durasi mengikuti panjang narasi. */}
      <Composition
        id="BelajarWarna"
        component={BelajarWarna}
        width={1920}
        height={1080}
        fps={FPS}
        durationInFrames={buatTimeline(DAFTAR_WARNA).total}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: buatTimeline(props.daftarWarna).total,
        })}
      />
    </>
  );
};
