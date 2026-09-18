"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./CustomCursor.module.css";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [cursorType, setCursorType] = useState<"default" | "hover" | "project">("default");
  const [isVisible, setIsVisible] = useState(false);
  // Track visibility in a ref so the handler closure never becomes stale —
  // this prevents the effect from needing to remount on every cursor-state change.
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Disable entirely on touch / coarse pointer devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Fast GSAP quickTo for silky smooth cursor tracking without lag
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);

      // Use the ref to read current visibility without adding it to deps
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check for project card or project view area
      const projectTarget = target.closest('[data-cursor="view"]');
      if (projectTarget) {
        setCursorType("project");
        return;
      }

      // Check for generic interactive element
      const interactiveTarget = target.closest('a, button, [role="button"], input, textarea');
      if (interactiveTarget) {
        setCursorType("hover");
        return;
      }

      setCursorType("default");
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
    // Empty dependency array — this effect runs once. Handlers read from refs.
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`
        ${styles.cursor}
        ${isVisible ? styles.cursorVisible : ""}
        ${cursorType === "hover" ? styles.cursorHover : ""}
        ${cursorType === "project" ? styles.cursorProject : ""}
      `}
      aria-hidden="true"
    >
      {cursorType === "project" && (
        <span className={styles.cursorText}>VIEW <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.5} /></span>
      )}
    </div>
  );
}
