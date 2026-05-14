import { useCareerData } from "../hooks/useCareerData";
import { useState } from "react";

type AcademicEntry = {
  Board: string;
  InstituteName: string;
  Level: string;
  MajorGroup: string;
  PassingYear: number;
  Registration: number | string;
  Result: number;
  ResultPublishDate: string;
  Roll: number | string;
  StudentID: string;
};

const LEVEL_ORDER = ["SSC", "HSC", "BSS", "MSS"];

const LEVEL_META: Record<string, { label: string; color: string; dim: string; bg: string; index: string }> = {
  SSC: { label: "Secondary School Certificate", color: "#c084fc", dim: "#c084fc30", bg: "#c084fc08", index: "01" },
  HSC: { label: "Higher Secondary Certificate", color: "#2dd4bf", dim: "#2dd4bf30", bg: "#2dd4bf08", index: "02" },
  BSS: { label: "Bachelor of Social Science",   color: "#60a5fa", dim: "#60a5fa30", bg: "#60a5fa08", index: "03" },
  MSS: { label: "Master of Social Science",     color: "#fb923c", dim: "#fb923c30", bg: "#fb923c08", index: "04" },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

function CopyChip({ label, value, accent, dim, bg }: {
  label: string; value: string; accent: string; dim: string; bg: string;
}) {
  const [copied, setCopied] = useState(false);
  const isEmpty = !value || value === "—" || value === "NA";

  const handleCopy = () => {
    if (isEmpty) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <button
      onClick={handleCopy}
      disabled={isEmpty}
      className="group relative flex flex-col justify-between rounded-xl p-4 border transition-all duration-300 text-left w-full h-full"
      style={{
        background: bg,
        borderColor: copied ? accent : dim,
        boxShadow: copied ? `0 0 18px ${dim}` : "none",
        cursor: isEmpty ? "default" : "pointer",
        opacity: isEmpty ? 0.4 : 1,
        transform: "scale(1)",
        transition: "transform 0.15s, border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={e => { if (!isEmpty) (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
    >
      <span className="text-[9px] tracking-[0.35em] uppercase font-bold block mb-2"
        style={{ color: accent + "88", fontFamily: "monospace" }}>
        {label}
      </span>
      <span className="text-white font-semibold leading-snug block text-sm"
        style={{ fontFamily: "'Courier New', monospace" }}>
        {value || "—"}
      </span>
      {!isEmpty && (
        <span className={`absolute top-3 right-3 transition-all duration-200 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}>
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </span>
      )}
      {!isEmpty && (
        <span className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500 rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      )}
    </button>
  );
}

const Education = () => {
  const { Academic } = useCareerData();

  const byLevel: Record<string, AcademicEntry> = {};
  (Academic as unknown as AcademicEntry[])?.forEach((e) => { byLevel[e.Level] = e; });

  const availableLevels = LEVEL_ORDER.filter((l) => byLevel[l]);
  const [activeTab, setActiveTab] = useState<string>(availableLevels[0] ?? "SSC");

  const data = byLevel[activeTab];
  const meta = LEVEL_META[activeTab];

  return (
    <section className="min-h-screen bg-black px-5 py-16 relative overflow-hidden">
      {/* Ambient glow top-right */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full blur-[160px] opacity-[0.07] transition-all duration-700"
        style={{ background: meta?.color }}
      />

      {/* Header */}
      <div className="relative mb-10">
        <p className="text-[10px] tracking-[0.45em] uppercase mb-1.5" style={{ color: meta?.color, fontFamily: "monospace" }}>
          Academic Record
        </p>
        <div className="flex items-end justify-between">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-none" style={{ fontFamily: "'Georgia', serif" }}>
            Education
          </h2>
          <span className="text-7xl font-black opacity-[0.05] leading-none select-none" style={{ color: meta?.color, fontFamily: "monospace" }}>
            {meta?.index}
          </span>
        </div>
        <div className="mt-4 h-px w-full" style={{ background: `linear-gradient(90deg, ${meta?.color}50, transparent)` }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-8 flex-wrap">
        {availableLevels.map((level) => {
          const m = LEVEL_META[level];
          const isActive = level === activeTab;
          return (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className="px-5 py-2 rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 border"
              style={{
                fontFamily: "monospace",
                color: isActive ? "#000" : m.color + "99",
                background: isActive ? m.color : "transparent",
                borderColor: isActive ? m.color : m.dim,
              }}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* ── Bento Grid Panel ── */}
      {data && meta && (
        <div key={activeTab} style={{ animation: "fadeUp 0.32s ease forwards" }}>

          {/* Row 1: Institute (wide) + GPA (tall accent) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">

            {/* Institute — spans 2 cols */}
            <div
              className="col-span-2 relative rounded-2xl p-5 border overflow-hidden flex flex-col justify-between"
              style={{ background: meta.bg, borderColor: meta.dim, minHeight: "150px" }}
            >
              {/* Watermark */}
              <span
                className="absolute -bottom-5 -right-2 text-[90px] font-black leading-none select-none pointer-events-none"
                style={{ color: meta.color + "07", fontFamily: "monospace" }}
              >
                {activeTab}
              </span>
              <p className="text-[9px] tracking-[0.35em] uppercase font-bold mb-2"
                style={{ color: meta.color + "80", fontFamily: "monospace" }}>
                Institution
              </p>
              <div>
                <p className="text-white text-base md:text-lg font-bold leading-snug pr-6"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {data.InstituteName}
                </p>
                <p className="text-xs mt-2" style={{ color: meta.color + "60" }}>{meta.label}</p>
              </div>
              {/* copy btn */}
              <button
                onClick={() => navigator.clipboard.writeText(data.InstituteName)}
                className="absolute top-4 right-4 opacity-30 hover:opacity-90 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: meta.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>

            {/* GPA hero tile */}
            <div
              className="col-span-1 rounded-2xl border flex flex-col items-center justify-center gap-1 relative overflow-hidden"
              style={{ background: meta.color + "12", borderColor: meta.dim, minHeight: "150px" }}
            >
              <span className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: meta.color + "80", fontFamily: "monospace" }}>
                GPA
              </span>
              <span
                className="text-2xl md:text-6xl font-black leading-none"
                style={{ color: meta.color, fontFamily: "monospace", textShadow: `0 0 40px ${meta.color}50` }}
              >
                {data.Result}
              </span>
              <span className="text-[9px] text-zinc-600 tracking-widest uppercase mt-0.5">Result</span>
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 50% 70%, ${meta.color}25, transparent 70%)` }}
              />
            </div>
          </div>

          {/* Row 2: Board | Group | Passing Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <CopyChip label="Board"        value={data.Board}            accent={meta.color} dim={meta.dim} bg={meta.bg} />
            <CopyChip label="Major / Group" value={data.MajorGroup}      accent={meta.color} dim={meta.dim} bg={meta.bg} />
            <CopyChip label="Passing Year" value={String(data.PassingYear)} accent={meta.color} dim={meta.dim} bg={meta.bg} />
          </div>

          {/* Row 3: Roll (wide) | Registration */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <CopyChip label="Roll No."     value={String(data.Roll)}         accent={meta.color} dim={meta.dim} bg={meta.bg} />
            <CopyChip label="Registration" value={String(data.Registration)} accent={meta.color} dim={meta.dim} bg={meta.bg} />
          </div>

          {/* Row 4: Date | Student ID | decorative year block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <CopyChip label="Result Published" value={formatDate(data.ResultPublishDate)} accent={meta.color} dim={meta.dim} bg={meta.bg} />
            <CopyChip label="Student ID"       value={data.StudentID === "NA" ? "—" : data.StudentID} accent={meta.color} dim={meta.dim} bg={meta.bg} />
            {/* Decorative year tile */}
            <div
              className="rounded-xl border flex items-center justify-center"
              style={{ borderColor: meta.dim, background: meta.bg, minHeight: "80px" }}
            >
              <span className="text-3xl font-black select-none" style={{ color: meta.color + "22", fontFamily: "monospace" }}>
                {data.PassingYear}
              </span>
            </div>
          </div>

          <p className="mt-5 text-[10px] text-zinc-700 tracking-widest uppercase text-right">
            Click any tile to copy ↗
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Education;