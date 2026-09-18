"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Avoid running on the very first mount so the LoadingScreen and Hero have full control
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!containerRef.current) return;

    // Fast, smooth cinematic reveal on navigation between routes
    gsap.fromTo(
      containerRef.current,
      { opacity: 0.2, y: 16 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" }
    );

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      {children}
    </div>
  );
}
