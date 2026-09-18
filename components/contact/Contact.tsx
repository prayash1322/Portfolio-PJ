"use client";

import React, { useEffect, useRef } from "react";
import styles from "./Contact.module.css";
import { SITE } from "@/lib/constants";
import { registerGSAP, gsap } from "@/lib/gsap";
import { ArrowUpRight } from "lucide-react";

export default function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGSAP();

    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current.children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
        );
      }

      if (actionsRef.current) {
        tl.fromTo(
          actionsRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "-=0.4"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className={styles.section} aria-label="Contact">
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.label}>GET IN TOUCH</span>
        </div>

        <div ref={headlineRef} className={styles.headlineGroup}>
          <div className={styles.headlineLine}>LET&apos;S BUILD</div>
          <div className={`${styles.headlineLine} ${styles.headlineLineEmphasized}`}>
            SOMETHING
          </div>
          <div className={styles.headlineLine}>WORTH REMEMBERING.</div>
        </div>

        <div ref={actionsRef} className={styles.actionsArea}>
          <div className={styles.primaryCtaWrapper}>
            <a
              href={`mailto:${SITE.email}?subject=Project%20Inquiry%20%E2%80%94%20Prayashkanta%20Jena`}
              className={styles.ctaButton}
              data-cursor="hover"
            >
              <span>LET&apos;S TALK</span>
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
            <span className={styles.ctaSubtext}>A direct line for considered work.</span>
          </div>

          <div className={styles.channelsList}>
            <div className={styles.channelItem}>
              <span className={styles.channelLabel}>Email</span>
              <a href={`mailto:${SITE.email}`} className={styles.channelLink}>
                {SITE.email}
              </a>
            </div>

            <div className={styles.channelItem}>
              <span className={styles.channelLabel}>GitHub</span>
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channelLink}
              >
                github.com <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
              </a>
            </div>

            <div className={styles.channelItem}>
              <span className={styles.channelLabel}>LinkedIn</span>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channelLink}
              >
                linkedin.com <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
