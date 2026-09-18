import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

/* ─── Fonts ─────────────────────────────────────────────────── */

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

/* ─── Metadata ───────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Prayashkanta Jena — Full-Stack Developer",
  description:
    "Full-stack developer building interfaces and systems that feel inevitable. Based in India.",
  keywords: ["full-stack developer", "software engineer", "portfolio", "web development"],
  authors: [{ name: "Prayashkanta Jena" }],
  icons: {
    icon: [
      { url: "/fevicon.png", type: "image/png" },
    ],
    shortcut: "/fevicon.png",
    apple: "/fevicon.png",
  },
  openGraph: {
    title: "Prayashkanta Jena — Full-Stack Developer",
    description:
      "Building interfaces and systems that feel inevitable.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0b0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Navbar from "@/components/nav/Navbar";
import CustomCursor from "@/components/cursor/CustomCursor";
import ClickSpark from "@/components/reactbits/ClickSpark";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`
        ${instrumentSerif.variable}
        ${dmSans.variable}
        ${jetbrainsMono.variable}
      `}
    >
      <body>
        <SmoothScrollProvider>
          <CustomCursor />
          {/* Global click spark — fixed canvas overlay, responds to all clicks */}
          <ClickSpark
            sparkColor="rgba(240, 236, 228, 0.75)"
            sparkSize={4}
            sparkRadius={18}
            sparkCount={8}
            duration={360}
          />
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

