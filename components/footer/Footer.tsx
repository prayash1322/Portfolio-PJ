"use client";

import React from "react";
import styles from "./Footer.module.css";
import { SITE } from "@/lib/constants";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.container}>
        <div className={styles.brandGroup}>
          <span className={styles.initialMark}>{SITE.initials}</span>
          <span className={styles.copyright}>
            © {SITE.year} {SITE.name}. All rights reserved.
          </span>
        </div>

        <div className={styles.links}>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            LinkedIn
          </a>
          <a href={`mailto:${SITE.email}`} className={styles.link}>
            Email
          </a>
          <button
            type="button"
            onClick={scrollToTop}
            className={styles.backToTop}
            aria-label="Back to top of page"
          >
            <span>TOP</span>
            <ArrowUp aria-hidden="true" size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </footer>
  );
}
