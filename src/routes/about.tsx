import { createFileRoute } from "@tanstack/react-router";
import {
  Particles,
  SplitText,
  ShinyText,
  DecryptedText,
  TiltedCard,
  SpotlightCard,
  DockNavbar,
} from "@/components/reactbits";
import { ShieldCheck, Cpu, Database, CheckCircle2, Lock } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — GrejLabs UID Bypass Architecture" },
      { name: "description", content: "Architecture and operational design behind GrejLabs." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-gold/30 selection:text-gold">
      <Particles particleCount={50} speed={0.4} />
      <DockNavbar currentPath="/about" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">Architecture Overview</span>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            <SplitText text="Designed for Command and Control" highlightWords={["Command", "Control"]} />
          </h1>
          <p className="text-muted-foreground text-lg">
            GrejLabs combines a green-royalty aesthetic with low-latency UID access management and transparent credit accounting.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <TiltedCard maxTilt={10} className="p-8 space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/30">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-2xl font-bold">1. UID Bypass Control</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add, extend, replace, or revoke hardware & client UID authorizations through an atomic operation pipeline.
            </p>
          </TiltedCard>

          <TiltedCard maxTilt={10} className="p-8 space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Database className="size-6" />
            </div>
            <h3 className="text-2xl font-bold">2. Credit Accounting</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paid access operations deduct exactly 1 credit while non-modifying checks remain completely free of cost.
            </p>
          </TiltedCard>

          <TiltedCard maxTilt={10} className="p-8 space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Cpu className="size-6" />
            </div>
            <h3 className="text-2xl font-bold">3. Auditability</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every request generates an immutable log record, establishing clear history for both resellers and administrators.
            </p>
          </TiltedCard>
        </div>

        <div className="rounded-2xl border border-gold/40 bg-card/60 p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <h2 className="text-3xl font-bold">
            <DecryptedText text="SECURITY_AND_PERFORMANCE_SPECS" className="text-gold" />
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Supabase RLS & Role-Based Token Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Real-Time Log Synchronization & Activity Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Sub-Second Server Function Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>ReactBits Animated Visual Feedback System</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
