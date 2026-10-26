import localFont from "next/font/local";

export const Switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500" },
    { path: "./fonts/Switzer-Semibold.woff2", weight: "600" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

export const InstrumentSerif = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});
