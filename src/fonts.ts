import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Font Fredoka (SIL Open Font License) disimpan lokal di public/fonts
// supaya render tetap jalan tanpa koneksi internet.
export const fontFamily = "Fredoka";

for (const weight of ["600", "700"] as const) {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/fredoka-latin-${weight}-normal.woff2`),
    weight,
  });
}
