"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { renderCanvasFrame } from "@/lib/animations/heroSequence";

export interface HeroCanvasHandle {
  draw: (img: HTMLImageElement) => void;
  getCanvas: () => HTMLCanvasElement | null;
}

interface HeroCanvasProps {
  className?: string;
}

const HeroCanvas = forwardRef<HeroCanvasHandle, HeroCanvasProps>(({ className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentImgRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    draw: (img: HTMLImageElement) => {
      currentImgRef.current = img;
      if (canvasRef.current && img) {
        renderCanvasFrame(canvasRef.current, img, "cover");
      }
    },
    getCanvas: () => canvasRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (currentImgRef.current && canvasRef.current) {
        renderCanvasFrame(canvasRef.current, currentImgRef.current, "cover");
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(canvas);
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
});

HeroCanvas.displayName = "HeroCanvas";

export default HeroCanvas;
