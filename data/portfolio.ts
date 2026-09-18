/**
 * Portfolio Content — Single Source of Truth
 * Derived strictly from Prayash-jena-Latest-Resume(4).pdf
 * No invented metrics, no invented technologies, no invented projects.
 */

export interface ProjectItem {
  slug: string;
  number: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  accentColor: string;
  image?: string;
  visualTheme: {
    baseColor: string;
    gradient: string;
    ambientGlow: string;
  };
  role?: string;
  tagline?: string;
  timeline?: string;
  highlights?: { label: string; value: string }[];
  problem?: string;
  approach?: string;
  currentState?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  boardOrUniversity?: string;
  period: string;
  stream?: string;
  currentStatus?: string;
  coursework?: string;
}

export interface ExperienceItem {
  company: string;
  location: string;
  period: string;
  role: string;
  points: string[];
}

export interface CourseItem {
  name: string;
  institution: string;
  period: string;
  status: string;
}

export const PORTFOLIO_DATA = {
  personal: {
    name: "Prayashkanta Jena",
    initials: "PJ",
    title: "Full Stack Developer | AI & Agentic Development",
    tagline: "Building scalable, reliable applications and AI-driven software solutions.",
    email: "prayash1305@gmail.com",
    phone: "97266-13507",
    location: "Surat, India",
    github: "https://github.com/Prayash1322",
    githubUsername: "Prayash1322",
    linkedin: "https://linkedin.com/in/prayash-jena",
    linkedinName: "Prayash Jena",
    aboutImage: "/me-about.png",
    summary:
      "Information Technology student with hands-on experience in full-stack web development, mobile application development, backend development, and AI-assisted software development. Experienced with JavaScript, TypeScript, React, React Native, Node.js, REST APIs, SQL, and Git, with practical exposure to developing and deploying software solutions. Seeking software development opportunities to build scalable and reliable applications.",
    editorialHeadline: "Building digital experiences that feel as good as they work.",
    editorialLead:
      "I'm Prayashkanta Jena, an Information Technology student and developer with hands-on experience across full-stack web development, mobile applications, and backend engineering. I build with JavaScript, TypeScript, React, React Native, Node.js, and SQL — focused on developing cleanly engineered, scalable solutions and AI-assisted application workflows.",
  },

  skills: {
    programmingLanguages: [
      "Python",
      "C",
      "C++ (DSA & OOPs)",
      "SQL",
      "JavaScript",
      "TypeScript",
    ],
    webDevelopment: [
      "HTML5",
      "CSS3",
      "React.js",
      "Next.js",
      "React Native",
      "Bootstrap",
      "Tailwind",
    ],
    backend: ["Node.js", "Express.js", "REST APIs"],
    databases: ["MongoDB", "MySQL", "PostgreSQL"],
    toolsAndTechnologies: [
      "VS Code",
      "Cursor",
      "Antigravity",
      "Git",
      "Vercel",
      "Supabase",
      "Postman",
      "Windows/Linux OS/Mac OS",
    ],
    aiAndAgentic: [
      "AI agents",
      "Prompt engineering",
      "Multi-agent workflows",
      "Agile SDLC",
    ],
  },

  // The 7 real projects from resume
  projects: [
    {
      slug: "baazly-ecommerce-store",
      number: "01",
      title: "Baazly E-Commerce Store",
      category: "E-Commerce Platform",
      description:
        "E-commerce platform with full CRUD functionality for managing products and store data.",
      technologies: ["HTML", "CSS", "JavaScript"],
      liveUrl: "https://baazly.vercel.app/",
      githubUrl: null,
      accentColor: "#d4521a",
      image: "/project-image/baazly.png",
      visualTheme: {
        baseColor: "#171210",
        gradient: "linear-gradient(135deg, #1c1512 0%, #2e1d17 50%, #120e0d 100%)",
        ambientGlow: "rgba(212, 82, 26, 0.16)",
      },
    },
    {
      slug: "glimpse-image-store",
      number: "02",
      title: "Glimpse Image Store",
      category: "Web Application",
      description:
        "React-based web application using Redux for centralized state management and a responsive component-based interface.",
      technologies: ["React.js", "Redux", "JavaScript"],
      liveUrl: "https://glimpse-pj.vercel.app/",
      githubUrl: null,
      accentColor: "#61dafb",
      image: "/project-image/glimpse.png",
      visualTheme: {
        baseColor: "#10161c",
        gradient: "linear-gradient(135deg, #121d28 0%, #172d3f 50%, #0d141b 100%)",
        ambientGlow: "rgba(97, 218, 251, 0.16)",
      },
    },
    {
      slug: "cloudpeek-weather",
      number: "03",
      title: "Cloudpeek Weather Application",
      category: "Weather Application",
      description:
        "Weather application integrating OpenWeather API and Weather.com API to fetch and display weather information.",
      technologies: ["HTML", "CSS", "JavaScript"],
      liveUrl: "https://cloudpeek-pj.vercel.app/",
      githubUrl: null,
      accentColor: "#38bdf8",
      image: "/project-image/cloudpeek.png",
      visualTheme: {
        baseColor: "#0f171d",
        gradient: "linear-gradient(135deg, #12202a 0%, #173345 50%, #0d151c 100%)",
        ambientGlow: "rgba(56, 189, 248, 0.16)",
      },
    },
    {
      slug: "hotstar-clone",
      number: "04",
      title: "Hotstar Clone",
      category: "OTT Platform Interface",
      description:
        "Responsive OTT platform interface with modern UI components.",
      technologies: ["HTML", "CSS"],
      liveUrl: "https://jiohotstarclone.vercel.app/",
      githubUrl: null,
      accentColor: "#1e88e5",
      image: "/project-image/jiohotstar.png",
      visualTheme: {
        baseColor: "#10141c",
        gradient: "linear-gradient(135deg, #141c2b 0%, #1a273e 50%, #0e121a 100%)",
        ambientGlow: "rgba(30, 136, 229, 0.16)",
      },
    },
    {
      slug: "kaira-fashion-store",
      number: "05",
      title: "Kaira Fashion Store",
      category: "Fashion E-Commerce",
      description:
        "Responsive fashion e-commerce interface focused on product presentation.",
      technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      liveUrl: "https://kaira-pj.vercel.app/",
      githubUrl: null,
      accentColor: "#e28743",
      image: "/project-image/kaira.png",
      visualTheme: {
        baseColor: "#161210",
        gradient: "linear-gradient(135deg, #201713 0%, #312119 50%, #110e0c 100%)",
        ambientGlow: "rgba(226, 135, 67, 0.16)",
      },
    },
    {
      slug: "coffee-culture",
      number: "06",
      title: "Coffee Culture",
      category: "Café Website",
      description: "Responsive café website with structured UI.",
      technologies: ["HTML", "CSS"],
      liveUrl: "https://coffee-culture-pj.vercel.app/",
      githubUrl: null,
      accentColor: "#b87333",
      image: "/project-image/coffee.png",
      visualTheme: {
        baseColor: "#161310",
        gradient: "linear-gradient(135deg, #201914 0%, #2f221a 50%, #110f0d 100%)",
        ambientGlow: "rgba(184, 115, 51, 0.16)",
      },
    },
  ] as ProjectItem[],

  experience: [
    {
      company: "YOSA Technology Solutions Pvt. Ltd.",
      location: "Surat",
      period: "2025 – 2026",
      role: "AI-Driven Software Development & Agentic Application Engineering Intern",
      points: [
        "Contributed to development of AI-driven software solutions and application engineering tasks.",
        "Worked with AI agents and AI-assisted development workflows using tools such as Cursor and Claude.",
        "Assisted with designing and implementing software architecture, APIs, databases, and application workflows.",
        "Applied Agile software development practices throughout development.",
        "Contributed to a solution currently deployed for a client.",
      ],
    },
  ] as ExperienceItem[],

  education: [
    {
      institution: "Vidhyadeep University",
      degree: "Bachelor of Science in Information Technology",
      boardOrUniversity: "Vidhyadeep University",
      period: "2025 – 2028 (Expected)",
      currentStatus: "Second Year (SY)",
      coursework: "Programming, Database Management Systems, etc.",
    },
    {
      institution: "The Radiant International School",
      degree: "Senior Secondary (12th Grade)",
      boardOrUniversity: "CBSE",
      period: "2024 – 2025",
      stream: "Commerce",
    },
  ] as EducationItem[],

  courses: [
    {
      name: "Full Stack Development",
      institution: "Red and White Skill Education",
      period: "2025 – 2026",
      status: "On-going",
    },
  ] as CourseItem[],
} as const;
