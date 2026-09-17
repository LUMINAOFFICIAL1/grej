import { useState } from "react";
import { Calculator, Crown, CheckCircle2, Zap } from "lucide-react";
import { Magnet } from "./Magnet";

export function CreditCalculator() {
  const [pageCount, setPageCount] = useState<number>(5);
  const [concepts, setConcepts] = useState<number>(1);
  const [incDev, setIncDev] = useState<boolean>(true);
  const [incContent, setIncContent] = useState<boolean>(false);

  // Dynamic Calculation matching glassmorphism preview
  const basePrice = pageCount * 15;
  const conceptPrice = concepts * 10;
  const devBonus = incDev ? 15 : 0;
  const contentBonus = incContent ? 10 : 0;
  const totalUIDLimit = pageCount * 50 + concepts * 100;
  const totalPrice = Math.max(20, basePrice + conceptPrice + devBonus + contentBonus);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-900/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl text-slate-100">
      {/* Frosted Glass Flare */}
      <div className="absolute -top-24 -right-24 size-60 rounded-full bg-gradient-to-br from-cyan-400/20 via-violet-500/20 to-amber-400/20 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Calculator className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white font-display">
              CMS Pricing & UID Calculator
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Webflow Tricks Glassmorphism Pricing Preview
            </p>
          </div>
        </div>
        <div className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-1 text-xs text-cyan-300 font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
          <Zap className="size-3.5 text-cyan-400" /> Interactive
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* 1. Page Count Slider */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex justify-between items-center text-sm font-bold font-mono">
            <span className="text-slate-300">UID Capacity Limit Count</span>
            <span className="text-cyan-400 text-lg font-mono">{pageCount * 50} UIDs</span>
          </div>
          <input
            type="range"
            min={1}
            max={45}
            value={pageCount}
            onChange={(e) => setPageCount(Number(e.target.value))}
            className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400 focus:outline-none"
          />
          <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
            <span>50 UIDs</span>
            <span>1,000 UIDs</span>
            <span>2,250 UIDs</span>
          </div>
        </div>

        {/* 2. Concept Counter Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 font-bold uppercase">Unique Nodes</p>
              <p className="text-xl font-black text-amber-400 mt-1 font-mono">{concepts} Node{concepts > 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConcepts(Math.max(1, concepts - 1))}
                className="size-9 rounded-xl border border-white/20 bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center text-lg transition-all active:scale-95"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setConcepts(concepts + 1)}
                className="size-9 rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-lg transition-all hover:bg-cyan-500/30 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Switches */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Include API Dev</span>
              <button
                type="button"
                onClick={() => setIncDev(!incDev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  incDev ? "bg-cyan-400" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-slate-950 transition-transform ${
                    incDev ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Priority Support</span>
              <button
                type="button"
                onClick={() => setIncContent(!incContent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  incContent ? "bg-amber-400" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-slate-950 transition-transform ${
                    incContent ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Total Display */}
        <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-amber-500/10 p-5 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-mono font-bold">Estimated Rate</p>
            <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">${totalPrice} USD</p>
          </div>
          <div className="text-right font-mono">
            <p className="text-xs text-amber-400 font-bold">Total Capacity</p>
            <p className="text-lg font-black text-white">{totalUIDLimit} UIDs</p>
          </div>
        </div>

        <Magnet strength={0.2} className="w-full">
          <a
            href="/auth"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 p-4 font-mono font-black text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)] transition-all hover:brightness-110 active:scale-[0.99] uppercase tracking-wider"
          >
            <Crown className="size-4" />
            <span>Select {totalUIDLimit} UIDs Package</span>
          </a>
        </Magnet>
      </div>
    </div>
  );
}
