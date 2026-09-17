import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Crown, Zap, Activity, Cpu, Layers } from "lucide-react";
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

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-performance canvas noise
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
      {/* Webflow Noise Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.05] z-50"
      />

      {/* WEBFLOW GLASSMORPHISM NAVIGATION */}
      <nav className="relative z-40 w-full border-b border-white/10 bg-[#0d0e12]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#5c31ff]/20 border border-[#5c31ff]/50 text-[#def141] shadow-[0_0_15px_rgba(92,49,255,0.3)]">
              <ShieldCheck className="size-6" />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-white">
              Grej<span className="text-[#def141]">Labs</span>
            </span>
          </Link>

          {/* Webflow Sliding Line Menu */}
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

          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-[#5c31ff] px-6 py-3 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(92,49,255,0.4)] hover:bg-[#4a22e0] transition-all"
          >
            <span>Enter Console</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION WITH WEBFLOW BACKGROUND VIDEO */}
      <section id="hero" className="relative mx-auto max-w-7xl px-6 pt-16 pb-28 lg:px-10 lg:pt-24 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Hero Content with Staggered Fade-Up Animation */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#def141]/40 bg-[#def141]/10 px-4 py-1.5 text-xs font-mono font-bold text-[#def141]"
            >
              <Sparkles className="size-4 text-[#def141]" />
              <span>HIGH-PERFORMANCE UID RESELLER PLATFORM</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase font-display"
            >
              GREJLABS <br />
              <span className="text-slate-400">UID BYPASS &</span> <br />
              <span className="bg-gradient-to-r from-[#f88cd4] via-[#def141] to-[#5c31ff] bg-clip-text text-transparent">
                Workstation
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-2 text-base sm:text-lg text-slate-300 font-mono leading-relaxed"
          >
            <p>Giving resellers and developers a competitive edge with</p>
            <p className="text-slate-400">sub-second UID access control & zero per-action transaction fees.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/auth"
              className="inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 text-sm font-mono font-black text-slate-950 shadow-2xl hover:bg-slate-200 transition-all group"
            >
              <span>Launch Reseller Console</span>
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-950 text-white group-hover:translate-x-1 transition-transform">
                <ArrowRight className="size-4" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Right Hero Video Container Positioned Further Right */}
        <div className="lg:col-span-5 relative flex justify-center items-center h-[420px] sm:h-[460px] w-full max-w-md lg:ml-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://cdn.prod.website-files.com/5ffcd643561bc26ed27a87a1/5ffcd85058323b1a1485dae4_blue-bg-poster-00001.jpg"
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source
              src="https://cdn.prod.website-files.com/5ffcd643561bc26ed27a87a1/5ffcd85058323b1a1485dae4_blue-bg-transcode.mp4"
              type="video/mp4"
            />
            <source
              src="https://cdn.prod.website-files.com/5ffcd643561bc26ed27a87a1/5ffcd85058323b1a1485dae4_blue-bg-transcode.webm"
              type="video/webm"
            />
          </video>

          {/* Radial Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-transparent to-transparent opacity-80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12]/50 via-transparent to-transparent z-10" />

          {/* Floating Workstation Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 p-8 rounded-3xl border border-white/20 bg-slate-950/70 backdrop-blur-2xl text-center space-y-3 max-w-xs shadow-2xl"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#5c31ff]/20 text-[#def141] border border-[#5c31ff]/40 mx-auto">
              <Cpu className="size-6 animate-pulse" />
            </div>
            <h3 className="font-display font-black text-xl text-white">RESELLER ENGINE</h3>
            <p className="text-xs font-mono text-slate-300">Operational & Active 24/7</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-1 text-[11px] font-mono font-bold text-emerald-400">
                <Activity className="size-3" /> SYSTEM READY
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE WORKSTATION GRID */}
      <section id="features" className="border-y border-white/10 bg-slate-950/80 backdrop-blur-2xl py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold text-[#def141]">
              HIGH-SPEED WORKSTATION
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white font-display">
              Built for Modern Resellers
            </h2>
            <p className="text-slate-400 font-mono text-base">
              A comprehensive UID access portfolio equipped with sub-second execution, zero transaction fees, and verifiable audit logs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
                <Zap className="size-6" />
              </div>
              <h3 className="text-2xl font-bold text-white font-display">Instant Access Provisioning</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Add or extend client UID access in sub-second speed with immediate confirmation logs and verifiable status tokens.
              </p>
              <div className="pt-4 text-xs font-mono text-cyan-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4" /> High-volume active UID capacity
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40">
                <Activity className="size-6" />
              </div>
              <h3 className="text-2xl font-bold text-white font-display">Zero-Fee Maintenance</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                UID replacements, removals, inspections, and active lists are completely free with zero per-action fee structure.
              </p>
              <div className="pt-4 text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4" /> Unlimited Free Utility Operations
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#5c31ff]/20 text-[#def141] border border-[#5c31ff]/40">
                <Crown className="size-6" />
              </div>
              <h3 className="text-2xl font-bold text-white font-display">4-Tier Role Architecture</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Starter (200 UIDs), Pro (400 UIDs), Developer (Unlimited + API), and Master Admin control room access.
              </p>
              <div className="pt-4 text-xs font-mono text-[#def141] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="size-4" /> Granular Access Permissions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESELLER RATES SECTION (REPLACED CALCULATOR) */}
      <section id="rates" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold text-[#def141]">
            TRANSPARENT CAPACITY RATES
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white font-display">Reseller Access Tiers</h2>
          <p className="text-slate-400 font-mono text-base">
            Select your active UID limit reseller tier with zero per-action transaction fees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Starter Tier */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">STARTER ROLE</span>
              <h3 className="text-3xl font-black text-white font-display">200 Active UIDs</h3>
              <p className="text-4xl font-black text-[#def141] font-mono">$20 <span className="text-xs text-slate-400 font-normal">USD</span></p>
              <p className="text-xs text-slate-400 font-mono">Entry reseller package for fast client setup.</p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#def141]" /> 200 Active Concurrent UIDs Limit</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#def141]" /> Free UID Replacements & Inspection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#def141]" /> Direct Web Console Access</li>
              </ul>
            </div>
            <Link
              to="/auth"
              className="w-full text-center rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 py-3.5 text-xs font-mono font-bold text-white transition-all"
            >
              Get Starter Access
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl border border-[#def141]/50 bg-[#def141]/5 p-8 backdrop-blur-2xl space-y-6 flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 rounded-full bg-[#def141] text-slate-950 px-3 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider">
              POPULAR
            </div>
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#def141] font-black uppercase">★ PRO ROLE</span>
              <h3 className="text-3xl font-black text-white font-display">400 Active UIDs</h3>
              <p className="text-4xl font-black text-[#def141] font-mono">$30 <span className="text-xs text-slate-400 font-normal">USD</span></p>
              <p className="text-xs text-slate-400 font-mono">High-volume control room package for active operations.</p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#def141]" /> 400 Active Concurrent UIDs Limit</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#def141]" /> Priority Limit Setup & Approval</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#def141]" /> 24/7 Dedicated Support</li>
              </ul>
            </div>
            <Link
              to="/auth"
              className="w-full text-center rounded-2xl bg-[#def141] hover:bg-[#c9dc35] py-3.5 text-xs font-mono font-black text-slate-950 transition-all"
            >
              Get Pro Access
            </Link>
          </div>

          {/* Developer Tier */}
          <div className="rounded-3xl border border-[#5c31ff]/50 bg-[#5c31ff]/10 p-8 backdrop-blur-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#5c31ff] font-black uppercase">DEVELOPER ROLE</span>
              <h3 className="text-3xl font-black text-white font-display">Unlimited UIDs</h3>
              <p className="text-4xl font-black text-white font-mono">$40 <span className="text-xs text-slate-400 font-normal">USD</span></p>
              <p className="text-xs text-slate-400 font-mono">Maximum tier for unlimited client capacity & direct API access.</p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#5c31ff]" /> Unlimited Active UIDs Capacity</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#5c31ff]" /> Direct API Key & Webhook Automation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#5c31ff]" /> Full Master Clearance</li>
              </ul>
            </div>
            <Link
              to="/auth"
              className="w-full text-center rounded-2xl bg-[#5c31ff] hover:bg-[#4a22e0] py-3.5 text-xs font-mono font-bold text-white transition-all shadow-[0_0_20px_rgba(92,49,255,0.4)]"
            >
              Get Developer Access
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0d0e12] py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-6 lg:px-10 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-white font-extrabold">GrejLabs</span>
            <span>— UID Bypass Reseller Console</span>
          </div>
          <p>© 2026 GrejLabs. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
