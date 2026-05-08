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

// ─── Thunder — 4-layer sharp crack + deep rolling rumble ─────────────────────
//
//  Layer 1 — Ultra-sharp electric ZAP transient   (0–60 ms,  highpass 3.5kHz)
//  Layer 2 — Woody mid-frequency CRACK            (0–550 ms, bandpass 900Hz Q12)
//  Layer 3 — Deep rolling RUMBLE                  (0–4.5 s,  lowpass sweep 320→22Hz)
//  Layer 4 — Distant echo rumble                  (delayed,  lowpass 160→18Hz)
//
function synthesiseThunder(ac: AudioContext): void {
  const now = ac.currentTime;
  const duration = 4.5;
  const frameCount = Math.ceil(ac.sampleRate * duration);

  // Shared white-noise buffer — each layer gets its own BufferSource
  const buf = ac.createBuffer(1, frameCount, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frameCount; i++) data[i] = Math.random() * 2 - 1;

  const makeSource = () => {
    const s = ac.createBufferSource();
    s.buffer = buf;
    return s;
  };

  const master = ac.createGain();
  master.gain.value = 1.0;
  master.connect(ac.destination);

  // ── Layer 1: electric ZAP (4 ms attack, gone by 60 ms) ───────────────────
  {
    const src = makeSource();
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3500;
    hp.Q.value = 0.5;

    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200;
    bp.Q.value = 6;

    const g = ac.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(2.8, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master);
    src.start(now); src.stop(now + 0.12);
  }

  // ── Layer 2: sharp woody CRACK (8 ms attack, dies ~550 ms) ───────────────
  {
    const src = makeSource();
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    hp.Q.value = 0.7;

    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900;
    bp.Q.value = 12; // narrow Q = crisp crack character

    const g = ac.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(1.8, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.3,  now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master);
    src.start(now); src.stop(now + 0.6);
  }

  // ── Layer 3: deep rolling RUMBLE (full duration) ──────────────────────────
  {
    const src = makeSource();
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(320, now);
    lp.frequency.exponentialRampToValueAtTime(22, now + duration);
    lp.Q.value = 1.2;

    const lp2 = ac.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 180;

    const g = ac.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.9, now + 0.02);
    g.gain.setValueAtTime(0.9, now + 0.1);
    g.gain.exponentialRampToValueAtTime(0.4,  now + 0.8);
    g.gain.exponentialRampToValueAtTime(0.12, now + 2.2);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(lp); lp.connect(lp2); lp2.connect(g); g.connect(master);
    src.start(now); src.stop(now + duration);
  }

  // ── Layer 4: distant echo rumble (random delay 280–830 ms) ───────────────
  {
    const echoDelay = 0.28 + Math.random() * 0.55;
    const src = makeSource();
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(160, now + echoDelay);
    lp.frequency.exponentialRampToValueAtTime(18, now + duration);

    const g = ac.createGain();
    g.gain.setValueAtTime(0, now + echoDelay);
    g.gain.linearRampToValueAtTime(0.45, now + echoDelay + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(lp); lp.connect(g); g.connect(master);
    src.start(now + echoDelay); src.stop(now + duration);
  }
}

// ─── Ensure AudioContext is live, then fire ───────────────────────────────────
function fireThunder(acRef: React.MutableRefObject<AudioContext | null>): void {
  if (!acRef.current || acRef.current.state === "closed") {
    acRef.current = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  }
  const ac = acRef.current;
  if (ac.state === "suspended") {
    ac.resume().then(() => synthesiseThunder(ac));
  } else {
    synthesiseThunder(ac);
  }
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
  const audioCtxRef   = useRef<AudioContext | null>(null);

  const spawnRipple = useCallback((x: number, surfaceY: number) => {
    ripplesRef.current.push({
      x, y: surfaceY,
      r: 1,
      maxR: 18 + Math.random() * 16,
      opacity: 0.75,
      rings: 1 + Math.floor(Math.random() * 2),
    });
  }, []);

  // Every strike fires fireThunder — no skipping, no random chance
  const triggerStrike = useCallback((W: number, H: number) => {
    boltsRef.current.push(createBolt(W, H));
    flashAlphaRef.current = 1;
    fireThunder(audioCtxRef);
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
      const count = Math.floor(rain.width / 6);
      dropsRef.current = Array.from({ length: count }, () => ({
        x:       Math.random() * rain.width,
        y:       Math.random() * rain.height - rain.height,
        length:  Math.random() * 20 + 10,
        speed:   Math.random() * 4 + 2,
        opacity: Math.random() * 0.45 + 0.08,
        width:   Math.random() < 0.7 ? 1 : 1.5,
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

      // Drops
      dropsRef.current.forEach(d => {
        rctx.beginPath();
        rctx.moveTo(d.x, d.y);
        rctx.lineTo(d.x - d.length * 0.1, d.y + d.length);
        rctx.strokeStyle = `rgba(0,245,255,${d.opacity})`;
        rctx.lineWidth = d.width;
        rctx.shadowColor = "rgba(0,245,255,0.2)";
        rctx.shadowBlur = 2;
        rctx.stroke();
        rctx.shadowBlur = 0;
        d.y += d.speed;
        if (d.y + d.length >= SURFACE_Y) {
          spawnRipple(d.x, SURFACE_Y);
          d.y = -d.length - Math.random() * 60;
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
      const delay = 5000 + Math.random() * 9000;
      timeoutId = setTimeout(() => {
        triggerStrike(rain.width, rain.height);
        schedule();
      }, delay);
    };
    schedule();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      clearTimeout(timeoutId);
      audioCtxRef.current?.close();
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