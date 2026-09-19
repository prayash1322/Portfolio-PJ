"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Decal, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap, registerGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import styles from "./TechStack.module.css";


export type Technology = {
  id: string;
  name: string;
  category: string;
  icon: string;
  accent: string;
  color: string;
  basePosition: [number, number, number];
  size: number;
};

// Technologies from developer's portfolio & background
const TECHNOLOGIES: Technology[] = [
  {
    id: "react",
    name: "React",
    category: "Frontend Architecture",
    icon: "react",
    accent: "#61dafb",
    color: "#0e2938",
    basePosition: [-0.62, 0.28, 0.38],
    size: 1.08,
  },
  {
    id: "nextdotjs",
    name: "Next.js",
    category: "Full-Stack Framework",
    icon: "nextdotjs",
    accent: "#f0ece4",
    color: "#1c1b1a",
    basePosition: [0.46, 0.78, 0.20],
    size: 1.02,
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Type-Safe Language",
    icon: "typescript",
    accent: "#3178c6",
    color: "#122a45",
    basePosition: [1.52, 0.24, 0.26],
    size: 0.98,
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Core Web Language",
    icon: "javascript",
    accent: "#f7df1e",
    color: "#383112",
    basePosition: [1.1, 1.79, -0.27],
    size: 0.84,
  },
  {
    id: "python",
    name: "Python",
    category: "Scripting & AI",
    icon: "python",
    accent: "#3776ab",
    color: "#12243a",
    basePosition: [-0.50, 1.58, -0.18],
    size: 0.90,
  },
  {
    id: "html5",
    name: "HTML5",
    category: "Web Markup",
    icon: "html5",
    accent: "#e34f26",
    color: "#3a1810",
    basePosition: [0.90, -0.40, -0.10],
    size: 0.88,
  },
  {
    id: "css3",
    name: "CSS3",
    category: "Styling & Layouts",
    icon: "css3",
    accent: "#264de4",
    color: "#10183d",
    basePosition: [2.14, 1.46, 0.06],
    size: 0.84,
  },
  {
    id: "nodedotjs",
    name: "Node.js",
    category: "Backend Runtime",
    icon: "nodedotjs",
    accent: "#5fa04e",
    color: "#142d17",
    basePosition: [-1.24, -0.60, 0.22],
    size: 1.02,
  },
  {
    id: "express",
    name: "Express.js",
    category: "Web Framework",
    icon: "express",
    accent: "#f0ece4",
    color: "#1c1c1c",
    basePosition: [-2.04, -0.10, -0.14],
    size: 0.88,
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Relational Database",
    icon: "postgresql",
    accent: "#4169e1",
    color: "#13283c",
    basePosition: [-0.10, -0.82, 0.42],
    size: 1.10,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Document Database",
    icon: "mongodb",
    accent: "#47a248",
    color: "#122a15",
    basePosition: [0.86, -1.36, 0.06],
    size: 0.94,
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "Relational Database",
    icon: "mysql",
    accent: "#4479a1",
    color: "#12263c",
    basePosition: [-0.86, -1.56, -0.20],
    size: 0.90,
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    category: "Utility-First CSS",
    icon: "tailwindcss",
    accent: "#38bdf8",
    color: "#10323a",
    basePosition: [-1.56, 0.92, 0.04],
    size: 0.90,
  },
  {
    id: "github",
    name: "GitHub",
    category: "Version Control & CI/CD",
    icon: "github",
    accent: "#e6edf3",
    color: "#202022",
    basePosition: [-1.58, -1.16, -0.20],
    size: 0.82,
  },
];

// Single Sphere with separate stable hit-test geometry and animated visual subtree
function TechSphereItem({
  tech,
  texture,
  basePos,
  onHover,
  onLeave,
  onSelect,
  visualRef,
  isInteractive = true,
}: {
  tech: Technology;
  texture: THREE.Texture;
  basePos: THREE.Vector3;
  onHover: (id: string) => void;
  onLeave: (id: string) => void;
  onSelect: (id: string) => void;
  visualRef: (el: THREE.Group | null) => void;
  isInteractive?: boolean;
}) {
  const radius = tech.size / 2;
  const decalScale = useMemo(() => {
    const s = tech.size * 0.68;
    return new THREE.Vector3(s, s, s);
  }, [tech.size]);

  return (
    <group position={basePos}>
      {/* Stable Stationary Hit Proxy:
          Only active on desktop/tablet viewports.
          Disabled on phones where the cluster is purely for visual display. */}
      {isInteractive && (
        <mesh
          visible={false}
          onPointerEnter={(e) => {
            if (e.pointerType === "touch") return;
            e.stopPropagation();
            onHover(tech.id);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "touch") return;
            e.stopPropagation();
            onLeave(tech.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tech.id);
          }}
        >
          <sphereGeometry args={[radius * 1.15, 16, 16]} />
        </mesh>
      )}

      {/* Animated Visual Subtree:
          Interpolated smoothly in useFrame (position, scale, rotation).
          Raycast is disabled so inner elements never conflict with the hit proxy. */}
      <group ref={visualRef}>
        <mesh castShadow receiveShadow raycast={() => null}>
          <sphereGeometry args={[radius, 36, 36]} />
          <meshPhysicalMaterial
            color={tech.color}
            roughness={0.14}
            metalness={0.16}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
            reflectivity={0.88}
          />
          {/* Crisp Technology Logo Decal seamlessly conforming to sphere curvature */}
          <Decal
            position={[0, 0, radius]}
            rotation={[0, 0, 0]}
            scale={decalScale}
          >
            <meshBasicMaterial
              map={texture}
              transparent
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-1}
              depthTest={true}
            />
          </Decal>
        </mesh>
      </group>
    </group>
  );
}

// Organic Connected Cluster with One Single Source of Truth for Motion & THREE.Timer
function ConnectedCluster({
  assemblyProgressRef,
  reducedMotion,
}: {
  assemblyProgressRef: React.RefObject<number>;
  reducedMotion: boolean;
}) {
  const { viewport } = useThree();
  const clusterGroupRef = useRef<THREE.Group>(null);
  const sphereVisualRefs = useRef<(THREE.Group | null)[]>([]);

  // Interaction tracking via refs - avoids React setState re-renders on animation frames
  const hoveredIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Modern Three.js Timing API
  const timerRef = useRef<THREE.Timer | null>(null);
  if (!timerRef.current && typeof THREE.Timer === "function") {
    timerRef.current = new THREE.Timer();
  }

  useEffect(() => {
    const timer = timerRef.current;
    if (timer) {
      timer.connect(document);
      return () => {
        timer.disconnect();
      };
    }
  }, []);

  // Pre-load all 15 local textures
  const texturePaths = useMemo(() => TECHNOLOGIES.map((t) => `/stack/${t.icon}.png`), []);
  const textures = useTexture(texturePaths);

  // Configure texture settings for maximum sharpness & mipmapping
  useEffect(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
    });
  }, [textures]);

  // Viewport-aware responsive classification
  const isMobile = viewport.width < 6.2;
  const isTablet = !isMobile && viewport.width < 9.2;

  // On portrait / mobile: compact horizontal spacing so balls form a cohesive constellation that fits narrow screens
  const spacingX = isMobile ? 0.78 : isTablet ? 0.90 : 1.0;
  const spacingY = isMobile ? 1.04 : 1.0;

  const baseVectors = useMemo(
    () =>
      TECHNOLOGIES.map(
        (t) =>
          new THREE.Vector3(
            t.basePosition[0] * spacingX,
            t.basePosition[1] * spacingY,
            t.basePosition[2]
          )
      ),
    [spacingX, spacingY]
  );

  // Exact geometric bounds of the cluster including sphere radii
  const bounds = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    TECHNOLOGIES.forEach((t, i) => {
      const radius = t.size / 2;
      const v = baseVectors[i];
      if (v.x - radius < minX) minX = v.x - radius;
      if (v.x + radius > maxX) maxX = v.x + radius;
      if (v.y - radius < minY) minY = v.y - radius;
      if (v.y + radius > maxY) maxY = v.y + radius;
    });

    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { minX, maxX, minY, maxY, spanX, spanY, centerX, centerY };
  }, [baseVectors]);

  // Dynamic responsive scale & centering — guarantees ZERO clipping on ANY screen size
  const { clusterScale, clusterBaseX, clusterBaseY } = useMemo(() => {
    if (isMobile) {
      // Mobile: Full width canvas, centered below heading.
      // Leave 14% safety margin on X and 14% on Y so balls NEVER clip
      const safeWidth = viewport.width * 0.86;
      const safeHeight = viewport.height * 0.86;
      const fitScale = Math.min(safeWidth / bounds.spanX, safeHeight / bounds.spanY);
      const finalScale = Math.min(0.85, Math.max(0.50, fitScale));

      return {
        clusterScale: finalScale,
        clusterBaseX: -bounds.centerX * finalScale,
        clusterBaseY: -bounds.centerY * finalScale,
      };
    }

    if (isTablet) {
      // Tablet: Balanced framing, moderate offset
      const safeWidth = viewport.width * 0.50;
      const safeHeight = viewport.height * 0.86;
      const fitScale = Math.min(safeWidth / bounds.spanX, safeHeight / bounds.spanY, 0.90);
      const finalScale = Math.max(0.66, fitScale);
      const baseX = Math.min(1.8, viewport.width * 0.22);

      return {
        clusterScale: finalScale,
        clusterBaseX: baseX,
        clusterBaseY: 0,
      };
    }

    // Desktop: Shifted towards the right side to leave generous clearance for "TECH STACK (K)"
    const safeWidth = viewport.width * 0.48;
    const safeHeight = viewport.height * 0.88;
    const fitScale = Math.min(safeWidth / bounds.spanX, safeHeight / bounds.spanY, 0.94);
    const finalScale = Math.max(0.74, fitScale);
    const baseX = Math.min(2.55, viewport.width * 0.26);

    return {
      clusterScale: finalScale,
      clusterBaseX: baseX,
      clusterBaseY: 0,
    };
  }, [isMobile, isTablet, viewport.width, viewport.height, bounds]);

  // Smooth pointer damping ref to prevent abrupt mouse chasing
  const smoothedPointer = useRef(new THREE.Vector2(0, 0));

  // Per-sphere continuous smoothed hover and neighbor weights (0 to 1)
  const hoverWeights = useRef(new Float32Array(TECHNOLOGIES.length));
  const neighborWeights = useRef(new Float32Array(TECHNOLOGIES.length));

  // Cached vector allocations for physics loop (zero GC allocations per frame)
  const tempTargetPos = useMemo(() => new THREE.Vector3(), []);
  const tempDiff = useMemo(() => new THREE.Vector2(), []);

  const handleHover = (id: string) => {
    if (isMobile) return;
    hoveredIdRef.current = id;
  };

  const handleLeave = (id: string) => {
    if (isMobile) return;
    if (hoveredIdRef.current === id) {
      hoveredIdRef.current = null;
    }
  };

  const handleSelect = (id: string) => {
    selectedIdRef.current = selectedIdRef.current === id ? null : id;
  };

  useFrame((state, delta) => {
    if (!clusterGroupRef.current) return;

    // Advance THREE.Timer
    if (timerRef.current) {
      timerRef.current.update();
    }
    const time = timerRef.current ? timerRef.current.getElapsed() : (state.clock as unknown as { elapsedTime: number }).elapsedTime || 0;
    const dt = Math.min(delta, 0.05);

    // Smooth pointer damping - normalized [-1, 1]
    const pointerTarget = state.pointer;
    const pointerDamp = 1 - Math.exp(-12 * dt);
    smoothedPointer.current.x = THREE.MathUtils.lerp(
      smoothedPointer.current.x,
      pointerTarget.x,
      pointerDamp
    );
    smoothedPointer.current.y = THREE.MathUtils.lerp(
      smoothedPointer.current.y,
      pointerTarget.y,
      pointerDamp
    );
    const smPointer = smoothedPointer.current;

    // --- 1. GLOBAL CLUSTER PARALLAX (Subtle, Restrained Tilt & Shift) ---
    if (!reducedMotion) {
      const clusterLerp = 1 - Math.exp(-8 * dt);
      clusterGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        clusterGroupRef.current.rotation.x,
        -smPointer.y * (isMobile ? 0.025 : 0.08),
        clusterLerp
      );
      clusterGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        clusterGroupRef.current.rotation.y,
        smPointer.x * (isMobile ? 0.035 : 0.10),
        clusterLerp
      );
      clusterGroupRef.current.position.x = THREE.MathUtils.lerp(
        clusterGroupRef.current.position.x,
        clusterBaseX + (isMobile ? 0 : smPointer.x * 0.12),
        clusterLerp
      );
      clusterGroupRef.current.position.y = THREE.MathUtils.lerp(
        clusterGroupRef.current.position.y,
        clusterBaseY + (isMobile ? 0 : smPointer.y * 0.10),
        clusterLerp
      );
    } else {
      clusterGroupRef.current.position.x = clusterBaseX;
      clusterGroupRef.current.position.y = clusterBaseY;
    }

    // Determine active sphere ID (hover has priority, click selection acts as lock)
    const activeId = hoveredIdRef.current || selectedIdRef.current;
    const activeIndex = activeId ? TECHNOLOGIES.findIndex((t) => t.id === activeId) : -1;

    // Assembly progress from ScrollTrigger intro (stored in ref)
    const assemblyProg = assemblyProgressRef.current ?? 1;
    const dispersion = (1 - assemblyProg) * 0.85;

    // Exponential spring interpolation factors
    const weightLerp = 1 - Math.exp(-12 * dt);
    const motionLerp = reducedMotion ? 1 : 1 - Math.exp(-14 * dt);

    const weights = hoverWeights.current;
    const nWeights = neighborWeights.current;

    // --- 2. PER-SPHERE ONE SOURCE OF TRUTH MOTION ---
    TECHNOLOGIES.forEach((_, i) => {
      const visualGroup = sphereVisualRefs.current[i];
      if (!visualGroup) return;

      const tech = TECHNOLOGIES[i];
      const base = baseVectors[i];

      // Smoothly update hover weights
      const targetHover = i === activeIndex ? 1.0 : 0.0;
      weights[i] = THREE.MathUtils.lerp(weights[i], targetHover, weightLerp);
      const hw = weights[i];

      // Smoothly update neighbor weights (quadratic distance falloff)
      let targetNeighbor = 0.0;
      if (activeIndex >= 0 && i !== activeIndex) {
        const activeBase = baseVectors[activeIndex];
        const dist = base.distanceTo(activeBase);
        if (dist < 2.8) {
          targetNeighbor = Math.pow(1 - dist / 2.8, 2);
        }
      }
      nWeights[i] = THREE.MathUtils.lerp(nWeights[i], targetNeighbor, weightLerp);
      const nw = nWeights[i];

      // 1. Dispersion offset during intro assembly
      const dispX = base.x * dispersion;
      const dispY = base.y * dispersion;

      // 2. Harmonic breathing at resting state
      const idleX = reducedMotion ? 0 : Math.sin(time * 0.65 + i * 1.35) * 0.024;
      const idleY = reducedMotion ? 0 : Math.cos(time * 0.75 + i * 1.65) * 0.024;
      const idleZ = reducedMotion ? 0 : Math.sin(time * 0.55 + i * 2.05) * 0.016;

      // 3. Depth-weighted subtle pointer parallax
      const depthFactor = 1.0 + base.z * 0.35;
      const parallaxX = reducedMotion ? 0 : smPointer.x * 0.06 * depthFactor;
      const parallaxY = reducedMotion ? 0 : smPointer.y * 0.06 * depthFactor;

      // 4. Hover focus and neighbor reaction offsets
      let hoverX = 0;
      let hoverY = 0;
      let hoverZ = 0;
      let targetScale = 1.0;
      let targetRotX = 0;
      let targetRotY = 0;

      if (hw > 0.001) {
        // Selected / hovered sphere: moves forward subtly, scales slightly, tilts to cursor
        hoverZ += hw * 0.55;
        hoverX += hw * (smPointer.x * 0.05);
        hoverY += hw * (smPointer.y * 0.05);
        targetScale += hw * 0.16;
        targetRotX += hw * (-smPointer.y * 0.10);
        targetRotY += hw * (smPointer.x * 0.12);
      }

      if (nw > 0.001 && activeIndex >= 0) {
        // Neighbor spheres: smoothly separate away from active sphere
        const activeBase = baseVectors[activeIndex];
        tempDiff.set(base.x - activeBase.x, base.y - activeBase.y);
        if (tempDiff.lengthSq() > 0.0001) {
          tempDiff.normalize();
        } else {
          tempDiff.set(1, 0);
        }
        const force = nw * 0.52;
        hoverX += tempDiff.x * force;
        hoverY += tempDiff.y * force;
        hoverZ -= force * 0.15; // smooth iris opening in depth
        targetScale -= force * 0.04;
        targetRotX -= tempDiff.y * force * 0.16;
        targetRotY += tempDiff.x * force * 0.16;
      }

      // Final unified target position relative to basePosition:
      tempTargetPos.set(
        dispX + idleX + parallaxX + hoverX,
        dispY + idleY + parallaxY + hoverY,
        idleZ + hoverZ
      );

      // Boundary safety: prevent spheres from ever cutting off at the right viewport edge on hover/parallax
      const clusterPosX = clusterGroupRef.current?.position.x ?? clusterBaseX;
      const absX = clusterPosX + (base.x + tempTargetPos.x) * clusterScale;
      const currentRadius = (tech.size / 2) * targetScale * clusterScale;
      const rightEdge = absX + currentRadius;

      // Viewport half-width at the sphere's Z distance from the camera (camera at z = 7.2)
      const absZ = (base.z + tempTargetPos.z) * clusterScale;
      const distToCam = Math.max(0.1, 7.2 - absZ);
      const halfWidthAtZ = (distToCam / 7.2) * (viewport.width / 2);
      const maxAllowedEdge = halfWidthAtZ - 0.08;

      if (rightEdge > maxAllowedEdge) {
        const overshoot = rightEdge - maxAllowedEdge;
        tempTargetPos.x -= overshoot / clusterScale;
      }

      // Single smooth damped interpolation toward the target
      visualGroup.position.lerp(tempTargetPos, motionLerp);
      visualGroup.scale.setScalar(
        THREE.MathUtils.lerp(visualGroup.scale.x, targetScale, motionLerp)
      );
      visualGroup.rotation.x = THREE.MathUtils.lerp(
        visualGroup.rotation.x,
        targetRotX,
        motionLerp
      );
      visualGroup.rotation.y = THREE.MathUtils.lerp(
        visualGroup.rotation.y,
        targetRotY,
        motionLerp
      );
    });
  });

  return (
    <group ref={clusterGroupRef} scale={clusterScale}>
      {TECHNOLOGIES.map((tech, index) => (
        <TechSphereItem
          key={tech.id}
          tech={tech}
          texture={textures[index]}
          basePos={baseVectors[index]}
          onHover={handleHover}
          onLeave={handleLeave}
          onSelect={handleSelect}
          isInteractive={true}
          visualRef={(el) => {
            sphereVisualRefs.current[index] = el;
          }}
        />
      ))}
    </group>
  );
}

export default function TechStack() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const assemblyProgressRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  // GSAP ScrollTrigger intro assembly and scene entrance
  useEffect(() => {
    if (reducedMotion) {
      assemblyProgressRef.current = 1;
      return;
    }

    registerGSAP();

    const ctx = gsap.context(() => {
      // 1. Headline reveal
      gsap.fromTo(
        "[data-stack-title]",
        { opacity: 0, y: 55 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 76%",
            toggleActions: "play none none none",
          },
        }
      );

      // 2. 3D Scene container fade & scale
      gsap.fromTo(
        "[data-stack-scene]",
        { opacity: 0, scale: 0.88 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            toggleActions: "play none none none",
          },
        }
      );

      // 3. Cluster assembly progress: spheres coalesce smoothly from dispersed state into resting cluster
      // Directly updates assemblyProgressRef without calling React setState on every frame
      gsap.to(assemblyProgressRef, {
        current: 1,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          toggleActions: "play none none none",
        },
      });

      // 4. Parallax during scroll through section
      gsap.to("[data-stack-scene]", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const [isInView, setIsInView] = useState(true);

  // Pause Three.js frameloop when offscreen to preserve 100% GPU/CPU for other sections
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "250px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="stack"
      ref={sectionRef}
      className={styles.section}
      aria-label="Technology Stack"
    >
      <div className={styles.container}>
        {/* Large Editorial Headline */}
        <h2 data-stack-title className={styles.heading}>
          TECH
          <br />
          <em>STACK</em>
        </h2>

        {/* Interactive 3D Canvas Scene */}
        <div data-stack-scene className={styles.sceneWrap}>
          <Canvas
            className={styles.scene}
            frameloop={isInView ? "always" : "never"}
            style={{ touchAction: "pan-y" }}
            shadows={{ enabled: true, type: THREE.PCFShadowMap }}
            dpr={[1, 2]}
            camera={{ position: [0, 0, 7.2], fov: 38 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            {/* Cinematic Three-Point Studio Lighting */}
            <ambientLight intensity={1.8} />
            <spotLight
              position={[-4.5, 6, 6.5]}
              intensity={85}
              angle={0.42}
              penumbra={1}
              color="#f0ece4"
              castShadow
            />
            {/* Subtle warm rim accent light matching portfolio palette */}
            <pointLight position={[4.5, -2.5, 3.5]} intensity={28} color="#e28743" />
            <pointLight position={[-3, -4, 2]} intensity={18} color="#4169e1" />

            <Suspense fallback={null}>
              <ConnectedCluster
                assemblyProgressRef={assemblyProgressRef}
                reducedMotion={reducedMotion}
              />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  );
}
