"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { SITE } from "@/lib/constants";
import GlassSurface from "./GlassSurface";
import JellyRadio from "@/components/reactbits/JellyRadio";

const NAV_ITEMS = [
  { value: "about", label: "About" },
  { value: "stack", label: "Stack" },
  { value: "work", label: "Work" },
  { value: "experience", label: "Experience" },
  { value: "contact", label: "Contact" },
];

export default function Navbar() {
  const [active, setActive] = useState<string>("");
  // Track the last active section in a ref to skip redundant setState calls
  // on every scroll tick when the active section hasn't changed.
  const activeRef = useRef<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const aboutEl = document.getElementById("about");
      if (aboutEl) {
        const aboutTop = aboutEl.getBoundingClientRect().top + window.scrollY;
        // When user is above About (in Hero section), no chip should be active
        if (window.scrollY + window.innerHeight * 0.25 < aboutTop) {
          if (activeRef.current !== "") {
            activeRef.current = "";
            setActive("");
          }
          return;
        }
      }

      const sections = ["about", "stack", "work", "experience", "contact"];
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      let current = "";
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          current = sections[i];
          break;
        }
      }

      // Only update state if the active section actually changed
      if (activeRef.current !== current) {
        activeRef.current = current;
        setActive(current);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavChange = (value: string) => {
    setActive(value);
    const target = document.getElementById(value);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = `#${value}`;
    }
  };

  return (
    <header className={styles.header} id="navbar">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={50}
        displace={15}
        distortionScale={-150}
        redOffset={5}
        greenOffset={15}
        blueOffset={25}
        brightness={60}
        opacity={0.8}
        backgroundOpacity={0.15}
        saturation={1.5}
        mixBlendMode="screen"
        className={styles.glassPill}
      >
        <Link
          href="/"
          onClick={() => setActive("")}
          className={styles.brand}
          aria-label={`${SITE.name} — Homepage`}
        >
          <span className={styles.brandName}>{SITE.initials}</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Main navigation">
          <JellyRadio
            items={NAV_ITEMS}
            value={active}
            onChange={handleNavChange}
            chipColor="rgba(240, 236, 228, 0.04)"
            activeColor="rgba(240, 236, 228, 0.95)"
            textColor="rgba(240, 236, 228, 0.72)"
            activeTextColor="#0d0c0a"
            size="sm"
            gap={4}
            radius={999}
            swell={0.15}
            barge={4}
            shrink={0.03}
            jelly={1}
            bounce={0.25}
            stagger={16}
            stiffness={580}
            ariaLabel="Navigation Sections"
          />
        </nav>
      </GlassSurface>
    </header>
  );
}

