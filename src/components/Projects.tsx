import { useState } from "react";

const projects = [
  {
    id: 1,
    title: "Hex Bachelor House",
    category: "react",
    type: "Full Stack",
    image: "https://i.postimg.cc/DwTnRW5X/hex-house.png",
    liveLink: "https://hex-bachelor.netlify.app",
    description:
      "This is a full stack real and usable project designed for my living flate. Fully Functiional and Performing project.",
    technologies: ["React", "Typescript", "AppScript"],
  },
  {
    id: 2,
    title: "ASH English",
    category: "react",
    type: "Full Stack",
    image: "https://i.postimg.cc/jS2nMzNq/ASH-Dictionary.png",
    liveLink: "https://ash-english.netlify.app",
    description:
      "This is English Learning Dictionary, includes word definitions, synonyms, antonyms, Phrases and Idioms.",
    technologies: ["React", "React Bootstrap", "Node.js", "Express", "MongoDB"],
  },
  {
    id: 3,
    title: "CoolShop Ecommerce",
    category: "html-css",
    type: "Frontend",
    image: "https://ashik-ashik.github.io/img/cool-shop/g4.jpg",
    liveLink: "https://ashik-ashik.github.io/cool-shop/",
    description:
      "A fully responsive e-commerce website with multiple UI interactions and Bootstrap features.",
    technologies: ["HTML", "CSS", "Bootstrap", "JavaScript"],
  },
  {
    id: 4,
    title: "HotShopee Ecommerce",
    category: "html-css",
    type: "Frontend",
    image: "https://ashik-ashik.github.io/hot-shop/img/blog/blog-home-1.jpg",
    liveLink: "https://ashik-ashik.github.io/hot-shop/",
    description:
      "A responsive e-commerce website built using Bootstrap with modern layouts and interactive features.",
    technologies: ["HTML", "CSS", "Bootstrap", "JavaScript"],
  },
  {
    id: 5,
    title: "Educational Website",
    category: "react",
    type: "Frontend",
    image:
      "https://world-leading-university.netlify.app/education/courses/course-img-1.jpg",
    liveLink: "https://world-leading-university.netlify.app/",
    description:
      "A simple and responsive educational website developed using React and React Bootstrap.",
    technologies: ["React", "JavaScript", "React Bootstrap"],
  },
  {
    id: 6,
    title: "Creative Landing Page",
    category: "html-css",
    type: "Frontend",
    image: "https://ashik-ashik.github.io/techno/img/bg-4.jpg",
    liveLink: "https://ashik-ashik.github.io/techno/",
    description:
      "A lightweight responsive landing page built with HTML, CSS, Bootstrap, and JavaScript.",
    technologies: ["HTML", "CSS", "Bootstrap", "JavaScript"],
  },
];

const FILTERS = ["all", "react", "html-css"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All Projects",
  react: "React",
  "html-css": "HTML / CSS",
};

/* ── type badge colours ────────────────────────────────────────────────── */
const TYPE_STYLES: Record<string, string> = {
  "Full Stack":
    "bg-cyan-400/10 text-cyan-300 border border-cyan-400/30",
  Frontend:
    "bg-violet-400/10 text-violet-200 border border-violet-400/30",
};

export default function ProjectsSection() {
  const [active, setActive] = useState<Filter>("all");

  const filtered =
    active === "all" ? projects : projects.filter((p) => p.category === active);

  return (
    <section  className="px-4 sm:px-8 max-w-7xl mx-auto">

      {/* ── Section heading ─────────────────────────────────────────────── */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
        <div>
          <p className="font-orbitron text-[10px] tracking-[0.3em] uppercase text-cyan-400/60 mb-2">
            Portfolio
          </p>
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white
                         [text-shadow:0_0_30px_rgba(0,245,255,0.25)]">
            Projects
            <span className="text-cyan-400">.</span>
          </h2>
          {/* Decorative rule */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-12 bg-cyan-400 [box-shadow:0_0_6px_rgba(0,245,255,0.8)]" />
            <div className="h-px w-4 bg-cyan-400/30" />
            <div className="h-px w-2 bg-cyan-400/15" />
          </div>
        </div>

        {/* ── Filter pills ──────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`font-orbitron text-[10px] font-semibold tracking-widest uppercase
                          px-4 py-2 rounded border transition-all duration-200
                          ${active === f
                            ? "bg-cyan-400/15 border-cyan-400/70 text-cyan-300 [box-shadow:0_0_14px_rgba(0,245,255,0.25)]"
                            : "bg-transparent border-slate-700 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-400"
                          }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

/* ── Individual card ────────────────────────────────────────────────────── */
function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-lg
                 bg-slate-900/60 border border-slate-700/60
                 hover:border-cyan-400/40 transition-all duration-300
                 hover:[box-shadow:0_0_28px_rgba(0,245,255,0.10)]"
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105 opacity-50"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/640x360/0f172a/334155?text=Project";
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 flex items-center justify-center">
          <a
            href={project.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-orbitron text-[10px] tracking-widest uppercase
                       px-5 py-2.5 rounded border border-cyan-400 text-cyan-300
                       bg-slate-950/80 hover:bg-cyan-400/15 transition-all duration-200
                       [box-shadow:0_0_18px_rgba(0,245,255,0.35)]
                       flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Live Preview
          </a>
        </div>

        {/* Type badge */}
        <span className={`absolute top-3 left-3 font-orbitron text-[9px] tracking-widest
                          uppercase px-2.5 py-1 rounded ${TYPE_STYLES[project.type] ?? ""}`}>
          {project.type}
        </span>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Title */}
        <h3 className="font-orbitron text-sm font-bold text-slate-100
                       group-hover:text-cyan-300 transition-colors duration-200
                       [text-shadow:none] group-hover:[text-shadow:0_0_12px_rgba(0,245,255,0.35)]">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-xs leading-relaxed flex-1">
          {project.description}
        </p>

        {/* ── Tech stack ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-700/50">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[9px] tracking-wide uppercase
                         bg-slate-800/80 text-slate-400 border border-slate-700/60
                         px-2 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* ── CTA link ────────────────────────────────────────────────── */}
        <a
          href={project.liveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-orbitron text-[9px] tracking-widest uppercase text-cyan-400/70
                     hover:text-cyan-300 transition-colors duration-200
                     flex items-center gap-1.5 mt-1 w-fit group/link"
        >
          <span className="h-px w-4 bg-cyan-400/50 group-hover/link:w-7 transition-all duration-300" />
          View Project
          <svg className="w-3 h-3 translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  );
}