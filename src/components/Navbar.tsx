import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X } from "lucide-react";

// ─── Nav links ───
const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  darkMode: boolean;
  toggleDark: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDark }) => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log("hi! nav")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setActive(href);
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-[rgba(0,245,255,0.15)] shadow-lg shadow-[rgba(0,245,255,0.05)]"
          : "bg-transparent"
      }`}
      style={{ zIndex: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#hero"
            onClick={(e) => { e.preventDefault(); handleNav("#hero"); }}
            className="font-display font-bold text-lg tracking-widest neon-text-cyan cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            MA<span style={{ color: "var(--neon-purple)" }}>.</span>
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`relative px-4 py-2 font-body font-semibold text-sm tracking-wider uppercase transition-all duration-200 rounded-sm ${
                  active === link.href
                    ? "text-[var(--neon-cyan)]"
                    : "text-slate-400 hover:text-[var(--neon-cyan)]"
                }`}
              >
                {active === link.href && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: "var(--neon-cyan)", boxShadow: "0 0 8px var(--neon-cyan)" }}
                  />
                )}
                {link.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              className="p-2 rounded-full glass neon-border text-[var(--neon-cyan)] transition-all duration-200"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-[var(--neon-cyan)]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-[rgba(0,245,255,0.1)]"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`text-left px-4 py-2 font-body font-semibold text-sm uppercase tracking-wider rounded ${
                    active === link.href
                      ? "text-[var(--neon-cyan)] bg-[rgba(0,245,255,0.05)]"
                      : "text-slate-400"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;