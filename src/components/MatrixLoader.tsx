import { useState, useEffect } from "react";

const LABELS = ["initialising", "loading modules", "connecting", "decrypting", "almost ready"];

const BARS = [2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2];

export default function MatrixLoader({ visible = true }) {
  const [labelIndex, setLabelIndex] = useState(0);
  const [show, setShow] = useState(visible);
  const [fading, setFading] = useState(false);
  const onDismiss = () => {}

  useEffect(() => {
    const callthisF = () => {
      if (!visible) {
      setFading(true);
      const t = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(t);
    } else {
      setShow(true);
      setFading(false);
    }
    }
    callthisF()
  }, [visible]);

  useEffect(() => {
    const t = setInterval(() => {
      setLabelIndex((i) => (i + 1) % LABELS.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8">

        {/* Bar waveform */}
        <div className="flex items-end gap-1 h-12">
          {BARS.map((h, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-green-500"
              style={{
                height: `${h * 6}px`,
                opacity: 0.3 + (h / 7) * 0.7,
                animation: `barPulse 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        {/* Spinner */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-2 rounded-full bg-green-500/10 animate-ping" />
          <svg
            className="absolute inset-0 w-14 h-14 animate-spin"
            viewBox="0 0 56 56"
            fill="none"
          >
            <circle cx="28" cy="28" r="22" stroke="rgba(34,197,94,0.1)" strokeWidth="2.5" />
            <path
              d="M28 6a22 22 0 0 1 22 22"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-green-500 font-mono text-xs select-none">◈</span>
        </div>

        {/* Label */}
        <div className="flex items-center gap-1.5 h-5 overflow-hidden">
          <p
            key={labelIndex}
            className="font-mono text-xs tracking-[0.2em] text-green-500 lowercase animate-fadeUp"
          >
            {LABELS[labelIndex]}
          </p>
          <span className="w-0.5 h-3.5 bg-green-500 animate-blink" />
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-2 font-mono text-[11px] tracking-widest text-green-500/50 border border-green-500/20 rounded px-4 py-1.5 hover:text-green-400 hover:border-green-500/50 transition-all duration-200"
          >
            dismiss
          </button>
        )}
      </div>

      <style>{`
        @keyframes barPulse {
          0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
          50%       { transform: scaleY(1);   opacity: 1; }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-blink   { animation: blink 0.9s step-start infinite; }
        .animate-fadeUp  { animation: fadeUp 0.3s ease both; }
      `}</style>
    </div>
  );
}


// ── Demo ─────────────────────────────────────────────────────────────────────

export function MatrixLoaderDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="h-screen w-screen bg-black">
      <MatrixLoader />

      {!loading && (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="font-mono text-sm tracking-widest text-green-500">
            system ready.
          </p>
          <button
            onClick={() => setLoading(true)}
            className="font-mono text-xs tracking-widest text-green-500/60 border border-green-500/25 rounded px-5 py-2 hover:text-green-400 hover:border-green-500/50 transition-all duration-200"
          >
            reload
          </button>
        </div>
      )}
    </div>
  );
}