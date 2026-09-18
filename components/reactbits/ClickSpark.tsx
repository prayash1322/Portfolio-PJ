"use client";

import React, { useRef, useCallback, useEffect } from "react";
import "./ClickSpark.css";

interface ClickSparkProps {
  children?: React.ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  className?: string;
}

type Spark = {
  x: number;
  y: number;
  angle: number;
  startTime: number;
};

export default function ClickSpark({
  children,
  sparkColor = "rgba(240, 236, 228, 0.8)",
  sparkSize = 5,
  sparkRadius = 20,
  sparkCount = 8,
  duration = 380,
  className = "",
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparksRef.current = sparksRef.current.filter((spark) => {
      const t = Math.min((now - spark.startTime) / duration, 1);
      const eased = easeOut(t);
      const dist = eased * sparkRadius;
      const alpha = (1 - eased) * 0.9;
      const sx = spark.x + Math.cos(spark.angle) * dist;
      const sy = spark.y + Math.sin(spark.angle) * dist;
      const size = sparkSize * (1 - eased * 0.6);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = sparkColor;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      return t < 1;
    });

    ctx.globalAlpha = 1;

    if (sparksRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(draw);
    } else {
      activeRef.current = false;
    }
  }, [sparkColor, sparkSize, sparkRadius, duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    syncSize();
    window.addEventListener("resize", syncSize, { passive: true });

    const handleClick = (e: MouseEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const now = performance.now();
      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x: e.clientX,
        y: e.clientY,
        angle: (i / sparkCount) * Math.PI * 2 + Math.random() * 0.3,
        startTime: now,
      }));

      sparksRef.current.push(...newSparks);

      if (!activeRef.current) {
        activeRef.current = true;
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("resize", syncSize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw, sparkCount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="click-spark-canvas"
        aria-hidden="true"
      />
      {children}
    </>
  );
}
