import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { runUidAction, type UidAction } from "@/lib/uid.functions";
import { useAccount } from "@/lib/account";
import { PanelShell } from "@/components/PanelShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Gauge,
  Crown,
  Zap,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Trash2,
  Info,
  List,
  Sparkles,
  Activity,
  Terminal,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Reseller Control Panel — GrejLabs" },
      {
        name: "description",
        content:
          "Manage client UID Bypass access, extensions, replacements, and status checks based on your assigned UID Limit.",
      },
    ],
  }),
  component: Panel,
});

const ACTIONS: { key: UidAction; label: string; icon: React.ReactNode; blurb: string }[] = [
  { key: "add", label: "Add Client Access", icon: <UserCheck className="size-4 text-[#def141]" />, blurb: "Grant client access for specified number of days (uses active UID Limit)" },
  { key: "extend", label: "Extend Client Access", icon: <Zap className="size-4 text-[#38bdf8]" />, blurb: "Add additional active days to an existing client UID" },
  { key: "replace", label: "Replace Client UID", icon: <RefreshCw className="size-4 text-[#f88cd4]" />, blurb: "Transfer client access days to a new target UID" },
  { key: "remove", label: "Remove Access", icon: <Trash2 className="size-4 text-rose-400" />, blurb: "Immediately revoke client UID access authorization" },
  { key: "info", label: "Inspect Client Info", icon: <Info className="size-4 text-emerald-400" />, blurb: "Query expiry timestamp and status details" },
  { key: "list", label: "List Active UIDs", icon: <List className="size-4 text-[#def141]" />, blurb: "Display all paid UIDs and remaining days" },
];

function Panel() {
  const navigate = useNavigate();
  const { data: account, isLoading } = useAccount();
  const queryClient = useQueryClient();
  const run = useServerFn(runUidAction);

  // Admins & Resellers can both access the UID Workstation Panel

  const [action, setAction] = useState<UidAction>("add");
  const [uid, setUid] = useState("");
  const [newUid, setNewUid] = useState("");
  const [days, setDays] = useState("30");
  const [output, setOutput] = useState<string | null>(null);

  const logs = useQuery({
    queryKey: ["uid-logs", account?.id],
    enabled: !!account?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("uid_logs")
        .select("id, action, uid, target_uid, days, credits_used, success, message, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      return data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          action,
          uid,
          newUid,
          days: Number(days) || 0,
        },
      }),
    onSuccess: (result) => {
      setOutput(result.message);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      queryClient.invalidateQueries({ queryKey: ["account"] });
      logs.refetch();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Request failed"),
  });

  const current = ACTIONS.find((a) => a.key === action)!;

  return (
    <PanelShell account={account ?? null}>
      <div className="space-y-8">
        {/* METRICS ROW WITH GLASS CARDS */}
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>ASSIGNED UID LIMIT</span>
              <Gauge className="size-4 text-[#def141]" />
            </div>
            <p className="text-4xl font-black font-mono text-[#def141]">
              {(account?.uidLimit ?? account?.uid_limit ?? 200) >= 9999 ? "UNLIMITED" : `${account?.uidLimit ?? account?.uid_limit ?? 200}`}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">Active Concurrent Capacity</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>RESELLER AUTHORIZATION</span>
              <ShieldCheck className="size-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black font-mono text-emerald-400">
              AUTHORIZED
            </p>
            <p className="text-[11px] text-slate-400 font-mono font-bold text-emerald-400">Status Verified</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>ACTIVE ROLE LEVEL</span>
              <Crown className="size-4 text-[#f88cd4]" />
            </div>
            <p className="text-3xl font-black font-mono text-white">
              {account?.role ? account.role.toUpperCase() : "RESELLER"}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">Zero Per-Action Fees</p>
          </motion.div>
        </div>

        {/* CONTROL PANEL WORKSTATION */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Action Executor Box */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
                  UID Workstation <Sparkles className="size-5 text-[#def141]" />
                </h2>
                <p className="text-xs text-slate-400 font-mono">Select operation type and target client UID</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5c31ff]/50 bg-[#5c31ff]/10 px-3 py-1 font-mono text-[10px] font-bold text-[#def141]">
                <Activity className="size-3 text-[#def141] animate-pulse" /> LIVE ENGINE
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setAction(item.key);
                    setOutput(null);
                  }}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all font-mono text-xs ${
                    action === item.key
                      ? "border-[#def141] bg-[#def141]/10 text-white shadow-[0_0_15px_rgba(222,241,65,0.2)]"
                      : "border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="mb-2">{item.icon}</div>
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 font-mono text-xs text-slate-300">
              <span className="text-[#def141] font-bold">INFO: </span>
              {current.blurb}
            </div>

            {/* Action Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="space-y-4"
            >
              {action !== "list" && (
                <div className="space-y-2">
                  <Label className="text-xs font-mono font-bold text-slate-300">
                    TARGET CLIENT UID
                  </Label>
                  <Input
                    required
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    placeholder="Enter target client UID (e.g. 10928374)"
                    className="bg-slate-950/80 border-white/10 text-white font-mono text-xs h-12 focus:border-[#def141] rounded-xl"
                  />
                </div>
              )}

              {action === "replace" && (
                <div className="space-y-2">
                  <Label className="text-xs font-mono font-bold text-slate-300">
                    NEW TARGET UID
                  </Label>
                  <Input
                    required
                    value={newUid}
                    onChange={(e) => setNewUid(e.target.value)}
                    placeholder="Enter new UID to receive access"
                    className="bg-slate-950/80 border-white/10 text-white font-mono text-xs h-12 focus:border-[#f88cd4] rounded-xl"
                  />
                </div>
              )}

              {(action === "add" || action === "extend") && (
                <div className="space-y-2">
                  <Label className="text-xs font-mono font-bold text-slate-300">
                    DURATION DAYS
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="bg-slate-950/80 border-white/10 text-white font-mono text-xs h-12 focus:border-[#38bdf8] rounded-xl"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-[#5c31ff] hover:bg-[#4a22e0] text-white font-mono font-black py-4 text-xs shadow-[0_0_20px_rgba(92,49,255,0.4)] flex items-center justify-center gap-2 tracking-widest uppercase transition-all rounded-xl"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-white" />
                    <span>EXECUTING ACTION...</span>
                  </>
                ) : (
                  <>
                    <span>RUN {action.toUpperCase()} ACTION</span>
                  </>
                )}
              </Button>
            </form>

            {/* Output Log Console */}
            {output && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-4 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#def141] font-bold border-b border-white/10 pb-2">
                  <Terminal className="size-4" /> RESPONSE TERMINAL OUTPUT
                </div>
                <pre className="whitespace-pre-wrap text-slate-200 overflow-x-auto leading-relaxed">
                  {output}
                </pre>
              </div>
            )}
          </div>

          {/* Audit Logs Column */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white font-display flex items-center gap-2">
                Audit Log Trail <CheckCircle2 className="size-5 text-emerald-400" />
              </h3>
              <span className="text-xs font-mono text-slate-400">Last 25 Events</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {logs.data?.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 text-center py-8">
                  No execution logs recorded yet.
                </p>
              ) : (
                logs.data?.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-[#def141] uppercase">{log.action}</span>
                      <span className="text-[10px]">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white font-bold">UID: {log.uid || log.target_uid || "N/A"}</p>
                    <p className="text-slate-400 text-[11px] truncate">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
