import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Crown,
  Zap,
  Activity,
  Cpu,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { useNoiseCanvas } from "@/lib/useNoiseCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GrejLabs — UID Bypass Reseller Console" },
      {
        name: "description",
        content:
          "High-performance UID access control platform, active capacity limits, and reseller command console.",
      },
    ],
  }),
  component: Index,
});

const DISCORD_LINK = "https://discord.gg/grej";

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // High-performance lightweight noise canvas
  useNoiseCanvas(canvasRef);

  // Navigation line position state
  const [lineState, setLineState] = useState<{ left: number; width: number; color: string }>({
    left: 0,
    width: 0,
    color: "#def141",
  });

  function handleNavMouseEnter(e: React.MouseEvent<HTMLAnchorElement>, color: string) {
    const target = e.currentTarget;
    setLineState({
      left: target.offsetLeft,
      width: target.offsetWidth,
      color,
    });
  }

  const navLinks = [
    { label: "Home", color: "#def141", href: "#hero" },
    { label: "Workstation", color: "#f88cd4", href: "#features" },
    { label: "Reseller Rates", color: "#38bdf8", href: "#rates" },
    { label: "Control Room", color: "#5c31ff", href: "/auth" },
  ];

  return (
    <div className="relative min-h-screen bg-[#0d0e12] text-white font-sans overflow-x-hidden selection:bg-[#5c31ff] selection:text-white">
      {/* Lightweight Film Grain Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.04] z-50"
      />

      {/* WEBFLOW GLASSMORPHISM NAVIGATION */}
      <nav className="relative z-40 w-full border-b border-white/10 bg-[#0d0e12]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#5c31ff]/20 border border-[#5c31ff]/50 text-[#def141] shadow-[0_0_15px_rgba(92,49,255,0.3)]">
              <ShieldCheck className="size-6" />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-white">
              Grej<span className="text-[#def141]">Labs</span>
            </span>
          </Link>

          {/* Desktop Sliding Line Menu */}
          <div className="relative hidden md:flex items-center gap-6 font-mono text-sm">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={(e) => handleNavMouseEnter(e, link.color)}
                className="py-2 text-slate-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Sliding Line Indicator */}
            <motion.div
              animate={{
                left: lineState.left,
                width: lineState.width,
                backgroundColor: lineState.color,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute bottom-0 h-[3px] rounded-full shadow-[0_0_12px_currentColor]"
            />
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-mono font-bold text-slate-200 transition-all"
            >
              <MessageSquare className="size-4 text-[#5865F2]" />
              <span>Discord</span>
            </a>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-[#5c31ff] px-6 py-2.5 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(92,49,255,0.4)] hover:bg-[#4a22e0] transition-all"
            >
              <span>Enter Console</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="flex md:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Animated Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-[#0d0e12]/95 backdrop-blur-2xl px-6 py-6 space-y-4"
            >
              <div className="flex flex-col space-y-3 font-mono text-sm">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="pt-2 flex flex-col gap-3 font-mono text-xs">
                <a
                  href={DISCORD_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-white font-bold"
                >
                  <MessageSquare className="size-4 text-[#5865F2]" />
                  <span>Join Discord Community</span>
                </a>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5c31ff] py-3 text-white font-bold shadow-[0_0_20px_rgba(92,49,255,0.4)]"
                >
                  <span>Enter Console</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-20 sm:pb-28 lg:px-10 lg:pt-24 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#def141]/40 bg-[#def141]/10 px-4 py-1.5 text-[11px] sm:text-xs font-mono font-bold text-[#def141]"
            >
              <Sparkles className="size-3.5 sm:size-4 text-[#def141]" />
              <span>HIGH-PERFORMANCE UID RESELLER PLATFORM</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none uppercase font-display"
            >
              GREJLABS <br />
              <span className="text-slate-400">UID BYPASS &</span> <br />
              <span className="bg-gradient-to-r from-[#f88cd4] via-[#def141] to-[#5c31ff] bg-clip-text text-transparent">
                Workstation
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-1 text-sm sm:text-base lg:text-lg text-slate-300 font-mono leading-relaxed max-w-2xl mx-auto lg:mx-0"
          >
            <p>Giving resellers and developers a competitive edge with</p>
            <p className="text-slate-400">sub-second UID access control & zero per-action transaction fees.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <Link
              to="/auth"
              className="inline-flex items-center gap-3 sm:gap-4 rounded-full bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-mono font-black text-slate-950 shadow-2xl hover:bg-slate-200 transition-all group"
            >
              <span>Launch Console</span>
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-slate-950 text-white group-hover:translate-x-1 transition-transform">
                <ArrowRight className="size-3.5 sm:size-4" />
              </div>
            </Link>

            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-mono font-bold text-white transition-all"
            >
              <MessageSquare className="size-4 text-[#5865F2]" />
              <span>Join Discord</span>
            </a>
          </motion.div>
        </div>

        {/* Right Hero Video Banner */}
        <div className="lg:col-span-5 relative flex justify-center items-center h-[280px] sm:h-[420px] w-full max-w-md mx-auto lg:ml-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://cdn.prod.website-files.com/5ffcd643561bc26ed27a87a1/5ffcd85058323b1a1485dae4_blue-bg-poster-00001.jpg"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
          >
            <source
              src="https://cdn.prod.website-files.com/5ffcd643561bc26ed27a87a1/5ffcd85058323b1a1485dae4_blue-bg-transcode.mp4"
              type="video/mp4"
            />
          </video>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-transparent to-transparent opacity-80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12]/40 via-transparent to-transparent z-10" />

          {/* Floating Workstation Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-950/80 backdrop-blur-2xl text-center space-y-2.5 sm:space-y-3 max-w-[260px] sm:max-w-xs shadow-2xl"
          >
            <div className="flex size-10 sm:size-12 items-center justify-center rounded-2xl bg-[#5c31ff]/20 text-[#def141] border border-[#5c31ff]/40 mx-auto">
              <Cpu className="size-5 sm:size-6 animate-pulse" />
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white">RESELLER ENGINE</h3>
            <p className="text-[11px] sm:text-xs font-mono text-slate-300">Operational & Active 24/7</p>
            <div className="pt-1 sm:pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3.5 sm:px-4 py-1 text-[10px] sm:text-[11px] font-mono font-bold text-emerald-400">
                <Activity className="size-3" /> SYSTEM READY
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE WORKSTATION GRID */}
      <section id="features" className="border-y border-white/10 bg-slate-950/80 backdrop-blur-2xl py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 space-y-12 sm:space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-mono font-bold text-[#def141]">
              HIGH-SPEED WORKSTATION
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-display">
              Built for Modern Resellers
            </h2>
            <p className="text-slate-400 font-mono text-xs sm:text-base max-w-2xl mx-auto">
              A comprehensive UID access portfolio equipped with sub-second execution, zero transaction fees, and verifiable audit logs.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
                <Zap className="size-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display">Instant Access Provisioning</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Add or extend client UID access in sub-second speed with immediate confirmation logs and verifiable status tokens.
              </p>
              <div className="pt-2 sm:pt-4 text-xs font-mono text-cyan-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4" /> High-volume active UID capacity
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40">
                <Activity className="size-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display">Zero-Fee Maintenance</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                UID replacements, removals, inspections, and active lists are completely free with zero per-action fee structure.
              </p>
              <div className="pt-2 sm:pt-4 text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4" /> Unlimited Free Utility Operations
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#5c31ff]/20 text-[#def141] border border-[#5c31ff]/40">
                <Crown className="size-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display">4-Tier Role Architecture</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Starter (200 UIDs), Pro (400 UIDs), Developer (Unlimited + API), and Master Admin control room access.
              </p>
              <div className="pt-2 sm:pt-4 text-xs font-mono text-[#def141] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4" /> Granular Access Permissions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESELLER RATES SECTION */}
      <section id="rates" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:px-10 space-y-12 sm:space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-mono font-bold text-[#def141]">
            TRANSPARENT CAPACITY RATES
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-display">Reseller Access Tiers</h2>
          <p className="text-slate-400 font-mono text-xs sm:text-base">
            Select your active UID limit reseller tier with zero per-action transaction fees.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {/* Starter Tier */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">STARTER ROLE</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">200 Active UIDs</h3>
              <p className="text-3xl sm:text-4xl font-black text-[#def141] font-mono">
                $20 <span className="text-xs text-slate-400 font-normal">USD</span>
              </p>
              <p className="text-xs text-slate-400 font-mono">Entry reseller package for fast client setup.</p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#def141]" /> 200 Active Concurrent UIDs Limit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#def141]" /> Free UID Replacements & Inspection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#def141]" /> Direct Web Console Access
                </li>
              </ul>
            </div>
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 py-3.5 text-xs font-mono font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Starter Access
            </a>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-[#def141]/50 bg-[#def141]/5 p-6 sm:p-8 backdrop-blur-2xl space-y-6 flex flex-col justify-between relative shadow-[0_0_30px_rgba(222,241,65,0.1)]">
            <div className="absolute -top-3 right-6 rounded-full bg-[#def141] text-slate-950 px-3 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider shadow-md">
              POPULAR
            </div>
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#def141] font-black uppercase">★ PRO ROLE</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">400 Active UIDs</h3>
              <p className="text-3xl sm:text-4xl font-black text-[#def141] font-mono">
                $30 <span className="text-xs text-slate-400 font-normal">USD</span>
              </p>
              <p className="text-xs text-slate-400 font-mono">High-volume control room package for active operations.</p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#def141]" /> 400 Active Concurrent UIDs Limit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#def141]" /> Priority Limit Setup & Approval
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#def141]" /> 24/7 Dedicated Support
                </li>
              </ul>
            </div>
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center rounded-2xl bg-[#def141] hover:bg-[#c9dc35] py-3.5 text-xs font-mono font-black text-slate-950 transition-all shadow-[0_0_20px_rgba(222,241,65,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Pro Access
            </a>
          </div>

          {/* Developer Tier */}
          <div className="rounded-3xl border border-[#5c31ff]/50 bg-[#5c31ff]/10 p-6 sm:p-8 backdrop-blur-2xl space-y-6 flex flex-col justify-between shadow-[0_0_30px_rgba(92,49,255,0.15)]">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#5c31ff] font-black uppercase">DEVELOPER ROLE</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">Unlimited UIDs</h3>
              <p className="text-3xl sm:text-4xl font-black text-white font-mono">
                $40 <span className="text-xs text-slate-400 font-normal">USD</span>
              </p>
              <p className="text-xs text-slate-400 font-mono">Maximum tier for unlimited client capacity & direct API access.</p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#5c31ff]" /> Unlimited Active UIDs Capacity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#5c31ff]" /> Direct API Key & Webhook Automation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#5c31ff]" /> Full Master Clearance
                </li>
              </ul>
            </div>
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center rounded-2xl bg-[#5c31ff] hover:bg-[#4a22e0] py-3.5 text-xs font-mono font-bold text-white transition-all shadow-[0_0_20px_rgba(92,49,255,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Developer Access
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0d0e12] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 lg:px-10 text-xs text-slate-400 font-mono text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-white font-extrabold">GrejLabs</span>
            <span className="hidden xs:inline">— UID Bypass Reseller Console</span>
          </div>
          <p>© 2026 GrejLabs. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
