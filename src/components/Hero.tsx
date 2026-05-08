import { useEffect, useState, useRef, useCallback } from "react";

const personalInfo = {
  name: "Md. Ashik Ali",
  title: "Researcher & Social Worker",
  taglines: [
    "Social Work Researcher",
    "Data Analyst (SPSS)",
    "Community Leader",
    "Development Sector Enthusiast",
    "Volunteer & Advocate",
  ],
  bio: `I am a Social Work graduate and researcher from Pabna University of Science and Technology (PUST) with a strong academic foundation in social research, data analysis, and community studies. My master's thesis on socioeconomic conditions in Chalan Beel strengthened my skills in field research, SPSS-based analysis, and academic reporting. I am passionate about research, community welfare, and social policy — guided by curiosity, empathy, and a commitment to continuous learning.`,
  location: "Singra, Natore-6450, Bangladesh",
  email: "ashikali0204@gmail.com",
  website: "ashbooks.netlify.app",
  linkedin: "https://www.linkedin.com/in/ashikali0",
};

/* ─────────────────────────────────────────────────────────────────────
   Typewriter hook
───────────────────────────────────────────────────────────────────── */
function useTypewriter(words: string[], speed = 20, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [words, wordIdx, charIdx, deleting, speed, pause]);

  return display;
}

/* ─────────────────────────────────────────────────────────────────────
   MosaicAvatar — canvas-based pixel scatter on scroll
───────────────────────────────────────────────────────────────────── */
const TILE = 10; // tile size in px
const IMG_SRC = "https://i.postimg.cc/qqG1qjP8/normal.png";

function MosaicAvatar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  // const tilesRef = useRef<{ sx: number; sy: number; dx: number; dy: number }[]>([]);
  const rafRef = useRef<number>(0);
  const gapRef = useRef(0); // current rendered gap (0 = packed, 1 = exploded)
  const imgLoadedRef = useRef(false);

  /* ── Draw one frame with a given gap ratio (0–1) ──────────────────── */
  const draw = useCallback((gap: number) => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    if (!canvas || !offscreen || !imgLoadedRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const maxGap = TILE * 3.5; // maximum extra spacing between tiles
    const spacing = gap * maxGap;

    // Eased — slow start, then faster near top
    // gap 0 → fully packed, gap 1 → exploded
    // We want acceleration: ease-in curve
    const easedSpacing = spacing * spacing / maxGap; // quadratic

    const cols = Math.ceil(W / TILE);
    const rows = Math.ceil(H / TILE);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const destX = c * TILE + (c * easedSpacing) - ((cols - 1) * easedSpacing) / 2;
        const destY = r * TILE + (r * easedSpacing) - ((rows - 1) * easedSpacing) / 2;
        ctx.drawImage(offscreen, c * TILE, r * TILE, TILE, TILE, destX, destY, TILE, TILE);
      }
    }
  }, []);

  /* ── Animate gap smoothly toward a target ─────────────────────────── */
  const targetGapRef = useRef(0);
  const animateGap = useCallback(function step() {
    const current = gapRef.current;
    const target = targetGapRef.current;
    const diff = target - current;

    if (Math.abs(diff) > 0.001) {
      // Lerp speed: slower for a dreamy feel
      gapRef.current += diff * 0.06;
      draw(gapRef.current);
      rafRef.current = requestAnimationFrame(step);
    } else {
      gapRef.current = target;
      draw(gapRef.current);
    }
  }, [draw]);

  /* ── Scroll handler ────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();

      // Effect triggers only when rect.top <= 300px from top of screen.
      // Below 300px (rect.top > 300) → progress = 0 (fully packed, default view).
      // At 300px → effect begins. At 0px (top edge at screen top) → fully exploded.

      const startTrigger =200; // px — effect kicks in here
      const endTrigger = 0;     // px — fully exploded when top hits screen top

      let progress = (startTrigger - rect.top) / (startTrigger - endTrigger);
      progress = Math.max(0, Math.min(1, progress));

      targetGapRef.current = progress;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animateGap);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animateGap]);

  /* ── Load image & setup offscreen canvas ──────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displaySize = 550; // matches the md:w-60 avatar size
    canvas.width = displaySize;
    canvas.height = displaySize;

    // Extra canvas so we can read pixel tiles from original
    const offscreen = document.createElement("canvas");
    offscreen.width = displaySize;
    offscreen.height = displaySize;
    offscreenRef.current = offscreen;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = IMG_SRC;

    img.onload = () => {
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      // Draw the image cropped/fitted into a circle by clipping
      ctx.save();
      ctx.beginPath();
      ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Same translate as the original img (translate-y-5)
      // Cover fit: scale to fill the circle, centered (no gaps)
const scale = Math.max(displaySize / img.naturalWidth, displaySize / img.naturalHeight);
const drawW = img.naturalWidth * scale;
const drawH = img.naturalHeight * scale;
const offsetX = (displaySize - drawW) / 2;
const offsetY = (displaySize - drawH) / 2;
ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      imgLoadedRef.current = true;
      draw(0);
    };

    img.onerror = () => {
      // Fallback: just show the img tag (canvas stays hidden)
    };
  }, [draw]);

  return (
    <div ref={wrapRef} className="shrink-0 flex items-center justify-center">
      <div
        className="relative flex items-center justify-center "
        style={{ width: 240, height: 240 }}
      >
        {/* Glow rings — purely decorative, behind canvas */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow:
              "0 0 60px rgba(0,245,255,0.25), inset 0 0 35px rgba(0,245,255,0.12)",
            border: "4px solid rgba(0,245,255,0.4)",
            borderRadius: "50%",
          }}
        />
        {/* Outer glow ring 1 */}
        <div
          className="absolute rounded-full pointer-events-none animate-pulse overflow-hidden"
          style={{
            inset: -12,
            border: "3px solid rgba(0,245,255,0.3)",
            borderRadius: "50%",
            boxShadow: "0 0 35px rgba(0,245,255,0.35)",
          }}
        />
        {/* Outer glow ring 2 */}
        <div
          className="absolute rounded-full pointer-events-none opacity-70 overflow-hidden"
          style={{
            inset: -18,
            border: "2px solid rgba(0,245,255,0.2)",
            borderRadius: "50%",
          }}
        />

        {/* Animated inner highlight */}
        <div
          className="absolute rounded-full bg-cyan-400/10 animate-pulse overflow-hidden"
          style={{ inset: 0, borderRadius: "50%" }}
        />
        <div
          className="absolute rounded-full border border-cyan-300/20 overflow-hidden"
          style={{ inset: 12, borderRadius: "50%" }}
        />

        {/*
          Canvas clipped to circle — draws the pixel mosaic.
          overflow-hidden + border-radius clip it visually.
        */}
        <canvas
          ref={canvasRef}
          style={{
            borderRadius: "50%",
            overflow: "hidden",
            display: "block",
            width: 230,
            height: 230,
            position: "relative",
            zIndex: 1,
            // border: '5px solid #fff'
          }}
        />

        {/* Subtle scanline overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            zIndex: 2,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.03) 5px)",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────────────────── */
const Hero: React.FC = () => {
  const typed = useTypewriter(personalInfo.taglines);

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center gap-10 w-full">

      {/* Left */}
      <div className="flex-1 min-w-0">
        <p className="font-orbitron text-[10px] text-center md:text-left tracking-[5px] uppercase text-cyan-400/80 mb-3">
          Portfolio
        </p>
        <h1
          className="font-orbitron text-4xl text-center md:text-left sm:text-6xl font-black text-white leading-tight
                     tracking-tight mb-2"
          style={{ textShadow: "0 0 40px rgba(0,245,255,0.3)" }}
        >
          Md.{" "}
          <span className="text-cyan-400">Ashik</span>{" "}
          Ali
        </h1>
        <p className="font-orbitron text-center md:text-left text-sm sm:text-base font-normal text-slate-300 tracking-[3px] uppercase mb-5">
          {personalInfo.title}
        </p>

        {/* Typewriter */}
        <p className="font-rajdhani text-base font-semibold text-emerald-400 tracking-wide mb-6 min-h-6">
          &gt; {typed}
          <span className="blink">_</span>
        </p>

        <p className="font-rajdhani text-justify tracking-[1px] text-[17px] text-slate-200 leading-relaxed mb-8 max-w-xl">
          {personalInfo.bio}
        </p>

        {/* Contact pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: personalInfo.email, href: `mailto:${personalInfo.email}`, dot: "#00f5ff" },
            { label: "LinkedIn", href: personalInfo.linkedin, dot: "#60a5fa" },
            { label: personalInfo.website, href: `https://${personalInfo.website}`, dot: "#a78bfa" },
            { label: personalInfo.location, href: "#", dot: "#00ff88" },
          ].map(({ label, href, dot }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                         bg-cyan-400/5 border border-cyan-400/20 text-slate-300 tracking-wide
                         hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-400 transition-all"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: dot, boxShadow: `0 0 5px ${dot}` }}
              />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Mosaic avatar */}
      <MosaicAvatar />

    </div>
  );
};

export default Hero;