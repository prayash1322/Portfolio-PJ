"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
// Direct import — no dynamic/lazy loading gap that would flash the dark hero
// before the cream loading screen appears.
import LoadingScreen from "@/components/loader/LoadingScreen";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Hero, { HeroRevealHandle } from "@/components/hero/Hero";
import IntroAbout from "@/components/about/IntroAbout";

// Heavy below-fold sections — dynamically imported so they don't block
// the initial JS parse/hydration. Three.js alone is 200–400 KB gzipped.
const TechStack = dynamic(() => import("@/components/stack/TechStack"), {
  ssr: false,
  loading: () => (
    <section
      id="stack"
      aria-label="Technology Stack"
      style={{ minHeight: "100vh" }}
    />
  ),
});

const SelectedWork = dynamic(() => import("@/components/work/SelectedWork"), {
  ssr: false,
  loading: () => (
    <section
      id="work"
      aria-label="Selected Work"
      style={{ minHeight: "50vh" }}
    />
  ),
});

const Experience = dynamic(() => import("@/components/experience/Experience"), {
  ssr: false,
});

const Contact = dynamic(() => import("@/components/contact/Contact"), {
  ssr: false,
});

const Footer = dynamic(() => import("@/components/footer/Footer"), {
  ssr: false,
});

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false);
  const heroRevealRef = useRef<HeroRevealHandle | null>(null);

  /**
   * Called by loading.ts mid-pill-expansion.
   * Appends hero + navbar reveal tweens directly onto the loader's GSAP timeline.
   * No React state controls opacity here — GSAP owns it entirely.
   */
  const handleSetupHeroReveal = useCallback(
    (tl: gsap.core.Timeline, atPosition: string | number) => {
      // Fade the hero section in briskly as overlay begins to sweep
      tl.to(
        "[data-hero-section]",
        { opacity: 1, duration: 0.2, ease: "power1.out" },
        atPosition
      );

      // Hero text reveals smoothly into place
      if (heroRevealRef.current) {
        heroRevealRef.current.registerReveal(tl, "-=0.15");
      }

      // Navbar settles in cleanly
      const navbar = document.getElementById("navbar");
      if (navbar) {
        tl.fromTo(
          navbar,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          "-=0.1"
        );
      }
    },
    []
  );

  /**
   * Called when the entire GSAP sequence (loading + hero reveal) completes.
   * Unlocks scroll and refreshes ScrollTrigger for exact pinning coordinates.
   */
  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  return (
    <>
      {/* LoadingScreen is directly imported so it renders on the very first paint.
          z-index:9999 keeps it above everything. Unmounts after the full timeline completes. */}
      {!loaderDone && (
        <LoadingScreen
          onComplete={handleLoaderComplete}
          onSetupHeroReveal={handleSetupHeroReveal}
        />
      )}

      <main>
        {/*
          data-hero-section: targeted by GSAP (CSS starts it at opacity:0).
          Hero is always mounted so frame preloading starts immediately.
        */}
        <div data-hero-section>
          <Hero ref={heroRevealRef} />
        </div>

        {/* 01 — Editorial Intro / About */}
        <IntroAbout />

        {/* 02 — Technology ecosystem */}
        <TechStack />

        {/* 03 — Selected Work (7 Real Projects from Resume) */}
        <SelectedWork />

        {/* 04 — Experience & Education (Strictly from Resume) */}
        <Experience />

        {/* 05 — Cinematic Contact */}
        <Contact />

        {/* 06 — Minimal Footer */}
        <Footer />
      </main>
    </>
  );
}
