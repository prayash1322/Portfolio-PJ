import { gsap } from "gsap";

interface LoadingAnimationOptions {
  pillEl: HTMLElement;
  percentEl: HTMLElement;
  overlayEl: HTMLElement;
  onComplete: () => void;
  onSetupHeroReveal?: (tl: gsap.core.Timeline, atPosition: string | number) => void;
  reducedMotion?: boolean;
}

/**
 * Drives the loading screen animation timeline.
 *
 * Sequence:
 * 1. Counter 0 → 100% over 2.5s
 * 2. Hold at 100% for ~200ms
 * 3. Pill expands to cover viewport (0.85s)
 *    ↳ Hero fade-in starts at the MID-POINT of the pill expansion
 *      so the portrait is already visible when the overlay sweeps
 * 4. Overlay sweeps up (0.7s), revealing the portrait-filled hero beneath
 * 5. Hero text slides in (from the SAME timeline, registered by handleSetupHeroReveal)
 * 6. Navbar settles
 * 7. onComplete fires
 */
export function createLoadingTimeline(
  gsapInstance: typeof gsap,
  opts: LoadingAnimationOptions
): gsap.core.Timeline {
  const { pillEl, percentEl, overlayEl, onComplete, onSetupHeroReveal, reducedMotion } = opts;

  const counter = { value: 0 };

  const tl = gsapInstance.timeline({ onComplete });

  if (reducedMotion) {
    tl.set(percentEl, { textContent: "100%" })
      .set(overlayEl, { autoAlpha: 0 });
    if (onSetupHeroReveal) onSetupHeroReveal(tl, "+=0");
    return tl;
  }

  tl
    // 1. Snappy count 0 → 100
    .to(counter, {
      value: 100,
      duration: 2.0,
      ease: "power1.inOut",
      onUpdate() {
        const v = Math.round(counter.value);
        percentEl.textContent = `${String(v).padStart(2, "0")}%`;
      },
    })
    // 2. Micro hold at 100%
    .to({}, { duration: 0.08 })
    // 3. Crisp pill expansion into sweep — no black screen pause
    .to(pillEl, {
      scale: 30,
      duration: 0.35,
      ease: "power2.in",
      transformOrigin: "center center",
    });

  // ── Hero reveal fires synchronously with the exit sweep ───────────────────
  if (onSetupHeroReveal) {
    onSetupHeroReveal(tl, "-=0.2");
  }

  tl
    // 4. Overlay sweeps up briskly
    .to(
      overlayEl,
      { yPercent: -100, duration: 0.48, ease: "power3.inOut" },
      "-=0.18"
    );

  return tl;
}
