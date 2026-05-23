import { useState, useEffect } from "react";
import PersonalInfo from "./PersonalInfo";
import Education from "./Education";
import { useCareerData } from "../hooks/useCareerData";
import MatrixLoader from "../components/MatrixLoader";
import Certifications from "./Certifications";
import { Link } from "react-router-dom";
import { LiaHomeSolid } from "react-icons/lia";
import { AiOutlineCopyrightCircle } from "react-icons/ai";


// ── Types ─────────────────────────────────────────────────────────────────────

type NavId =
  | "personal-info"
  | "education"
  | "skills"
  | "experience"
  | "projects"
  | "certifications"
  | "settings";

interface NavItem {
  id: NavId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IcUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IcGradCap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 2.2 2.7 4 6 4s6-1.8 6-4v-5" />
    <line x1="22" y1="10" x2="22" y2="16" />
  </svg>
);
const IcBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
// const IcBriefcase = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
//     <rect x="2" y="7" width="20" height="14" rx="2" />
//     <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
//     <line x1="12" y1="12" x2="12" y2="12" strokeWidth={2} />
//     <path d="M2 12h20" />
//   </svg>
// );
// const IcCode = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
//     <polyline points="16 18 22 12 16 6" />
//     <polyline points="8 6 2 12 8 18" />
//   </svg>
// );
const IcAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <circle cx="12" cy="9" r="7" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
// const IcSettings = () => (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
//     <circle cx="12" cy="12" r="3" />
//     <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
//   </svg>
// );
const IcChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IcChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IcMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className="w-5 h-5">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="16" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "personal-info",    label: "Personal Info",    shortLabel: "Info",   icon: <IcUser />,      section: "PROFILE" },
  { id: "education",        label: "Education",        shortLabel: "Edu",    icon: <IcGradCap />,   section: "PROFILE" },
  { id: "certifications",   label: "Certifications",   shortLabel: "Certs",  icon: <IcAward />,     section: "CAREER"  },
  { id: "skills",           label: "Skills",           shortLabel: "Skills", icon: <IcBolt />,      section: "PROFILE" }
  ];

const SECTION_ORDER = ["PROFILE", "CAREER", "SYSTEM"];

// ── Geometric background decoration ─────────────────────────────────────────

const GeoBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
    {/* Large faint rings */}
    <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border border-amber-900/20" />
    <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full border border-amber-800/15" />
    {/* Corner diamond */}
    <div
      className="absolute bottom-24 -left-12 w-32 h-32 border border-amber-900/20 rotate-45"
      style={{ borderRadius: "4px" }}
    />
    <div
      className="absolute bottom-28 -left-8 w-20 h-20 border border-amber-800/15 rotate-45"
      style={{ borderRadius: "2px" }}
    />
    {/* Dots grid */}
    <svg className="absolute bottom-0 right-0 opacity-[0.06] w-40 h-40" viewBox="0 0 80 80">
      {Array.from({ length: 6 }).map((_, r) =>
        Array.from({ length: 6 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={c * 14 + 7} cy={r * 14 + 7} r="1.5" fill="#f59e0b" />
        ))
      )}
    </svg>
    {/* Subtle glow top right */}
    <div className="absolute -top-10 right-0 w-40 h-40 bg-amber-600/5 rounded-full blur-3xl" />
  </div>
);

// ── Avatar / Monogram ─────────────────────────────────────────────────────────

const Avatar = ({ collapsed }: { collapsed: boolean }) => (
  <div
    className={`relative transition-all duration-300 ${collapsed ? "w-8 h-8" : "w-14 h-14"} shrink-0`}
  >
    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full border-2 border-amber-500/40" />
    {/* Inner ring */}
    <div className="absolute inset-[3px] rounded-full border border-amber-600/20" />
    {/* Monogram */}
    <div className="absolute inset-[4px] rounded-full bg-gradient-to-br from-amber-800/60 to-amber-950/80 flex items-center justify-center">
    <Link to='/account'>
      <span
        className={`font-bold text-amber-300 transition-all duration-300 ${collapsed ? "text-[9px]" : "text-sm"}`}
        style={{ fontFamily: "'Georgia', serif", letterSpacing: "0.05em" }}
      >
        ME
      </span>
    </Link>
    </div>
    {/* Online dot */}
    {!collapsed && (
      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gray-950 block" />
    )}
  </div>
);

// ── Sidebar Section Label ─────────────────────────────────────────────────────

const SectionDivider = ({ label, collapsed }: { label: string; collapsed: boolean }) => (
  <div className={`flex items-center gap-2 px-3 mt-5 mb-1 ${collapsed ? "justify-center" : ""}`}>
    {collapsed ? (
      <div className="w-4 h-px bg-amber-900/60" />
    ) : (
      <>
        <span className="text-[9px] tracking-[0.2em] font-bold text-amber-900/80 uppercase whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-amber-900/30" />
      </>
    )}
  </div>
);

// ── Sidebar Nav Item ──────────────────────────────────────────────────────────

interface NavItemBtnProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavItemBtn = ({ item, active, collapsed, onClick }: NavItemBtnProps) => (
  <button
    onClick={onClick}
    title={collapsed ? item.label : undefined}
    className={`
      relative group w-full flex items-center rounded-xl transition-all duration-200 overflow-hidden
      ${collapsed ? "justify-center px-0 py-2.5 mx-auto" : "gap-3 px-3 py-2.5"}
      ${active
        ? "bg-amber-500/15 text-amber-300"
        : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
      }
    `}
    style={{ outline: "none" }}
  >
    {/* Active left indicator */}
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
    )}

    {/* Icon */}
    <span
      className={`shrink-0 transition-colors duration-200 ${active ? "text-amber-400" : "text-gray-600 group-hover:text-gray-300"}`}
    >
      {item.icon}
    </span>

    {/* Label */}
    {!collapsed && (
      <span
        className={`text-sm whitespace-nowrap transition-all duration-200 ${active ? "font-semibold text-amber-200" : "font-medium"}`}
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        {item.label}
      </span>
    )}

    {/* Badge */}
    {!collapsed && item.badge !== undefined && item.badge > 0 && (
      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
        {item.badge}
      </span>
    )}

    {/* Hover shimmer */}
    {!active && (
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
    )}
  </button>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeId: NavId;
  setActiveId: (id: NavId) => void;
}

const Sidebar = ({ collapsed, setCollapsed, activeId, setActiveId }: SidebarProps) => {
  const grouped = SECTION_ORDER.map((section) => ({
    section,
    items: NAV_ITEMS.filter((n) => n.section === section),
  }));

  return (
    <aside
      className={`
        relative flex flex-col h-full bg-gray-950 border-r border-amber-900/20
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[60px]" : "w-[220px]"}
      `}
    >
      <GeoBg />

      {/* ── Top: Avatar + name ── */}
      <div
        className={`relative z-10 flex flex-col items-center pt-6 pb-5 border-b border-amber-900/20
          ${collapsed ? "px-2" : "px-5 items-start"}`}
      >
        <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-3"}`}>
          <Avatar collapsed={collapsed} />
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-sm font-bold text-gray-100 leading-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                My Profile
              </p>
              <p className="text-[11px] text-amber-600/80 mt-0.5 truncate">Personal Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
        <Link to="/" className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 text-left w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800/70`}><LiaHomeSolid size={18} />{collapsed ? "":"Home"}</Link>
        <Link to="/career" className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 text-left w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800/70`}><AiOutlineCopyrightCircle size={18} />{collapsed ? "":"Career"}</Link>
        {grouped.map(({ section, items }) => (
          <div key={section}>
            <SectionDivider label={section} collapsed={collapsed} />
            {items.map((item) => (
              <NavItemBtn
                key={item.id}
                item={item}
                active={activeId === item.id}
                collapsed={collapsed}
                onClick={() => setActiveId(item.id)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Toggle button ── */}
      <div className="relative z-10 border-t border-amber-900/20 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            w-full flex items-center rounded-xl px-2 py-2 gap-2
            text-gray-600 hover:text-amber-400 hover:bg-amber-500/10
            transition-all duration-200 group
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IcChevronRight /> : (
            <>
              <IcChevronLeft />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

// ── Breadcrumb ────────────────────────────────────────────────────────────────

const Breadcrumb = ({ activeId }: { activeId: NavId }) => {
  const item = NAV_ITEMS.find((n) => n.id === activeId);
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-600" aria-label="breadcrumb">
      <span>Dashboard</span>
      <span className="text-gray-700">/</span>
      <span className="text-amber-400/80">{item?.section?.charAt(0) + (item?.section?.slice(1).toLowerCase() ?? "")}</span>
      <span className="text-gray-700">/</span>
      <span className="text-gray-300">{item?.label}</span>
    </nav>
  );
};

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_META: Record<NavId, { title: string; subtitle: string; color: string }> = {
  "personal-info":   { title: "Personal Info",    subtitle: "Your identity & contact details",        color: "from-amber-600/20 to-transparent" },
  "education":       { title: "Education",         subtitle: "Academic history & qualifications",       color: "from-sky-600/20 to-transparent" },
  "skills":          { title: "Skills",            subtitle: "Technical & professional competencies",   color: "from-emerald-600/20 to-transparent" },
  "certifications":  { title: "Certifications",    subtitle: "Verified credentials & achievements",     color: "from-orange-600/20 to-transparent" },
  "experience":      { title: "Experience",        subtitle: "Work history & professional journey",     color: "from-violet-600/20 to-transparent" },
  "projects":        { title: "Projects",          subtitle: "Portfolio of work & contributions",       color: "from-rose-600/20 to-transparent" },
  "settings":        { title: "Settings",          subtitle: "Preferences & configuration",             color: "from-gray-600/20 to-transparent" },
};

// ── Placeholder for pages not yet built ──────────────────────────────────────

const PlaceholderPage = ({ id }: { id: NavId }) => {
  const meta = PAGE_META[id];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      {/* Ornament */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gray-900 border border-amber-900/30 flex items-center justify-center text-amber-800/70">
          {NAV_ITEMS.find((n) => n.id === id)?.icon}
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-amber-900/15" />
      </div>
      <div className="text-center space-y-1">
        <p
          className="text-lg font-bold text-gray-300"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {meta.title}
        </p>
        <p className="text-sm text-gray-600">{meta.subtitle}</p>
        <p className="text-xs text-amber-900/60 mt-2 italic">Component coming soon…</p>
      </div>
    </div>
  );
};

// ── Main content area header ──────────────────────────────────────────────────

const ContentHeader = ({ activeId, sidebarCollapsed, setSidebarCollapsed }: {
  activeId: NavId;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}) => {
  const meta = PAGE_META[activeId];
  return (
    <header className="shrink-0 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-sm px-6 py-4 flex items-center gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
      >
        <IcMenu />
      </button>

      {/* Title area */}
      <div className="flex-1 min-w-0">
        <Breadcrumb activeId={activeId} />
        <h1
          className="text-xl font-bold text-gray-100 mt-1 leading-tight truncate"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {meta.title}
        </h1>
      </div>

      {/* Right cluster — add action buttons here per page if needed */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 animate-pulse" />
          Personal Space
        </div>
      </div>
    </header>
  );
};

// ── Render router: swap components here as they're built ─────────────────────

const renderPage = (id: NavId): React.ReactNode => {
  switch (id) {
    case "personal-info":   return <PersonalInfo />;
    case "education":     return <Education />;
    case "certifications":return <Certifications />;
    // Uncomment and import as you build each component:
    // case "skills":        return <Skills />;
    // case "experience":    return <Experience />;
    // case "projects":      return <Projects />;
    // case "settings":      return <Settings />;
    default:                return <PlaceholderPage id={id} />;
  }
};

// ── Subtle content-area background pattern ────────────────────────────────────

const ContentBg = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {/* Very faint diagonal lines */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="#f59e0b" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diag)" />
    </svg>
    {/* Soft ambient glow — bottom left */}
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-900/5 rounded-full blur-3xl" />
  </div>
);

// ── Root ──────────────────────────────────────────────────────────────────────

const PersonalDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId]   = useState<NavId>("personal-info");
  const [mounted, setMounted]     = useState(false);
  const {loading} = useCareerData();

  // Staggered mount animation trigger
  useEffect(() => { 
    const settingMounted =()=>{
      setMounted(true);
    };
    settingMounted();
   }, []);

   if(loading){
     return <MatrixLoader />

   }

  return (
    <div
      className={`flex h-screen w-full overflow-hidden bg-gray-950 text-white transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeId={activeId}
        setActiveId={setActiveId}
      />

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <ContentBg />

        {/* Header */}
        <ContentHeader
          activeId={activeId}
          sidebarCollapsed={collapsed}
          setSidebarCollapsed={setCollapsed}
        />

        {/* Page content with fade transition key */}
        <div
          key={activeId}
          className="relative flex-1 overflow-y-auto"
          style={{
            animation: "fadeSlideIn 0.22s ease-out both",
          }}
        >
          {renderPage(activeId)}
        </div>

        {/* ── Footer strip ── */}
        <footer className="relative shrink-0 border-t border-gray-800/60 px-6 py-2 flex items-center justify-between">
          <span className="text-[11px] text-gray-700" style={{ fontFamily: "monospace" }}>
            personal.dashboard <span className="text-amber-900/60">v1.0</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-gray-700">Active</span>
          </div>
        </footer>
      </main>

      {/* Global CSS for fade animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PersonalDashboard;