"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./IntroAbout.module.css";
import { SITE } from "@/lib/constants";
import ScrollExpand from "@/components/reactbits/ScrollExpand";

export default function IntroAbout() {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Responsive configuration for ScrollExpand
  const [config, setConfig] = useState({
    startWidth: 46,
    startHeight: 56,
    startRadius: 24,
    endRadius: 0,
    mediaZoom: 1.15,
    scrollDistance: 1.25,
    holdDistance: 0.5,
    smoothing: 0.05,
    overlayScrim: 0.84,
  });

  useEffect(() => {
    const updateConfig = () => {
      const w = window.innerWidth;
      if (w <= 480) {
        setConfig({
          startWidth: 84,
          startHeight: 48,
          startRadius: 18,
          endRadius: 0,
          mediaZoom: 1.08,
          scrollDistance: 0.9,
          holdDistance: 0.4,
          smoothing: 0.04,
          overlayScrim: 0.86,
        });
      } else if (w <= 768) {
        setConfig({
          startWidth: 70,
          startHeight: 52,
          startRadius: 20,
          endRadius: 0,
          mediaZoom: 1.12,
          scrollDistance: 1.0,
          holdDistance: 0.45,
          smoothing: 0.05,
          overlayScrim: 0.84,
        });
      } else if (w <= 1280) {
        setConfig({
          startWidth: 54,
          startHeight: 54,
          startRadius: 24,
          endRadius: 0,
          mediaZoom: 1.14,
          scrollDistance: 1.1,
          holdDistance: 0.5,
          smoothing: 0.05,
          overlayScrim: 0.82,
        });
      } else {
        setConfig({
          startWidth: 46,
          startHeight: 56,
          startRadius: 24,
          endRadius: 0,
          mediaZoom: 1.15,
          scrollDistance: 1.25,
          holdDistance: 0.5,
          smoothing: 0.05,
          overlayScrim: 0.84,
        });
      }
    };

    updateConfig();
    window.addEventListener("resize", updateConfig);

    return () => {
      window.removeEventListener("resize", updateConfig);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className={styles.section} aria-label="About">
      <ScrollExpand
        src={SITE.aboutImage}
        alt={`${SITE.name} — Full-Stack Developer`}
        useWindowScroll={true}
        startWidth={config.startWidth}
        startHeight={config.startHeight}
        startRadius={config.startRadius}
        endRadius={config.endRadius}
        mediaZoom={config.mediaZoom}
        scrollDistance={config.scrollDistance}
        holdDistance={config.holdDistance}
        smoothing={config.smoothing}
        overlayScrim={config.overlayScrim}
      >
        <div className={styles.overlayContainer}>
          <h2 className={styles.statement}>
            Building digital experiences{" "}
            <span className={styles.statementEmphasized}>that feel as good</span> as they work.
          </h2>

          <div className={styles.narrative}>
            <p className={styles.lead}>
              I&apos;m Prayashkanta Jena, an Information Technology student and full-stack developer with hands-on experience in web development, mobile applications, and backend systems. I work across JavaScript, TypeScript, React, React Native, Node.js, REST APIs, and SQL — with practical exposure to developing, deploying, and building with AI-assisted workflows.
            </p>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}
