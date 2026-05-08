import React, { useState, useEffect, useRef } from "react";
import RainCanvas from "../components/RainBackground";
import ProjectsSection from "../components/Projects";
import NavBar from "../components/Navbar";
import Research from "../components/Research";
import ExtracurricularActivities from "../components/ExtraActivity";
import SocialLinksSection from "../components/SocialLinks";
import Hero from "../components/Hero";

// ─── Data ─────────────────────────────────────────────────────────────────────



const skillsListSoft = [
  { name: "Data Collection & Analysis", level: 90, category: "Research", color: "#00f5ff" },
  { name: "SPSS Statistical Software", level: 85, category: "Research", color: "#00f5ff" },
  { name: "Social Research Methods", level: 88, category: "Research", color: "#00f5ff" },
  { name: "Psycho-Social Case Management", level: 82, category: "Social Work", color: "#00ff88" },
  { name: "Counseling & Support", level: 80, category: "Social Work", color: "#00ff88" },
  { name: "Community Development", level: 86, category: "Social Work", color: "#00ff88" },
  { name: "Academic / Report Writing", level: 84, category: "Communication", color: "#a78bfa" },
  { name: "Project Management", level: 78, category: "Management", color: "#fbbf24" },
  { name: "Public Speaking & Leadership", level: 80, category: "Communication", color: "#a78bfa" },
];

const skillsListTools = [
  { name: "APPSCRIPT", level: 75, category: "Technical", color: "#34d399" }, // emerald
  { name: "TYPESCRIPT", level: 82, category: "Technical", color: "#3178c6" }, // ts blue
  { name: "NODE", level: 78, category: "Technical", color: "#68a063" }, // node green
  { name: "REACT", level: 85, category: "Technical", color: "#61dafb" }, // react cyan
  { name: "JS", level: 84, category: "Technical", color: "#f7df1e" }, // js yellow
  { name: "CSS", level: 92, category: "Technical", color: "#38bdf8" }, // sky blue
  { name: "HTML", level: 95, category: "Technical", color: "#f97316" }, // orange
  { name: "GITHUB", level: 80, category: "Technical", color: "#a78bfa" }, // violet
  { name: "GIT", level: 78, category: "Technical", color: "#ef4444" }, // red
  { name: "Microsoft Office Suite", level: 90, category: "Technical", color: "#2563eb" }, // office blue
  { name: "Graphic Design", level: 76, category: "Creative", color: "#ff0080" }, // pink
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
  { id: 6, org: "General Hospital, Pabna", role: "Internship — Medical Social Worker", period: "Jan 2025 – Apr 2025", duration: "4 months", location: "Pabna Sadar, Rajshahi, Bangladesh", description: "Assisted 50+ patients with psycho-social case management, counseling, needs assessments, and coordination of free medical treatment.", type: "Internship", color: "#00ff88" },
  { id: 7, org: "Mental Hospital, Pabna", role: "Internship — Social Service", period: "Nov 2023 – Feb 2024", duration: "4 months", location: "Pabna Sadar, Rajshahi, Bangladesh", description: "Provided psycho-social support for patients with schizophrenia, bipolar disorder, depression, and substance abuse disorders.", type: "Internship", color: "#a78bfa" },
  { id: 8, org: "ITJOYBD", role: "IT Instructor", period: "Jan 2021 – Feb 2022", duration: "1 yr 2 mos", location: "Dhaka, Bangladesh", description: "Conducted engaging online web development classes, developed curricula, provided one-on-one student support.", type: "Full-time", color: "#00f5ff" },
  { id: 3, org: "YES! YOU CAN Global Foundation", role: "Graphic Designer", period: "Aug 2025 – Jan 2026", duration: "6 months", location: "Islamabad, Pakistan (Remote)", description: "Designed 20+ high-quality graphics for social media, publications, and promotional materials.", type: "Volunteer", color: "#ff0080" },
  { id: 2, org: "Skills Canvas", role: "District Ambassador", period: "Sep 2025 – Feb 2026", duration: "6 months", location: "Dhaka, Bangladesh", description: "Represented Skills Canvas as District Ambassador, promoting skill development initiatives and youth engagement at the district level.", type: "Ambassador", color: "#00ff88" },
  { id: 1, org: "Aspire Institute", role: "Aspire Leaders — Cohort 5", period: "Oct 2025 – Mar 2026", duration: "6 months", location: "Global (Remote)", description: "Selected for Aspire Institute's prestigious global leadership fellowship for emerging leaders driving social impact.", type: "Fellowship", color: "#00f5ff" },
  { id: 4, org: "English Carnival Bangladesh", role: "Campus Ambassador", period: "Aug 2025 – Jan 2026", duration: "6 months", location: "Bangladesh", description: "Supported webinars, seminars, and study-abroad programs. Drove student registrations and shared event branding across social media networks.", type: "Ambassador", color: "#a78bfa" },
  { id: 5, org: "International Leadership Competition", role: "University Representative", period: "Aug 2025 – Dec 2025", duration: "5 months", location: "Bangladesh", description: "Represented Pabna University of Science and Technology in an international leadership competition.", type: "Leadership", color: "#60a5fa" },
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
  <section id={`section-${id}`} className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
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




  return (
    <>
        <RainCanvas/>
        <div className="relative z-10 min-h-screen font-sans text-slate-200">

        {/* ── Google Fonts ── */}
        <style>{`);
            .font-orbitron { font-family: 'Orbitron', monospace; }
            .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
            body { font-family: 'Rajdhani', sans-serif; }
            .blink { animation: blink 1s step-end infinite; }
            @keyframes blink { 50% { opacity: 0; } }
        `}</style>



        <NavBar />

        {/* ── HERO ────────────────────────────────────────────────────────────── */}
        <section id="section-home" className="min-h-screen flex items-center px-4 sm:px-8 py-24 max-w-7xl mx-auto">
          <Hero />
        </section>

        

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />



        {/* ── PROJECTS ────────────────────────────────────────────────────────── */}
        <Section id="works" label="Work" title="Works & Initiatives">
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
        
        
        
        <Section id="projects" label="" title="">
          < ProjectsSection  />
        </Section>
        
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />



        {/* ── EXPERIENCE ──────────────────────────────────────────────────────── */}
        <Section id="experience" label="Career" title="Experience">
            <div className="relative pl-8 border-l border-cyan-400/20">
            {experienceList.map((e) => (
                <div key={e.id} className="relative mb-6 last:mb-0">
                {/* Timeline dot */}
                <div
                    className="absolute -left-[2.35rem] top-5 w-2.5 h-2.5 rounded-full border-2 bg-slate-950"
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



        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />


        {/* Research */}
        <Section id="research" label="Research" title="Research Works">
          <Research />
        </Section>



        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />



        {/* ── SKILLS ──────────────────────────────────────────────────────────── */}
        <Section id="skills" label="Expertise" title="Skills & Proficiency">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsListSoft.map((skill, i) => (
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


        {/* ── Tools ──────────────────────────────────────────────────────────── */}
        <Section id="tools" label="IT Tools" title="Tools and Technologies">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsListTools.map((skill, i) => (
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



 {/* Extra Activities */}
        <Section id="activity" label="Extra Curricular" title="Actvities">
          <ExtracurricularActivities />
        </Section>



        {/* Divider */}
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
        
        
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent mx-4 sm:mx-8" />


        {/* ── Social links ────────────────────────────────────────────────────────────── */}
        <Section id="social" label="Social" title="Get in Touch">
            <SocialLinksSection />
        </Section>

        {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
        <footer className="border-t border-cyan-400/15 bg-gray-900/60 py-6 text-center">
            <p className="font-orbitron text-[10px] tracking-[2px] uppercase text-slate-300">
            © {new Date().getFullYear()} Md. Ashik Ali · ASH · Bangladesh
            </p>
        </footer>

        </div>
    
    </>
  );
};

export default Portfolio;