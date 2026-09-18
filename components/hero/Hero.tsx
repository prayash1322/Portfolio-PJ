"use client";

import React, {
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./Hero.module.css";
import HeroCanvas, { HeroCanvasHandle } from "./HeroCanvas";
import { FrameSequenceManager, getFramePath } from "@/lib/animations/heroSequence";
import { registerGSAP, gsap } from "@/lib/gsap";
import { FRAME_COUNT, SITE } from "@/lib/constants";
import ParticleText from "@/components/reactbits/ParticleText";

export interface HeroRevealHandle {
  registerReveal: (tl: gsap.core.Timeline, atPosition?: string | number) => void;
}

const Hero = forwardRef<HeroRevealHandle>(function Hero(_, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHandleRef = useRef<HeroCanvasHandle | null>(null);

  const textLeftRef        = useRef<HTMLDivElement | null>(null);
  const textRightRef       = useRef<HTMLDivElement | null>(null);
  const leftLabelRef       = useRef<HTMLParagraphElement | null>(null);
  const rightLabelRef      = useRef<HTMLParagraphElement | null>(null);
  const rightHeadRef       = useRef<HTMLDivElement | null>(null);
  const particleWrapperRef = useRef<HTMLDivElement | null>(null);

  const sequenceManager = useMemo(() => new FrameSequenceManager(FRAME_COUNT), []);

  const particleName = useMemo(() => {
    return SITE.name.toUpperCase().replace(" ", "\n");
  }, []);

  // ── Expose reveal handle ───────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    registerReveal(tl: gsap.core.Timeline, atPosition: string | number = "+=0") {
      const rightLines = rightHeadRef.current
        ? Array.from(rightHeadRef.current.querySelectorAll(`.${styles.headLine}`))
        : [];

      // Left label slides upward into place with a soft fade
      if (leftLabelRef.current) {
        tl.fromTo(
          leftLabelRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          atPosition
        );
      }

      // Right label slides upward into place with a soft fade
      if (rightLabelRef.current) {
        tl.fromTo(
          rightLabelRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "<0.04"
        );
      }

      // ParticleText fades in cleanly in lockstep with the right heading lines
      if (particleWrapperRef.current) {
        tl.fromTo(
          particleWrapperRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "<0.06"
        );
      }

      // Right heading lines reveal upward with slight stagger
      if (rightLines.length > 0) {
        tl.fromTo(
          rightLines,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 },
          "<0.06"
        );
      }

      // Micro-settle
      tl.to({}, { duration: 0.1 });
    },
  }), []);

  // ── Scroll-driven image sequence & text parallax ──────────────────────────
  useEffect(() => {
    registerGSAP();

    let scrollTimeline: gsap.core.Timeline | null = null;

    // 1. Immediately load & draw Frame 1 so canvas is NEVER a blank/black rectangle
    const frame1 = new Image();
    frame1.src = getFramePath(1);
    frame1.onload = () => {
      if (canvasHandleRef.current) {
        canvasHandleRef.current.draw(frame1);
      }
    };

    // 2. Preload remaining sequence in background
    sequenceManager.preload().then(() => {
      const img1 = sequenceManager.getImage(1);
      if (img1 && canvasHandleRef.current) {
        canvasHandleRef.current.draw(img1);
      }
    });

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      let lastDrawnFrame = 1;

      // Pinned ScrollTrigger: Hero remains pinned while all 240 frames scrub through,
      // and only unpins to scroll to the rest of the site AFTER the 240 frames finish!
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          start: "top top",
          end: "+=240%",
          scrub: 0.5,
          onUpdate: (self) => {
            const rawFrame = Math.round(1 + self.progress * (FRAME_COUNT - 1));
            const targetFrame = Math.min(Math.max(rawFrame, 1), FRAME_COUNT);

            if (targetFrame !== lastDrawnFrame) {
              lastDrawnFrame = targetFrame;
              const img = sequenceManager.getImage(targetFrame);
              if (img && canvasHandleRef.current) {
                canvasHandleRef.current.draw(img);
              }
            }
          },
        },
      });

      // Synchronous scroll-linked parallax on both text panels during the 240-frame scrub
      if (textLeftRef.current) {
        tl.fromTo(
          textLeftRef.current,
          { y: 0 },
          { y: -140, ease: "none" },
          0
        );
      }

      if (textRightRef.current) {
        tl.fromTo(
          textRightRef.current,
          { y: 0 },
          { y: -100, ease: "none" },
          0
        );
      }

      scrollTimeline = tl;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scrollTimeline) {
        scrollTimeline.scrollTrigger?.kill();
        scrollTimeline.kill();
      }
    };
  }, [sequenceManager]);

  return (
    <section className={styles.heroWrapper} aria-label="Hero">
      <div ref={containerRef} className={styles.pinContainer}>
        {/* Full-viewport canvas — background matches frame dark bg as fallback */}
        <div className={styles.canvasWrapper}>
          <HeroCanvas ref={canvasHandleRef} className={styles.canvasElement} />
        </div>

        {/* Side vignettes for text legibility */}
        <div className={styles.vignette} aria-hidden="true" />

        {/* LEFT typography panel with label and ParticleText */}
        <div ref={textLeftRef} className={styles.textLeft}>
          <p ref={leftLabelRef} className={styles.label}>
            HELLO! I&apos;M
          </p>

          <div
            ref={particleWrapperRef}
            className={styles.particleNameWrapper}
            style={{ opacity: 0 }}
          >
            <ParticleText
              text={particleName}
              color="#f0ece4"
              highlightColor="#d97706"
              particleSize={1.30}
              density={1.45}
              scatter={140}
              gatherDuration={1000}
              stagger={300}
              pointerRepel={25}
              repelRadius={90}
              idleDrift={0.2}
              glow={true}
              trigger="mount"
              align="left"
              fontSize="clamp(1.75rem, 3.8vw, 4rem)"
              fontWeight={900}
              fontFamily="var(--font-ui), var(--font-dm-sans), sans-serif"
              className={styles.particleName}
            />
          </div>
        </div>

        {/* RIGHT typography */}
        <div ref={textRightRef} className={styles.textRight}>
          <p ref={rightLabelRef} className={styles.label}>
            A CREATIVE
          </p>
          <div ref={rightHeadRef} className={styles.headGroup}>
            <div className={styles.headLine}>FULL STACK</div>
            <div className={styles.headLine}>DEVELOPER</div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;
