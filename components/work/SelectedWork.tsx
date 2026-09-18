"use client";

import React, { useRef } from "react";
import styles from "./SelectedWork.module.css";
import { PROJECTS } from "@/lib/data/projects";
import ProjectCard from "./ProjectCard";
import ScrollStack, { ScrollStackItem } from "@/components/reactbits/ScrollStack";

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section id="work" ref={sectionRef} className={styles.section} aria-label="Selected Works">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.heading}>
            A few things I&apos;ve made <em>matter.</em>
          </h2>
        </div>

        <ScrollStack
          useWindowScroll={true}
          itemDistance={55}
          itemScale={0.02}
          itemStackDistance={10}
          stackPosition="75px"
          scaleEndPosition="40px"
          baseScale={0.90}
          blurAmount={0}
          className={styles.stackScroller}
        >
          {PROJECTS.map((project, index) => (
            <ScrollStackItem key={project.slug} itemClassName={styles.stackItem}>
              <ProjectCard project={project} index={index} />
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
