# Prayashkanta Jena — Portfolio

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-white?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-green?style=for-the-badge&logo=greensock)](https://greensock.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

An award-grade, interactive developer portfolio built with **Next.js 16 (App Router + Turbopack)**, **Three.js / React Three Fiber**, **GSAP**, and curated **React Bits** component integrations. Engineered with a dark amber aesthetic, dynamic 3D physics, cinematic scroll scrubbing, and high-performance client-side optimizations.

---

## ✨ Features & Highlights

- **Cinematic Canvas Hero**: 240-frame scrubbable sequence synchronized with user scroll gestures.
- **Interactive 3D Tech Stack**: Physics-driven dynamic sphere cluster powered by **Three.js** and **React Three Fiber** with custom lighting and cursor-reactive hover boundaries.
- **Curated Micro-Interactions**: Custom integrations of **React Bits** components:
  - `BorderGlow`: Cursor-following edge luminescent cards
  - `ParticleText`: Interactive canvas-driven text disruption effect
  - `GlareHover` & `SpotlightCard`: Dynamic specular reflection effects
  - `TiltedCard`: 3D perspective tilt on cursor hover
  - `ScrollStack` & `ScrollExpand`: Cinematic depth transitions on scroll
  - `JellyRadio` & `ClickSpark`: Tactile fluid navigation and click sparks
- **Performance Optimized**:
  - Critical bundle code-splitting via `next/dynamic` (Three.js isolated from initial page load)
  - `IntersectionObserver` canvas render pausing for battery and GPU preservation
  - JetBrains Mono optimized font loading
  - Image delivery via modern AVIF / WebP compression formats
- **Custom Fluid Scrollbar & Smooth Transitions**: Amber glow accents, customized thin scrollbar, and polished page transitions.

---

## 🛠️ Tech Stack

### Core & Framework
- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: Vanilla Modular CSS + CSS Variables (Custom Design System)

### 3D & Animations
- **3D Graphics**: [Three.js](https://threejs.org/) & [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Animation Orchestration**: [GSAP](https://greensock.com/gsap/) & [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Motion Components**: `motion/react` & Custom GLSL Shaders
- **Smooth Scroll**: [@studio-freight/lenis](https://github.com/darkroomengineering/lenis)

### Tooling & Deployment
- **Deployment**: [Vercel](https://vercel.com)
- **Package Manager**: `npm`
- **Linter**: ESLint 9

---

## 📁 Project Structure

```text
portfolio-site/
├── app/
│   ├── layout.tsx              # Root layout, fonts, and global metadata
│   ├── page.tsx                # Homepage assembling interactive sections
│   ├── globals.css             # Design tokens, theme variables, custom scrollbar
│   └── projects/[slug]/        # Dynamic project case study pages
├── components/
│   ├── hero/                   # Hero section & canvas image sequence scrubber
│   ├── stack/                  # 3D Three.js interactive Tech Stack
│   ├── work/                   # Work showcase & project cards
│   ├── experience/             # Professional experience & education timeline
│   ├── contact/                # Contact section & interactive social hubs
│   ├── nav/                    # JellyRadio floating navbar & glass header
│   ├── loader/                 # Custom brand intro loading animation
│   └── reactbits/              # React Bits micro-interaction components
├── data/
│   └── portfolio.ts            # Single source of truth for portfolio content
├── public/
│   ├── hero-sequence/          # Rendered frame sequence for scroll scrubber
│   ├── project-image/          # High-resolution project previews
│   └── stack/                  # Custom 3D tech icons
└── next.config.ts              # Next.js performance & compression configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.18+ or 20+ recommended)
- [npm](https://www.npmjs.com/) or `pnpm` / `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/prayash1322/Portfolio-PJ.git
   cd Portfolio-PJ
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

To build and test the production application locally:

```bash
# Compile and build static pages with Turbopack
npm run build

# Preview production build locally
npm run start
```

---

## 🌐 Deploy to Vercel

The portfolio is fully configured for zero-config deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New"** → **"Project"**.
3. Import the **`Portfolio-PJ`** repository.
4. Leave all default settings (`Next.js` framework, `./` root directory).
5. Click **"Deploy"**.

---

## 📬 Contact & Connect

**Prayashkanta Jena** — Full Stack Developer & AI/Agentic Engineer
- **GitHub**: [@prayash1322](https://github.com/prayash1322)
- **LinkedIn**: [Prayash Jena](https://linkedin.com/in/prayash-jena)
- **Email**: [prayash1305@gmail.com](mailto:prayash1305@gmail.com)
- **Location**: Surat, India

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
