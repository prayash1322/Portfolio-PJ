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
  blur: number;
}

interface CachedCardMetrics {
  cardTop: number;
  triggerStart: number;
  triggerEnd: number;
  pinStart: number;
  targetScale: number;
}

interface CachedStackLayout {
  metrics: CachedCardMetrics[];
  pinEnd: number;
  stackPositionPx: number;
}

export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
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
  const metricsRef = useRef<CachedStackLayout | null>(null);
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

  const getElementOffset = useCallback(
    (element: HTMLElement, index?: number) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        // Subtract any currently active translateY from ScrollStack transforms
        // to retrieve the true static document offset of the card
        const currentY =
          index !== undefined ? lastTransformsRef.current.get(index)?.translateY ?? 0 : 0;
        return rect.top + window.scrollY - currentY;
      } else {
        return element.offsetTop;
      }
    },
    [useWindowScroll]
  );

  // Measure and cache layout metrics once on mount / resize to eliminate DOM layout thrashing on scroll
  const measureMetrics = useCallback(() => {
    if (!cardsRef.current.length) return;

    const { containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = useWindowScroll
      ? (document.querySelector(".scroll-stack-end") as HTMLElement | null)
      : (scrollerRef.current?.querySelector(".scroll-stack-end") as HTMLElement | null);

    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    const numCards = cardsRef.current.length;
    const lastCard = numCards > 0 ? cardsRef.current[numCards - 1] : null;
    const lastCardTop = lastCard ? getElementOffset(lastCard, numCards - 1) : 0;
    const lastCardHeight = lastCard ? lastCard.offsetHeight : 520;
    const lastCardPinStart = lastCardTop - stackPositionPx - itemStackDistance * (numCards - 1);
    const stackBottom = stackPositionPx + itemStackDistance * (numCards - 1) + lastCardHeight;

    // Unpin when the next section is 40px below the stack bottom (zero blank space, zero overlap)
    const pinEnd =
      endElementTop > 0
        ? Math.max(lastCardPinStart + 120, endElementTop - stackBottom - 40)
        : lastCardPinStart + 200;

    const metrics: CachedCardMetrics[] = cardsRef.current.map((card, i) => {
      const cardTop = getElementOffset(card, i);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const targetScale = baseScale + i * itemScale;
      return {
        cardTop,
        triggerStart,
        triggerEnd,
        pinStart,
        targetScale,
      };
    });

    metricsRef.current = {
      metrics,
      pinEnd,
      stackPositionPx,
    };
  }, [
    baseScale,
    getElementOffset,
    getScrollData,
    itemScale,
    itemStackDistance,
    parsePercentage,
    scaleEndPosition,
    stackPosition,
    useWindowScroll,
  ]);

  // High-performance transform update: 0 DOM reads during scroll frames
  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || !metricsRef.current) return;

    const { scrollTop } = getScrollData();
    const { metrics, pinEnd, stackPositionPx } = metricsRef.current;

    cardsRef.current.forEach((card, i) => {
      if (!card || !metrics[i]) return;

      const { cardTop, triggerStart, triggerEnd, pinStart, targetScale } = metrics[i];

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < metrics.length; j++) {
          if (scrollTop >= metrics[j].pinStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

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
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        card.style.transform = transform;
        if (blurAmount > 0) {
          card.style.filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";
        }
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
    blurAmount,
    calculateProgress,
    getScrollData,
    itemStackDistance,
    onStackComplete,
    rotationAmount,
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
      // Check if global Lenis instance is already running from SmoothScrollProvider
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
      card.style.willChange = blurAmount > 0 ? "transform, filter" : "transform";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.webkitTransform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.webkitPerspective = "1000px";
    });

    measureMetrics();
    setupLenis();

    const handleResize = () => {
      measureMetrics();
      updateCardTransforms();
    };

    if (useWindowScroll) {
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
      window.addEventListener("resize", handleResize, { passive: true });
    }

    const ro = new ResizeObserver(handleResize);
    ro.observe(scroller);

    updateCardTransforms();

    return () => {
      ro.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (useWindowScroll) {
        window.removeEventListener("scroll", scheduleUpdate);
        window.removeEventListener("resize", handleResize);
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
      metricsRef.current = null;
    };
  }, [
    itemDistance,
    blurAmount,
    useWindowScroll,
    setupLenis,
    measureMetrics,
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
