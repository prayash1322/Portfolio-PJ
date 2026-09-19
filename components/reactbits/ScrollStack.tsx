"use client";

import React, {
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import Lenis from "lenis";
import "./ScrollStack.css";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
  style?: CSSProperties;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
  style,
}) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
    {children}
  </div>
);

export interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

interface CardTransform {
  translateY: number;
  scale: number;
  rotation: number;
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 55,
  itemScale = 0.02,
  itemStackDistance = 10,
  stackPosition = "75px",
  scaleEndPosition = "40px",
  baseScale = 0.90,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const createdOwnLenisRef = useRef(false);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef<Map<number, CardTransform>>(new Map());
  const rafPendingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start || 1);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(String(value));
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller?.scrollTop ?? 0,
        containerHeight: scroller?.clientHeight ?? 0,
      };
    }
  }, [useWindowScroll]);

  // Robustly calculate the static offset of an element inside the scroller.
  // CSS transforms on card NEVER affect offsetTop, guaranteeing 100% accurate measurements.
  const getCardOffsetInScroller = useCallback((card: HTMLElement, scroller: HTMLElement): number => {
    let offset = 0;
    let curr: HTMLElement | null = card;
    while (curr && curr !== scroller) {
      offset += curr.offsetTop;
      curr = curr.offsetParent as HTMLElement | null;
    }
    return offset;
  }, []);

  // Update card transforms with live static scroller coordinates.
  // Completely immune to pin spacers, image loads, or hydration timing!
  const updateCardTransforms = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !cardsRef.current.length) return;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    // Live static document top of the scroller (scroller has zero CSS transforms)
    const scrollerTop = useWindowScroll
      ? scroller.getBoundingClientRect().top + window.scrollY
      : 0;

    const endElement = scroller.querySelector(".scroll-stack-end") as HTMLElement | null;
    const endElementOffset = endElement ? getCardOffsetInScroller(endElement, scroller) : 0;
    const endElementTop = scrollerTop + endElementOffset;

    const numCards = cardsRef.current.length;
    const lastCard = numCards > 0 ? cardsRef.current[numCards - 1] : null;
    const lastCardOffset = lastCard ? getCardOffsetInScroller(lastCard, scroller) : 0;
    const lastCardTop = scrollerTop + lastCardOffset;
    const lastCardHeight = lastCard ? lastCard.offsetHeight : 500;
    const lastCardPinStart = lastCardTop - stackPositionPx - itemStackDistance * (numCards - 1);
    const stackBottom = stackPositionPx + itemStackDistance * (numCards - 1) + lastCardHeight;

    // Unpin cleanly when the stack sequence finishes
    const pinEnd =
      endElementTop > 0
        ? Math.max(lastCardPinStart + 120, endElementTop - stackBottom - 30)
        : lastCardPinStart + 180;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardOffset = getCardOffsetInScroller(card, scroller);
      const cardTop = scrollerTop + cardOffset;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform: CardTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.transform = transform;
        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    baseScale,
    calculateProgress,
    getCardOffsetInScroller,
    getScrollData,
    itemScale,
    itemStackDistance,
    onStackComplete,
    parsePercentage,
    rotationAmount,
    scaleEndPosition,
    stackPosition,
    useWindowScroll,
  ]);

  // Coalesce updates to at most 1 per display refresh frame
  const scheduleUpdate = useCallback(() => {
    if (rafPendingRef.current) return;
    rafPendingRef.current = true;
    requestAnimationFrame(() => {
      rafPendingRef.current = false;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const globalLenis =
        typeof window !== "undefined"
          ? (window as unknown as { __lenis?: Lenis }).__lenis
          : undefined;

      if (globalLenis) {
        globalLenis.on("scroll", scheduleUpdate);
        lenisRef.current = globalLenis;
        createdOwnLenisRef.current = false;
        return globalLenis;
      }
      return null;
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return null;

      const inner = scroller.querySelector(".scroll-stack-inner");
      const lenis = new Lenis({
        wrapper: scroller,
        content: (inner as HTMLElement) || scroller,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1,
        infinite: false,
        gestureOrientation: "vertical",
        wheelMultiplier: 1,
        syncTouch: false,
      });

      lenis.on("scroll", scheduleUpdate);

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      createdOwnLenisRef.current = true;
      return lenis;
    }
  }, [scheduleUpdate, useWindowScroll]);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll<HTMLElement>(".scroll-stack-card")
        : scroller.querySelectorAll<HTMLElement>(".scroll-stack-card")
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      card.style.zIndex = `${i + 1}`;
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = "transform";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.webkitPerspective = "1000px";
    });

    setupLenis();

    if (useWindowScroll) {
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
      window.addEventListener("resize", scheduleUpdate, { passive: true });
    }

    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(scroller);

    updateCardTransforms();

    return () => {
      ro.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (useWindowScroll) {
        window.removeEventListener("scroll", scheduleUpdate);
        window.removeEventListener("resize", scheduleUpdate);
      }
      if (lenisRef.current) {
        if (createdOwnLenisRef.current) {
          lenisRef.current.destroy();
        } else {
          lenisRef.current.off("scroll", scheduleUpdate);
        }
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
    };
  }, [
    itemDistance,
    useWindowScroll,
    setupLenis,
    updateCardTransforms,
    scheduleUpdate,
  ]);

  return (
    <div
      className={`scroll-stack-scroller ${className}`.trim()}
      ref={scrollerRef}
      data-window-scroll={useWindowScroll ? "true" : undefined}
    >
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
