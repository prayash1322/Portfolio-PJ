import { PORTFOLIO_DATA, ProjectItem } from "@/data/portfolio";

export type Project = ProjectItem;

export const PROJECTS: Project[] = PORTFOLIO_DATA.projects as Project[];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
