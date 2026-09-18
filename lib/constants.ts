import { PORTFOLIO_DATA } from "@/data/portfolio";

export const SITE = {
  name: PORTFOLIO_DATA.personal.name,
  initials: PORTFOLIO_DATA.personal.initials,
  role: PORTFOLIO_DATA.personal.title,
  tagline: PORTFOLIO_DATA.personal.tagline,
  email: PORTFOLIO_DATA.personal.email,
  phone: PORTFOLIO_DATA.personal.phone,
  location: PORTFOLIO_DATA.personal.location,
  github: PORTFOLIO_DATA.personal.github,
  linkedin: PORTFOLIO_DATA.personal.linkedin,
  aboutImage: PORTFOLIO_DATA.personal.aboutImage,
  year: new Date().getFullYear(),
} as const;

export const FRAME_COUNT = 240;

export const MOTION = {
  EASE_OUT: "power3.out",
  EASE_IN_OUT: "power2.inOut",
  EASE_REVEAL: "expo.out",
  EASE_BACK: "back.out(1.2)",
  DUR_FAST: 0.3,
  DUR_MED: 0.6,
  DUR_SLOW: 1.0,
  DUR_CINEMATIC: 1.6,
  STAGGER: 0.08,
} as const;
