import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Info, Home } from "lucide-react";
import { Magnet } from "./Magnet";
import { ShinyText } from "./ShinyText";

interface DockNavbarProps {
  currentPath?: string;
}

export function DockNavbar({ currentPath = "/" }: DockNavbarProps) {
  const navItems = [
    { label: "Home", href: "/", icon: <Home className="size-4" /> },
    { label: "Pricing & Tiers", href: "/showcase", icon: <Sparkles className="size-4" /> },
    { label: "About", href: "/about", icon: <Info className="size-4" /> },
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
      <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/70 px-5 py-3 shadow-2xl backdrop-blur-xl transition-all hover:border-gold/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-gold/30 border border-gold/40 shadow-inner">
            <ShieldCheck className="size-5 text-gold" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-foreground">
            Grej<ShinyText className="ml-1 text-gold">Labs</ShinyText>
          </span>
        </Link>

        {/* Floating Dock Menu */}
        <nav className="hidden items-center gap-1 sm:flex rounded-full border border-border/60 bg-muted/40 p-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Magnet key={item.href} strength={0.25}>
                <Link
                  to={item.href}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Magnet>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Magnet strength={0.3}>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              <span>Enter Panel</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Magnet>
        </div>
      </div>
    </header>
  );
}
