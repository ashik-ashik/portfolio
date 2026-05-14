import { useCareerData } from "../hooks/useCareerData";
import { useState } from "react";

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
    <section className="min-h-screen bg-black px-6 py-16 font-mono">
      {/* Header */}
      <div className="mb-14 relative">
        <p className="text-xs tracking-[0.35em] text-zinc-400 uppercase mb-2">
          — Profile
        </p>
        <h2
          className="text-lg md:text-5xl font-bold tracking-tight leading-none"
          style={{
            background: "linear-gradient(135deg, #ffffff 40%, #555 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Personal Info
        </h2>

        {/* Decorative line */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px w-12 bg-zinc-700" />
          <div className="h-px w-3 bg-zinc-500" />
          <div className="h-1 w-1 rounded-full bg-zinc-400" />
        </div>
      </div>

      {/* Grid of info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden">
        {Personal?.map(
          (
            item: { Title: string; Information: string },
            index: number
          ) => (
            <div
              key={index}
              className="group relative bg-black px-6 py-6 hover:bg-zinc-900 transition-colors duration-300 cursor-default"
            >
              {/* Index badge */}
              <span className="absolute top-4 right-4 text-[10px] text-zinc-500 tabular-nums group-hover:text-zinc-500 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Title */}
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-300 mb-2 group-hover:text-zinc-400 transition-colors">
                {item.Title}
              </p>

              {/* Information + Copy */}
              <div className="flex items-start justify-between gap-3">
                <p
                  className="text-white text-base md:text-lg font-medium leading-snug break-words max-w-[80%] select-text"
                  style={{ fontFamily: "'Orbitron', serif" }}
                >
                  {item.Information}
                </p>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(item.Information, index)}
                  title="Copy"
                  className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100"
                >
                  {copiedIndex === index ? (
                    /* Checkmark */
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold tracking-wide">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : (
                    /* Copy icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-zinc-500 hover:text-zinc-200 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Bottom accent bar on hover */}
              <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-gradient-to-r from-zinc-400 to-transparent transition-all duration-500" />
            </div>
          )
        )}
      </div>

      {/* Footer label */}
      <p className="mt-8 text-xs text-zinc-700 tracking-widest uppercase text-right">
        Hover any card to copy ↗
      </p>
    </section>
  );
};

export default PersonalInfo;