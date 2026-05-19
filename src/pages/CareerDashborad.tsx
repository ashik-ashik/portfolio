import { useState, useMemo } from "react";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useCareerData } from "../hooks/useCareerData";
import MatrixLoader from "../components/MatrixLoader";
import CareerJobRecords from "./CareerJobRecords";
import AddCareerData from "./AddCareerData";
import EditCareerData from "./EditCareerData";

// ── Types ─────────────────────────────────────────────────────────────────────

type Career = {
  SL?: string;
  Institute?: string;
  Position?: string;
  UserID?: string;
  Password?: string;
  Posts?: string;
  ApplyDate?: string;
  /** Real values: "Done" | "Future" */
  ExamStatus?: string;
  /** Real values: "Qualified" | "Unqualified" | "Not Attaint" | "↔" | "" */
  Preliminary?: string;
  /** Real values: "↔" | "" */
  Written?: string;
  /** Real values: "Unqualified" | "" */
  Viva?: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

type RoundOutcome = "qualified" | "unqualified" | "pending" | "not_attained" | "not_held";

type RoundStats = {
  qualified: number;
  unqualified: number;
  pending: number;
  not_attained: number;
  appeared: number;
};

// ── Value helpers matched to real data ───────────────────────────────────────
// ExamStatus: "Done" = already held | "Future" = upcoming
// Round cols:  "Qualified" | "Unqualified" | "Not Attaint" | "↔" | ""
//   "↔"         → appeared, result awaited
//   "Not Attaint"→ exam was held but candidate didn't sit this round




function isExamDone(val?: string): boolean {
  return val?.trim().toLowerCase() === "done";
}

function isExamFuture(val?: string): boolean {
  return val?.trim().toLowerCase() === "future";
}

function getRoundResult(val?: string): RoundOutcome {
  if (!val || val.trim() === "" || val.trim() === "-") return "not_held";
  const v = val.trim().toLowerCase();
  if (v === "qualified")                              return "qualified";
  if (v === "unqualified")                            return "unqualified";
  if (v === "not attaint" || v === "Not Attaint")    return "not_attained";
  return "pending";
}

function makeRound(): RoundStats {
  return { qualified: 0, unqualified: 0, pending: 0, not_attained: 0, appeared: 0 };
}

function pct(num: number, den: number): string {
  if (den === 0) return "0%";
  return ((num / den) * 100).toFixed(1) + "%";
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconAdd = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" strokeLinecap="round" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconList = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" />
    <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" strokeLinecap="round" />
  </svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconMenu = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
  </svg>
);

// ── Shared UI ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
}
const StatCard = ({ label, value, sub, accent, icon }: StatCardProps) => (
  <div className="relative bg-gray-900 border border-gray-700/60 rounded-xl overflow-hidden flex flex-col gap-3 p-5 hover:border-gray-500/70 transition-colors duration-200">
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">{label}</p>
      <span className="text-gray-500">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-white font-mono">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

interface MiniBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}
const MiniBar = ({ label, count, total, color }: MiniBarProps) => {
  const width = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-300">
        <span>{label}</span>
        <span className="font-mono text-gray-200">{count} <span className="text-gray-500">/ {total}</span></span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

interface DonutProps {
  qualified: number;
  unqualified: number;
  pending: number;
  notAttained: number;
  size?: number;
}
const DonutChart = ({ qualified, unqualified, pending, notAttained, size = 120 }: DonutProps) => {
  const total = qualified + unqualified + pending + notAttained;
  if (total === 0) return <div className="text-gray-500 text-xs">No results yet</div>;
  const r = 40; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const segs = [
    { value: qualified,   color: "#34d399" },
    { value: unqualified, color: "#f87171" },
    { value: pending,     color: "#fbbf24" },
    { value: notAttained, color: "#6b7280" },
  ];
  let offset = 0;
  const arcs = segs.map((s, i) => {
    const dash = (s.value / total) * circ;
    const gap  = circ - dash;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none"
        stroke={s.color} strokeWidth={size / 8}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += dash;
    return el;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth={size / 8} />
      {arcs}
      <text x={cx} y={cy - 4}  textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3af" fontSize="8">results</text>
    </svg>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <IconDashboard />, path: "/career" },
  { id: "add",       label: "Add Info",  icon: <IconAdd />,       path: "/career/add" },
  { id: "edit",      label: "Edit Info", icon: <IconEdit />,      path: "/career/edit" },
  { id: "records",   label: "Records",   icon: <IconList />,      path: "/career/records" },
  { id: "settings",  label: "Settings",  icon: <IconSettings />,  path: "/career/settings" },
];

interface SidebarProps {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  active: string;
  setActive: (id: string) => void;
}
const Sidebar = ({ expanded, setExpanded, active, setActive }: SidebarProps) => (
  <aside className={`flex flex-col bg-gray-950 border-r border-gray-800 h-full transition-all duration-300 ease-in-out ${expanded ? "w-56" : "w-16"}`}>
    {/* Top toggle */}
    <div className="flex items-center justify-between p-3 border-b border-gray-800 min-h-[56px]">
      {expanded && (
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-300 pl-1 select-none">Career</span>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors duration-150 ml-auto"
        title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? <IconChevronLeft /> : <IconChevronRight />}
      </button>
    </div>

    {/* Hamburger hint when collapsed */}
    {!expanded && (
      <div className="flex justify-center pt-2 pb-1">
        <span className="text-gray-500"><IconMenu /></span>
      </div>
    )}

    {/* Nav items */}
    <nav className="flex flex-col gap-1 p-2 flex-1 mt-1">
      <Link to="/" className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 text-left w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800/70`}><HomeIcon /></Link>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            title={!expanded ? item.label : undefined}
            className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 text-left w-full border
              ${isActive
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-600/30"
                : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/70 border-transparent"
              }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {expanded && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
          </button>
        );
      })}
    </nav>

    {/* Status dot */}
    <div className="p-3 border-t border-gray-800">
      <div className={`flex items-center gap-2 ${!expanded && "justify-center"}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        {expanded && <span className="text-xs text-gray-400">System Online</span>}
      </div>
    </div>
  </aside>
);

// ── Dashboard Content ─────────────────────────────────────────────────────────

interface DashboardContentProps {
  careerData: Career[];
}

const DashboardContent = ({ careerData }: DashboardContentProps) => {
  const stats = useMemo(() => {
    const total = careerData.length;

    

    // ExamStatus buckets
    const examDone   = careerData.filter((d) => isExamDone(d.ExamStatus)).length;
    const examFuture = careerData.filter((d) => isExamFuture(d.ExamStatus)).length;

    // Round stats
    const prelim  = makeRound();
    const written = makeRound();
    const viva    = makeRound();

    const accum = (round: RoundStats, outcome: RoundOutcome) => {
      if (outcome === "not_held") return;
      round.appeared++;
      if      (outcome === "qualified")    round.qualified++;
      else if (outcome === "unqualified")  round.unqualified++;
      else if (outcome === "not_attained") round.not_attained++;
      else                                 round.pending++;
    };

    careerData.forEach((d) => {
      accum(prelim,  getRoundResult(d.Preliminary));
      accum(written, getRoundResult(d.Written));
      accum(viva,    getRoundResult(d.Viva));
    });

    // Institute breakdown
    const byInstitute: Record<string, number> = {};
    careerData.forEach((d) => {
      const key = d.Institute?.trim() || "Unknown";
      byInstitute[key] = (byInstitute[key] || 0) + 1;
    });

    // Numeric posts only (ignore "Not Specific" / blank)
    const totalPosts = careerData.reduce((acc, d) => {
      const n = parseInt(d?.Posts ?? "");
      return acc + (isNaN(n) ? 0 : n);
    }, 0);

    const uniqueInstitutes = new Set(
      careerData.map((d) => d.Institute?.trim()).filter(Boolean)
    ).size;

    const topInstitutes = Object.entries(byInstitute)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Exam was held but prelim result is "Not Attaint"
    const notAttained = prelim.not_attained;

    return {
      total, examDone, examFuture,
      prelim, written, viva,
      totalPosts, uniqueInstitutes,
      topInstitutes, notAttained,
    };
  }, [careerData]);

  const {
    total, examDone, examFuture,
    prelim, written, viva,
    totalPosts, uniqueInstitutes,
    topInstitutes, notAttained,
  } = stats;

  const overallQualified   = prelim.qualified   + written.qualified   + viva.qualified;
  const overallUnqualified = prelim.unqualified  + written.unqualified  + viva.unqualified;
  const overallPending     = prelim.pending      + written.pending      + viva.pending;
  const overallNotAttained = prelim.not_attained + written.not_attained + viva.not_attained;
  const {loading} = useCareerData();
  if(loading){
    return <MatrixLoader />
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Career Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Application & Exam Analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-xs text-gray-300 font-mono">{total} total records</span>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applied" value={total} sub="All applications" accent="bg-indigo-500"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>}
        />
        <StatCard
          label="Exams Done" value={examDone} sub={`${pct(examDone, total)} of total`} accent="bg-emerald-500"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" /></svg>}
        />
        <StatCard
          label="Future / Upcoming" value={examFuture} sub={`${pct(examFuture, total)} upcoming`} accent="bg-amber-500"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>}
        />
        <StatCard
          label="Institutes" value={uniqueInstitutes} sub={`${totalPosts.toLocaleString()} posts (numeric)`} accent="bg-pink-500"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" strokeLinecap="round" /></svg>}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Donut — overall outcome */}
        <div className="bg-gray-900 border border-gray-700/60 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Overall Outcome</p>
          <div className="flex items-center gap-6">
            <DonutChart
              qualified={overallQualified} unqualified={overallUnqualified}
              pending={overallPending} notAttained={overallNotAttained} size={120}
            />
            <div className="flex flex-col gap-3 flex-1">
              {[
                { label: "Qualified",    count: overallQualified,   dot: "bg-emerald-400", text: "text-emerald-400" },
                { label: "Unqualified",  count: overallUnqualified, dot: "bg-red-400",     text: "text-red-400" },
                { label: "Not Attained", count: overallNotAttained, dot: "bg-gray-500",    text: "text-gray-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0`} />
                    <span className="text-gray-300 text-xs">{item.label}</span>
                  </div>
                  <span className={`font-mono font-semibold text-xs ${item.text}`}>{item.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-800 text-xs text-gray-500">
                Q : U : N/A = {overallQualified} : {overallUnqualified} : {overallNotAttained}
              </div>
            </div>
          </div>
        </div>

        {/* Round-wise breakdown */}
        <div className="bg-gray-900 border border-gray-700/60 rounded-xl p-5 flex flex-col gap-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Round-wise Results</p>
          {(
            [
              { label: "Preliminary", data: prelim,  color: "bg-sky-500" },
              { label: "Written",     data: written, color: "bg-violet-500" },
              { label: "Viva",        data: viva,    color: "bg-rose-500" },
            ] as { label: string; data: RoundStats; color: string }[]
          ).map(({ label, data, color }) => {
            const decided = data.qualified + data.unqualified;
            return (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-gray-200">{label}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{data.appeared} appeared</span>
                </div>
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-800">
                  {data.appeared > 0 ? (
                    <>
                      <div className="bg-emerald-500 h-full" style={{ width: pct(data.qualified,    data.appeared) }} title={`Qualified: ${data.qualified}`} />
                      <div className="bg-red-500 h-full"     style={{ width: pct(data.unqualified,  data.appeared) }} title={`Unqualified: ${data.unqualified}`} />
                      <div className="bg-gray-600 h-full"    style={{ width: pct(data.not_attained, data.appeared) }} title={`Not Attained: ${data.not_attained}`} />
                    </>
                  ) : (
                    <div className="bg-gray-800 h-full w-full" />
                  )}
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-400">{data.qualified} Q</span>
                  <span className="text-red-400">{data.unqualified} U</span>
                  <span className="text-gray-500">{data.not_attained} N/A</span>
                  <span className="ml-auto text-gray-400">
                    {decided > 0 ? pct(data.qualified, decided) : "—"} pass rate
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bars + % tiles */}
        <div className="bg-gray-900 border border-gray-700/60 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Application Progress</p>
          <MiniBar label="Exams Done"           count={examDone}          total={total} color="bg-emerald-500" />
          <MiniBar label="Future / Upcoming"    count={examFuture}        total={total} color="bg-amber-500" />
          <MiniBar label="Prelim Appeared"      count={prelim.appeared}   total={total} color="bg-sky-500" />
          <MiniBar label="Written Appeared"     count={written.appeared}  total={total} color="bg-violet-500" />
          <MiniBar label="Viva Appeared"        count={viva.appeared}     total={total} color="bg-rose-500" />
          <MiniBar label="Not Attained (Prelim)" count={notAttained}      total={total} color="bg-gray-600" />

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
            {[
              { label: "Exam Coverage",  val: pct(examDone, total) },
              { label: "Prelim Pass %",  val: pct(prelim.qualified,  prelim.qualified  + prelim.unqualified  || 1) },
              { label: "Written Pass %", val: pct(written.qualified, written.qualified + written.unqualified || 1) },
              { label: "Viva Pass %",    val: pct(viva.qualified,    viva.qualified    + viva.unqualified    || 1) },
            ].map((item) => (
              <div key={item.label} className="bg-gray-800/50 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="text-white font-mono text-sm font-semibold">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top institutes */}
        <div className="bg-gray-900 border border-gray-700/60 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Top Institutes Applied</p>
          <div className="space-y-3">
            {topInstitutes.length === 0 ? (
              <p className="text-gray-500 text-sm">No data</p>
            ) : (
              topInstitutes.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-gray-800 text-gray-400 text-xs flex items-center justify-center font-mono shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-200 truncate max-w-[70%]">{name}</span>
                      <span className="text-xs font-mono text-gray-300">
                        {count} <span className="text-gray-600">/ {total}</span>
                      </span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: pct(count, total),
                          background: ["#6366f1","#34d399","#f59e0b","#f87171","#a78bfa"][i % 5],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick summary table */}
        <div className="bg-gray-900 border border-gray-700/60 rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Quick Summary</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 pb-2 font-medium">Metric</th>
                <th className="text-right text-gray-400 pb-2 font-medium">Count</th>
                <th className="text-right text-gray-400 pb-2 font-medium">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Total Applications",      count: total,                ratio: "100%" },
                { label: "Exams Done",              count: examDone,             ratio: pct(examDone, total) },
                { label: "Future / Upcoming",       count: examFuture,           ratio: pct(examFuture, total) },
                { label: "Prelim — Appeared",       count: prelim.appeared,      ratio: pct(prelim.appeared, examDone || 1) },
                { label: "Prelim — Qualified",      count: prelim.qualified,     ratio: pct(prelim.qualified, prelim.appeared || 1) },
                { label: "Prelim — Unqualified",    count: prelim.unqualified,   ratio: pct(prelim.unqualified, prelim.appeared || 1) },
                { label: "Prelim — Not Attained",   count: prelim.not_attained,  ratio: pct(prelim.not_attained, examDone || 1) },
                { label: "Written — Appeared",      count: written.appeared,     ratio: pct(written.appeared, total) },
                { label: "Viva — Appeared",         count: viva.appeared,        ratio: pct(viva.appeared, total) },
                { label: "Overall Qualified",       count: overallQualified,     ratio: pct(overallQualified, overallQualified + overallUnqualified || 1) },
                { label: "Overall Unqualified",     count: overallUnqualified,   ratio: pct(overallUnqualified, overallQualified + overallUnqualified || 1) },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-1.5 text-gray-300">{row.label}</td>
                  <td className="py-1.5 text-right font-mono text-white">{row.count}</td>
                  <td className="py-1.5 text-right font-mono text-indigo-400">{row.ratio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// ── Placeholder for future child routes ───────────────────────────────────────

const Placeholder = ({ title, description }: { title: string; description: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gray-950">
    <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-500">
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
      </svg>
    </div>
    <h2 className="text-white text-lg font-semibold">{title}</h2>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

// ── Root ──────────────────────────────────────────────────────────────────────

const CareerDashboard = () => {
  const { careerData } = useCareerData();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeNav, setActiveNav]             = useState("dashboard");

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard": return <DashboardContent careerData={careerData as Career[]} />;
      case "add":       return <AddCareerData />;
      case "edit":      return <EditCareerData />;
      case "records":   return <CareerJobRecords />;
      case "settings":  return <Placeholder title="Settings"  description="Your Settings component renders here." />;
      default:          return <DashboardContent careerData={careerData as Career[]} />;
    }
  };

  return (
    <section className="flex h-screen w-full overflow-y-auto bg-gray-950 text-white">
      <Sidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
        active={activeNav}
        setActive={setActiveNav}
      />
      {renderContent()}
    </section>
  );
};

export default CareerDashboard;