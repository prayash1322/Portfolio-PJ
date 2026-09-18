import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import styles from "./ProjectDetail.module.css";
import { PROJECTS, getProjectBySlug } from "@/lib/data/projects";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found — Prayashkanta Jena",
    };
  }

  return {
    title: `${project.title} — Case Study | Prayashkanta Jena`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = PROJECTS.findIndex((p) => p.slug === slug);
  const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Navigation Bar */}
        <div className={styles.backNav}>
          <Link href="/#work" className={styles.backLink} data-cursor="hover">
            <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.5} />
            <span>All Selected Work</span>
          </Link>
          <span className={styles.projectIndex}>
            PROJECT // {project.number} OF {String(PROJECTS.length).padStart(2, "0")}
          </span>
        </div>

        {/* Title Header */}
        <header className={styles.headerArea}>
          <span className={styles.category}>{project.category}</span>
          <h1 className={styles.title}>{project.title}</h1>
          {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
        </header>

        {/* Large Hero Visual */}
        <div
          className={styles.heroVisual}
          style={{
            background: project.visualTheme.gradient,
            boxShadow: `0 30px 80px -20px ${project.visualTheme.ambientGlow}`,
          }}
        >
          <div className={styles.heroVisualTop}>
            <span className={styles.visualIndex}>Project {project.number}</span>
            {project.timeline && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(240, 236, 228, 0.7)",
                }}
              >
                {project.timeline}
              </span>
            )}
          </div>

          <div className={styles.heroVisualCenter}>
            <div className={styles.heroVisualTitle}>{project.title}</div>
          </div>

          <div className={styles.heroVisualBottom}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                color: "rgba(240, 236, 228, 0.6)",
              }}
            >
              {project.category}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                color: "var(--chalk)",
              }}
            >
              Project details
            </div>
          </div>
        </div>

        {/* Highlights Bar */}
        {project.highlights && project.highlights.length > 0 && (
          <div className={styles.highlightsList}>
            {project.highlights.map((item) => (
              <div key={item.label} className={styles.highlightItem}>
                <span className={styles.highlightLabel}>{item.label}</span>
                <span className={styles.highlightValue}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Editorial Case Study Content Grid */}
        <div className={styles.caseStudyGrid}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {project.role && (
              <div className={styles.sideItem}>
                <span className={styles.sideLabel}>Role & Responsibility</span>
                <span className={styles.sideValue}>{project.role}</span>
              </div>
            )}

            {project.timeline && (
              <div className={styles.sideItem}>
                <span className={styles.sideLabel}>Timeline</span>
                <span className={styles.sideValue}>{project.timeline}</span>
              </div>
            )}

            <div className={styles.sideItem}>
              <span className={styles.sideLabel}>Technology Stack</span>
              <div className={styles.techPills}>
                {project.technologies.map((tech) => (
                  <span key={tech} className={styles.techPill}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.currentState && (
              <div className={styles.sideItem}>
                <span className={styles.sideLabel}>Current Status</span>
                <span className={styles.sideValue}>{project.currentState}</span>
              </div>
            )}

            <div className={styles.actionsGroup}>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtnPrimary}
                  data-cursor="hover"
                >
                  <span>Launch Live Project</span>
                  <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.5} />
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtnSecondary}
                  data-cursor="hover"
                >
                  <span>View Source Code</span>
                  <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </aside>

          {/* Main Narrative */}
          <section className={styles.narrative}>
            <article className={styles.narrativeBlock}>
              <h2 className={styles.narrativeSectionTitle}>Overview</h2>
              <p className={styles.narrativeText}>{project.description}</p>
            </article>

            {project.problem && (
              <article className={styles.narrativeBlock}>
                <h2 className={styles.narrativeSectionTitle}>Objective</h2>
                <p className={styles.narrativeText}>{project.problem}</p>
              </article>
            )}

            {project.approach && (
              <article className={styles.narrativeBlock}>
                <h2 className={styles.narrativeSectionTitle}>Approach</h2>
                <p className={styles.narrativeText}>{project.approach}</p>
              </article>
            )}
          </section>
        </div>

        {/* Bottom Pagination */}
        <nav className={styles.bottomNav} aria-label="Next project navigation">
          <div>
            <span className={styles.bottomNavLabel}>NEXT CASE STUDY</span>
          </div>
          <Link
            href={`/projects/${nextProject.slug}`}
            className={styles.bottomNavLink}
            data-cursor="hover"
          >
            <span>{nextProject.title}</span>
            <ArrowRight aria-hidden="true" size={19} strokeWidth={1.5} />
          </Link>
        </nav>
      </div>
    </main>
  );
}
