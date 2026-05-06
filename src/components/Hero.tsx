import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Download, Eye } from "lucide-react";
import { personalInfo } from "../hooks/portfolioData";

// ─── Typing animation hook ───
const useTypingEffect = (words: string[], speed = 80, pause = 2000) => {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setText(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        } else {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        if (charIdx > 0) {
          setText(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        } else {
          setDeleting(false);
          setWordIdx((w) => (w + 1) % words.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return text;
};

// ─── Floating orb decoration ───
const FloatOrb: React.FC<{ color: string; size: number; x: string; y: string; delay: number }> = ({ color, size, x, y, delay }) => (
  <motion.div
    animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    style={{
      position: "absolute", left: x, top: y,
      width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      filter: `blur(${size / 3}px)`,
      pointerEvents: "none",
    }}
  />
);

const Hero: React.FC = () => {
  const typedText = useTypingEffect(personalInfo.taglines);

  const scrollToProjects = () => {
    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen items-center justify-center overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {/* Ambient orbs */}
      <FloatOrb color="#00f5ff" size={300} x="10%" y="20%" delay={0} />
      <FloatOrb color="#7c3aed" size={250} x="75%" y="10%" delay={1.5} />
      <FloatOrb color="#ff0080" size={180} x="60%" y="70%" delay={2.5} />

      {/* Grid lines overlay */}
      <div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-0 text-center px-4 max-w-5xl mx-auto pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass neon-border rounded-full px-4 py-2 text-xs font-mono tracking-widest mb-6"
          style={{ color: "var(--neon-cyan)" }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
          AVAILABLE FOR RESEARCH & COLLABORATION
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display font-black leading-none mb-4"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
        >
          <span className="text-white">Md. </span>
          <span className="neon-text-cyan">Ashik</span>
          <br />
          <span className="text-white">Ali</span>
        </motion.h1>

        {/* Typing subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-body text-xl md:text-2xl font-semibold tracking-wide mb-2 h-10 flex items-center justify-center gap-1"
          style={{ color: "var(--neon-purple)" }}
        >
          <span>{typedText}</span>
          <span className="typing-cursor text-[var(--neon-cyan)]">|</span>
        </motion.div>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="font-mono text-sm text-slate-400 mb-8 tracking-wider"
        >
          📍 {personalInfo.location}
        </motion.p>

        {/* Bio snippet */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="font-body text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Social Work researcher passionate about <span style={{ color: "var(--neon-cyan)" }}>community welfare</span>,{" "}
          <span style={{ color: "var(--neon-purple)" }}>data-driven research</span>, and{" "}
          <span style={{ color: "var(--neon-pink)" }}>sustainable social change</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToProjects}
            className="btn-glow flex items-center gap-2 px-6 py-3 rounded font-display font-semibold text-sm tracking-widest"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.15))",
              border: "1px solid var(--neon-cyan)",
              color: "var(--neon-cyan)",
            }}
          >
            <Eye size={16} />
            VIEW PROJECTS
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToContact}
            className="btn-glow flex items-center gap-2 px-6 py-3 rounded font-display font-semibold text-sm tracking-widest text-slate-300"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <Download size={16} />
            GET IN TOUCH
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="mt-10 relative">
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className=" bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
        style={{ color: "rgba(0,245,255,0.5)" }}
      >
        <span className="font-mono text-xs tracking-widest">SCROLL</span>
        <ChevronDown size={20} />
      </motion.div>
      </div>
    </section>
  );
};

export default Hero;