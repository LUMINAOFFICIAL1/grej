import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function DotField({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative overflow-hidden ${className}`}><div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_center,rgba(189,156,74,0.38)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />{children}</div>;
}

export function ShimmerText({ children }: { children: ReactNode }) {
  return <motion.span className="inline-block bg-gradient-to-r from-gold via-foreground to-gold bg-[length:220%_100%] bg-clip-text text-transparent" animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>{children}</motion.span>;
}

export function OrbitStatus({ label = "Online" }: { label?: string }) {
  return <div className="relative grid size-24 place-items-center rounded-full border border-primary/40 bg-primary/10"><motion.div className="absolute inset-2 rounded-full border border-dashed border-gold/70" animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} /><span className="relative text-xs font-medium text-primary">{label}</span></div>;
}

export function Marquee({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden border-y border-border/60 py-3"><motion.div className="flex w-max gap-10 whitespace-nowrap text-xs uppercase tracking-[0.24em] text-muted-foreground" animate={{ x: [0, -420] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>{children}<span aria-hidden="true">{children}</span></motion.div></div>;
}

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.div className={`group relative overflow-hidden rounded-lg border border-border bg-card/70 p-6 ${className}`} whileHover={{ scale: 1.02, y: -6 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}><div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(260px_circle_at_50%_0%,rgba(190,157,72,0.2),transparent_70%)]" />{children}</motion.div>;
}
