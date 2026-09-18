import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FRAME_COUNT } from "@/lib/constants";

/**
 * Format frame index to 3-digit padded string (e.g. 1 -> "001")
 */
export function getFramePath(index: number): string {
  const padded = String(index).padStart(3, "0");
  return `/hero-sequence/frame-${padded}.png`;
}

/**
 * Preload and cache frames in memory
 */
export class FrameSequenceManager {
  private images: Map<number, HTMLImageElement> = new Map();
  private loadedCount: number = 0;
  private totalFrames: number = FRAME_COUNT;
  private onProgressCallback?: (loaded: number, total: number) => void;

  constructor(totalFrames: number = FRAME_COUNT) {
    this.totalFrames = totalFrames;
  }

  public getLoadedCount(): number {
    return this.loadedCount;
  }

  public getImage(frameNumber: number): HTMLImageElement | undefined {
    if (this.images.has(frameNumber)) {
      return this.images.get(frameNumber);
    }
    // Fallback to nearest loaded frame to prevent any visual blanking/flicker
    for (let offset = 1; offset < this.totalFrames; offset++) {
      const prev = frameNumber - offset;
      if (prev >= 1 && this.images.has(prev)) {
        return this.images.get(prev);
      }
      const next = frameNumber + offset;
      if (next <= this.totalFrames && this.images.has(next)) {
        return this.images.get(next);
      }
    }
    return undefined;
  }

  /**
   * Preload sequence with high-priority first frames and background batching
   */
  public preload(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    this.onProgressCallback = onProgress;

    return new Promise((resolve) => {
      // Immediately load the first 12 frames for instant visual feedback
      const priorityFrames = Array.from({ length: Math.min(12, this.totalFrames) }, (_, i) => i + 1);
      
      let priorityLoaded = 0;
      priorityFrames.forEach((frameNum) => {
        this.loadSingleFrame(frameNum, () => {
          priorityLoaded++;
          if (priorityLoaded === priorityFrames.length) {
            resolve();
            // Continue loading remaining frames in background
            this.loadRemainingFrames();
          }
        });
      });
    });
  }

  private loadSingleFrame(frameNum: number, onLoad?: () => void): void {
    if (this.images.has(frameNum)) {
      onLoad?.();
      return;
    }

    const img = new Image();
    img.src = getFramePath(frameNum);
    img.onload = () => {
      this.images.set(frameNum, img);
      this.loadedCount++;
      this.onProgressCallback?.(this.loadedCount, this.totalFrames);
      onLoad?.();
    };
    img.onerror = () => {
      onLoad?.();
    };
  }

  private loadRemainingFrames(): void {
    for (let i = 13; i <= this.totalFrames; i++) {
      this.loadSingleFrame(i);
    }
  }
}

/**
 * Draw frame to canvas preserving aspect ratio
 */
export function renderCanvasFrame(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  fit: "contain" | "cover" = "cover"
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);

  if (width === 0 || height === 0) return;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const imgRatio = image.width / image.height;
  const canvasRatio = width / height;

  let drawW = width;
  let drawH = height;
  let drawX = 0;
  let drawY = 0;

  if (fit === "contain") {
    if (canvasRatio > imgRatio) {
      drawH = height;
      drawW = height * imgRatio;
      drawX = (width - drawW) / 2;
      drawY = 0;
    } else {
      drawW = width;
      drawH = width / imgRatio;
      drawX = 0;
      drawY = (height - drawH) / 2;
    }
  } else {
    // Cover: preserve natural aspect ratio, center visually, cover viewport
    if (canvasRatio > imgRatio) {
      drawW = width;
      drawH = width / imgRatio;
      drawX = 0;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgRatio;
      drawX = (width - drawW) / 2;
      drawY = 0;
    }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
}
