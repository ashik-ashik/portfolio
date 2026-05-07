/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent, ReactNode, JSX } from "react";

import {
  Home,
  Zap,
  FolderKanban,
  Briefcase,
  X,
  MoreVertical,
  Workflow,
} from "lucide-react";

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
const ORBIT_RADIUS = 118;
// How many pixels the pointer must move before it's considered a drag (not a tap)
const DRAG_THRESHOLD = 6;

const NAV_SECTIONS: NavSection[] = [
  { label: "Home",       id: "section-home",       icon: <Home       size={13} strokeWidth={2} /> },
  { label: "Works",      id: "section-works",      icon: <Workflow       size={13} strokeWidth={2} /> },
  { label: "Projects",   id: "section-projects",   icon: <FolderKanban size={13} strokeWidth={2} /> },
  { label: "Experience", id: "section-experience", icon: <Briefcase  size={13} strokeWidth={2} /> },
  { label: "Education",  id: "section-education",  icon: <Zap        size={13} strokeWidth={2} /> },
  { label: "Skills",     id: "section-skills",     icon: <Zap        size={13} strokeWidth={2} /> },
  { label: "More",    id: "section-more",    icon: <MoreVertical       size={13} strokeWidth={2} /> },
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
  // Track whether this gesture has crossed the drag threshold
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
      if (Math.abs(vel) < 0.07) {
        setIsSpinning(false);
        return;
      }
      setRotation((r) => r + vel);
      spinRaf.current = requestAnimationFrame(step);
    };

    spinRaf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(spinRaf.current);
  }, [isSpinning]);

  /* ── Pointer handlers on the drag wrapper ─────────────────────────── */
  function handlePointerDown(e: PointerEvent<HTMLDivElement>): void {
    // Only capture on the wrapper itself, not on child buttons
    if ((e.target as HTMLElement).closest("button")) return;

    cancelAnimationFrame(spinRaf.current);
    setIsSpinning(false);

    const angle = angleBetween(originX, originY, e.clientX, e.clientY);

    dragStart.current = {
      angle,
      rotation,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    lastAngle.current = angle;
    lastTime.current = performance.now();
    angVelocity.current = 0;
    hasDragged.current = false;

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>): void {
    if (!isDragging || !dragStart.current) return;

    const dx = e.clientX - dragStart.current.clientX;
    const dy = e.clientY - dragStart.current.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > DRAG_THRESHOLD) {
      hasDragged.current = true;
    }

    const angle = angleBetween(originX, originY, e.clientX, e.clientY);
    setRotation(dragStart.current.rotation + (angle - dragStart.current.angle));

    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      angVelocity.current = ((angle - lastAngle.current) / dt) * 15;
    }

    lastAngle.current = angle;
    lastTime.current = now;
  }

  function handlePointerUp(): void {
    if (!isDragging) return;
    setIsDragging(false);
    dragStart.current = null;

    if (Math.abs(angVelocity.current) > 0.35) {
      setIsSpinning(true);
    }
  }

  /* ── Per-button pointer handlers (tap detection) ───────────────────── */
  function handleButtonPointerDown(e: PointerEvent<HTMLButtonElement>): void {
    // Stop propagation so the drag wrapper doesn't capture it
    e.stopPropagation();
    cancelAnimationFrame(spinRaf.current);
    setIsSpinning(false);

    dragStart.current = {
      angle: angleBetween(originX, originY, e.clientX, e.clientY),
      rotation,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    lastAngle.current = dragStart.current.angle;
    lastTime.current = performance.now();
    angVelocity.current = 0;
    hasDragged.current = false;

    setIsDragging(true);
    // Capture on the button so we get pointerup even if finger moves
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleButtonPointerMove(e: PointerEvent<HTMLButtonElement>): void {
    if (!dragStart.current) return;

    const dx = e.clientX - dragStart.current.clientX;
    const dy = e.clientY - dragStart.current.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > DRAG_THRESHOLD) {
      hasDragged.current = true;
    }

    // Rotate the whole wheel while dragging from a button too
    const angle = angleBetween(originX, originY, e.clientX, e.clientY);
    setRotation(dragStart.current.rotation + (angle - dragStart.current.angle));

    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      angVelocity.current = ((angle - lastAngle.current) / dt) * 15;
    }
    lastAngle.current = angle;
    lastTime.current = now;
  }

  function handleButtonPointerUp(
    e: PointerEvent<HTMLButtonElement>,
    sectionId: string
  ): void {
    e.stopPropagation();
    setIsDragging(false);
    dragStart.current = null;

    // Only navigate if this was a tap, not a drag
    if (!hasDragged.current) {
      onSelect(sectionId);
    } else if (Math.abs(angVelocity.current) > 0.35) {
      setIsSpinning(true);
    }
  }

  if (!isOpen) return null;

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(1,6,18,0.88)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };

  const ringCommon: CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    left: originX,
    top: originY,
  };

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(0,245,255,0.3)",
            pointerEvents: "none",
            animation: `navParticleDrift ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      {/* Outer ring */}
      <div
        style={{
          ...ringCommon,
          width: ORBIT_RADIUS * 2 + 96,
          height: ORBIT_RADIUS * 2 + 96,
          border: "1px solid rgba(0,245,255,0.16)",
          boxShadow: "0 0 48px rgba(0,245,255,0.06), inset 0 0 48px rgba(0,245,255,0.04)",
          transform: `translate(-50%,-50%) rotate(${rotation}deg)`,
        }}
      />

      {/* Inner ring */}
      <div
        style={{
          ...ringCommon,
          width: ORBIT_RADIUS * 2 - 44,
          height: ORBIT_RADIUS * 2 - 44,
          border: "1px solid rgba(0,245,255,0.07)",
          transform: `translate(-50%,-50%) rotate(${-rotation * 0.45}deg)`,
        }}
      />

      {/* Drag area wrapper — only handles drag on empty space */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "absolute",
          left: originX,
          top: originY,
          width: 0,
          height: 0,
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {NAV_SECTIONS.map((section, i) => {
          const baseAngle = (360 / ITEM_COUNT) * i - 90;
          const totalAngle = baseAngle + rotation;
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
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${entryScale})`,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                zIndex: Math.round(y) + 200,
                pointerEvents: "auto",
                touchAction: "manipulation",
                // Prevent text selection on long press mobile
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 100,
                  background: isActive ? "rgba(0,245,255,0.16)" : "rgba(2,16,34,0.8)",
                  border: `1.5px solid ${isActive ? "rgba(0,245,255,0.85)" : "rgba(0,245,255,0.22)"}`,
                  color: isActive ? "#00f5ff" : "rgba(190,230,255,0.88)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                  whiteSpace: "nowrap",
                  // Prevent callout on iOS long-press
                  WebkitTouchCallout: "none",
                }}
              >
                <span style={{ display: "flex", opacity: isActive ? 1 : 0.7 }}>
                  {section.icon}
                </span>
                {section.label}
                {isActive && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#00f5ff",
                    }}
                  />
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
        style={{
          position: "absolute",
          left: originX,
          top: originY,
          transform: "translate(-50%, -50%)",
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "rgba(0,245,255,0.1)",
          border: "1.5px solid rgba(0,245,255,0.7)",
          color: "#00f5ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10002,
        }}
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      {/* Hint */}
      <p
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(0,245,255,0.35)",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          margin: 0,
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

  /* Open menu */
  function openMenu(): void {
    if (!hamburgerRef.current) return;
    const rect = hamburgerRef.current.getBoundingClientRect();
    setMenuOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setMenuOpen(true);
  }

  /* 
   * FIX: Close menu first, then scroll after a short delay.
   * This ensures the body overflow:hidden is released before
   * scrollIntoView is called, so the scroll actually works.
   */
  function handleSelect(id: string): void {
    setActiveId(id);
    setMenuOpen(false);

    // Wait for the overlay to unmount and overflow to clear
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(2,8,24,0.84)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderBottom: "1px solid rgba(0,245,255,0.13)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {/* Logo */}
          <span
            style={{
              fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.24em",
              color: "#00f5ff",
              padding: "1rem 0",
            }}
          >
            AA
          </span>

          {/* Desktop links */}
          <div className="nav-desktop-links">
            {NAV_SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleDesktopClick(s.id)}
                  style={{
                    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                    fontSize:'13px',
                    background: "none",
                    border: "none",
                    color: isActive ? "#00f5ff" : "rgba(190,220,255,0.82)",
                    cursor: "pointer",
                    padding: "1rem 11px",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Mobile right */}
          <div className="nav-mobile-right">
            <span className="nav-mobile-active-label text-xs"
            style={{
                    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                    }}>{activeSection?.label}</span>
            <button
              ref={hamburgerRef}
              onClick={openMenu}
              aria-label="Open navigation menu"
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

        .nav-desktop-links {
          display: flex;
          align-items: center;
        }

        .nav-mobile-right {
          display: none;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 767px) {
          .nav-desktop-links  { display: none !important; }
          .nav-mobile-right   { display: flex !important; }
        }

        @media (min-width: 768px) {
          .nav-mobile-right { display: none !important; }
        }
      `}</style>
    </>
  );
}