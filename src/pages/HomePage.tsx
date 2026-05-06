import React, { useState, useEffect, useRef } from "react";
import RainCanvas from "../components/RainBackground";

// ─── Data ─────────────────────────────────────────────────────────────────────

const personalInfo = {
  name: "Md. Ashik Ali",
  title: "Researcher & Social Worker",
  taglines: [
    "Social Work Researcher",
    "Data Analyst (SPSS)",
    "Community Leader",
    "Development Sector Enthusiast",
    "Volunteer & Advocate",
  ],
  bio: `I am a Social Work graduate and researcher from Pabna University of Science and Technology (PUST) with a strong academic foundation in social research, data analysis, and community studies. My master's thesis on socioeconomic conditions in Chalan Beel strengthened my skills in field research, SPSS-based analysis, and academic reporting. I am passionate about research, community welfare, and social policy — guided by curiosity, empathy, and a commitment to continuous learning.`,
  location: "Singra, Natore-6450, Bangladesh",
  email: "ashikali0204@gmail.com",
  website: "ashbooks.netlify.app",
  linkedin: "https://www.linkedin.com/in/ashikali0",
};

const skillsList = [
  { name: "Data Collection & Analysis", level: 90, category: "Research", color: "#00f5ff" },
  { name: "SPSS Statistical Software", level: 85, category: "Research", color: "#00f5ff" },
  { name: "Social Research Methods", level: 88, category: "Research", color: "#00f5ff" },
  { name: "Psycho-Social Case Management", level: 82, category: "Social Work", color: "#00ff88" },
  { name: "Counseling & Support", level: 80, category: "Social Work", color: "#00ff88" },
  { name: "Community Development", level: 86, category: "Social Work", color: "#00ff88" },
  { name: "Academic / Report Writing", level: 84, category: "Communication", color: "#a78bfa" },
  { name: "Graphic Design", level: 72, category: "Creative", color: "#ff0080" },
  { name: "Web Development (Basic)", level: 65, category: "Technical", color: "#60a5fa" },
  { name: "Project Management", level: 78, category: "Management", color: "#fbbf24" },
  { name: "Public Speaking & Leadership", level: 80, category: "Communication", color: "#a78bfa" },
  { name: "Microsoft Office Suite", level: 85, category: "Technical", color: "#60a5fa" },
];

const projectsList = [
  { id: 1, title: "Master's Thesis: Chalan Beel Study", description: "Socioeconomic Conditions and Livelihood Diversification: A Comparative Analysis Between Fishermen and Non-Fishermen Communities in Chalan Beel, Natore, Bangladesh.", tags: ["SPSS", "Field Research", "Social Analysis", "Quantitative Methods"], category: "Research", color: "#00f5ff", icon: "📊" },
  { id: 2, title: "Hospital Social Services Internship", description: "Provided psycho-social support to 50+ patients at 250-Bedded General Hospital, Pabna, coordinating medical and rehabilitation services.", tags: ["Case Management", "Counseling", "Healthcare", "Social Work"], category: "Social Work", color: "#00ff88", icon: "🏥" },
  { id: 3, title: "Mental Health Advocacy Program", description: "Psycho-social support and rehabilitation planning for patients at Pabna Mental Hospital, working with schizophrenia, bipolar, and substance abuse cases.", tags: ["Mental Health", "Rehabilitation", "Advocacy", "Interdisciplinary"], category: "Social Work", color: "#a78bfa", icon: "🧠" },
  { id: 4, title: "Youth Empowerment Graphic Campaign", description: "Designed 20+ high-quality graphics for YES! YOU CAN Global Foundation, empowering youth and driving sustainability awareness.", tags: ["Graphic Design", "Branding", "Social Media", "NGO"], category: "Creative", color: "#ff0080", icon: "🎨" },
  { id: 5, title: "Web Development Education Program", description: "Conducted online classes on web development for diverse student cohorts at ITJOYBD, developing curriculum and providing one-on-one mentorship.", tags: ["Teaching", "Web Development", "Curriculum Design", "Mentorship"], category: "Education", color: "#60a5fa", icon: "💻" },
  { id: 6, title: "Aspire Leaders Fellowship", description: "Selected for Aspire Institute's Cohort 5 (2025) — a prestigious global leadership development program for emerging change-makers.", tags: ["Leadership", "Fellowship", "Global", "Development"], category: "Leadership", color: "#00f5ff", icon: "🌍" },
];

const experienceList = [
  { id: 1, org: "Aspire Institute", role: "Aspire Leaders — Cohort 5", period: "Oct 2025 – Mar 2026", duration: "6 months", location: "Global (Remote)", description: "Selected for Aspire Institute's prestigious global leadership fellowship for emerging leaders driving social impact.", type: "Fellowship", color: "#00f5ff" },
  { id: 2, org: "Skills Canvas", role: "District Ambassador", period: "Sep 2025 – Feb 2026", duration: "6 months", location: "Dhaka, Bangladesh", description: "Represented Skills Canvas as District Ambassador, promoting skill development initiatives and youth engagement at the district level.", type: "Ambassador", color: "#00ff88" },
  { id: 3, org: "YES! YOU CAN Global Foundation", role: "Graphic Designer", period: "Aug 2025 – Jan 2026", duration: "6 months", location: "Islamabad, Pakistan (Remote)", description: "Designed 20+ high-quality graphics for social media, publications, and promotional materials.", type: "Volunteer", color: "#ff0080" },
  { id: 4, org: "English Carnival Bangladesh", role: "Campus Ambassador", period: "Aug 2025 – Jan 2026", duration: "6 months", location: "Bangladesh", description: "Supported webinars, seminars, and study-abroad programs. Drove student registrations and shared event branding across social media networks.", type: "Ambassador", color: "#a78bfa" },
  { id: 5, org: "International Leadership Competition", role: "University Representative", period: "Aug 2025 – Dec 2025", duration: "5 months", location: "Bangladesh", description: "Represented Pabna University of Science and Technology in an international leadership competition.", type: "Leadership", color: "#60a5fa" },
  { id: 6, org: "General Hospital, Pabna", role: "Internship — Medical Social Worker", period: "Jan 2025 – Apr 2025", duration: "4 months", location: "Pabna Sadar, Rajshahi, Bangladesh", description: "Assisted 50+ patients with psycho-social case management, counseling, needs assessments, and coordination of free medical treatment.", type: "Internship", color: "#00ff88" },
  { id: 7, org: "Mental Hospital, Pabna", role: "Internship — Social Service", period: "Nov 2023 – Feb 2024", duration: "4 months", location: "Pabna Sadar, Rajshahi, Bangladesh", description: "Provided psycho-social support for patients with schizophrenia, bipolar disorder, depression, and substance abuse disorders.", type: "Internship", color: "#a78bfa" },
  { id: 8, org: "ITJOYBD", role: "IT Instructor", period: "Jan 2021 – Feb 2022", duration: "1 yr 2 mos", location: "Dhaka, Bangladesh", description: "Conducted engaging online web development classes, developed curricula, provided one-on-one student support.", type: "Full-time", color: "#00f5ff" },
];

const educationList = [
  { id: 1, institution: "Pabna University of Science and Technology", degree: "Master of Social Work (MSW)", field: "Social Work", period: "Sep 2024 – Oct 2025", location: "Pabna, Bangladesh", thesis: "Socioeconomic Conditions and Livelihood Diversification Between Fisherman and Non-Fisnerman Community in Chalan Beel, Natore", color: "#00f5ff", icon: "🎓" },
  { id: 2, institution: "Pabna University of Science and Technology", degree: "BSS Honours", field: "Social Work", period: "Jan 2019 – Jul 2024", location: "Pabna, Bangladesh", thesis: "The Socioeconomic Impact of Price Hike over the Lower and Lower middle Class People in Pabna", color: "#a78bfa", icon: "🏛️" },
  { id: 3, institution: "Chamari College, Natore", degree: "Higher Secondary Certificate (HSC)", field: "Humanities", period: "Jun 2016 – Feb 2018", location: "Natore, Bangladesh", color: "#00ff88", icon: "📚" },
  { id: 4, institution: "Bahadur Pur Bilateral High School, Natore", degree: "Secondary School Certificate (SSC)", field: "Humanities", period: "Jan 2011 – Dec 2015", location: "Natore, Bangladesh", color: "#ff0080", icon: "🏫" },
];

const certificationsList = [
  { name: "Spreadsheet II: Formatting and Functions", color: "#00f5ff" },
  { name: "Introduction to Digital Business Skills", color: "#a78bfa" },
  { name: "R Programming for Beginners", color: "#00ff88" },
  { name: "Project Management Essentials Certificate", color: "#ff0080" },
  { name: "Communication Skills", color: "#60a5fa" },
];

const awardsList = [
  { title: "Runner-up — Chess Championship", org: "University / Local", icon: "♟️", color: "#00f5ff" },
  { title: "Runner-up — Marriage Tournament (29 Cards)", org: "Regional Competition", icon: "🃏", color: "#a78bfa" },
  { title: "Star Team Member Honor", org: "Organization Recognition", icon: "⭐", color: "#fbbf24" },
];

const languagesList = [
  { name: "Bangla", level: "Native / Bilingual", percent: 100, color: "#00f5ff" },
  { name: "English", level: "Professional Working", percent: 75, color: "#a78bfa" },
];

const NAV_SECTIONS = ["home", "skills", "projects", "experience", "education", "more"];

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [words, wordIdx, charIdx, deleting, speed, pause]);

  return display;
}

// ─── Skill Bar (animates on mount via state) ──────────────────────────────────

const SkillBar: React.FC<{ level: number; color: string }> = ({ level, color }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWidth(level); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [level]);

  return (
    <div ref={ref} className="w-full h-1 rounded-full bg-white overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, background: color, boxShadow: `0 0 8px ${color}88` }}
      />
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ id: string; label: string; title: string; children: React.ReactNode }> = ({
  id, label, title, children,
}) => (
  <section id={`section-${id}`} className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
    <p className="text-xs font-bold tracking-[4px] uppercase text-cyan-400/70 mb-1">{label}</p>
    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 relative inline-block
                   after:absolute after:bottom-[-8px] after:left-0 after:w-3/5 after:h-0.5
                   after:bg-gradient-to-r after:from-cyan-400 after:to-transparent">
      {title}
    </h2>
    {children}
  </section>
);

// ─── Glass card ───────────────────────────────────────────────────────────────

const Glass: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children, className = "", style,
}) => (
  <div
    className={`bg-gray-900/40 border border-cyan-400/15 rounded-xl
                transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_24px_rgba(0,245,255,0.07)]
                ${className}`}
    style={style}
  >
    {children}
  </div>
);

// ─── Main Portfolio Component ─────────────────────────────────────────────────

const Portfolio: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const typed = useTypewriter(personalInfo.taglines);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 120;
      for (const id of NAV_SECTIONS) {
        const el = document.getElementById(`section-${id}`);
        if (el && el.offsetTop <= scrollY) setActiveSection(id);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
        <RainCanvas/>
        <div className="relative z-10 min-h-screen font-sans text-slate-200">

        {/* ── Google Fonts ── */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
            .font-orbitron { font-family: 'Orbitron', monospace; }
            .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
            body { font-family: 'Rajdhani', sans-serif; }
            .blink { animation: blink 1s step-end infinite; }
            @keyframes blink { 50% { opacity: 0; } }
        `}</style>

        {/* ── NAV ─────────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-400/15
                        flex items-center gap-0 px-4 sm:px-8 overflow-x-auto scrollbar-none">
            <span className="font-orbitron text-sm font-bold tracking-widest text-cyan-400 uppercase
                            pr-5 mr-2 border-r border-cyan-400/20 py-4 whitespace-nowrap shrink-0
                            [text-shadow:0_0_12px_rgba(0,245,255,0.6)]">
            AA
            </span>
            {NAV_SECTIONS.map((s) => (
            <button
                key={s}
                onClick={() => scrollTo(s)}
                className={`font-orbitron text-[11px] font-semibold tracking-widest uppercase px-3 py-4
                            whitespace-nowrap shrink-0 border-b-2 transition-all duration-200
                            ${activeSection === s
                            ? "text-cyan-400 border-cyan-400 [text-shadow:0_0_8px_rgba(0,245,255,0.5)]"
                            : "text-slate-200 border-transparent hover:text-cyan-400"
                            }`}
            >
                {s}
            </button>
            ))}
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────────── */}
        <section id="section-home" className="min-h-screen flex items-center px-4 sm:px-8 py-24 max-w-7xl mx-auto">
            <div className="flex flex-col-reverse sm:flex-row items-center gap-10 w-full">

            {/* Left */}
            <div className="flex-1 min-w-0">
                <p className="font-orbitron text-[10px] text-center md:text-left  tracking-[5px] uppercase text-cyan-400/80 mb-3">
                Portfolio
                </p>
                <h1 className="font-orbitron text-4xl text-center md:text-left  sm:text-6xl font-black text-white leading-tight
                            tracking-tight mb-2 [text-shadow:0_0_40px_rgba(0,245,255,0.3)]">
                Md.{" "}
                <span className="text-cyan-400">Ashik</span>{" "}
                Ali
                </h1>
                <p className="font-orbitron text-center md:text-left  text-sm sm:text-base font-normal text-slate-300 tracking-[3px] uppercase mb-5">
                {personalInfo.title}
                </p>

                {/* Typewriter */}
                <p className="font-rajdhani text-base font-semibold text-emerald-400 tracking-wide mb-6 min-h-6">
                &gt; {typed}
                <span className="blink">_</span>
                </p>

                <p className="font-rajdhani tracking-[1px] text-[17px] text-slate-200 leading-relaxed mb-8 max-w-xl">
                {personalInfo.bio}
                </p>

                {/* Contact pills */}
                <div className="flex flex-wrap gap-2">
                {[
                    { label: personalInfo.email, href: `mailto:${personalInfo.email}`, dot: "#00f5ff" },
                    { label: "LinkedIn", href: personalInfo.linkedin, dot: "#60a5fa" },
                    { label: personalInfo.website, href: `https://${personalInfo.website}`, dot: "#a78bfa" },
                    { label: personalInfo.location, href: "#", dot: "#00ff88" },
                ].map(({ label, href, dot }) => (
                    <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                bg-cyan-400/5 border border-cyan-400/20 text-slate-300 tracking-wide
                                hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-400 transition-all"
                    >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot, boxShadow: `0 0 5px ${dot}` }} />
                    {label}
                    </a>
                ))}
                </div>
            </div>

            {/* Avatar */}
<div className="shrink-0 flex items-center justify-center">
  <div
    className="relative
      w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60
      rounded-full overflow-hidden
      flex items-center justify-center

      border-4 border-cyan-400/40

      shadow-[0_0_60px_rgba(0,245,255,0.25),inset_0_0_35px_rgba(0,245,255,0.12)]
      backdrop-blur-md

      before:absolute before:inset-[-12px] before:rounded-full
      before:border-[3px] before:border-cyan-300/30
      before:shadow-[0_0_35px_rgba(0,245,255,0.35)]

      after:absolute after:inset-[-18px] after:rounded-full
      after:border-[2px] after:border-cyan-500/20
      after:blur-sm after:opacity-70
    "
  >
    {/* animated glow ring */}
    <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse" />

    {/* inner highlight ring */}
    <div className="absolute inset-3 rounded-full border border-cyan-300/20" />

    <img
      src="https://i.postimg.cc/prYV9dWT/ash.png"
      alt="Md. Ashik Ali"
      className="
        w-full h-full
        object-cover
        scale-100
        translate-y-3 sm:translate-y-4 md:translate-y-5
        transition-transform duration-300
      "
    />
  </div>
</div>

            </div>
        </section>

        

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />

        {/* ── PROJECTS ────────────────────────────────────────────────────────── */}
        <Section id="projects" label="Work" title="Projects & Initiatives">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectsList.map((p) => (
                <Glass key={p.id} className="p-5 flex flex-col gap-3" style={{ borderColor: `${p.color}22` }}>
                <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl leading-none">{p.icon}</span>
                    <span
                    className="font-orbitron text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border"
                    style={{ color: p.color, borderColor: p.color, opacity: 0.8 }}
                    >
                    {p.category}
                    </span>
                </div>
                <h3 className="font-orbitron text-sm font-semibold leading-snug" style={{ color: p.color }}>
                    {p.title}
                </h3>
                <p className="font-rajdhani text-[15px] text-slate-100 leading-relaxed flex-1">
                    {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {p.tags.map((t) => (
                    <span
                        key={t}
                        className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded"
                        style={{ color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}30` }}
                    >
                        {t}
                    </span>
                    ))}
                </div>
                </Glass>
            ))}
            </div>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />

        {/* ── EXPERIENCE ──────────────────────────────────────────────────────── */}
        <Section id="experience" label="Career" title="Experience">
            <div className="relative pl-8 border-l border-cyan-400/20">
            {experienceList.map((e) => (
                <div key={e.id} className="relative mb-6 last:mb-0">
                {/* Timeline dot */}
                <div
                    className="absolute -left-[2.3rem] top-5 w-2.5 h-2.5 rounded-full border-2 bg-slate-950"
                    style={{ borderColor: e.color, boxShadow: `0 0 8px ${e.color}` }}
                />
                <Glass className="p-5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span className="font-orbitron text-sm font-semibold text-white">{e.role}</span>
                    <span className="font-rajdhani text-sm font-semibold" style={{ color: e.color }}>{e.org}</span>
                    <span
                        className="font-orbitron text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border"
                        style={{ color: e.color, borderColor: e.color, opacity: 0.75 }}
                    >
                        {e.type}
                    </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                    <span className="text-[11px] text-slate-200 tracking-wide">📅 {e.period}</span>
                    <span className="text-[11px] text-slate-200 tracking-wide">⏱ {e.duration}</span>
                    <span className="text-[11px] text-slate-200 tracking-wide">📍 {e.location}</span>
                    </div>
                    <p className="font-rajdhani text-[14px] text-slate-100 leading-relaxed">{e.description}</p>
                </Glass>
                </div>
            ))}
            </div>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />

        {/* ── EDUCATION ───────────────────────────────────────────────────────── */}
        <Section id="education" label="Academic" title="Education">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {educationList.map((e) => (
                <Glass key={e.id} className="p-5 flex flex-col gap-2" style={{ borderColor: `${e.color}33` }}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{e.icon}</span>
                    <span className="font-orbitron text-sm font-semibold leading-snug" style={{ color: e.color }}>
                    {e.degree}
                    </span>
                </div>
                <p className="font-rajdhani text-sm font-semibold" style={{ color: e.color, opacity: 0.85 }}>
                    {e.institution}
                </p>
                <p className="font-rajdhani text-[12px] text-slate-200 tracking-wide">{e.field} · {e.period}</p>
                <p className="font-rajdhani text-[12px] text-slate-200 tracking-wide">📍 {e.location}</p>
                {e.thesis && (
                    <p
                    className="font-rajdhani text-[13px] italic text-slate-100 leading-relaxed px-3 py-2 mt-1 rounded-r-md bg-white/[0.03] border-l-2"
                    style={{ borderColor: e.color }}
                    >
                    Thesis: {e.thesis}
                    </p>
                )}
                </Glass>
            ))}
            </div>
        </Section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />

        {/* ── SKILLS ──────────────────────────────────────────────────────────── */}
        <Section id="skills" label="Expertise" title="Skills & Proficiency">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsList.map((skill, i) => (
                <Glass key={i} className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: skill.color, opacity: 0.75 }}>
                    {skill.category}
                </p>
                <div className="flex justify-between items-baseline mb-2">
                    <span className="font-rajdhani text-sm font-semibold text-slate-200">{skill.name}</span>
                    <span className="font-orbitron text-[11px] font-bold" style={{ color: skill.color }}>
                    {skill.level}%
                    </span>
                </div>
                <SkillBar level={skill.level} color={skill.color} />
                </Glass>
            ))}
            </div>
        </Section>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />

        {/* ── MORE ────────────────────────────────────────────────────────────── */}
        <Section id="more" label="Additional" title="Certs, Awards & Languages">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

            {/* Certifications */}
            <div>
                <p className="font-orbitron text-[10px] font-bold tracking-[3px] uppercase text-cyan-400/70
                            mb-4 pb-2 border-b border-cyan-400/15">
                Certifications
                </p>
                <div className="flex flex-col gap-2">
                {certificationsList.map((c, i) => (
                    <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-cyan-400/15
                                bg-cyan-400/[0.03] hover:border-cyan-400/30 transition-colors"
                    >
                    <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                        style={{ background: c.color, boxShadow: `0 0 5px ${c.color}` }}
                    />
                    <span className="font-rajdhani text-[13px] font-medium text-slate-200 leading-snug">{c.name}</span>
                    </div>
                ))}
                </div>
            </div>

            {/* Awards */}
            <div>
                <p className="font-orbitron text-[10px] font-bold tracking-[3px] uppercase text-cyan-400/70
                            mb-4 pb-2 border-b border-cyan-400/15">
                Honours & Awards
                </p>
                <div className="flex flex-col gap-2">
                {awardsList.map((a, i) => (
                    <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-cyan-400/15
                                bg-cyan-400/[0.03] hover:border-cyan-400/30 transition-colors"
                    >
                    <span className="text-2xl shrink-0">{a.icon}</span>
                    <div>
                        <p className="font-rajdhani text-[15px] font-semibold" style={{ color: a.color }}>{a.title}</p>
                        <p className="font-rajdhani text-[13px] text-slate-300 mt-0.5">{a.org}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Languages */}
            <div>
                <p className="font-orbitron text-[10px] font-bold tracking-[3px] uppercase text-cyan-400/70
                            mb-4 pb-2 border-b border-cyan-400/15">
                Languages
                </p>
                <div className="flex flex-col gap-5">
                {languagesList.map((l, i) => (
                    <div key={i}>
                    <div className="flex justify-between items-baseline mb-1.5">
                        <span className="font-orbitron text-sm font-semibold text-white">{l.name}</span>
                        <span className="font-rajdhani text-[11px] text-slate-200 tracking-wide">{l.level}</span>
                    </div>
                    <div className="w-full h-0.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                        className="h-full rounded-full"
                        style={{ width: `${l.percent}%`, background: l.color, boxShadow: `0 0 8px ${l.color}88` }}
                        />
                    </div>
                    </div>
                ))}
                </div>
            </div>

            </div>
        </Section>

        {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
        <footer className="border-t border-cyan-400/15 bg-gray-900/60 py-6 text-center">
            <p className="font-orbitron text-[10px] tracking-[2px] uppercase text-slate-300">
            © {new Date().getFullYear()} Md. Ashik Ali · Researcher & Social Worker · Bangladesh
            </p>
        </footer>

        </div>
    
    </>
  );
};

export default Portfolio;