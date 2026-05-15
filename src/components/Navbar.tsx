/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import type { PointerEvent, ReactNode, JSX } from "react";

import {
  Home,
  Zap,
  FolderKanban,
  Briefcase,
  X,
  MoreVertical,
  Workflow,
  ToolCaseIcon,
} from "lucide-react";
import { GiArchiveResearch } from "react-icons/gi";
import { ImConnection } from "react-icons/im";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/* ─────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────── */
interface NavSection {
  label: string;
  id: string;
  icon: ReactNode;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
}

interface Origin {
  x: number;
  y: number;
}

interface DragStart {
  angle: number;
  rotation: number;
  clientX: number;
  clientY: number;
}

interface CircularMenuProps {
  isOpen: boolean;
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  originX: number;
  originY: number;
}

/* ─────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────── */
const ORBIT_RADIUS = 158; // larger circle for mobile
// How many pixels the pointer must move before it's considered a drag (not a tap)
const DRAG_THRESHOLD = 6;

const NAV_SECTIONS: NavSection[] = [
  { label: "Home",       id: "section-home",       icon: <Home       size={12} strokeWidth={2} /> },
  { label: "Works",      id: "section-works",      icon: <Workflow   size={12} strokeWidth={2} /> },
  { label: "Projects",   id: "section-projects",   icon: <FolderKanban size={12} strokeWidth={2} /> },
  { label: "Experience", id: "section-experience", icon: <Briefcase  size={12} strokeWidth={2} /> },
  { label: "Education",  id: "section-education",  icon: <Zap        size={12} strokeWidth={2} /> },
  { label: "Research",       id: "section-research",       icon: <GiArchiveResearch size={12} strokeWidth={2} /> },
  { label: "Skills",     id: "section-skills",     icon: <Zap        size={12} strokeWidth={2} /> },
  { label: "Tools",       id: "section-tools",       icon: <ToolCaseIcon size={12} strokeWidth={2} /> },
  { label: "Activity",       id: "section-activity",       icon: <MoreVertical size={12} strokeWidth={2} /> },
  { label: "More",       id: "section-more",       icon: <MoreVertical size={12} strokeWidth={2} /> },
  { label: "Social",       id: "section-social",       icon: <ImConnection size={12} strokeWidth={2} /> },
];

const ITEM_COUNT = NAV_SECTIONS.length;

/* Stable particle list */
const PARTICLES: Particle[] = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.2 + 0.8,
  dur: Math.random() * 5 + 4,
  delay: Math.random() * 4,
}));

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
function toPolar(angleDeg: number, r: number = ORBIT_RADIUS): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

function angleBetween(cx: number, cy: number, px: number, py: number): number {
  return (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CircularMenu
═══════════════════════════════════════════════════════════════════════════ */
function CircularMenu({
  isOpen,
  activeId,
  onSelect,
  onClose,
  originX,
  originY,
}: CircularMenuProps): JSX.Element | null {
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [entryScale, setEntryScale] = useState<number>(0.5);

  const dragStart = useRef<DragStart | null>(null);
  const lastAngle = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const angVelocity = useRef<number>(0);
  const spinRaf = useRef<number>(0);
  const hasDragged = useRef<boolean>(false);

  /* Entry animation */
  useEffect(() => {
    if (!isOpen) {
      setEntryScale(0.5);
      setRotation(0);
      return;
    }
    const t = setTimeout(() => setEntryScale(1), 30);
    return () => clearTimeout(t);
  }, [isOpen]);

  /* Inertia */
  useEffect(() => {
    if (!isSpinning) return;
    let vel = angVelocity.current;
    const step = (): void => {
      vel *= 0.93;
      if (Math.abs(vel) < 0.07) { setIsSpinning(false); return; }
      setRotation((r) => r + vel);
      spinRaf.current = requestAnimationFrame(step);
    };
    spinRaf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(spinRaf.current);
  }, [isSpinning]);

  /* ── Shared drag logic ────────────────────────────────────────────── */
  function startDrag(clientX: number, clientY: number): void {
    cancelAnimationFrame(spinRaf.current);
    setIsSpinning(false);
    const angle = angleBetween(originX, originY, clientX, clientY);
    dragStart.current = { angle, rotation, clientX, clientY };
    lastAngle.current = angle;
    lastTime.current = performance.now();
    angVelocity.current = 0;
    hasDragged.current = false;
    setIsDragging(true);
  }

  function moveDrag(clientX: number, clientY: number): void {
    if (!dragStart.current) return;
    const dx = clientX - dragStart.current.clientX;
    const dy = clientY - dragStart.current.clientY;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) hasDragged.current = true;
    const angle = angleBetween(originX, originY, clientX, clientY);
    setRotation(dragStart.current.rotation + (angle - dragStart.current.angle));
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) angVelocity.current = ((angle - lastAngle.current) / dt) * 15;
    lastAngle.current = angle;
    lastTime.current = now;
  }

  function endDrag(navigateTo?: string): void {
    setIsDragging(false);
    dragStart.current = null;
    if (!hasDragged.current && navigateTo) {
      onSelect(navigateTo);
    } else if (Math.abs(angVelocity.current) > 0.35) {
      setIsSpinning(true);
    }
  }

  /* ── Big disc pointer handlers (covers entire circle area) ────────── */
  function handleDiscPointerDown(e: PointerEvent<HTMLDivElement>): void {
    // If clicking directly on a button child, let button handle it
    if ((e.target as HTMLElement).closest("button")) return;
    startDrag(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleDiscPointerMove(e: PointerEvent<HTMLDivElement>): void {
    if (!isDragging) return;
    moveDrag(e.clientX, e.clientY);
  }

  function handleDiscPointerUp(): void {
    if (!isDragging) return;
    endDrag();
  }

  /* ── Per-button pointer handlers ──────────────────────────────────── */
  function handleButtonPointerDown(e: PointerEvent<HTMLButtonElement>): void {
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleButtonPointerMove(e: PointerEvent<HTMLButtonElement>): void {
    moveDrag(e.clientX, e.clientY);
  }

  function handleButtonPointerUp(e: PointerEvent<HTMLButtonElement>, sectionId: string): void {
    e.stopPropagation();
    endDrag(sectionId);
  }

  if (!isOpen) return null;

  // Disc size = orbit radius + enough margin to cover the outermost button
  const discSize = (ORBIT_RADIUS + 70) * 2;

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        background: "rgba(1,6,18,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "rgba(0,245,255,0.3)",
            animation: `navParticleDrift ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* Outer ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: ORBIT_RADIUS * 2 + 96,
          height: ORBIT_RADIUS * 2 + 96,
          left: originX,
          top: originY,
          border: "1px solid rgba(0,245,255,0.16)",
          boxShadow: "0 0 48px rgba(0,245,255,0.06), inset 0 0 48px rgba(0,245,255,0.04)",
          transform: `translate(-50%,-50%) rotate(${rotation}deg)`,
        }}
      />

      {/* Inner ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: ORBIT_RADIUS * 2 - 44,
          height: ORBIT_RADIUS * 2 - 44,
          left: originX,
          top: originY,
          border: "1px solid rgba(0,245,255,0.07)",
          transform: `translate(-50%,-50%) rotate(${-rotation * 0.45}deg)`,
        }}
      />

      {/*
       * Big transparent disc — covers the entire orbit area so ANY touch
       * on the circle (even empty space) initiates a drag/spin.
       */}
      <div
        onPointerDown={handleDiscPointerDown}
        onPointerMove={handleDiscPointerMove}
        onPointerUp={handleDiscPointerUp}
        onPointerCancel={handleDiscPointerUp}
        style={{
          position: "absolute",
          left: originX,
          top: originY,
          width: discSize,
          height: discSize,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
          // Fully transparent — just for pointer events
          background: "transparent",
        }}
      >
        {/* Nav buttons positioned relative to disc centre */}
        {NAV_SECTIONS.map((section, i) => {
          const baseAngle = (360 / ITEM_COUNT) * i - 90;
          const totalAngle = baseAngle + rotation;
          // Positions relative to disc centre (discSize/2, discSize/2)
          const { x, y } = toPolar(totalAngle);
          const isActive = activeId === section.id;

          return (
            <button
              key={section.id}
              aria-label={`Navigate to ${section.label}`}
              onPointerDown={handleButtonPointerDown}
              onPointerMove={handleButtonPointerMove}
              onPointerUp={(e) => handleButtonPointerUp(e, section.id)}
              onPointerCancel={(e) => {
                e.stopPropagation();
                setIsDragging(false);
                dragStart.current = null;
              }}
              style={{
                position: "absolute",
                // Centre of disc is at (discSize/2, discSize/2)
                left: discSize / 2 + x,
                top: discSize / 2 + y,
                transform: `translate(-50%, -50%) scale(${entryScale})`,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                zIndex: Math.round(y) + 200,
                pointerEvents: "auto",
                touchAction: "manipulation",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
            >
              <div
                className="flex items-center uppercase tracking-widest whitespace-nowrap select-none"
                style={{
                  gap: 5,
                  padding: "6px 12px",
                  borderRadius: 100,
                  background: isActive ? "rgba(0,245,255,0.16)" : "rgba(2,16,34,0.8)",
                  border: `1.5px solid ${isActive ? "rgba(0,245,255,0.85)" : "rgba(0,245,255,0.22)"}`,
                  color: isActive ? "#00f5ff" : "rgba(190,230,255,0.88)",
                  // Smaller font size for mobile menu items
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                  WebkitTouchCallout: "none",
                }}
              >
                <span style={{ display: "flex", opacity: isActive ? 1 : 0.7 }}>
                  {section.icon}
                </span>
                {section.label}
                {isActive && (
                  <span className="w-1 h-1 rounded-full" style={{ background: "#00f5ff" }} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close navigation"
        className="absolute flex items-center justify-center rounded-full cursor-pointer z-[10002]"
        style={{
          left: originX,
          top: originY,
          transform: "translate(-50%, -50%)",
          width: 50,
          height: 50,
          background: "rgba(0,245,255,0.1)",
          border: "1.5px solid rgba(0,245,255,0.7)",
          color: "#00f5ff",
        }}
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      {/* Hint */}
      <p
        className="absolute bottom-9 left-1/2 -translate-x-1/2 pointer-events-none m-0 uppercase tracking-widest whitespace-nowrap"
        style={{
          color: "rgba(0,245,255,0.35)",
          fontSize: 9,
          fontFamily: "monospace",
        }}
      >
        drag to spin · tap to navigate
      </p>

      <style>{`
        @keyframes navParticleDrift {
          from { transform: translate(0,0) scale(1); opacity: 0.15; }
          to   { transform: translate(9px,-16px) scale(1.5); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════════════════ */
export default function NavBar(): JSX.Element {
  const [activeId, setActiveId] = useState<string>(NAV_SECTIONS[0].id);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [menuOrigin, setMenuOrigin] = useState<Origin>({ x: 0, y: 0 });
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const {user} = useAuth();
  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* Resize */
  useEffect(() => {
    const onResize = (): void => {
      if (window.innerWidth >= 768 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  /* Scroll spy */
  useEffect(() => {
    const onScroll = (): void => {
      const scrollY = window.scrollY + 120;
      for (const s of [...NAV_SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= scrollY) {
          setActiveId(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openMenu(): void {
    if (!hamburgerRef.current) return;
    const rect = hamburgerRef.current.getBoundingClientRect();
    setMenuOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setMenuOpen(true);
  }

  function handleSelect(id: string): void {
    setActiveId(id);
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function handleDesktopClick(id: string): void {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const activeSection = NAV_SECTIONS.find((s) => s.id === activeId);

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(2,8,24,0.84)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderBottomColor: "rgba(0,245,255,0.13)",
        }}
      >
        <div className="flex items-center justify-between px-6 max-w-[1200px] mx-auto">
          {/* Logo */}
          <span
            className="py-4 text-[13px] font-black tracking-[0.24em]"
            style={{
              fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
              color: "#00f5ff",
            }}
          >
            <Link to={`${user && !user.email ? '/login' : '/account'}`}>
              AA  
            </Link>
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center">
            {NAV_SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleDesktopClick(s.id)}
                  className="bg-transparent border-none cursor-pointer px-[11px] py-4 text-[13px]"
                  style={{
                    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                    color: isActive ? "#00f5ff" : "rgba(190,220,255,0.82)",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-[10px]">
            <span
              className="text-xs"
              style={{
                fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                color: "rgba(190,220,255,0.82)",
              }}
            >
              {activeSection?.label}
            </span>
            <button
              ref={hamburgerRef}
              onClick={openMenu}
              aria-label="Open navigation menu"
              className="bg-transparent border-none cursor-pointer text-lg"
              style={{ color: "#00f5ff" }}
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Menu */}
      <div id="circular-nav-menu" role="dialog" aria-modal="true">
        <CircularMenu
          isOpen={menuOpen}
          activeId={activeId}
          onSelect={handleSelect}
          onClose={() => setMenuOpen(false)}
          originX={menuOrigin.x}
          originY={menuOrigin.y}
        />
      </div>

      <style>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
}