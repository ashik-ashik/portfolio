import { useState, useMemo } from "react";
import type { JobCircular } from "../services/careerDataTypes";
import { useCareerData } from "../hooks/useCareerData";
import useAuth from "../hooks/useAuth";
import MatrixLoader from "../components/MatrixLoader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysRemaining(applyEnds: string): number {
  const end = new Date(applyEnds);
  const today = new Date();

  return Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDeadlineStatus(days: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (days < 0)
    return {
      label: "Expired",
      color: "text-slate-400",
      bg: "bg-slate-800/60",
    };

  if (days <= 3)
    return {
      label: `${days}d left`,
      color: "text-red-400",
      bg: "bg-red-950/60",
    };

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
  if (grade <= 3)
    return "text-violet-300 border-violet-700 bg-violet-950/50";

  if (grade <= 6)
    return "text-sky-300 border-sky-700 bg-sky-950/50";

  if (grade <= 10)
    return "text-teal-300 border-teal-700 bg-teal-950/50";

  return "text-slate-300 border-slate-600 bg-slate-800/50";
}

function toEmbedUrl(url: string): string {
  const match = url.match(/[?&]id=([^&]+)/);

  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

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
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-3 sm:px-6 py-3 border-b border-slate-700/60"
        style={{ background: "#0d1629" }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 shrink-0">
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
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-widest uppercase">
              Circular Document
            </p>

            <p className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 border border-indigo-700/50 bg-indigo-950/40 hover:bg-indigo-900/60 transition-colors"
          >
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

      {/* Viewer */}
      <div className="flex-1">
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

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-700/40 p-4 sm:p-5"
      style={{
        background:
          "linear-gradient(135deg,#0f1c35 0%,#0d1424 100%)",
      }}
    >
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${accent}`}
      />

      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl ${accent} bg-opacity-10 border border-white/10`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-widest uppercase mb-1">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-black text-white leading-none break-words">
            {value}
          </p>

          {sub && (
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Career = {
  SL?: string;
  Institute?: string;
  Position?: string;
  UserID?: string;
  Password?: string;
  Posts?: string;
  ApplyDate?: string;
  /** "Done" | "Future" */
  ExamStatus?: string;
  /** "Qualified" | "Unqualified" | "Not Attaint" | "↔" | "" */
  Preliminary?: string;
  /** "↔" | "" */
  Written?: string;
  /** "Unqualified" | "" */
  Viva?: string;
};
export default function AvailableJobListsToApply() {
  const { availableJobData, careerData, loading } = useCareerData();
  const { currentUserInfo } = useAuth();

  const GOOGLE_FORM_URL =
    "https://forms.gle/8dDUXndbLcSTE1Bd9";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] =
    useState<keyof JobCircular>("ApplyEnds");

  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    "asc"
  );

  const [pdfModal, setPdfModal] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [gradeFilter, setGradeFilter] =
    useState<string>("all");

  // ── Stats ──────────────────────────────────────────────────────────────

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

    const uniqueOrgs = new Set(
      availableJobData.map((j) => j.InstitutionName)
    ).size;

    return {
      total,
      totalPosts,
      closingSoon,
      uniqueOrgs,
    };
  }, [availableJobData]);

  // ── Filter + Sort ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let data = availableJobData.filter((job) => {
    return !(careerData as Career[]).some(
      (career) =>
        career.Institute?.trim().toLowerCase() ===
          job.InstitutionName?.trim().toLowerCase() &&
        career.Position?.trim().toLowerCase() ===
          job.PostName?.trim().toLowerCase()
    );
});

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

      data = data.filter(
        (j) => j.PositionGrade === grade
      );
    }

    data.sort((a, b) => {
      let av: string | number = a[sortField];
      let bv: string | number = b[sortField];

      if (
        sortField === "ApplyEnds" ||
        sortField === "ApplyStart"
      ) {
        av = new Date(av as string).getTime();
        bv = new Date(bv as string).getTime();
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;

      return 0;
    });

    return data;
  }, [
    availableJobData,
    searchQuery,
    sortField,
    sortDir,
    gradeFilter,
  ]);

  function toggleSort(field: keyof JobCircular) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({
    field,
  }: {
    field: keyof JobCircular;
  }) {
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

  if (loading) {
    return <MatrixLoader />;
  }

  return (
    <div
      className="min-h-screen w-full text-slate-100 overflow-x-hidden"
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

      <div className="max-w-7xl mx-auto px-1 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />

              <span
                className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-emerald-400"
                style={{
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                Live Circulars
              </span>
            </div>

            {(currentUserInfo?.Role ===
              import.meta.env
                .VITE_ASH_ADMIN_SECRET_ROLE) && (
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-300 border border-indigo-600/40 bg-indigo-950/30 hover:bg-indigo-900/50 hover:border-indigo-500/60 hover:text-indigo-200 transition-all"
              >
                Add New Circular
              </a>
            )}
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3"
            style={{ letterSpacing: "-0.02em" }}
          >
            Available Job Circulars
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Ongoing government job circulars you're
            eligible and interested to apply for.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

          <StatCard
            accent="bg-indigo-500"
            label="Total Circulars"
            value={stats.total}
            sub="Active openings"
            icon={<div className="w-5 h-5" />}
          />

          <StatCard
            accent="bg-teal-500"
            label="Total Vacancies"
            value={stats.totalPosts.toLocaleString()}
            sub="Seats across all posts"
            icon={<div className="w-5 h-5" />}
          />

          <StatCard
            accent="bg-amber-500"
            label="Closing Soon"
            value={stats.closingSoon}
            sub="Deadline within 7 days"
            icon={<div className="w-5 h-5" />}
          />

          <StatCard
            accent="bg-rose-500"
            label="Organizations"
            value={stats.uniqueOrgs}
            sub="Unique institutions"
            icon={<div className="w-5 h-5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search institution or post..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 border border-slate-700/50 bg-slate-800/40 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

            <select
              value={gradeFilter}
              onChange={(e) =>
                setGradeFilter(e.target.value)
              }
              className="w-full sm:w-[180px] px-4 py-3 rounded-xl text-sm text-slate-200 border border-slate-700/50 bg-slate-800/40"
            >
              <option value="all">
                All Grades
              </option>

              {[
                ...new Set(
                  availableJobData.map(
                    (j) => j.PositionGrade
                  )
                ),
              ]
                .sort((a, b) => a - b)
                .map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
            </select>

            <span
              className="w-full sm:w-auto text-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 border border-slate-700/40 bg-slate-800/30"
              style={{
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {filtered.length} /{" "}
              {availableJobData.length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border border-slate-700/40 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg,#0f1b30 0%,#0a1220 100%)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {(
                    [
                      {
                        label: "#",
                        field: null,
                      },
                      {
                        label: "Institution",
                        field: "InstitutionName",
                      },
                      {
                        label: "Post Name",
                        field: "PostName",
                      },
                      {
                        label: "Vacancies",
                        field: "NumberOfPosts",
                      },
                      {
                        label: "Grade",
                        field: "PositionGrade",
                      },
                      {
                        label: "Apply Window",
                        field: "ApplyEnds",
                      },
                      {
                        label: "Deadline",
                        field: "ApplyEnds",
                      },
                      {
                        label: "Circular",
                        field: null,
                      },
                    ] as {
                      label: string;
                      field: keyof JobCircular | null;
                    }[]
                  ).map(({ label, field }, i) => (
                    <th
                      key={i}
                      onClick={
                        field
                          ? () => toggleSort(field)
                          : undefined
                      }
                      className={`px-4 sm:px-5 py-4 text-left text-xs font-bold tracking-widest uppercase text-slate-500 whitespace-nowrap ${
                        field
                          ? "cursor-pointer hover:text-slate-300"
                          : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {label}
                        {field && (
                          <SortIcon field={field} />
                        )}
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
                      className="py-16 text-center text-slate-600"
                    >
                      No circulars found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((job, idx) => {
                    const daysLeft =
                      getDaysRemaining(
                        job.ApplyEnds
                      );

                    const deadline =
                      getDeadlineStatus(daysLeft);

                    const gradeStyle =
                      getGradeColor(
                        job.PositionGrade
                      );

                    return (
                      <tr
                        key={`${job.Timestamp}-${idx}`}
                        className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 sm:px-5 py-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                          {String(idx + 1).padStart(
                            2,
                            "0"
                          )}
                        </td>

                        <td className="px-4 sm:px-5 py-4 min-w-[220px]">
                          
                            <div className="flex items-start gap-2.5">
                              <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 font-bold text-xs">
                                {job.InstitutionName.split(
                                  " "
                                )
                                  .slice(0, 2)
                                  .map((w) => w[0])
                                  .join("")}
                              </span>
                            <div className="">
                              <span className="text-slate-200 font-semibold leading-snug text-xs sm:text-sm break-words text-nowrap">
                                {
                                  job.InstitutionName 
                                }
                              </span>
                                <p> 
                                  <a href={job?.ApplyLink} className="text-white text-xs hover:underline hover:text-rose-600" target="_blank" rel="noopener noreferrer">
                                    Apply Now
                                  </a>
                                </p> 
                            </div>
                          </div>
                        </td>

                        <td className="px-4 sm:px-5 py-4 min-w-[240px]">
                          <span className="text-slate-300 font-medium block text-xs sm:text-sm leading-snug text-nowrap">
                            {job.PostName}
                          </span>
                        </td>

                        <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-nowrap">
                          {job.NumberOfPosts}
                        </td>

                        <td className="px-4 sm:px-5 py-4 text-nowrap">
                          <span
                            className={`inline-flex flex-col items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${gradeStyle}`}
                          >
                            <span>
                              Gr.{" "}
                              {
                                job.PositionGrade
                              }
                            </span>

                            <span className="text-[9px] opacity-70">
                              {getGradeLabel(
                                job.PositionGrade
                              )}
                            </span>
                          </span>
                        </td>

                        <td className="px-4 sm:px-5 py-4 whitespace-nowrap text-xs text-nowrap">
                          {new Date(
                            job.ApplyStart
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-4 sm:px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${deadline.color} ${deadline.bg} text-nowrap`}
                          >
                            {deadline.label}
                          </span>
                        </td>

                        <td className="px-4 sm:px-5 py-4">
                          <button
                            onClick={() =>
                              setPdfModal({
                                url: job.CircularFile,
                                title: `${job.InstitutionName} — ${job.PostName}`,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-300 border border-indigo-700/40 bg-indigo-950/30 hover:bg-indigo-900/50 text-nowrap"
                          >
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

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p
              className="text-[11px] sm:text-xs text-slate-600"
              style={{
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {filtered.length} record
              {filtered.length !== 1
                ? "s"
                : ""}{" "}
              shown
            </p>

            <p className="text-[11px] sm:text-xs text-slate-700">
              Last synced:{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-[11px] sm:text-xs text-slate-700 px-4">
          ASH initiative
        </p>
      </div>
    </div>
  );
}