import React, { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  opacity: number;
  rings: number;
}

interface LightningSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface LightningBolt {
  segments: LightningSegment[];
  branches: LightningSegment[][];
  alpha: number;
  phase: number;
  flashFrames: number;
}

// ─── Lightning geometry ────────────────────────────────────────────────────────

function buildSegments(
  x1: number, y1: number,
  x2: number, y2: number,
  spread: number,
  depth: number
): LightningSegment[] {
  if (depth === 0) return [{ x1, y1, x2, y2 }];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread * 0.25;
  return [
    ...buildSegments(x1, y1, mx, my, spread / 2, depth - 1),
    ...buildSegments(mx, my, x2, y2, spread / 2, depth - 1),
  ];
}

function createBolt(W: number, H: number): LightningBolt {
  const sx = W * (0.12 + Math.random() * 0.76);
  const ex = sx + (Math.random() - 0.5) * W * 0.35;
  const ey = H * (0.5 + Math.random() * 0.42);

  const segments = buildSegments(sx, 0, ex, ey, W * 0.2, 7);

  const branches: LightningSegment[][] = [];
  const branchCount = 2 + Math.floor(Math.random() * 3);
  for (let b = 0; b < branchCount; b++) {
    const idx = Math.floor(Math.random() * (segments.length * 0.65));
    const pivot = segments[idx];
    if (!pivot) continue;
    const bx2 = pivot.x2 + (Math.random() - 0.5) * W * 0.28;
    const by2 = pivot.y2 + Math.random() * H * 0.22;
    branches.push(buildSegments(pivot.x2, pivot.y2, bx2, by2, W * 0.08, 5));
  }

  return { segments, branches, alpha: 1, phase: 0, flashFrames: 10 + Math.floor(Math.random() * 8) };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const RainCanvas: React.FC = () => {
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const boltCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef       = useRef<number>(0);
  const dropsRef      = useRef<Drop[]>([]);
  const ripplesRef    = useRef<Ripple[]>([]);
  const boltsRef      = useRef<LightningBolt[]>([]);
  const flashAlphaRef = useRef<number>(0);

  const spawnRipple = useCallback((x: number, surfaceY: number) => {
    ripplesRef.current.push({
      x, y: surfaceY,
      r: 1,
      maxR: 10 + Math.random() * 8,
      opacity: 0.65,
      rings: 1 + Math.floor(Math.random() * 2),
    });
  }, []);

  // Lightning only — no thunder sound
  const triggerStrike = useCallback((W: number, H: number) => {
    boltsRef.current.push(createBolt(W, H));
    flashAlphaRef.current = 1;
  }, []);

  useEffect(() => {
    const rain = rainCanvasRef.current;
    const bolt = boltCanvasRef.current;
    if (!rain || !bolt) return;
    const rctx = rain.getContext("2d");
    const bctx = bolt.getContext("2d");
    if (!rctx || !bctx) return;

    const resize = () => {
      rain.width  = bolt.width  = window.innerWidth;
      rain.height = bolt.height = window.innerHeight;
      initDrops();
    };

    const initDrops = () => {
      const count = Math.floor(rain.width / 3);
      dropsRef.current = Array.from({ length: count }, () => ({
        x:       Math.random() * rain.width,
        y:       Math.random() * rain.height - rain.height,
        // Smaller: vertical radius 3–8px (was 6–18px)
        length:  Math.random() * 5 + 3,
        // Faster: 8–16px/frame (was 2–6px/frame)
        speed:   Math.random() * 8 + 8,
        opacity: Math.random() * 0.55 + 0.15,
        // Narrower to match smaller size
        width:   Math.random() * 0.8 + 0.5,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = rain.width;
      const H = rain.height;
      const SURFACE_Y = H - 28;

      // ── Rain canvas ────────────────────────────────────────────────────────
      rctx.clearRect(0, 0, W, H);

      const wg = rctx.createLinearGradient(0, SURFACE_Y, 0, H);
      wg.addColorStop(0, "rgba(0,120,200,0.28)");
      wg.addColorStop(1, "rgba(0,40,90,0.55)");
      rctx.fillStyle = wg;
      rctx.fillRect(0, SURFACE_Y, W, H - SURFACE_Y);

      rctx.beginPath();
      rctx.moveTo(0, SURFACE_Y); rctx.lineTo(W, SURFACE_Y);
      rctx.strokeStyle = "rgba(0,245,255,0.18)";
      rctx.lineWidth = 1;
      rctx.stroke();

      // Drops — oval/teardrop shape using ellipse
      dropsRef.current.forEach(d => {
        const rx = d.width;       // horizontal radius (narrow)
        const ry = d.length;      // vertical radius (elongated)

        rctx.save();
        rctx.shadowColor = "rgba(0,245,255,0.25)";
        rctx.shadowBlur = 3;

        // Filled oval body
        rctx.beginPath();
        // Slight tilt to simulate falling angle
        rctx.translate(d.x, d.y);
        rctx.rotate(-0.08); // subtle lean
        rctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

        // Gradient fill: brighter top, fade to transparent bottom — like a real raindrop
        const grad = rctx.createLinearGradient(0, -ry, 0, ry);
        grad.addColorStop(0,   `rgba(180,240,255,${d.opacity * 0.9})`);
        grad.addColorStop(0.4, `rgba(0,220,255,${d.opacity})`);
        grad.addColorStop(1,   `rgba(0,100,200,${d.opacity * 0.3})`);
        rctx.fillStyle = grad;
        rctx.fill();

        // Thin highlight glint on the left edge
        rctx.beginPath();
        rctx.ellipse(-rx * 0.25, -ry * 0.3, rx * 0.2, ry * 0.25, 0, 0, Math.PI * 2);
        rctx.fillStyle = `rgba(255,255,255,${d.opacity * 0.55})`;
        rctx.fill();

        rctx.restore();

        d.y += d.speed;
        // Trigger ripple when the bottom tip of the drop (center + ry) reaches the surface
        if (d.y + d.length >= SURFACE_Y) {
          spawnRipple(d.x, SURFACE_Y);
          d.y = -d.length - Math.random() * 80;
          d.x = Math.random() * W;
        }
      });

      // Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rp = ripplesRef.current[i];
        const prog = rp.r / rp.maxR;
        for (let k = 0; k < rp.rings; k++) {
          const rr = rp.r * (1 - k * 0.28);
          if (rr < 0) continue;
          const a = rp.opacity * (1 - prog) * (1 - k * 0.35);
          if (a <= 0) continue;
          rctx.beginPath();
          rctx.ellipse(rp.x, rp.y, rr, rr * 0.3, 0, 0, Math.PI * 2);
          rctx.strokeStyle = `rgba(0,245,255,${a})`;
          rctx.lineWidth = Math.max(0.4, 1.3 - k * 0.35);
          rctx.stroke();
        }
        const da = rp.opacity * 0.55 * (1 - prog);
        if (da > 0) {
          rctx.beginPath();
          rctx.arc(rp.x, rp.y, rp.r * 0.18, 0, Math.PI * 2);
          rctx.fillStyle = `rgba(0,245,255,${da})`;
          rctx.fill();
        }
        rp.r += 0.5 + rp.r * 0.045;
        rp.opacity -= 0.011;
        if (rp.opacity <= 0 || rp.r > rp.maxR) ripplesRef.current.splice(i, 1);
      }

      // ── Lightning / flash canvas ───────────────────────────────────────────
      bctx.clearRect(0, 0, W, H);

      const fa = flashAlphaRef.current;
      if (fa > 0) {
        const fg = bctx.createRadialGradient(W / 2, H * 0.1, 0, W / 2, H * 0.1, W);
        fg.addColorStop(0, `rgba(230,240,255,${fa * 0.6})`);
        fg.addColorStop(0.5, `rgba(150,190,255,${fa * 0.18})`);
        fg.addColorStop(1, `rgba(80,120,255,${fa * 0.04})`);
        bctx.fillStyle = fg;
        bctx.fillRect(0, 0, W, H);
        flashAlphaRef.current = Math.max(0, fa - 0.022);
      }

      // Bolts
      for (let i = boltsRef.current.length - 1; i >= 0; i--) {
        const b = boltsRef.current[i];
        const bright = b.phase === 0 && b.flashFrames % 2 === 0;
        const baseA  = bright ? b.alpha : b.alpha * 0.45;

        const drawSegs = (segs: LightningSegment[], coreW: number, alpha: number, glow: boolean) => {
          if (!segs.length) return;
          bctx.beginPath();
          bctx.moveTo(segs[0].x1, segs[0].y1);
          segs.forEach(s => bctx.lineTo(s.x2, s.y2));
          bctx.lineJoin = "round";

          if (glow) {
            bctx.strokeStyle = `rgba(140,190,255,${alpha * 0.18})`;
            bctx.lineWidth = coreW * 12;
            bctx.stroke();
            bctx.strokeStyle = `rgba(180,215,255,${alpha * 0.35})`;
            bctx.lineWidth = coreW * 5;
            bctx.stroke();
            bctx.strokeStyle = `rgba(220,240,255,${alpha * 0.6})`;
            bctx.lineWidth = coreW * 2.2;
            bctx.stroke();
          }
          bctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          bctx.lineWidth = coreW;
          bctx.stroke();
        };

        drawSegs(b.segments, bright ? 2.8 : 1.6, baseA, true);
        b.branches.forEach(br => drawSegs(br, bright ? 1.4 : 0.8, baseA * 0.65, false));

        if (b.phase === 0) {
          b.flashFrames--;
          if (b.flashFrames <= 0) b.phase = 1;
        } else {
          b.alpha -= 0.018;
        }
        if (b.alpha <= 0) boltsRef.current.splice(i, 1);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      // 18–35 second intervals between strikes
      const delay = 18000 + Math.random() * 17000;
      timeoutId = setTimeout(() => {
        // Only fire if the tab is visible — otherwise just reschedule silently.
        // This prevents bolts from stacking up while the tab is in the background.
        if (!document.hidden) {
          triggerStrike(rain.width, rain.height);
        }
        schedule();
      }, delay);
    };
    schedule();

    // When the user returns to the tab, flush any stale bolts that accumulated
    // (shouldn't happen now, but belt-and-suspenders) and clear the flash.
    const onVisibilityChange = () => {
      if (!document.hidden) {
        boltsRef.current = [];
        flashAlphaRef.current = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [spawnRipple, triggerStrike]);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
  };

  return (
    <>
      <canvas ref={rainCanvasRef} style={{ ...base, zIndex: 1, opacity: 0.88 }} />
      <canvas ref={boltCanvasRef} style={{ ...base, zIndex: 2 }} />
    </>
  );
};

export default RainCanvas;