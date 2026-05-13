import { useEffect, useRef, useState } from "react";

// ── Utilities ────────────────────────────────────────────────────────────────

function r(from: number, to: number): number {
  return ~~(Math.random() * (to - from + 1) + from);
}

function pick<T>(...args: T[]): T {
  return args[r(0, args.length - 1)];
}

function getChar(): string {
  return String.fromCharCode(
    pick(r(0, 1), r(1, 0), r(1, 1))
  );
}

function loop(fn: () => void, delay: number): () => void {
  let stamp = Date.now();
  let rafId: number;
  function _loop() {
    if (Date.now() - stamp >= delay) {
      fn();
      stamp = Date.now();
    }
    rafId = requestAnimationFrame(_loop);
  }
  rafId = requestAnimationFrame(_loop);
  return () => cancelAnimationFrame(rafId);
}

// ── Core Classes ─────────────────────────────────────────────────────────────

class Char {
  element: HTMLSpanElement;
  private cleanup?: () => void;

  constructor() {
    this.element = document.createElement("span");
    this.mutate();
  }

  mutate() {
    this.element.textContent = getChar();
  }

  startMutating() {
    this.cleanup = loop(() => this.mutate(), r(1e3, 5e3));
  }

  destroy() {
    this.cleanup?.();
  }
}

class Trail {
  list: Char[];
  body: (Char | undefined)[];
  options: { size: number; offset: number };

  constructor(list: Char[] = [], options?: Partial<{ size: number; offset: number }>) {
    this.list = list;
    this.options = Object.assign({ size: 10, offset: 0 }, options);
    this.body = [];
    this.move();
  }

  traverse(fn: (c: Char, i: number, last: boolean) => void) {
    this.body.forEach((n, i) => {
      const last = i === this.body.length - 1;
      if (n) fn(n, i, last);
    });
  }

  move() {
    this.body = [];
    const { offset, size } = this.options;
    for (let i = 0; i < size; ++i) {
      const item = this.list[offset + i - size + 1];
      this.body.push(item);
    }
    this.options.offset = (offset + 1) % (this.list.length + size - 1);
  }
}

class Rain {
  element: HTMLParagraphElement;
  trail!: Trail;
  chars: Char[] = [];
  private cleanups: (() => void)[] = [];

  constructor(target: HTMLElement, row: number) {
    this.element = document.createElement("p");
    this.element.style.cssText = "line-height:1;margin:0;";
    this.build(row);
    target.appendChild(this.element);
    this.drop();
  }

  build(row = 20) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < row; ++i) {
      const c = new Char();
      c.element.style.cssText =
        "display:block;width:2vmax;height:2vmax;font-size:2vmax;" +
        'color:#9bff9b11;text-align:center;font-family:"sans-serif;';
      frag.appendChild(c.element);
      this.chars.push(c);
      if (Math.random() < 0.5) c.startMutating();
    }
    this.trail = new Trail(this.chars, { size: r(10, 30), offset: r(0, 100) });
    this.element.appendChild(frag);
  }

  drop() {
    const trail = this.trail;
    const len = trail.body.length;
    const delay = r(10, 100);
    const stop = loop(() => {
      trail.move();
      trail.traverse((c, i, last) => {
        if (last) {
          c.mutate();
          c.element.style.cssText =
            'display:block;width:2vmax;height:2vmax;font-size:2vmax;text-align:center;font-family:"Helvetica Neue",Helvetica,sans-serif;' +
            "color:hsl(136,100%,85%);text-shadow:0 0 .5em #fff,0 0 .5em currentColor;";
        } else {
          const lightness = (85 / len) * (i + 1);
          c.element.style.cssText =
            'display:block;width:2vmax;height:2vmax;font-size:2vmax;text-align:center;font-family:"Helvetica Neue",Helvetica,sans-serif;' +
            `color:hsl(136,100%,${lightness}%);`;
        }
      });
    }, delay);
    this.cleanups.push(stop);
  }

  destroy() {
    this.cleanups.forEach((fn) => fn());
    this.chars.forEach((c) => c.destroy());
    this.element.remove();
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface MatrixLoaderProps {
  /** Whether to show the loader */
  visible?: boolean;
  /** Text shown in the centre card */
  label?: string;
  /** Number of rain columns (default 50) */
  columns?: number;
  /** Rows per column (default 50) */
  rows?: number;
  /** Called when the dismiss button is clicked */
  onDismiss?: () => void;
}

export default function MatrixLoader({
  visible = true,
  label = "Loading…",
  columns = 50,
  rows = 50,
  onDismiss,
}: MatrixLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rainsRef = useRef<Rain[]>([]);
  const [show, setShow] = useState(visible);
  const [fadeOut, setFadeOut] = useState(false);

  // Spin up / tear down rain columns whenever visibility changes
  useEffect(() => {
    const dismissalErrorFunc = () => {

        if (!visible) {
          setFadeOut(true);
          const t = setTimeout(() => setShow(false), 600);
          return () => clearTimeout(t);
        } else {
          setFadeOut(false);
          setShow(true);
        }
    }
    dismissalErrorFunc();
  }, [visible]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !show) return;

    // Clear any previous runs
    rainsRef.current.forEach((r) => r.destroy());
    rainsRef.current = [];

    for (let i = 0; i < columns; i++) {
      rainsRef.current.push(new Rain(el, rows));
    }

    return () => {
      rainsRef.current.forEach((r) => r.destroy());
      rainsRef.current = [];
    };
  }, [show, columns, rows]);

  if (!show) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black
        transition-opacity duration-500
        ${fadeOut ? "opacity-0" : "opacity-100"}
      `}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      {/* Rain canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex overflow-hidden"
        aria-hidden="true"
      />

      {/* Centre card */}
      <div
        className="
          relative z-10 flex flex-col items-center gap-4
          rounded-2xl border border-green-500/20
          bg-black/70 px-10 py-8 shadow-[0_0_60px_rgba(0,255,70,0.15)]
          backdrop-blur-sm
        "
      >
        {/* Animated ring */}
        <span className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-20" />
          <svg
            className="h-14 w-14 animate-spin"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="rgba(74,222,128,0.15)"
              strokeWidth="4"
            />
            <path
              d="M28 4a24 24 0 0 1 24 24"
              stroke="#4ade80"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <p
          className="
            font-mono text-base font-semibold tracking-widest text-green-400
            [text-shadow:0_0_.5em_#4ade80]
          "
        >
          {label}
        </p>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="
              mt-1 rounded border border-green-500/30 px-4 py-1
              font-mono text-xs text-green-500/70
              transition hover:border-green-400 hover:text-green-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
            "
          >
            dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// ── Demo wrapper (remove in production) ──────────────────────────────────────

export function MatrixLoaderDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="h-screen w-screen bg-black">
      <MatrixLoader
        visible={loading}
        label="Initialising system…"
        onDismiss={() => setLoading(false)}
      />
      {!loading && (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="font-mono text-green-400 [text-shadow:0_0_.5em_#4ade80]">
            System ready.
          </p>
          <button
            onClick={() => setLoading(true)}
            className="rounded border border-green-500/40 px-6 py-2 font-mono text-sm text-green-400 hover:border-green-300 hover:text-green-200 transition"
          >
            reload
          </button>
        </div>
      )}
    </div>
  );
}