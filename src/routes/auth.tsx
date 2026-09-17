import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { signInFn } from "@/lib/uid.functions";
import { setCurrentAccount, getCurrentAccount } from "@/lib/account";
import { useNoiseCanvas } from "@/lib/useNoiseCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Loader2, Lock, UserCheck, KeyRound, Sparkles, Cpu, Activity } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Reseller Console Access — GrejLabs" },
      {
        name: "description",
        content:
          "High-performance encrypted reseller authorization portal for GrejLabs UID Bypass workstation.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const signInServer = useServerFn(signInFn);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Navigation line position state
  const [lineState, setLineState] = useState<{ left: number; width: number; color: string }>({
    left: 0,
    width: 0,
    color: "#5c31ff",
  });

  // Cursor Mouse Tracking & Motion Spring Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(smoothY, [-400, 400], [8, -8]);
  const rotateY = useTransform(smoothX, [-400, 400], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }

  // High-performance canvas noise
  useNoiseCanvas(canvasRef);

  useEffect(() => {
    const active = getCurrentAccount();
    if (active) {
      navigate({ to: active.isAdmin ? "/admin" : "/panel", replace: true });
    }
  }, [navigate]);

  function handleNavMouseEnter(e: React.MouseEvent<HTMLAnchorElement>, color: string) {
    const target = e.currentTarget;
    setLineState({
      left: target.offsetLeft,
      width: target.offsetWidth,
      color,
    });
  }

  const navLinks = [
    { label: "Home", color: "#def141", href: "/" },
    { label: "Workstation", color: "#f88cd4", href: "/#features" },
    { label: "Reseller Rates", color: "#38bdf8", href: "/#rates" },
    { label: "Control Room", color: "#5c31ff", href: "/auth" },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    const toastId = toast.loading("Verifying Security Clearance...");

    try {
      const res = await signInServer({
        data: {
          identifier: identifier.trim(),
          password: password.trim(),
        },
      });

      toast.dismiss(toastId);

      if (res.user) {
        setCurrentAccount(res.user);
        toast.success(`Access Granted. Welcome Operator ${res.user.display_name || res.user.username}`);
        navigate({ to: res.user.isAdmin ? "/admin" : "/panel" });
      }
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const message = err instanceof Error ? err.message : "Authentication rejected.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col bg-[#0d0e12] text-white font-sans overflow-x-hidden selection:bg-[#5c31ff] selection:text-white"
    >
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
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-mono font-bold text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="size-4" />
            <span>Main Landing</span>
          </Link>
        </div>
      </nav>

      {/* AUTH CONTAINER WITH SAME THEME */}
      <div className="relative flex-1 flex items-center justify-center p-6 z-10">
        {/* Background Ambient Glow Orbs */}
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
          }}
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[#5c31ff]/25 via-[#f88cd4]/15 to-[#def141]/20 rounded-full blur-[160px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
        />

        {/* Interactive Glassmorphism Spring Card */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative p-[1.5px] rounded-3xl bg-gradient-to-br from-[#5c31ff] via-[#f88cd4] to-[#def141] shadow-[0_0_70px_rgba(92,49,255,0.35)] z-10 w-full max-w-md"
        >
          <div className="w-full p-8 bg-[#0d0e12]/90 backdrop-blur-3xl rounded-[23px] relative overflow-hidden space-y-6">
            {/* Top Animated Neon Border Line */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#def141] via-[#f88cd4] to-[#5c31ff] bg-[length:200%_100%]"
            />

            {/* Header Badge & Title */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#5c31ff]/20 text-[#def141] border border-[#5c31ff]/50 shadow-[0_0_15px_rgba(92,49,255,0.3)]">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <span className="font-display text-2xl font-black tracking-tight text-white block leading-none">
                    Grej<span className="text-[#def141]">Labs</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase font-bold flex items-center gap-1 mt-1">
                    <Activity className="size-3 text-[#def141] animate-pulse" /> WORKSTATION CONSOLE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <Lock className="size-3" /> ENCRYPTED
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <h1 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
                Reseller Authorization <Sparkles className="size-5 text-[#def141] animate-spin" style={{ animationDuration: "8s" }} />
              </h1>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Enter your Owner-assigned username and password to gain access.
              </p>
            </div>

            {/* Authorization Form */}
            <form onSubmit={submit} className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label
                  htmlFor="identifier"
                  className="text-[11px] font-mono uppercase tracking-widest text-[#def141] font-bold flex items-center gap-1.5"
                >
                  <UserCheck className="size-3.5 text-[#def141]" /> Username / Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter assigned username"
                  className="bg-slate-950/80 border-white/10 text-white text-xs font-mono py-3 h-12 focus:border-[#def141] focus:ring-1 focus:ring-[#def141] transition-all rounded-xl placeholder:text-slate-600 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-mono uppercase tracking-widest text-[#def141] font-bold flex items-center gap-1.5"
                >
                  <KeyRound className="size-3.5 text-[#def141]" /> Access Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-slate-950/80 border-white/10 text-white text-xs font-mono py-3 h-12 focus:border-[#def141] focus:ring-1 focus:ring-[#def141] transition-all rounded-xl placeholder:text-slate-600 shadow-inner"
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#5c31ff] hover:bg-[#4a22e0] text-white font-mono font-black py-4 text-xs shadow-[0_0_25px_rgba(92,49,255,0.4)] flex items-center justify-center gap-2 tracking-widest uppercase transition-all rounded-xl"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-white" />
                      <span>INITIALIZING ACCESS...</span>
                    </>
                  ) : (
                    "AUTHENTICATE OPERATOR"
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
