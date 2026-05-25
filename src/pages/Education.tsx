import { useCareerData } from "../hooks/useCareerData";
import { useState, useEffect } from "react";

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

const LEVEL_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  SSC: { label: "Secondary School Certificate", color: "#7F77DD", bg: "#7F77DD12", border: "#7F77DD40" },
  HSC: { label: "Higher Secondary Certificate", color: "#1D9E75", bg: "#1D9E7512", border: "#1D9E7540" },
  BSS: { label: "Bachelor of Social Science",   color: "#378ADD", bg: "#378ADD12", border: "#378ADD40" },
  MSS: { label: "Master of Social Science",     color: "#D85A30", bg: "#D85A3012", border: "#D85A3040" },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value || value === "NA") return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1700);
    });
  };
  return { copied, copy };
}

function FieldCard({ label, value, raw, accentColor, accentBg, accentBorder }: {
  label: string; value: string; raw: string;
  accentColor: string; accentBg: string; accentBorder: string;
}) {
  const isEmpty = !raw || raw === "NA" || value === "—";
  const { copied, copy } = useCopy(raw);

  return (
    <div
      onClick={!isEmpty ? copy : undefined}
      className="relative flex flex-col justify-between rounded-xl p-3.5 border overflow-hidden transition-all duration-150"
      style={{
        background: copied ? accentBg : "transparent",
        borderColor: copied ? accentColor : accentBorder,
        cursor: isEmpty ? "default" : "pointer",
        opacity: isEmpty ? 0.4 : 1,
        minHeight: "72px",
      }}
    >
      <p className="text-[10px] tracking-[0.2em] uppercase font-mono mb-1.5"
        style={{ color: accentColor + "90" }}>
        {label}
      </p>
      <p className="text-sm font-medium leading-snug break-words font-mono"
        style={{ color: copied ? accentColor : "white" }}>
        {value}
      </p>

      {/* Copy icon — top right */}
      {!isEmpty && (
        <span className={`absolute top-2.5 right-2.5 transition-all duration-150 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
          style={{ color: copied ? accentColor : "#6b7280" }}>
          {copied ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </span>
      )}

      {/* Bottom accent bar */}
      {!isEmpty && (
        <div
          className={`absolute bottom-0 left-0 h-[2px] transition-all duration-400 ${copied ? "w-full" : "w-0"}`}
          style={{ background: accentColor }}
        />
      )}
    </div>
  );
}

const Education = () => {
  const { Academic } = useCareerData();
  const [activeTab, setActiveTab] = useState<string>("");
  const [visible, setVisible] = useState(false);

  const byLevel: Record<string, AcademicEntry> = {};
  (Academic as unknown as AcademicEntry[])?.forEach((e) => { byLevel[e.Level] = e; });
  const availableLevels = LEVEL_ORDER.filter((l) => byLevel[l]);

  useEffect(() => {
    const tabChangingHelper = () => {

      if (!activeTab && availableLevels.length) setActiveTab(availableLevels[0]);
    }
    tabChangingHelper();
  }, [availableLevels, activeTab]);

  const switchTab = (level: string) => {
    setVisible(false);
    setTimeout(() => { setActiveTab(level); setVisible(true); }, 140);
  };

  useEffect(() => {
    if (activeTab) { requestAnimationFrame(() => setVisible(true)); }
  }, [activeTab]);

  const data = byLevel[activeTab];
  const meta = LEVEL_META[activeTab];

  const fields = data ? [
    { label: "Board",            value: data.Board,                        raw: data.Board },
    { label: "Group / Major",    value: data.MajorGroup,                   raw: data.MajorGroup },
    { label: "Passing year",     value: String(data.PassingYear),          raw: String(data.PassingYear) },
    { label: "Roll no.",         value: String(data.Roll),                 raw: String(data.Roll) },
    { label: "Registration",     value: String(data.Registration),         raw: String(data.Registration) },
    { label: "Result published", value: formatDate(data.ResultPublishDate), raw: formatDate(data.ResultPublishDate) },
    { label: "Student ID",       value: data.StudentID === "NA" ? "—" : data.StudentID, raw: data.StudentID },
  ] : [];

  const { copied: instCopied, copy: copyInst } = useCopy(data?.InstituteName ?? "");

  return (
    <section className="min-h-screen bg-black px-2 lg:px-4 py-14 font-mono">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: meta?.color }}>
          Academic record
        </p>
        <h2 className="text-4xl font-bold text-white leading-none">Education</h2>
        <div className="mt-4 h-px w-full" style={{ background: `linear-gradient(90deg, ${meta?.color}50, transparent)` }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {availableLevels.map((level) => {
          const m = LEVEL_META[level];
          const isActive = level === activeTab;
          return (
            <button
              key={level}
              onClick={() => switchTab(level)}
              className="px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-[0.15em] uppercase border transition-all duration-200"
              style={{
                background: isActive ? m.color : "transparent",
                color: isActive ? "#000" : m.color + "90",
                borderColor: isActive ? m.color : m.border,
              }}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* Panel with fade-slide transition */}
      {data && meta && (
        <div
          className="transition-all duration-200"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)" }}
        >
          {/* Hero row: Institution + GPA */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: "1fr 84px" }}>
            {/* Institution card — clickable */}
            <div
              onClick={copyInst}
              className="group relative rounded-xl p-4 border overflow-hidden cursor-pointer transition-all duration-150"
              style={{
                background: instCopied ? meta.bg : "transparent",
                borderColor: instCopied ? meta.color : meta.border,
              }}
            >
              <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: meta.color + "80" }}>
                Institution
              </p>
              <p className="text-sm font-semibold text-white leading-snug pr-6">{data.InstituteName}</p>
              <p className="text-[11px] mt-1" style={{ color: meta.color + "60" }}>{meta.label}</p>
              {/* Copy icon */}
              <span className={`absolute top-3 right-3 text-sm transition-all duration-150 ${instCopied ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                style={{ color: instCopied ? meta.color : "#6b7280" }}>
                {instCopied ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </span>
              <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-400 ${instCopied ? "w-full" : "w-0"}`}
                style={{ background: meta.color }} />
            </div>

            {/* GPA tile */}
            <div
              className="rounded-xl border flex flex-col items-center justify-center gap-0.5"
              style={{ background: meta.bg, borderColor: meta.border }}
            >
              <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: meta.color + "80" }}>GPA</span>
              <span className="text-2xl font-bold leading-none" style={{ color: meta.color }}>
                {data.Result.toFixed(2)}
              </span>
              <span className="text-[9px] tracking-widest uppercase text-zinc-600">Result</span>
            </div>
          </div>

          {/* Field grid — 2 columns on all screens */}
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f, i) => (
              <FieldCard
                key={i}
                label={f.label}
                value={f.value}
                raw={f.raw}
                accentColor={meta.color}
                accentBg={meta.bg}
                accentBorder={meta.border}
              />
            ))}
          </div>

          <p className="mt-4 text-[10px] text-zinc-700 tracking-widest uppercase text-right">
            Click any card to copy ↗
          </p>
        </div>
      )}
    </section>
  );
};

export default Education;