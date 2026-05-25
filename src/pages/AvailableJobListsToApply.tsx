import { useState, useMemo } from "react";
import type { JobCircular } from "../services/careerDataTypes";
import { useCareerData } from "../hooks/useCareerData";
import useAuth from "../hooks/useAuth";
import MatrixLoader from "../components/MatrixLoader";

// ─── Types ────────────────────────────────────────────────────────────────────



// ─── Mock hook (replace with your real useCareerData hook) ────────────────────

// const {availableJobData} = useCareerData: JobCircular[]([]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysRemaining(applyEnds: string): number {
  const end = new Date(applyEnds);
  const today = new Date();
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeadlineStatus(days: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (days < 0)
    return { label: "Expired", color: "text-slate-400", bg: "bg-slate-800/60" };
  if (days <= 3)
    return { label: `${days}d left`, color: "text-red-400", bg: "bg-red-950/60" };
  if (days <= 7)
    return {
      label: `${days}d left`,
      color: "text-amber-400",
      bg: "bg-amber-950/60",
    };
  return {
    label: `${days}d left`,
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
  };
}

function getGradeLabel(grade: number): string {
  if (grade <= 9) return "Class I";
  if (grade <= 12) return "Class II";
  if (grade <= 16) return "Class III";
  return "Class IV";
}

function getGradeColor(grade: number): string {
  if (grade <= 3) return "text-violet-300 border-violet-700 bg-violet-950/50";
  if (grade <= 6) return "text-sky-300 border-sky-700 bg-sky-950/50";
  if (grade <= 10) return "text-teal-300 border-teal-700 bg-teal-950/50";
  return "text-slate-300 border-slate-600 bg-slate-800/50";
}

// Convert Google Drive share URL to embeddable preview URL
function toEmbedUrl(url: string): string {
  const match = url.match(/[?&]id=([^&]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  // If it's already a /file/d/ URL
  const match2 = url.match(/\/file\/d\/([^/]+)/);
  if (match2) {
    return `https://drive.google.com/file/d/${match2[1]}/preview`;
  }
  return url;
}

// ─── PDF Modal ────────────────────────────────────────────────────────────────

interface PdfModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

function PdfModal({ url, title, onClose }: PdfModalProps) {
  const embedUrl = toEmbedUrl(url);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(2,6,20,0.97)" }}
    >
      {/* Modal Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-slate-700/60"
        style={{ background: "#0d1629" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
            <svg
              className="w-4 h-4 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
              Circular Document
            </p>
            <p className="text-sm text-slate-200 font-semibold truncate">
              {title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 border border-indigo-700/50 bg-indigo-950/40 hover:bg-indigo-900/60 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open Original
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          title={title}
          allow="autoplay"
        />
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-700/40 p-5"
      style={{ background: "linear-gradient(135deg,#0f1c35 0%,#0d1424 100%)" }}
    >
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${accent}`}
      />
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl ${accent} bg-opacity-10 border border-white/10`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase mb-0.5">
            {label}
          </p>
          <p className="text-2xl font-black text-white leading-none">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AvailableJobListsToApply() {
  const { availableJobData, loading } = useCareerData();
  const {currentUserInfo} = useAuth();

  const GOOGLE_FORM_URL = 'https://forms.gle/8dDUXndbLcSTE1Bd9';

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof JobCircular>("ApplyEnds");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pdfModal, setPdfModal] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  // ── Statistics ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = availableJobData.length;
    const totalPosts = availableJobData.reduce(
      (s, j) => s + j.NumberOfPosts,
      0
    );
    const closingSoon = availableJobData.filter((j) => {
      const d = getDaysRemaining(j.ApplyEnds);
      return d >= 0 && d <= 7;
    }).length;
    const uniqueOrgs = new Set(availableJobData.map((j) => j.InstitutionName))
      .size;
    return { total, totalPosts, closingSoon, uniqueOrgs };
  }, [availableJobData]);

  // ── Filter + Sort ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let data = [...availableJobData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (j) =>
          j.InstitutionName.toLowerCase().includes(q) ||
          j.PostName.toLowerCase().includes(q)
      );
    }
    if (gradeFilter !== "all") {
      const grade = parseInt(gradeFilter);
      data = data.filter((j) => j.PositionGrade === grade);
    }
    data.sort((a, b) => {
      let av: string | number = a[sortField];
      let bv: string | number = b[sortField];
      if (sortField === "ApplyEnds" || sortField === "ApplyStart") {
        av = new Date(av as string).getTime();
        bv = new Date(bv as string).getTime();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [availableJobData, searchQuery, sortField, sortDir, gradeFilter]);

  function toggleSort(field: keyof JobCircular) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: keyof JobCircular }) {
    if (sortField !== field)
      return (
        <svg
          className="w-3 h-3 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    return sortDir === "asc" ? (
      <svg
        className="w-3 h-3 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if(loading){
    return <MatrixLoader />
  }
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, #1a2a4a 0%, #060d1a 60%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {pdfModal && (
        <PdfModal
          url={pdfModal.url}
          title={pdfModal.title}
          onClose={() => setPdfModal(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

       {/* ── Page Header ─────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            {/* Left — live indicator */}
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Live Circulars
              </span>
            </div>

            {/* Right — Add New Circular (admin / stakeholder only) */}
            {(currentUserInfo?.Role === import.meta.env.VITE_ASH_ADMIN_SECRET_ROLE) && (
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-300 border border-indigo-600/40 bg-indigo-950/30 hover:bg-indigo-900/50 hover:border-indigo-500/60 hover:text-indigo-200 transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Circular
                <svg
                  className="w-2.5 h-2.5 opacity-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          <h1
            className="text-4xl font-black text-white leading-tight mb-2"
            style={{ letterSpacing: "-0.02em" }}
          >
            Available Job Circulars
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Ongoing government job circulars you're eligible and interested to
            apply for. Sorted by deadline by default.
          </p>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            accent="bg-indigo-500"
            label="Total Circulars"
            value={stats.total}
            sub="Active openings"
            icon={
              <svg
                className="w-5 h-5 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
          <StatCard
            accent="bg-teal-500"
            label="Total Vacancies"
            value={stats.totalPosts.toLocaleString()}
            sub="Seats across all posts"
            icon={
              <svg
                className="w-5 h-5 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                />
              </svg>
            }
          />
          <StatCard
            accent="bg-amber-500"
            label="Closing Soon"
            value={stats.closingSoon}
            sub="Deadline within 7 days"
            icon={
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            accent="bg-rose-500"
            label="Organizations"
            value={stats.uniqueOrgs}
            sub="Unique institutions"
            icon={
              <svg
                className="w-5 h-5 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          />
        </div>

        {/* ── Filters Bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search institution or post name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 border border-slate-700/50 bg-slate-800/40 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800/70 transition-all"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-200 border border-slate-700/50 bg-slate-800/40 focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer"
          >
            <option value="all">All Grades</option>
            {[...new Set(availableJobData.map((j) => j.PositionGrade))]
              .sort((a, b) => a - b)
              .map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
          </select>

          {/* Result count */}
          <span
            className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-slate-700/40 bg-slate-800/30"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {filtered.length} / {availableJobData.length} circulars
          </span>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-slate-700/40 overflow-hidden"
          style={{ background: "linear-gradient(180deg,#0f1b30 0%,#0a1220 100%)" }}
        >
          {/* Scrollable wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {(
                    [
                      { label: "#", field: null },
                      { label: "Institution", field: "InstitutionName" },
                      { label: "Post Name", field: "PostName" },
                      { label: "Vacancies", field: "NumberOfPosts" },
                      { label: "Grade", field: "PositionGrade" },
                      { label: "Apply Window", field: "ApplyEnds" },
                      { label: "Deadline", field: "ApplyEnds" },
                      { label: "Circular", field: null },
                    ] as { label: string; field: keyof JobCircular | null }[]
                  ).map(({ label, field }, i) => (
                    <th
                      key={i}
                      onClick={field ? () => toggleSort(field) : undefined}
                      className={`px-5 py-4 text-left text-xs font-bold tracking-widest uppercase text-slate-500 whitespace-nowrap select-none ${
                        field
                          ? "cursor-pointer hover:text-slate-300 transition-colors"
                          : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {label}
                        {field && <SortIcon field={field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-slate-600 text-sm"
                    >
                      No circulars match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((job, idx) => {
                    const daysLeft = getDaysRemaining(job.ApplyEnds);
                    const deadline = getDeadlineStatus(daysLeft);
                    const gradeStyle = getGradeColor(job.PositionGrade);

                    return (
                      <tr
                        key={`${job.Timestamp}-${idx}`}
                        className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                          {String(idx + 1).padStart(2, "0")}
                        </td>

                        {/* Institution */}
                        <td className="px-5 py-4 max-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 font-bold text-xs">
                              {job.InstitutionName.split(" ")
                                .slice(0, 2)
                                .map((w) => w[0])
                                .join("")}
                            </span>
                            <span className="text-slate-200 font-semibold leading-tight text-xs">
                              {job.InstitutionName}
                            </span>
                          </div>
                        </td>

                        {/* Post Name */}
                        <td className="px-5 py-4 max-w-[220px]">
                          <span className="text-slate-300 font-medium leading-snug block">
                            {job.PostName}
                          </span>
                          <span
                            className="text-slate-400 text-xs mt-0.5 block"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Added{" "}
                            {new Date(job.Timestamp).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        </td>

                        {/* Vacancies */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950/50 border border-teal-800/40 text-teal-300 font-bold text-xs">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            {job.NumberOfPosts}
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex flex-col items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${gradeStyle}`}
                          >
                            <span>Gr. {job.PositionGrade}</span>
                            <span className="text-[9px] font-normal opacity-70">
                              {getGradeLabel(job.PositionGrade)}
                            </span>
                          </span>
                        </td>

                        {/* Apply Window */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div
                            className="text-xs text-slate-400"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            <span className="text-slate-500">
                              {new Date(job.ApplyStart).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short", year: "2-digit" }
                              )}
                            </span>
                            <span className="mx-1.5 text-slate-700">→</span>
                            <span className="text-slate-300">
                              {new Date(job.ApplyEnds).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short", year: "2-digit" }
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Deadline badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-transparent text-xs font-bold ${deadline.color} ${deadline.bg}`}
                          >
                            {daysLeft >= 0 && daysLeft <= 7 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            )}
                            {deadline.label}
                          </span>
                        </td>

                        {/* Circular PDF */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setPdfModal({
                                url: job.CircularFile,
                                title: `${job.InstitutionName} — ${job.PostName}`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 border border-indigo-700/40 bg-indigo-950/30 hover:bg-indigo-900/50 hover:border-indigo-600/60 transition-all group-hover:shadow-sm"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between">
            <p
              className="text-xs text-slate-600"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} shown
            </p>
            <p className="text-xs text-slate-700">
              Last synced: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-700">
          ASH initiative
         </p>
      </div>
    </div>
  );
}