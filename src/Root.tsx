import React from "react";
import { Composition } from "remotion";
import { BelajarWarna, type BelajarWarnaProps } from "./BelajarWarna";
import { DAFTAR_WARNA, FPS, totalDurasi } from "./data/warna";

const defaultProps: BelajarWarnaProps = {
  judul: "Belajar Warna",
  daftarWarna: DAFTAR_WARNA,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video utama YouTube (16:9, Full HD) */}
      <Composition
        id="BelajarWarna"
        component={BelajarWarna}
        width={1920}
        height={1080}
        fps={FPS}
        durationInFrames={totalDurasi(DAFTAR_WARNA.length)}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: totalDurasi(props.daftarWarna.length),
        })}
      />
    </>
  );
};
