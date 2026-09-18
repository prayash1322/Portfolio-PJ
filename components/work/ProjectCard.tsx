"use client";

import React, { useRef } from "react";
import Image from "next/image";
import styles from "./SelectedWork.module.css";
import { Project } from "@/lib/data/projects";
import TiltedCard from "@/components/reactbits/TiltedCard";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import BorderGlow from "@/components/reactbits/BorderGlow";
import GlareHover from "@/components/reactbits/GlareHover";
function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const isReverse = index % 2 !== 0;

  // ScrollStack handles the scroll choreography and card transforms

  const CardTag = project.liveUrl ? "a" : "div";
  const cardProps = project.liveUrl
    ? {
      href: project.liveUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": `Open ${project.title} live website`,
    }
    : {};

  return (
    <div
      ref={rowRef}
      className={`${styles.projectRow} ${isReverse ? styles.projectRowReverse : ""}`}
    >
      {/* Visual Canvas Column — TiltedCard > BorderGlow > SpotlightCard > clickable card */}
      <div ref={visualRef} className={styles.visualColumn}>
        <TiltedCard
          rotateAmplitude={6}
          scaleOnHover={1.015}
          containerWidth="100%"
          containerHeight="auto"
        >
          <BorderGlow
            glowColor="32 85 62"
            glowRadius={30}
            borderRadius={6}
            backgroundColor="transparent"
            colors={["#e28743", "#f59e0b", "#d4521a"]}
          >
            <SpotlightCard
              spotlightColor="rgba(240, 236, 228, 0.04)"
              className={styles.spotlightWrapper}
            >
              <CardTag
                {...cardProps}
                className={styles.visualCard}
                data-cursor="view"
                style={{
                  background: project.visualTheme.gradient,
                  boxShadow: `0 24px 60px -15px ${project.visualTheme.ambientGlow}`,
                }}
              >
                <GlareHover
                  width="100%"
                  height="100%"
                  background="transparent"
                  borderRadius="4px"
                  borderColor="transparent"
                  glareColor="rgba(255, 231, 203, 0.75)"
                  glareOpacity={0.30}
                  glareAngle={-35}
                  glareSize={280}
                  transitionDuration={500}
                  className={styles.glareWrapper}
                >
                  {project.image ? (
                    <div className={styles.imageWrapper}>
                      <Image
                        src={project.image}
                        alt={`${project.title} mockup preview`}
                        fill
                        sizes="(max-width: 960px) 100vw, 55vw"
                        className={styles.projectImage}
                        priority={index < 2}
                      />
                    </div>
                  ) : (
                    <div className={styles.visualInner}>
                      <div className={styles.visualCenter}>
                        <h4 className={styles.visualMainTitle}>{project.title}</h4>
                        <p className={styles.visualSub}>{project.category}</p>
                      </div>
                    </div>
                  )}
                </GlareHover>
              </CardTag>
            </SpotlightCard>
          </BorderGlow>
        </TiltedCard>
      </div>

      {/* Editorial Content Column */}
      <div ref={contentRef} className={styles.contentColumn}>
        <div className={styles.metaHeader}>
          <span className={styles.projectCategory}>{project.category}</span>
        </div>

        <h3 className={styles.projectTitle}>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.projectTitleLink}
              data-cursor="view"
            >
              {project.title}
            </a>
          ) : (
            <span className={styles.projectTitleText} data-cursor="view">
              {project.title}
            </span>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubIconLink}
              aria-label={`${project.title} GitHub repository`}
            >
              <GithubIcon size={18} />
            </a>
          )}
        </h3>

        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.techList}>
          {project.technologies.map((tech) => (
            <span key={tech} className={styles.techItem}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
