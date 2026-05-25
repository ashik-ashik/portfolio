import { useState, useMemo } from "react";
import { useCareerData } from "../hooks/useCareerData";
import type { CertificatesRow } from "../services/careerDataTypes";

interface Certificate {
  Description: string;
  Duration: string;
  FileId: string;
  Institute: string;
  Title: string;
  Topics: string;
  Year: number;
}

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-all duration-200
        bg-slate-700 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-600 hover:border-amber-500/50"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy
        </>
      )}
    </button>
  );
};

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-wrap items-start gap-1 py-2 border-b border-slate-700/50 last:border-0">
    <span className="text-xs uppercase tracking-widest text-slate-500 w-24 shrink-0 pt-0.5 font-semibold">
      {label}
    </span>

    <span className="text-slate-200 text-sm flex-1 leading-relaxed break-words">
      {value}
    </span>

    <CopyButton value={value} label={label} />
  </div>
);


import { createPortal } from "react-dom";

const CertificateModal = ({cert,
  onClose,
}: {
  cert: Certificate;
  onClose: () => void;
}) => {
  const driveImageUrl = `https://drive.google.com/file/d/${cert.FileId}/preview`;

  const modalContent = (  
      <div
      className="fixed inset-0 z-[99999] w-full h-[100vh] bg-black/90 backdrop-blur-md flex justify-center items-center"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl
          bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          bg-slate-900/95 backdrop-blur border-b border-slate-700/60"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />

            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Certificate Preview
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
              hover:text-white hover:bg-slate-700 transition-all duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800 aspect-[4/3]">
            <iframe
              src={driveImageUrl}
              className="w-full h-full"
              allow="autoplay"
              title={cert.Title}
            />
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4 space-y-0.5">
            <DataRow label="Title" value={cert.Title} />
            <DataRow label="Institute" value={cert.Institute} />
            <DataRow label="Year" value={String(cert.Year)} />
            <DataRow label="Duration" value={cert.Duration} />
            <DataRow label="Topics" value={cert.Topics} />
            <DataRow label="Description" value={cert.Description} />
            <DataRow label="File ID" value={cert.FileId} />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    modalContent,
    document.getElementById("modal-root")!
  );
};



const CertificateCard = ({
  cert,
  index,
  onOpen,
}: {
  cert: Certificate;
  index: number;
  onOpen: () => void;
}) => {
  const topicList = cert.Topics
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div
      className="group relative rounded-2xl border border-slate-700/60 bg-slate-800/50
        hover:border-amber-500/40 hover:bg-slate-800/80 transition-all duration-300
        overflow-hidden cursor-pointer"
      onClick={onOpen}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none"
      />

      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/70 via-amber-300/40 to-transparent" />

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-snug group-hover:text-amber-100 transition-colors">
              {cert.Title}
            </h3>

            <p className="text-amber-400/80 text-sm font-medium">
              {cert.Institute}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20
              px-2.5 py-1 rounded-full"
            >
              {cert.Year}
            </span>

            <span className="text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full">
              {cert.Duration}
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
          {cert.Description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {topicList.slice(0, 5).map((topic, idx) => (
            <span
              key={`${topic}-${idx}`}
              className="text-xs px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300
                border border-slate-600/50"
            >
              {topic}
            </span>
          ))}

          {topicList.length > 5 && (
            <span
              className="text-xs px-2 py-0.5 rounded-md bg-slate-700/40 text-slate-500
                border border-slate-600/30"
            >
              +{topicList.length - 5} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
          <span className="text-xs text-slate-500 font-mono">
            ID: {cert.FileId.slice(0, 12)}…
          </span>

          <span
            className="text-xs text-amber-400/70 group-hover:text-amber-400 transition-colors
            flex items-center gap-1 font-medium"
          >
            View Certificate

            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

const Certifications = () => {
  const { Certificates } = useCareerData();

  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Normalize data
  const certs: Certificate[] = useMemo(() => {
    const raw = Certificates;

    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return [];
    }

    return (raw as CertificatesRow[]).map((c) => ({
      Description: String(c.Description ?? "").trim(),
      Duration: String(c.Duration ?? "").trim(),
      FileId: String(c.FileId ?? "").trim(),
      Institute: String(c.Institute ?? "").trim(),
      Title: String(c.Title ?? "").trim(),
      Topics: String(c.Topics ?? "").trim(),
      Year: Number(c.Year) || 0,
    }));
  }, [Certificates]);

  // Perfect filtering
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/\s+/g, " ");

    if (!q) return certs;

    return certs.filter((c) => {
      const searchable = [
        c.Title,
        c.Institute,
        c.Topics,
        String(c.Year),
      ]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, " ");

      return searchable.includes(q);
    });
  }, [certs, search]);

  return (
    <section className="min-h-screen bg-slate-950 px-1 lg:px-4 py-12 font-sans">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 rounded-full bg-amber-400" />

          <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
            Professional Development
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Certifications
        </h1>

        <p className="text-slate-400 text-sm">
          {certs.length} certificate{certs.length !== 1 ? "s" : ""} earned
        </p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search by title, institute, topic, description, or year…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60
              text-slate-200 placeholder-slate-500 text-sm focus:outline-none
              focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {search && (
          <p className="mt-2 text-xs text-slate-500 pl-1">
            {filtered.length} result
            {filtered.length !== 1 ? "s" : ""} for “{search}”
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((cert, i) => (
              <CertificateCard
                key={`${cert.FileId}-${cert.Title}-${cert.Year}-${i}`}
                cert={cert}
                index={i}
                onOpen={() => setSelectedCert(cert)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="text-slate-500 text-sm">
              No certificates match your search.
            </p>

            <button
              onClick={() => setSearch("")}
              className="text-amber-400 text-xs hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCert && (
        <CertificateModal
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </section>
  );
};

export default Certifications;