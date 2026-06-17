/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  ShieldCheck,
  Sparkles,
  LockKeyhole,
  UserCheck,
  LogOut,
  LayoutDashboard,
  Bell,
  Settings,
  ChevronRight,
  Activity,
  Star,
  Zap,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────
   LOGGED-IN DASHBOARD VIEW
───────────────────────────────────────────── */
const LoggedInView: React.FC<{ user: any; onLogout: () => void }> = ({
  user,
  onLogout,
}) => {
  const firstName = user.displayName?.split(" ")[0] ?? "there";
  const initials = user.displayName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

    const {currentUserInfo} = useAuth();

  const cards = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      desc: "View your workspace",
      color: "from-cyan-500/20 to-cyan-500/5",
      border: "border-cyan-400/25",
      accent: "text-cyan-300",
      link: currentUserInfo?.Role === "ASH_SYSTEM_CORE"
        ? "/career"
        : "/"
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: "Personal",
      desc: "Recent actions & logs",
      color: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-400/25",
      accent: "text-blue-300",
      link: currentUserInfo?.Role === "ASH_SYSTEM_CORE"
        ? "/personal"
        : "/"
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "Job Circular Collection",
      desc: "View collected job circulars",
      color: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-400/25",
      accent: "text-violet-300",
      link: currentUserInfo?.Role === "ASH_SYSTEM_CORE"
        ? "/career/apply-korte-hobe"
        : "/career/apply-korte-hobe"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Integrations",
      desc: "Connected apps",
      color: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-400/25",
      accent: "text-amber-300",
      link: currentUserInfo?.Role === "ASH_SYSTEM_CORE"
        ? "/integrations"
        : "/"
    },
  ];

  return (
    <div className="min-h-screen  text-white overflow-hidden relative flex flex-col items-center justify-center px-4 py-12">
      {/* BG blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-40 w-[500px] h-[500px] bg-cyan-500/15 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-blue-500/15 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/[0.04] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.04] rounded-full" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
        {/* ── TOP NAV BAR ── */}
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="font-black tracking-wide text-lg">AuthSphere</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,255,255,0.06)] overflow-hidden relative">
          {/* shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/30 flex items-center justify-center text-2xl font-black text-cyan-300">
                  {initials}
                </div>
              )}
              {/* online dot */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#030712] shadow-md shadow-emerald-400/50" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-cyan-400 uppercase tracking-widest mb-1">
                Welcome back
              </p>
              <h2 className="text-3xl font-black truncate">Hey, {firstName} 👋</h2>
              <p className="text-gray-400 text-sm mt-0.5 truncate">{user.email}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center gap-1.5 text-xs bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Verified
                </span>
                <span className="flex items-center gap-1.5 text-xs bg-cyan-500/15 border border-cyan-400/25 text-cyan-300 rounded-full px-3 py-1">
                  <ShieldCheck className="w-3 h-3" />
                  Google Auth
                </span>
                <span className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-gray-400 rounded-full px-3 py-1">
                  UID: {user.uid?.slice(0, 8)}…
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Member since", value: new Date(parseInt(user.metadata?.createdAt ?? "0")).getFullYear() },
              { label: "Last login", value: "Just now" },
              { label: "Provider", value: "Google" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/5 border border-white/8 p-3 text-center"
              >
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACCESS CARDS ── */}
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <Link to={c?.link || '/'} key={c.label}
                className={`group rounded-2xl border ${c.border} bg-gradient-to-br ${c.color} backdrop-blur-sm p-4 text-left hover:scale-[1.02] hover:shadow-lg transition-all duration-200`}
                >
                
                <div className="flex items-start justify-between mb-3">
                    <div className={`${c.accent} opacity-90`}>{c.icon}</div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
                <p className="font-bold text-sm text-white">{c.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{c.desc}</p>
            </Link>
          ))}
        </div>

        {/* ── SIGN OUT ── */}
        <button
          onClick={onLogout}
          className="group w-full flex items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-400/30 py-4 text-red-400 hover:text-red-300 font-semibold transition-all duration-200"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          Sign out of AuthSphere
        </button>

        <p className="text-center text-gray-600 text-xs">
          © 2026 AuthSphere. All rights reserved.
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────── */
const LoginPage: React.FC = () => {
  const { googleLogin, logout, user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await googleLogin();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    }
  };

  /* ── LOGGED IN ── */
  if (user) {
    return <LoggedInView user={user} onLogout={handleLogout} />;
  }

  /* ── LOGGED OUT ── */
  return (
    <div className="min-h-screen relative overflow-hidden  text-white flex items-center justify-center px-4 py-10">
      {/* BG */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5 shadow-[0_0_80px_rgba(0,255,255,0.08)]">
        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wide">AuthSphere</h1>
                <p className="text-sm text-gray-400">Secure Authentication Platform</p>
              </div>
            </div>

            <h2 className="text-5xl leading-tight font-black mb-5">
              Welcome Back
              <span className="block text-cyan-300">Continue Your Journey</span>
            </h2>

            <p className="text-gray-300 leading-relaxed max-w-lg text-base">
              Sign in securely with your Google account and access your personalized
              dashboard, saved data, and powerful tools instantly.
            </p>

            <div className="mt-12 space-y-5">
              {[
                {
                  icon: <ShieldCheck className="w-6 h-6 text-cyan-300" />,
                  title: "Enterprise Security",
                  desc: "Firebase powered authentication with secure login and protected access.",
                },
                {
                  icon: <LockKeyhole className="w-6 h-6 text-cyan-300" />,
                  title: "Privacy First",
                  desc: "Your information stays protected with modern authentication practices.",
                },
                {
                  icon: <UserCheck className="w-6 h-6 text-cyan-300" />,
                  title: "Personalized Experience",
                  desc: "Access your own dashboard, preferences, and synced profile.",
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{f.title}</h3>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 pt-10">© 2026 AuthSphere. All rights reserved.</p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-6 sm:p-10 md:p-14">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-5">
                <Sparkles className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-3xl font-black">AuthSphere</h1>
              <p className="text-gray-400 mt-2">Modern Secure Authentication</p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <div className="mb-8">
                <h2 className="text-4xl font-black mb-3">Sign In</h2>
                <p className="text-gray-400 leading-relaxed">
                  Continue with your Google account to securely access your dashboard.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white text-gray-900 py-4 px-6 font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(255,255,255,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 via-transparent to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center justify-center gap-4">
                  <FcGoogle className="text-3xl" />
                  {loading ? "Signing In…" : "Continue with Google"}
                </span>
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#07101f] px-4 text-sm text-gray-500">
                    Secure & Fast Authentication
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Protected by Firebase Authentication",
                  "One-click secure login experience",
                  "Responsive across all devices",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-2 h-2 rounded-full bg-cyan-300 flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm mt-8 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;