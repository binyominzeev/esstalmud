import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Inter, Lora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { groupBySeder } from "@/lib/talmud";
import Sidebar from "@/components/Sidebar";
import PanelsToggle from "@/components/PanelsToggle";

const fontHebrew = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-hebrew",
  display: "swap",
});

const fontHebrewText = localFont({
  src: [
    { path: "../public/fonts/taamey-frank/TaameyFrankCLM-Medium.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/taamey-frank/TaameyFrankCLM-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/taamey-frank/TaameyFrankCLM-MediumOblique.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/taamey-frank/TaameyFrankCLM-BoldOblique.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-hebrew-text",
  display: "swap",
});

const fontBody = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const fontUi = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Essentialist Talmud",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${fontHebrew.variable} ${fontHebrewText.variable} ${fontBody.variable} ${fontUi.variable}`}>
      <body>
        <PanelsToggle />
        <Sidebar groups={groupBySeder()} />
        {children}
      </body>
    </html>
  );
}
