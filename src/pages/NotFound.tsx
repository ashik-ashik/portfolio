import { useEffect, useRef, useState, type ReactNode, type JSX } from "react";
import {
  Search, Home, Compass, Satellite, Wifi, AlertTriangle,
  Radio, Zap, Globe, ArrowRight, RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   ALL RANDOM DATA — computed once at module level (no hooks)
   Explicit types keep TypeScript happy.
───────────────────────────────────────────────────────────── */
interface StarDatum {
  id:  number;
  x:   number;
  y:   number;
  s:   number;
  dur: string;
  del: string;
}

interface ParticleDatum {
  id:  number;
  x:   number;
  y:   number;
  sz:  number;
  col: string;
  dur: string;
  del: string;
}

const PARTICLE_COLORS: string[] = ["#06b6d4","#818cf8","#a855f7","#38bdf8","#34d399"];

const STARS: StarDatum[] = Array.from({ length: 130 }, (_, i): StarDatum => ({
  id:  i,
  x:   Math.random() * 100,
  y:   Math.random() * 100,
  s:   Math.random() * 2.4 + 0.5,
  dur: (Math.random() * 3.5 + 1.8).toFixed(1),
  del: (Math.random() * 6).toFixed(1),
}));

const PARTICLES: ParticleDatum[] = Array.from({ length: 22 }, (_, i): ParticleDatum => ({
  id:  i,
  x:   Math.random() * 100,
  y:   Math.random() * 100,
  sz:  Math.random() * 5 + 2,
  col: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  dur: (Math.random() * 6 + 4).toFixed(1),
  del: (Math.random() * 5).toFixed(1),
}));

/* ─────────────────────────────────────────────────────────────
   INJECTED CSS — keyframes + utility classes
───────────────────────────────────────────────────────────── */
const INJECTED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

  @keyframes floatY {
    0%,100% { transform: translateY(-10px); }
    50%      { transform: translateY(10px);  }
  }
  @keyframes floatYsm {
    0%,100% { transform: translateY(-4px); }
    50%      { transform: translateY(4px);  }
  }
  @keyframes spinCW  { to { transform: rotate(360deg);  } }
  @keyframes spinCCW { to { transform: rotate(-360deg); } }
  @keyframes twinkle {
    0%,100% { opacity:.1;  transform:scale(.8);  }
    50%      { opacity:1;   transform:scale(1.3); }
  }
  @keyframes ping404 {
    0%   { transform:scale(1);   opacity:.55; }
    100% { transform:scale(2.5); opacity:0;   }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(26px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes scanLine {
    0%   { top:-2px;  }
    100% { top:100%;  }
  }
  @keyframes pulseChip {
    0%,100% { opacity:.45; }
    50%      { opacity:1;   }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow:0 0 30px rgba(6,182,212,.35),0 0 60px rgba(6,182,212,.12); }
    50%      { box-shadow:0 0 55px rgba(6,182,212,.7),0 0 100px rgba(129,140,248,.25); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes breathe {
    0%,100% { opacity:.04; }
    50%      { opacity:.09; }
  }
  @keyframes radarSweep { to { transform:rotate(360deg); } }
  @keyframes typeCursor {
    0%,100% { opacity:1; }
    50%      { opacity:0; }
  }
  @keyframes orbPlanet { to { transform:rotate(360deg); } }

  .font-syne  { font-family:'Syne',sans-serif; }
  .font-mono2 { font-family:'Space Mono',monospace; }

  .e1{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) .05s both;}
  .e2{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) .25s both;}
  .e3{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) .45s both;}
  .e4{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) .65s both;}
  .e5{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) .85s both;}
  .e6{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) 1.05s both;}
  .e7{animation:fadeSlideUp .8s cubic-bezier(.16,1,.3,1) 1.25s both;}

  .text-shimmer {
    background:linear-gradient(90deg,#67e8f9 0%,#818cf8 30%,#a855f7 60%,#38bdf8 100%);
    background-size:200% auto;
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmer 4s linear infinite;
  }

  .float-orb   { animation:floatY    6s   ease-in-out infinite; }
  .float-sm    { animation:floatYsm  3.2s ease-in-out infinite; }
  .spin-cw     { animation:spinCW   20s   linear      infinite; }
  .spin-ccw    { animation:spinCCW  30s   linear      infinite; }
  .spin-planet { animation:orbPlanet 42s  linear      infinite; }
  .pulse-glow  { animation:glowPulse 3s   ease-in-out infinite; }
  .breathe-bg  { animation:breathe   5s   ease-in-out infinite; }
  .radar-spin  { animation:radarSweep 3s  linear      infinite; }

  .btn-p {
    display:flex; align-items:center; gap:10px;
    padding:14px 28px; border-radius:16px;
    font-family:'Syne',sans-serif; font-weight:600; font-size:.875rem; letter-spacing:.04em;
    background:linear-gradient(135deg,rgba(6,182,212,.18),rgba(129,140,248,.12));
    border:1px solid rgba(6,182,212,.55);
    backdrop-filter:blur(16px);
    color:#67e8f9;
    cursor:pointer;
    transition:all .25s ease;
    box-shadow:0 0 22px rgba(6,182,212,.2),inset 0 1px 0 rgba(255,255,255,.08);
    position:relative; overflow:hidden;
  }
  .btn-p:hover {
    background:linear-gradient(135deg,rgba(6,182,212,.28),rgba(129,140,248,.2));
    border-color:rgba(6,182,212,1);
    box-shadow:0 0 40px rgba(6,182,212,.55),0 0 80px rgba(6,182,212,.18);
    transform:scale(1.04) translateY(-1px);
  }
  .btn-p:active { transform:scale(.97); }

  .btn-s {
    display:flex; align-items:center; gap:10px;
    padding:14px 28px; border-radius:16px;
    font-family:'Syne',sans-serif; font-weight:600; font-size:.875rem; letter-spacing:.04em;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.11);
    backdrop-filter:blur(16px);
    color:rgba(255,255,255,.6);
    cursor:pointer;
    transition:all .25s ease;
  }
  .btn-s:hover {
    background:rgba(129,140,248,.1);
    border-color:rgba(129,140,248,.5);
    box-shadow:0 0 22px rgba(129,140,248,.3);
    color:#a5b4fc;
    transform:scale(1.04) translateY(-1px);
  }
  .btn-s:active { transform:scale(.97); }

  .tt-wrap { position:relative; }
  .tt-box {
    position:absolute; bottom:calc(100% + 8px); left:50%;
    transform:translateX(-50%) translateY(4px);
    opacity:0; pointer-events:none;
    transition:all .2s ease;
    white-space:nowrap;
    background:rgba(6,182,212,.14);
    border:1px solid rgba(6,182,212,.3);
    color:#67e8f9;
    font-family:'Space Mono',monospace;
    font-size:10px; letter-spacing:.2em;
    padding:4px 10px; border-radius:8px;
    backdrop-filter:blur(8px);
  }
  .tt-wrap:hover .tt-box { opacity:1; transform:translateX(-50%) translateY(0); }
`;

/* ─────────────────────────────────────────────────────────────
   STAR FIELD — consumes module-level STARS constant
───────────────────────────────────────────────────────────── */
function StarField(): JSX.Element {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((st) => (
        <div
          key={st.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${st.x}%`,
            top:  `${st.y}%`,
            width:  st.s,
            height: st.s,
            animation: `twinkle ${st.dur}s ease-in-out ${st.del}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PARTICLES — consumes module-level PARTICLES constant
───────────────────────────────────────────────────────────── */
function Particles(): JSX.Element {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left:   `${p.x}%`,
            top:    `${p.y}%`,
            width:  p.sz,
            height: p.sz,
            background: p.col,
            filter: `blur(1px) drop-shadow(0 0 5px ${p.col})`,
            opacity: 0.32,
            animation: `floatY ${p.dur}s ease-in-out ${p.del}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOUSE GLOW
───────────────────────────────────────────────────────────── */
function MouseGlow(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    let tx = window.innerWidth  / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.left = `${cx}px`;
      el.style.top  = `${cy}px`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none rounded-full"
      style={{
        width:  520,
        height: 520,
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle,rgba(6,182,212,.055) 0%,transparent 70%)",
        zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   RADAR WIDGET
───────────────────────────────────────────────────────────── */
function RadarWidget(): JSX.Element {
  const rings: number[] = [72, 52, 32];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      {rings.map((sz) => (
        <div
          key={sz}
          className="absolute rounded-full"
          style={{
            width:  sz,
            height: sz,
            border: "1px solid rgba(6,182,212,.2)",
            top:  "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
      ))}

      {/* crosshair */}
      <div className="absolute" style={{ width: 72, height: 72, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <div className="absolute" style={{ width: "100%", height: "1px", top: "50%", background: "rgba(6,182,212,.12)" }} />
        <div className="absolute" style={{ height: "100%", width: "1px", left: "50%", background: "rgba(6,182,212,.12)" }} />
      </div>

      {/* sweep */}
      <div
        className="absolute rounded-full overflow-hidden radar-spin"
        style={{ width: 72, height: 72, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
      >
        <div
          style={{
            position:        "absolute",
            top:             0,
            left:            "50%",
            width:           "50%",
            height:          "50%",
            background:      "conic-gradient(from 0deg,transparent 55%,rgba(6,182,212,.5) 100%)",
            transformOrigin: "0% 100%",
          }}
        />
      </div>

      {/* blip */}
      <div
        className="absolute rounded-full"
        style={{
          width:     5,
          height:    5,
          background: "#06b6d4",
          top:  "28%",
          left: "65%",
          boxShadow: "0 0 8px #06b6d4",
          animation: "pulseChip 1.8s ease-in-out infinite",
        }}
      />

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5">
        <span className="font-mono2 text-[8px] tracking-widest" style={{ color: "rgba(6,182,212,.4)" }}>RADAR</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────────────────────────── */
const MSGS: string[] = [
  "Searching known sectors...",
  "Route not found in star-map.",
  "Coordinates returned NULL.",
  "Signal lost. Drifting...",
];

function Typewriter(): JSX.Element {
  const [mi,      setMi]      = useState<number>(0);
  const [txt,     setTxt]     = useState<string>("");
  const [ci,      setCi]      = useState<number>(0);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    const target = MSGS[mi];

    if (!deleting && ci < target.length) {
      const t = setTimeout(() => { setTxt(target.slice(0, ci + 1)); setCi((c) => c + 1); }, 55);
      return () => clearTimeout(t);
    }
    if (!deleting && ci === target.length) {
      const t = setTimeout(() => setDeleting(true), 1900);
      return () => clearTimeout(t);
    }
    if (deleting && ci > 0) {
      const t = setTimeout(() => { setTxt(target.slice(0, ci - 1)); setCi((c) => c - 1); }, 28);
      return () => clearTimeout(t);
    }
    if (deleting && ci === 0) {
        const setingdelet = () => {

            setDeleting(false);
            setMi((m) => (m + 1) % MSGS.length);
        }
        setingdelet();
    }
  }, [ci, deleting, mi]);

  return (
    <div className="flex items-center gap-1.5 font-mono2 text-xs" style={{ color: "rgba(6,182,212,.5)", minHeight: 18 }}>
      <span>{txt}</span>
      <span style={{ animation: "typeCursor .8s step-end infinite", borderRight: "1.5px solid rgba(6,182,212,.7)", paddingRight: 1 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TELEMETRY BAR
───────────────────────────────────────────────────────────── */
const TELEM_VALS: string[] = ["—.——", "0.00", "ERR", "NULL"];

function TelemetryBar(): JSX.Element {
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1900);
    return () => clearInterval(t);
  }, []);

  const v = TELEM_VALS[tick % TELEM_VALS.length];

  return (
    <div
      className="flex items-center gap-4 px-4 py-2 rounded-xl font-mono2 text-[10px] tracking-widest"
      style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(6,182,212,.5)" }}
    >
      <span className="flex items-center gap-1.5"><Radio size={10} />FREQ: {v}</span>
      <span className="w-px h-3" style={{ background: "rgba(255,255,255,.1)" }} />
      <span className="flex items-center gap-1.5"><Zap size={10} />PWR: 0%</span>
      <span className="w-px h-3" style={{ background: "rgba(255,255,255,.1)" }} />
      <span className="flex items-center gap-1.5"><Globe size={10} />DEPTH: ∞</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS CHIPS
───────────────────────────────────────────────────────────── */
interface ChipDef {
  icon:  ReactNode;
  label: string;
  col:   string;
  rgb:   string;
  del:   string;
}

const CHIPS: ChipDef[] = [
  { icon: <Wifi size={11} />,           label: "SIGNAL LOST", col: "#f87171", rgb: "248,113,113", del: "0s"  },
  { icon: <AlertTriangle size={11} />,  label: "404 ERROR",   col: "#fbbf24", rgb: "251,191,36",  del: ".4s" },
  { icon: <Satellite size={11} />,      label: "SCANNING...", col: "#06b6d4", rgb: "6,182,212",   del: ".8s" },
];

function StatusChips(): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CHIPS.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono2 tracking-widest"
          style={{
            background: `rgba(${c.rgb},.08)`,
            border:     `1px solid ${c.col}40`,
            color:       c.col,
            animation:  `pulseChip 2s ease-in-out ${c.del} infinite`,
          }}
        >
          {c.icon}{c.label}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CENTRAL ORB
───────────────────────────────────────────────────────────── */
const PING_DELAYS: number[] = [0, 1, 2];

function CentralOrb(): JSX.Element {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>

      {/* outer ambient ring */}
      <div
        className="absolute rounded-full pulse-glow"
        style={{
          width:  260,
          height: 260,
          border: "1px solid rgba(6,182,212,.13)",
          background: "radial-gradient(circle,transparent 40%,rgba(6,182,212,.07) 70%,transparent 100%)",
        }}
      />

      {/* dashed orbit + satellite */}
      <div
        className="absolute rounded-full spin-cw"
        style={{
          width:  222,
          height: 222,
          border: "1.5px dashed rgba(6,182,212,.45)",
          boxShadow: "0 0 14px rgba(6,182,212,.18),inset 0 0 10px rgba(6,182,212,.05)",
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full"
          style={{
            top:        -10,
            width:      20,
            height:     20,
            background: "linear-gradient(135deg,#06b6d4,#818cf8)",
            boxShadow:  "0 0 14px rgba(6,182,212,.9),0 0 28px rgba(6,182,212,.4)",
          }}
        >
          <Satellite size={10} color="white" />
        </div>
      </div>

      {/* inner orbit CCW */}
      <div
        className="absolute rounded-full spin-ccw"
        style={{ width: 172, height: 172, border: "1px solid rgba(129,140,248,.18)" }}
      />

      {/* planet body */}
      <div
        className="absolute rounded-full overflow-hidden spin-planet"
        style={{
          width:  132,
          height: 132,
          background: `
            radial-gradient(circle at 35% 35%,rgba(56,189,248,.58) 0%,transparent 50%),
            radial-gradient(circle at 70% 68%,rgba(168,85,247,.38) 0%,transparent 50%),
            radial-gradient(circle at 50% 50%,#0c1a3a 0%,#060d1f 100%)
          `,
          boxShadow: `
            0 0 44px rgba(6,182,212,.5),
            0 0 88px rgba(6,182,212,.22),
            0 0 130px rgba(129,140,248,.14),
            inset 0 0 32px rgba(6,182,212,.14)
          `,
          border: "1px solid rgba(6,182,212,.4)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "repeating-linear-gradient(22deg,transparent,transparent 12px,rgba(6,182,212,.045) 12px,rgba(6,182,212,.045) 13px)" }}
        />
        <div className="absolute rounded-full" style={{ top:"30%",left:"10%",width:"40%",height:"8%", background:"rgba(56,189,248,.18)",filter:"blur(3px)" }} />
        <div className="absolute rounded-full" style={{ top:"55%",left:"40%",width:"30%",height:"6%", background:"rgba(168,85,247,.22)",filter:"blur(3px)" }} />
        <div className="absolute rounded-full" style={{ top:"8%", left:"22%",width:"52%",height:"18%",background:"rgba(255,255,255,.055)",filter:"blur(4px)" }} />
      </div>

      {/* floating search icon */}
      <div
        className="absolute flex items-center justify-center rounded-full float-sm"
        style={{
          width:  46,
          height: 46,
          background:    "rgba(6,182,212,.15)",
          border:        "1px solid rgba(6,182,212,.5)",
          backdropFilter:"blur(8px)",
          boxShadow:     "0 0 22px rgba(6,182,212,.55)",
        }}
      >
        <Search size={20} color="#67e8f9" />
      </div>

      {/* ping rings */}
      {PING_DELAYS.map((delay) => (
        <div
          key={delay}
          className="absolute rounded-full"
          style={{
            width:  132,
            height: 132,
            border: "1px solid rgba(6,182,212,.5)",
            animation: `ping404 3s ease-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function NotFound404(): JSX.Element {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = INJECTED_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background:  "radial-gradient(ellipse at 30% 20%,#0d1b3e 0%,#050816 55%,#02040f 100%)",
        fontFamily:  "'Syne',sans-serif",
      }}
    >
      {/* grid bg */}
      <div
        className="absolute inset-0 breathe-bg pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(6,182,212,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.8) 1px,transparent 1px)",
          backgroundSize:  "58px 58px",
          opacity: 0.05,
        }}
      />

      <StarField />
      <Particles />
      <MouseGlow />

      {/* corner glows */}
      <div className="absolute top-0 left-0 pointer-events-none rounded-full"
        style={{ width:420,height:420,background:"radial-gradient(circle,rgba(6,182,212,.08) 0%,transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 pointer-events-none rounded-full"
        style={{ width:520,height:520,background:"radial-gradient(circle,rgba(168,85,247,.09) 0%,transparent 70%)" }} />
      <div className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none rounded-full"
        style={{ width:320,height:320,background:"radial-gradient(circle,rgba(129,140,248,.06) 0%,transparent 70%)" }} />

      {/* scan sweep */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height:     2,
          background: "linear-gradient(90deg,transparent,rgba(6,182,212,.18),rgba(6,182,212,.35),rgba(6,182,212,.18),transparent)",
          animation:  "scanLine 9s linear 2s infinite",
        }}
      />

      {/* ── top nav ── */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20 e1"
        style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#06b6d4,#818cf8)", boxShadow:"0 0 16px rgba(6,182,212,.5)" }}
          >
            <Compass size={14} color="white" />
          </div>
          <span className="font-mono2 text-xs tracking-[.22em] uppercase" style={{ color:"rgba(255,255,255,.65)" }}>
            ASHIKNOW
          </span>
        </div>

        <div className="flex items-center gap-5">
          <RadarWidget />
          <div className="hidden sm:block text-right">
            <div className="font-mono2 text-[10px] tracking-widest" style={{ color:"rgba(6,182,212,.45)" }}>
              SYS_COORD: —.——, —.——
            </div>
            <div className="font-mono2 text-[10px] tracking-widest mt-0.5" style={{ color:"rgba(255,255,255,.2)" }}>
              SECTOR: NULL_VOID
            </div>
          </div>
        </div>
      </div>

      {/* ── main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 max-w-2xl w-full mt-16">

        {/* glitch badge */}
        <div className="e1">
          <div
            className="font-mono2 text-xs tracking-[.28em] uppercase px-3 py-1.5 rounded-full"
            style={{
              color:      "rgba(168,85,247,.8)",
              border:     "1px solid rgba(168,85,247,.25)",
              background: "rgba(168,85,247,.07)",
              animation:  "pulseChip 2.2s ease-in-out infinite",
            }}
          >
            ◈ SIGNAL CORRUPTED ◈
          </div>
        </div>

        

        {/* orb */}
        <div className="e3 float-orb mt-10">
          <CentralOrb />
        </div>

        {/* heading + desc */}
        <div className="e4 flex flex-col gap-3">
          <h1
            className="font-syne font-bold text-3xl sm:text-4xl tracking-tight"
            style={{ color:"rgba(255,255,255,.92)", textShadow:"0 0 40px rgba(6,182,212,.2)" }}
          >
            Lost in Deep Space
          </h1>
          <p
            className="font-syne text-sm sm:text-base leading-relaxed max-w-md mx-auto"
            style={{ color:"rgba(148,163,184,.75)" }}
          >
            The coordinates you entered don't exist in this universe. This page has drifted
            beyond the known sector or perhaps it never existed at all.
          </p>
          <div className="flex justify-center mt-1">
            <Typewriter />
          </div>
        </div>

        {/* status chips */}
        <div className="e5"><StatusChips /></div>

        {/* telemetry */}
        <div className="e5"><TelemetryBar /></div>

        {/* buttons */}
        <div className="e6 flex flex-col sm:flex-row gap-3 mt-1">
            <Link to='/'>
                <button className="btn-p">
                    <Home size={16} />
                    Return Home
                    <ArrowRight size={13} style={{ opacity: 0.55 }} />
                </button>
            </Link>
          <button className="btn-s">
            <Compass size={16} />
            Explore Universe
          </button>
          <button className="btn-s tt-wrap" style={{ padding:"14px 20px" }}>
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Retry Signal</span>
            <span className="tt-box">Re-establish connection</span>
          </button>
        </div>

        {/* error code rule */}
        <div className="e7 flex items-center gap-3 mt-1">
          <div className="h-px w-10" style={{ background:"linear-gradient(90deg,transparent,rgba(6,182,212,.4))" }} />
          <span
            className="font-mono2 text-[10px] tracking-[.25em] uppercase"
            style={{ color:"rgba(6,182,212,.4)" }}
          >
            ERR_PAGE_NOT_FOUND
          </span>
          <div className="h-px w-10" style={{ background:"linear-gradient(270deg,transparent,rgba(6,182,212,.4))" }} />
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-20"
        style={{ borderTop:"1px solid rgba(255,255,255,.04)" }}
      >
        <span className="font-mono2 text-[10px] tracking-widest" style={{ color:"rgba(255,255,255,.18)" }}>
          © 2025 ASHIKNOW
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background:"#f87171", animation:"pulseChip 1.5s ease-in-out infinite", boxShadow:"0 0 6px #f87171" }}
          />
          <span className="font-mono2 text-[10px] tracking-widest" style={{ color:"rgba(248,113,113,.6)" }}>
            OFFLINE
          </span>
        </div>
      </div>

      {/* bottom glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(6,182,212,.35),transparent)",
          animation:  "pulseChip 3s ease-in-out infinite",
        }}
      />
    </div>
  );
}