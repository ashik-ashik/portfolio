import { useCareerData } from "../hooks/useCareerData";
import { useState } from "react";

function formatValue(value: string): string {
  // Detect ISO date strings like "1990-05-12T00:00:00.000Z"
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return value;
}

const PersonalInfo = () => {
  const { Personal } = useCareerData();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    });
  };

  return (
    <section className="min-h-screen bg-black px-2 lg:px-6 py-16 font-mono">
      {/* Header */}
      <div className="mb-12 relative">
        <p className="text-[11px] tracking-[0.35em] text-zinc-500 uppercase mb-2">
          — Profile
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none">
          <span className="text-white">Personal </span>
          <span className="text-zinc-600">Info</span>
        </h2>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px w-10 bg-zinc-700" />
          <div className="h-px w-3 bg-zinc-600" />
          <div className="h-1 w-1 rounded-full bg-zinc-500" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden">
        {Personal?.map(
          (item: { Title: string; Information: string }, index: number) => {
            const isCopied = copiedIndex === index;
            const displayValue = formatValue(item.Information);

            return (
              <div
                key={index}
                onClick={() => handleCopy(item.Information, index)}
                className={`group relative bg-black px-6 py-6 cursor-pointer select-none transition-colors duration-200 overflow-hidden
                  ${isCopied ? "bg-zinc-900" : "hover:bg-zinc-900"}`}
              >
                {/* Index badge — hidden when copied */}
                {!isCopied && (
                  <span className="absolute top-4 right-4 text-[10px] text-zinc-600 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}

                {/* Copied badge */}
                {isCopied && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] tracking-widest uppercase font-semibold text-emerald-400 bg-emerald-950 border border-emerald-800 rounded-md px-2 py-0.5">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </span>
                )}

                {/* Title */}
                <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 mb-2 group-hover:text-zinc-400 transition-colors">
                  {item.Title}
                </p>

                {/* Value */}
                <p
                  className="text-white text-base md:text-lg font-medium leading-snug break-words pr-2"
                  style={{ fontFamily: "'Orbitron', serif" }}
                >
                  {displayValue}
                </p>

                {/* Bottom progress bar */}
                <div
                  className={`absolute bottom-0 left-0 h-[2px] transition-all duration-500
                    ${isCopied
                      ? "w-full bg-emerald-500"
                      : "w-0 group-hover:w-2/5 bg-gradient-to-r from-zinc-400 to-transparent"
                    }`}
                />
              </div>
            );
          }
        )}
      </div>

      <p className="mt-6 text-[11px] text-zinc-700 tracking-widest uppercase text-right">
        Click any card to copy ↗
      </p>
    </section>
  );
};

export default PersonalInfo;