/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useCareerData } from "../hooks/useCareerData";

// ── Types ─────────────────────────────────────────────────────────────────────

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

type Tab = "upcoming" | "done";

type SortKey = keyof Career;
type SortDir = "asc" | "desc";

type RowVariant =
  | "viva_qualified"
  | "written_qualified"
  | "prelim_qualified"
  | "pending"
  | "not_attained"
  | "all_fail"
  | "future";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isQualified(val?: string): boolean {
  return val?.trim().toLowerCase() === "qualified";
}
function isUnqualified(val?: string): boolean {
  return val?.trim().toLowerCase() === "unqualified";
}
function isNotAttained(val?: string): boolean {
  const v = val?.trim().toLowerCase() ?? "";
  return v === "not attaint" || v === "not attained";
}
function isPending(val?: string): boolean {
  return val?.trim() === "↔";
}

function getRowVariant(d: Career): RowVariant {
  if (!d.ExamStatus || d.ExamStatus.trim().toLowerCase() === "future") return "future";

  const p = d.Preliminary?.trim() ?? "";
  const w = d.Written?.trim()     ?? "";
  const v = d.Viva?.trim()        ?? "";

  if (isNotAttained(p)) return "not_attained";

  // Furthest milestone first
  if (isQualified(p) && isQualified(w) && isQualified(v)) return "viva_qualified";
  if (isQualified(p) && isQualified(w))                   return "written_qualified";
  if (isQualified(p))                                      return "prelim_qualified";
  if (isPending(p) || isPending(w) || isPending(v))        return "pending";
  if (isUnqualified(p) || isUnqualified(w) || isUnqualified(v)) return "all_fail";

  return "pending";
}

const VARIANT_META: Record<RowVariant, {
  label: string;
  rowBg: string;
  rowBorder: string;
  badge: string;
  dot: string;
}> = {
  viva_qualified: {
    label: "Viva Qualified",
    rowBg: "bg-emerald-950/40",
    rowBorder: "border-l-2 border-l-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  written_qualified: {
    label: "Written Qualified",
    rowBg: "bg-sky-950/40",
    rowBorder: "border-l-2 border-l-sky-400",
    badge: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    dot: "bg-sky-400",
  },
  prelim_qualified: {
    label: "Prelim Qualified",
    rowBg: "bg-indigo-950/40",
    rowBorder: "border-l-2 border-l-indigo-400",
    badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    dot: "bg-indigo-400",
  },
  pending: {
    label: "Result Pending",
    rowBg: "bg-amber-950/30",
    rowBorder: "border-l-2 border-l-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    dot: "bg-amber-400",
  },
  not_attained: {
    label: "Not Attained",
    rowBg: "bg-gray-900/60",
    rowBorder: "border-l-2 border-l-gray-600",
    badge: "bg-gray-700/50 text-gray-400 border border-gray-600/50",
    dot: "bg-gray-500",
  },
  all_fail: {
    label: "Unqualified",
    rowBg: "bg-red-950/30",
    rowBorder: "border-l-2 border-l-red-500",
    badge: "bg-red-500/20 text-red-300 border border-red-500/30",
    dot: "bg-red-400",
  },
  future: {
    label: "Upcoming",
    rowBg: "bg-gray-900/40",
    rowBorder: "border-l-2 border-l-violet-500",
    badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    dot: "bg-violet-400",
  },
};

function formatDate(raw?: string): string {
  if (!raw) return "—";
  return raw.trim();
}

function formatPosts(raw?: string): string {
  if (!raw || raw === "") return "—";
  if (raw === "not specific") return "Open";
  return raw;
}

// ── Round Pill ────────────────────────────────────────────────────────────────

const RoundPill = ({ val }: { val?: string }) => {
  if (!val || val.trim() === "") {
    return <span className="text-gray-700 text-xs">—</span>;
  }
  const v = val.trim();
  if (isQualified(v))    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Qualified</span>;
  if (isUnqualified(v))  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">✗ Unqualified</span>;
  if (isNotAttained(v))  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700/60 text-gray-400 border border-gray-600/50">– Not Attained</span>;
  if (v === "↔")         return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">↔ Pending</span>;
  return <span className="text-gray-400 text-xs">{v}</span>;
};

// ── Sort Icon ─────────────────────────────────────────────────────────────────

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span className={`ml-1 inline-flex flex-col gap-[1px] opacity-${active ? "100" : "30"}`}>
    <span className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent ${active && dir === "asc" ? "border-b-indigo-400" : "border-b-gray-500"}`} />
    <span className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent ${active && dir === "desc" ? "border-t-indigo-400" : "border-t-gray-500"}`} />
  </span>
);

// ── Legend ────────────────────────────────────────────────────────────────────

const Legend = () => (
  <div className="flex flex-wrap gap-2">
    {(Object.entries(VARIANT_META) as [RowVariant, typeof VARIANT_META[RowVariant]][])
      .filter(([k]) => k !== "future")
      .map(([key, meta]) => (
        <span key={key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      ))
    }
  </div>
);

// ── Copy Cell Button ──────────────────────────────────────────────────────────

const CopyBtn = ({ text }: { text?: string }) => {
  const [copied, setCopied] = useState(false);
  if (!text || text === "—") return null;
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handle}
      className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-300 shrink-0"
      title="Copy"
    >
      {copied
        ? <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      }
    </button>
  );
};

// ── Row Detail Drawer ─────────────────────────────────────────────────────────

const RowDetail = ({ record, onClose }: { record: Career; onClose: () => void }) => {
  const variant = getRowVariant(record);
  const meta = VARIANT_META[variant];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-mono">#{record.SL || "—"}</p>
            <h3 className="text-lg font-bold text-white leading-tight">{record.Institute || "Unknown"}</h3>
            <p className="text-sm text-gray-400">{record.Position || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${meta.badge}`}>{meta.label}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* Grid details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Apply Date",   val: formatDate(record.ApplyDate) },
            { label: "Exam Status",  val: record.ExamStatus || "—" },
            { label: "Posts",        val: formatPosts(record.Posts) },
            { label: "User ID",      val: record.UserID || "—", copy: true },
            { label: "Password",     val: record.Password || "—", copy: true },
          ].map(({ label, val, copy }) => (
            <div key={label} className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <div className="flex items-center gap-1">
                <p className="text-gray-200 font-mono text-xs break-all">{val}</p>
                {copy && <CopyBtn text={val !== "—" ? val : undefined} />}
              </div>
            </div>
          ))}
        </div>

        {/* Round results */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-semibold tracking-widest uppercase">Exam Rounds</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Preliminary", val: record.Preliminary },
              { label: "Written",     val: record.Written },
              { label: "Viva",        val: record.Viva },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-800/50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-2">{label}</p>
                <RoundPill val={val} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CareerJobRecords = () => {
  const { careerData } = useCareerData();
  const data = careerData as Career[];

  const [tab, setTab]                     = useState<Tab>("upcoming");
  const [search, setSearch]               = useState("");
  const [sortKey, setSortKey]             = useState<SortKey>("ApplyDate");
  const [sortDir, setSortDir]             = useState<SortDir>("asc");
  const [filterVariant, setFilterVariant] = useState<RowVariant | "all">("all");
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedRecord, setSelectedRecord]   = useState<Career | null>(null);

  // Split into tabs
  const upcoming = useMemo(
    () => data.filter((d) => d.ExamStatus?.trim().toLowerCase() === "future"),
    [data]
  );
  const done = useMemo(
    () => data.filter((d) => d.ExamStatus?.trim().toLowerCase() === "done"),
    [data]
  );

  const activeData = tab === "upcoming" ? upcoming : done;

  // Filter + search + sort
  const processed = useMemo(() => {
    let rows = [...activeData];

    // Variant filter
    if (filterVariant !== "all") {
      rows = rows.filter((d) => getRowVariant(d) === filterVariant);
    }

    // Search
if (search.trim()) {
  const q = search.trim().toLowerCase();

  rows = rows.filter((d) =>
    [
      d.Institute,
      d.Position,
      d.Posts,
      d.ApplyDate,
      d.Preliminary,
      d.Written,
      d.Viva,
    ].some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(q)
    )
  );
}

    // Sort
    rows.sort((a, b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1  : -1;
      return 0;
    });

    return rows;
  }, [activeData, filterVariant, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // Progress bar for a row (how far through the pipeline)
  const getPipelineProgress = (d: Career): number => {
    const v = getRowVariant(d);
    if (v === "viva_qualified")    return 100;
    if (v === "written_qualified") return 67;
    if (v === "prelim_qualified")  return 33;
    if (v === "pending")           return 20;
    return 0;
  };

  const TH = ({ label, k, center }: { label: string; k?: SortKey; center?: boolean }) => (
    <th
      className={`px-3 py-3 text-xs font-semibold tracking-widest uppercase text-gray-400 whitespace-nowrap select-none ${center ? "text-center" : "text-left"} ${k ? "cursor-pointer hover:text-gray-200 transition-colors" : ""}`}
      onClick={k ? () => handleSort(k) : undefined}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {k && <SortIcon active={sortKey === k} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gray-950 h-full">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 space-y-4 border-b border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Job Records</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {data.length} total · {upcoming.length} upcoming · {done.length} completed
            </p>
          </div>

          {/* Credentials toggle */}
          <button
            onClick={() => setShowCredentials((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${showCredentials
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200"
              }`}
          >
            {showCredentials ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
            {showCredentials ? "Hide Credentials" : "Show Credentials"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl w-fit border border-gray-800">
          {(["upcoming", "done"] as Tab[]).map((t) => {
            const count = t === "upcoming" ? upcoming.length : done.length;
            return (
              <button
                key={t}
                onClick={() => { setTab(t); setFilterVariant("all"); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2
                  ${tab === t
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                    : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                {t === "upcoming" ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" /></svg>
                )}
                {t === "upcoming" ? "Upcoming" : "Completed"}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${tab === t ? "bg-white/20" : "bg-gray-800"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + variant filter */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search institute, position…"
              className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 w-56 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>

          {/* Variant filter (only for Done tab) */}
          {tab === "done" && (
            <select
              value={filterVariant}
              onChange={(e) => setFilterVariant(e.target.value as RowVariant | "all")}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">All results</option>
              <option value="viva_qualified">Viva Qualified</option>
              <option value="written_qualified">Written Qualified</option>
              <option value="prelim_qualified">Prelim Qualified</option>
              <option value="pending">Result Pending</option>
              <option value="not_attained">Not Attained</option>
              <option value="all_fail">Unqualified</option>
            </select>
          )}

          {/* Result count badge */}
          <span className="text-xs text-gray-500 ml-1">
            {processed.length} {processed.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* Legend (Done tab only) */}
        {tab === "done" && <Legend />}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        {processed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>
            </div>
            <p className="text-gray-500 text-sm">No records found</p>
            {search && <button onClick={() => setSearch("")} className="text-indigo-400 text-xs hover:underline">Clear search</button>}
          </div>
        ) : (
          <table className="w-full text-xs border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800">
              <tr>
                <TH label="#"          />
                <TH label="Institute"  k="Institute" />
                <TH label="Position"   k="Position" />
                {showCredentials && <TH label="User ID"   k="UserID" />}
                {showCredentials && <TH label="Password"  />}
                <TH label="Posts"      k="Posts" />
                <TH label="Apply Date" k="ApplyDate" />
                <TH label="Status"     k="ExamStatus" center />
                <TH label="Prelim"     k="Preliminary" center />
                <TH label="Written"    k="Written" center />
                <TH label="Viva"       k="Viva" center />
                {tab === "done" && <TH label="Progress" center />}
                <TH label="Stage"      center />
              </tr>
            </thead>
            <tbody>
              {processed.map((record, idx) => {
                const variant = getRowVariant(record);
                const meta    = VARIANT_META[variant];
                const progress = getPipelineProgress(record);
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedRecord(record)}
                    className={`group cursor-pointer border-b border-gray-800/50 hover:brightness-125 transition-all duration-100 ${meta.rowBg} ${meta.rowBorder}`}
                  >
                    {/* SL */}
                    <td className="px-3 py-2.5 text-gray-600 font-mono w-8">
                      {record.SL || String(idx + 1)}
                    </td>

                    {/* Institute */}
                    <td className="px-3 py-2.5 font-semibold text-gray-200 max-w-[140px]">
                      <span className="truncate block" title={record.Institute}>{record.Institute || "—"}</span>
                    </td>

                    {/* Position */}
                    <td className="px-3 py-2.5 text-gray-300 max-w-[160px]">
                      <span className="truncate block" title={record.Position}>{record.Position || "—"}</span>
                    </td>

                    {/* Credentials */}
                    {showCredentials && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 font-mono text-gray-400">
                          <span className="truncate max-w-[100px]" title={record.UserID}>{record.UserID || "—"}</span>
                          <CopyBtn text={record.UserID} />
                        </div>
                      </td>
                    )}
                    {showCredentials && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 font-mono text-gray-400">
                          <span className="truncate max-w-[100px] blur-[4px] hover:blur-none transition-all select-none" title={record.Password}>
                            {record.Password || "—"}
                          </span>
                          <CopyBtn text={record.Password} />
                        </div>
                      </td>
                    )}

                    {/* Posts */}
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-gray-300 font-mono">{formatPosts(record.Posts)}</span>
                    </td>

                    {/* Apply Date */}
                    <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap font-mono">
                      {formatDate(record.ApplyDate)}
                    </td>

                    {/* Exam Status */}
                    <td className="px-3 py-2.5 text-center">
                      {record.ExamStatus?.trim().toLowerCase() === "done" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" /> Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" /> Future
                        </span>
                      )}
                    </td>

                    {/* Round pills */}
                    <td className="px-3 py-2.5 text-center"><RoundPill val={record.Preliminary} /></td>
                    <td className="px-3 py-2.5 text-center"><RoundPill val={record.Written} /></td>
                    <td className="px-3 py-2.5 text-center"><RoundPill val={record.Viva} /></td>

                    {/* Pipeline progress */}
                    {tab === "done" && (
                      <td className="px-3 py-2.5 w-24">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                background: progress === 100 ? "#34d399" : progress >= 67 ? "#38bdf8" : progress >= 33 ? "#818cf8" : "#f59e0b",
                              }}
                            />
                          </div>
                          <span className="text-gray-600 font-mono w-6 text-right">{progress}%</span>
                        </div>
                      </td>
                    )}

                    {/* Stage badge */}
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${meta.badge}`}>
                        <span className={`w-1 h-1 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer summary ── */}
      <div className="border-t border-gray-800 px-6 py-2 flex items-center gap-4 flex-wrap bg-gray-950">
        <span className="text-xs text-gray-600 font-mono">
          Showing <span className="text-gray-400">{processed.length}</span> of <span className="text-gray-400">{activeData.length}</span>
        </span>
        {tab === "done" && (
          <>
            <span className="text-gray-800">·</span>
            {(["viva_qualified","written_qualified","prelim_qualified","all_fail","not_attained","pending"] as RowVariant[]).map((v) => {
              const c = done.filter((d) => getRowVariant(d) === v).length;
              if (c === 0) return null;
              return (
                <span key={v} className="text-xs text-gray-500 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${VARIANT_META[v].dot}`} />
                  {VARIANT_META[v].label}: <span className="text-gray-300 font-mono ml-0.5">{c}</span>
                </span>
              );
            })}
          </>
        )}
        <span className="ml-auto text-xs text-gray-600 hidden sm:block">Click any row for details</span>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedRecord && (
        <RowDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

export default CareerJobRecords;