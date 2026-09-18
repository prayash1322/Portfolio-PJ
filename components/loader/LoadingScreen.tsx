"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { createLoadingTimeline } from "@/lib/animations/loading";
import { useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  onComplete: () => void;
  onSetupHeroReveal?: (tl: gsap.core.Timeline, atPosition: string | number) => void;
}

export default function LoadingScreen({ onComplete, onSetupHeroReveal }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // Lock scroll while loader is active
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    const pill = pillRef.current;
    const percent = percentRef.current;

    if (!overlay || !pill || !percent) return;

    const tl = createLoadingTimeline(gsap, {
      pillEl: pill,
      percentEl: percent,
      overlayEl: overlay,
      onComplete,
      onSetupHeroReveal,
      reducedMotion,
    });

    return () => {
      tl.kill();
    };
  }, [onComplete, onSetupHeroReveal, reducedMotion]);

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      {/* ─── Background marquee ─── */}
      <div className={styles.marqueeWrapper} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {/* Duplicate text enough times to guarantee seamless loop at any viewport width */}
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={styles.marqueeItem}>
              FULL STACK DEVELOPER&nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ─── Center pill ─── */}
      <div ref={pillRef} className={styles.pill}>
        <div className={styles.pillBorder} aria-hidden="true" />
        <span className={styles.pillLabel}>LOADING</span>
        <span ref={percentRef} className={styles.pillPercent}>
          00%
        </span>
      </div>
    </div>
  );
}
