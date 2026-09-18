"use client";

import React, { useEffect, useRef, type CSSProperties } from "react";
import "./ParticleText.css";

export interface ParticleTextProps {
  text?: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: "mount" | "hover" | "click";
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  style?: CSSProperties;
}

type Rgb = { r: number; g: number; b: number };

type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  seed: number;
  depth: number;
  delay: number;
};

const hexToRgb = (hex: string): Rgb | null => {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount),
});

const rgbToCss = (rgb: Rgb): string => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const resolveFontSize = (
  value: number | string,
  container: HTMLElement,
  fontWeight: number | string,
  fontFamily: string
): number => {
  if (typeof value === "number") return value;

  const probe = document.createElement("span");
  probe.textContent = "M";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.fontSize = value;
  probe.style.fontWeight = String(fontWeight);
  probe.style.fontFamily = fontFamily;
  container.appendChild(probe);
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 48;
  probe.remove();
  return size;
};

const waitForFonts = async (font: string): Promise<void> => {
  if (typeof document === "undefined" || !("fonts" in document)) return;

  try {
    await (document as unknown as { fonts: { load: (f: string) => Promise<unknown>; ready: Promise<unknown> } }).fonts.load(font);
  } catch {
    // Graceful fallback
  }

  try {
    await (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready;
  } catch {
    // Graceful fallback
  }
};

export default function ParticleText({
  text = "PRAYASHKANTA\nJENA",
  particleSize = 2.0,
  density = 2.0,
  color = "#f0ece4",
  highlightColor = "#d97706",
  scatter = 160,
  gatherDuration = 1600,
  stagger = 450,
  pointerRepel = 38,
  repelRadius = 110,
  idleDrift = 0.4,
  trigger = "mount",
  fontSize = "clamp(1.75rem, 3.8vw, 4rem)",
  fontWeight = 900,
  fontFamily = "var(--font-ui), sans-serif",
  glow = true,
  align = "left",
  className = "",
  style,
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let particles: Particle[] = [];
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    let buildId = 0;
    let gathering = false;
    let gatherStart = 0;
    let reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    // IntersectionObserver flag — skip rAF draws when off-screen
    let isInViewport = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const baseRgb = hexToRgb(color) || { r: 240, g: 236, b: 228 };
    const highlightRgb = hexToRgb(highlightColor) || { r: 217, g: 119, b: 6 };

    const pointer = {
      active: false,
      x: -9999,
      y: -9999,
      smoothX: -9999,
      smoothY: -9999,
    };

    const startGather = (fromScatter = true) => {
      if (!particles.length) return;

      const now = performance.now();
      const spread = reducedMotion ? 0 : scatter;

      particles.forEach((particle) => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2;
          const distance = spread * (0.35 + particle.depth * 0.75);
          particle.x =
            particle.targetX +
            Math.cos(angle) * distance +
            (particle.depth - 0.5) * spread * 0.45;
          particle.y =
            particle.targetY +
            Math.sin(angle) * distance +
            (particle.seed - 0.5) * spread * 0.45;
        }

        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = reducedMotion ? 0 : particle.seed * stagger;
      });

      gatherStart = now;
      gathering = true;
    };

    // Hardware-accelerated 60-120fps render loop
    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Warm glow setup matching original aesthetic
      if (glow && !reducedMotion) {
        ctx.shadowBlur = Math.min(5, particleSize * 2.2);
        ctx.shadowColor = highlightColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // Smooth pointer tracking for organic, fluid repulsion
      if (pointer.active) {
        pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
        pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;
      }

      let complete = true;
      const repelSq = repelRadius * repelRadius;
      const driftTime = now * 0.001;

      // Update positions and draw particles using hardware-accelerated fillRect blits
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let baseX = p.targetX;
        let baseY = p.targetY;
        let progress = 1;

        if (gathering) {
          const local =
            (now - gatherStart - p.delay) /
            Math.max(1, reducedMotion ? 1 : gatherDuration);
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX = p.startX + (p.targetX - p.startX) * eased;
          baseY = p.startY + (p.targetY - p.startY) * eased;
          if (progress < 1) complete = false;
        } else if (!reducedMotion && idleDrift > 0) {
          // Living micro-motion at rest
          baseX += Math.sin(driftTime * 0.9 + p.seed * 10) * idleDrift * p.depth;
          baseY += Math.cos(driftTime * 0.75 + p.depth * 10) * idleDrift * p.depth;
        }

        // Exact circular magnetic repulsion effect matching screenshot 2
        if (pointer.active && !reducedMotion && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const distSq = dx * dx + dy * dy;

          if (distSq < repelSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const force = Math.pow(1 - dist / repelRadius, 2) * pointerRepel;
            baseX += (dx / dist) * force;
            baseY += (dy / dist) * force;
          }
        }

        // Smooth spring interpolation
        const follow = reducedMotion ? 1 : 0.22;
        p.x += (baseX - p.x) * follow;
        p.y += (baseY - p.y) * follow;

        // Blit particle: hardware-accelerated 2D quad renders as crisp glowing disc at 120 FPS
        const sz = p.size;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
      }

      ctx.shadowBlur = 0;

      if (gathering && complete) {
        gathering = false;
      }

      // Only schedule next frame if still in viewport
      if (isInViewport) {
        animationFrame = window.requestAnimationFrame(render);
      } else {
        animationFrame = null;
      }
    };

    const ensureRenderLoop = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const sampleText = async () => {
      const currentBuild = ++buildId;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width <= 0 || height <= 0) return;

      // High-DPI canvas backing
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Resolve computed font family to avoid CSS var rejection in Canvas 2D
      let resolvedFamily = "DM Sans, sans-serif";
      if (typeof document !== "undefined") {
        const bodyStyle = window.getComputedStyle(document.body);
        const dmSansVar = bodyStyle.getPropertyValue("--font-dm-sans").trim();
        const uiVar = bodyStyle.getPropertyValue("--font-ui").trim();
        resolvedFamily = [dmSansVar, uiVar, "DM Sans", "Helvetica Neue", "sans-serif"]
          .filter(Boolean)
          .join(", ");
      }

      let resolvedSize = resolveFontSize(
        fontSize,
        container,
        fontWeight,
        resolvedFamily
      );
      let font = `${fontWeight} ${Math.round(resolvedSize)}px ${resolvedFamily}`;

      await waitForFonts(font);
      if (currentBuild !== buildId) return;

      const content = String(text || " ");
      const maxTextWidth = width * 0.98;

      // Check if text is multiline
      const lines = content.includes("\n") ? content.split("\n") : [content];

      // Measure using high-precision offscreen canvas
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      const setCanvasFont = (sz: number) => {
        offCtx.font = `${fontWeight} ${Math.round(sz)}px ${resolvedFamily}`;
        if (!offCtx.font.includes(String(Math.round(sz)))) {
          offCtx.font = `${fontWeight} ${Math.round(sz)}px sans-serif`;
        }
      };

      setCanvasFont(resolvedSize);

      let maxMeasuredWidth = 1;
      for (const line of lines) {
        const m = offCtx.measureText(line);
        if (m.width > maxMeasuredWidth) maxMeasuredWidth = m.width;
      }

      // Responsive downscale if text exceeds available container width
      if (maxMeasuredWidth > maxTextWidth) {
        resolvedSize = Math.max(
          18,
          resolvedSize * (maxTextWidth / maxMeasuredWidth)
        );
        font = `${fontWeight} ${Math.round(resolvedSize)}px ${resolvedFamily}`;
        await waitForFonts(font);
        if (currentBuild !== buildId) return;
        setCanvasFont(resolvedSize);
      }

      const sampleMetrics = offCtx.measureText(lines[0] || "M");
      const ascent = Math.ceil(
        sampleMetrics.actualBoundingBoxAscent || resolvedSize * 0.8
      );
      const descent = Math.ceil(
        sampleMetrics.actualBoundingBoxDescent || resolvedSize * 0.22
      );
      const lineHeight = Math.ceil(resolvedSize * 1.02);
      const padding = Math.max(8, Math.ceil(resolvedSize * 0.08));

      let maxLineWidth = 0;
      for (const line of lines) {
        const m = offCtx.measureText(line);
        if (m.width > maxLineWidth) maxLineWidth = m.width;
      }

      const textWidth = Math.max(1, Math.ceil(maxLineWidth));
      const textHeight = Math.max(
        1,
        ascent + descent + (lines.length - 1) * lineHeight
      );

      // High-precision DPR offscreen mask for razor-sharp subpixel rasterization
      const maskScale = Math.min(window.devicePixelRatio || 1, 2);
      offscreen.width = Math.ceil((textWidth + padding * 2) * maskScale);
      offscreen.height = Math.ceil((textHeight + padding * 2) * maskScale);
      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      offCtx.scale(maskScale, maskScale);

      setCanvasFont(resolvedSize);
      offCtx.textAlign = "left";
      offCtx.textBaseline = "alphabetic";
      offCtx.fillStyle = "#ffffff";

      // Render crisp source text onto high-DPI mask
      lines.forEach((line, index) => {
        offCtx.fillText(
          line,
          padding,
          padding + ascent + index * lineHeight
        );
      });

      const imageData = offCtx.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height
      );

      // Fine-grained sampling: step ~1.9px on desktop, scaling smoothly on mobile
      // Calibrated so particles sit tightly along strokes without any missing holes
      const baseStep = Math.max(1.5, Math.min(2.1, resolvedSize * 0.040));
      const step = Math.max(1.4, baseStep * (density ? 2.0 / density : 1.0));
      const totalCssW = textWidth + padding * 2;
      const totalCssH = textHeight + padding * 2;

      // Scan offscreen mask on a fine grid and capture precise glyph bounds
      const rawPoints: { x: number; y: number; alpha: number }[] = [];
      let minGlyphX = Infinity;
      let maxGlyphX = -Infinity;
      let minGlyphY = Infinity;
      let maxGlyphY = -Infinity;

      for (let cssY = 0; cssY < totalCssH; cssY += step) {
        const maskY = Math.round(cssY * maskScale);
        if (maskY >= offscreen.height) continue;

        for (let cssX = 0; cssX < totalCssW; cssX += step) {
          const maskX = Math.round(cssX * maskScale);
          if (maskX >= offscreen.width) continue;

          const idx = (maskY * offscreen.width + maskX) * 4;
          const alpha = imageData.data[idx + 3];

          // Capture full stroke thickness with crisp edges
          if (alpha > 55) {
            rawPoints.push({
              x: cssX,
              y: cssY,
              alpha: alpha / 255,
            });
            if (cssX < minGlyphX) minGlyphX = cssX;
            if (cssX > maxGlyphX) maxGlyphX = cssX;
            if (cssY < minGlyphY) minGlyphY = cssY;
            if (cssY > maxGlyphY) maxGlyphY = cssY;
          }
        }
      }

      if (rawPoints.length === 0) return;

      const glyphWidth = Math.max(1, maxGlyphX - minGlyphX);
      const glyphHeight = Math.max(1, maxGlyphY - minGlyphY);

      // Horizontal origin:
      // When align === "left", originX = 1 puts the leftmost edge of the letter "P"
      // exactly flush with the "H" in the "HELLO! I'M" label above it.
      let originX = 1;
      if (align === "right") {
        originX = Math.max(0, width - glyphWidth - 1);
      } else if (align === "center") {
        originX = Math.max(0, (width - glyphWidth) / 2);
      }

      // Vertical origin:
      // When align === "left", anchor near top of canvas (originY = 2) so distance
      // from "HELLO! I'M" is tight, natural, and matches the right-side label distance.
      let originY = 2;
      if (align === "center") {
        originY = Math.max(0, (height - glyphHeight) / 2);
      }

      const targets = rawPoints.map((pt) => ({
        x: originX + (pt.x - minGlyphX),
        y: originY + (pt.y - minGlyphY),
        alpha: pt.alpha,
      }));

      // No stride discarding! Every single sampled point is preserved
      particles = targets.map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;

        // Exact previous warm horizontal gradient across full text span:
        // Left letters: warm ivory (#f0ece4)
        // Right letters: rich amber/orange (#d97706)
        const blend = clamp(
          (target.x - originX) / Math.max(1, glyphWidth) + (seed - 0.5) * 0.35,
          0,
          1
        );
        const particleColor = rgbToCss(mixRgb(baseRgb, highlightRgb, blend));

        // Particle size scales with font size: sits tight and touches neighbor dots
        const pSize = Math.max(1.6, Math.min(2.2, step * (0.88 + 0.22 * target.alpha)));

        const angle = seed * Math.PI * 2;
        const distance = (reducedMotion ? 0 : scatter) * (0.35 + depth * 0.75);
        const startX =
          target.x +
          Math.cos(angle) * distance +
          (seed - 0.5) * scatter * 0.45;
        const startY =
          target.y +
          Math.sin(angle) * distance +
          (depth - 0.9) * scatter * 0.45;

        return {
          x: reducedMotion ? target.x : startX,
          y: reducedMotion ? target.y : startY,
          startX,
          startY,
          targetX: target.x,
          targetY: target.y,
          size: pSize,
          color: particleColor,
          seed,
          depth,
          delay: seed * stagger,
        };
      });

      if (reducedMotion) {
        particles.forEach((particle) => {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.startX = particle.targetX;
          particle.startY = particle.targetY;
          particle.delay = 0;
        });
        gathering = false;
      } else {
        startGather(false);
      }

      ensureRenderLoop();
    };

    const queueSample = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(sampleText);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const handlePointerEnter = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.smoothX = pointer.x;
      pointer.smoothY = pointer.y;
      pointer.active = true;
    };

    const handleClick = () => {
      if (trigger === "click") startGather(true);
    };

    const reduceMotionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    );
    const handleReduceMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      sampleText();
    };

    reduceMotionQuery?.addEventListener("change", handleReduceMotionChange);
    canvas.addEventListener("pointerenter", handlePointerEnter);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("click", handleClick);

    const resizeObserver = new ResizeObserver(queueSample);
    resizeObserver.observe(container);

    // Pause the animation loop when the particle canvas leaves the viewport —
    // resume it (and redraw) when it comes back into view.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isInViewport = entry.isIntersecting;
          if (isInViewport && animationFrame === null) {
            // Resume the loop from where it left off
            animationFrame = window.requestAnimationFrame(render);
          }
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );
    intersectionObserver.observe(container);

    sampleText();

    return () => {
      buildId += 1;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reduceMotionQuery?.removeEventListener(
        "change",
        handleReduceMotionChange
      );
      canvas.removeEventListener("pointerenter", handlePointerEnter);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("click", handleClick);

      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [
    text,
    particleSize,
    density,
    color,
    highlightColor,
    scatter,
    gatherDuration,
    stagger,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
    glow,
    align,
  ]);

  return (
    <div
      ref={containerRef}
      className={`particle-text ${className}`}
      style={style}
      aria-label={text}
    >
      <canvas
        ref={canvasRef}
        className="particle-text__canvas"
        aria-hidden="true"
      />
      <span className="particle-text__sr">{text}</span>
    </div>
  );
}
