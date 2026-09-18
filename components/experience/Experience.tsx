"use client";

import React, { useRef, useEffect } from "react";
import styles from "./Experience.module.css";
import { PORTFOLIO_DATA } from "@/data/portfolio";
import { registerGSAP, gsap } from "@/lib/gsap";

import BorderGlow from "@/components/reactbits/BorderGlow";

export default function Experience() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGSAP();

    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        "[data-exp-animate]",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className={styles.section} aria-label="Experience & Education">
      <div className={styles.container}>
        <div className={styles.sectionHeader} data-exp-animate>
          <h2 className={styles.heading}>
            EXPERIENCE &amp; <em>EDUCATION</em>
          </h2>
        </div>

        <div className={styles.grid}>
          {/* Experience / Internship Column */}
          <div className={styles.column} data-exp-animate>
            <span className={styles.subHeading}>INTERNSHIP EXPERIENCE</span>

            {PORTFOLIO_DATA.experience.map((exp) => (
              <BorderGlow
                key={exp.company}
                className={styles.glowCard}
                edgeSensitivity={30}
                glowColor="32 85 62"
                backgroundColor="#141110"
                fillOpacity={0}
                borderRadius={16}
                glowRadius={35}
                glowIntensity={1.0}
                coneSpread={28}
                colors={["#e28743", "#f59e0b", "#d4521a"]}
              >
                <div className={styles.itemCardInner}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{exp.company}</h3>
                      <span className={styles.itemRole}>{exp.role}</span>
                    </div>
                    <span className={styles.itemPeriod}>{exp.period}</span>
                  </div>

                  <ul className={styles.pointsList}>
                    {exp.points.map((point) => (
                      <li key={point} className={styles.pointItem}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </BorderGlow>
            ))}
          </div>

          {/* Education & Training Column */}
          <div className={styles.column} data-exp-animate>
            <span className={styles.subHeading}>EDUCATION &amp; TRAINING</span>

            {PORTFOLIO_DATA.education.map((edu) => (
              <BorderGlow
                key={edu.institution}
                className={styles.glowCard}
                edgeSensitivity={30}
                glowColor="32 85 62"
                backgroundColor="#141110"
                fillOpacity={0}
                borderRadius={16}
                glowRadius={35}
                glowIntensity={1.0}
                coneSpread={28}
                colors={["#e28743", "#f59e0b", "#d4521a"]}
              >
                <div className={styles.itemCardInner}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{edu.institution}</h3>
                      <span className={styles.itemRole}>
                        {edu.degree}
                        {edu.stream ? ` — ${edu.stream}` : ""}
                      </span>
                    </div>
                    <span className={styles.itemPeriod}>{edu.period}</span>
                  </div>

                  {edu.currentStatus && (
                    <p className={styles.educationDetails}>{edu.currentStatus}</p>
                  )}
                  {edu.coursework && (
                    <p className={styles.educationDetails}>{edu.coursework}</p>
                  )}
                </div>
              </BorderGlow>
            ))}

            {PORTFOLIO_DATA.courses.map((course) => (
              <BorderGlow
                key={course.name}
                className={styles.glowCard}
                edgeSensitivity={30}
                glowColor="32 85 62"
                backgroundColor="#141110"
                fillOpacity={0}
                borderRadius={16}
                glowRadius={35}
                glowIntensity={1.0}
                coneSpread={28}
                colors={["#e28743", "#f59e0b", "#d4521a"]}
              >
                <div className={styles.itemCardInner}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{course.name}</h3>
                      <span className={styles.itemRole}>
                        {course.institution} ({course.status})
                      </span>
                    </div>
                    <span className={styles.itemPeriod}>{course.period}</span>
                  </div>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
