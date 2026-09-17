import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { signOutEverywhere, type Account } from "@/lib/account";
import { useNoiseCanvas } from "@/lib/useNoiseCanvas";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Crown, Code2, ShieldCheck, Zap, LogOut, Activity } from "lucide-react";

export function PanelShell({ account, children }: { account: Account | null; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lineState, setLineState] = useState<{ left: number; width: number; color: string }>({
    left: 0,
    width: 0,
    color: "#5c31ff",
  });

  // High-performance canvas noise
  useNoiseCanvas(canvasRef);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutEverywhere();
    navigate({ to: "/auth", replace: true });
  }

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
    { label: account?.isAdmin ? "Owner Room" : "Control Room", color: "#5c31ff", href: account?.isAdmin ? "/admin" : "/panel" },
  ];

  const getRoleBadge = () => {
    switch (account?.role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#def141]/50 bg-[#def141]/10 px-3 py-1 text-[10px] font-extrabold font-mono text-[#def141] shadow-[0_0_12px_rgba(222,241,65,0.25)]">
            <Crown className="size-3 text-[#def141]" /> OWNER ADMIN
          </span>
        );
      case "developer":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#5c31ff]/50 bg-[#5c31ff]/10 px-3 py-1 text-[10px] font-extrabold font-mono text-[#5c31ff] shadow-[0_0_12px_rgba(92,49,255,0.25)]">
            <Code2 className="size-3 text-[#5c31ff]" /> DEVELOPER
          </span>
        );
      case "pro":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#38bdf8]/50 bg-[#38bdf8]/10 px-3 py-1 text-[10px] font-extrabold font-mono text-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            <Zap className="size-3 text-[#38bdf8]" /> PRO RESELLER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-extrabold font-mono text-slate-300">
            <ShieldCheck className="size-3 text-slate-400" /> STARTER
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0d0e12] text-white font-sans overflow-x-hidden selection:bg-[#5c31ff] selection:text-white flex flex-col">
      {/* Dynamic Noise Overlay Canvas */}
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-right border-r border-white/10 pr-4">
              <div>
                <div className="flex items-center justify-end gap-2">
                  {getRoleBadge()}
                  <span className="text-xs font-mono font-bold text-white">
                    {account?.display_name || account?.username || account?.email}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                  <Activity className="size-3 text-[#def141]" />
                  Limit: <span className="text-[#def141] font-bold">{account?.uidLimit >= 9999 ? "Unlimited" : `${account?.uidLimit ?? 0} UIDs`}</span>
                </p>
              </div>
            </div>

            <Button
              onClick={signOut}
              className="rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/20 px-4 py-2 text-xs font-mono font-bold text-white transition-all flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-6 py-10 lg:px-10">
        {children}
      </main>
    </div>
  );
}
