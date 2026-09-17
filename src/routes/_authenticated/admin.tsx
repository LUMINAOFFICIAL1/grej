import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, type ResellerRole } from "@/lib/account";
import { PanelShell } from "@/components/PanelShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Crown,
  Users,
  Plus,
  Lock,
  Code2,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  CreditCard,
  UserPlus,
  Radio,
  ArrowRight,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  Info,
  List,
  Loader2,
  Layers,
} from "lucide-react";

import { useServerFn } from "@tanstack/react-start";
import {
  getRoleOrdersFn,
  approveOrderFn,
  createUserByAdminFn,
  getUsersFn,
  updateUserRoleFn,
  toggleUserApprovalFn,
  getActivityLogsFn,
  deleteUserByAdminFn,
  changeUserPasswordByAdminFn,
  runUidAction,
  type UidAction,
} from "@/lib/uid.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Owner Master Command — GrejLabs" },
      {
        name: "description",
        content:
          "High-performance reseller command room, instant user provisioning, password management, UID workstation, and real-time network audit monitor.",
      },
    ],
  }),
  component: Admin,
});

type Row = {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  approved: boolean;
  credits: number;
  created_at: string;
  isAdmin: boolean;
  computedRole: ResellerRole;
};

const ACTIONS: { key: UidAction; label: string; icon: React.ReactNode; blurb: string }[] = [
  { key: "add", label: "Add Client Access", icon: <UserCheck className="size-4 text-[#def141]" />, blurb: "Grant client access for specified number of days (uses active UID Limit)" },
  { key: "extend", label: "Extend Client Access", icon: <Zap className="size-4 text-[#38bdf8]" />, blurb: "Add additional active days to an existing client UID" },
  { key: "replace", label: "Replace Client UID", icon: <RefreshCw className="size-4 text-[#f88cd4]" />, blurb: "Transfer client access days to a new target UID" },
  { key: "remove", label: "Remove Access", icon: <Trash2 className="size-4 text-rose-400" />, blurb: "Immediately revoke client UID access authorization" },
  { key: "info", label: "Inspect Client Info", icon: <Info className="size-4 text-emerald-400" />, blurb: "Query expiry timestamp and status details" },
  { key: "list", label: "List Active UIDs", icon: <List className="size-4 text-[#def141]" />, blurb: "Display all paid UIDs and remaining days" },
];

function Admin() {
  const getOrdersServer = useServerFn(getRoleOrdersFn);
  const approveOrderServer = useServerFn(approveOrderFn);
  const createUserByAdminServer = useServerFn(createUserByAdminFn);
  const getUsersServer = useServerFn(getUsersFn);
  const updateUserRoleServer = useServerFn(updateUserRoleFn);
  const toggleApprovalServer = useServerFn(toggleUserApprovalFn);
  const getActivityLogsServer = useServerFn(getActivityLogsFn);
  const deleteUserServer = useServerFn(deleteUserByAdminFn);
  const changePasswordServer = useServerFn(changeUserPasswordByAdminFn);
  const runUidServer = useServerFn(runUidAction);

  const { data: account } = useAccount();
  const queryClient = useQueryClient();

  // Owner User Creation State
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState<ResellerRole>("starter");
  const [creatingUser, setCreatingUser] = useState(false);

  // Password Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingPasswordVal, setEditingPasswordVal] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // UID Workstation State
  const [action, setAction] = useState<UidAction>("add");
  const [uid, setUid] = useState("");
  const [newUid, setNewUid] = useState("");
  const [days, setDays] = useState("30");
  const [output, setOutput] = useState<string | null>(null);

  const uidMutation = useMutation({
    mutationFn: () =>
      runUidServer({
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
      queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Request failed"),
  });

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast.error("Please provide both username/email and password.");
      return;
    }
    setCreatingUser(true);
    const toastId = toast.loading("Provisioning new reseller account...");
    try {
      const res = await createUserByAdminServer({
        data: {
          email: newEmail,
          password: newPassword,
          displayName: newDisplayName || undefined,
          role: newRole,
        },
      });
      toast.dismiss(toastId);
      toast.success(res.message);
      setNewEmail("");
      setNewPassword("");
      setNewDisplayName("");
      setNewRole("starter");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await users.refetch();
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = err instanceof Error ? err.message : "Failed to create user";
      toast.error(msg);
    } finally {
      setCreatingUser(false);
    }
  }

  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: !!account?.isAdmin,
    queryFn: async (): Promise<Row[]> => {
      const dbUsers = await getUsersServer();
      return (dbUsers ?? []).map((p) => {
        const userEmail = (p.email ?? "").trim().toLowerCase();
        const userUsername = (p.username ?? "").trim().toLowerCase();
        const isMaster = userUsername === "grej" || userEmail === "grej@grejlabs.local";
        const isAdmin = isMaster || p.role === "admin";
        const limit = isMaster ? 999999 : p.uid_limit;

        return {
          id: p.id,
          email: p.email,
          display_name: p.display_name || p.username,
          password_hash: p.password_hash || "••••••",
          approved: true,
          credits: limit,
          created_at: p.created_at,
          isAdmin,
          computedRole: p.role,
        };
      });
    },
  });

  const activity = useQuery({
    queryKey: ["admin-activity"],
    enabled: !!account?.isAdmin,
    queryFn: async () => {
      try {
        const logs = await getActivityLogsServer();
        return logs ?? [];
      } catch {
        return [];
      }
    },
  });

  const orders = useQuery({
    queryKey: ["admin-role-orders"],
    enabled: !!account?.isAdmin,
    queryFn: async () => {
      try {
        const res = await getOrdersServer({});
        return res ?? [];
      } catch {
        return [];
      }
    },
  });

  async function patchApproval(row: Row) {
    try {
      await toggleApprovalServer({ data: { userId: row.id, approved: !row.approved } });
      toast.success(`Reseller access ${row.approved ? "revoked" : "approved"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update approval";
      toast.error(msg);
    }
  }

  async function setRoleTier(row: Row, role: ResellerRole) {
    try {
      await updateUserRoleServer({ data: { userId: row.id, role } });
      toast.success(`Role updated to ${role.toUpperCase()}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      toast.error(msg);
    }
  }

  async function handleDeleteUser(row: Row) {
    const isMainOwner = row.id === "usr_owner_grej" || row.email.toLowerCase() === "grej@grejlabs.local" || (row.email.toLowerCase() === "grej" && row.computedRole === "admin");
    if (isMainOwner) {
      toast.error("Cannot delete primary Owner account!");
      return;
    }
    if (!confirm(`Are you sure you want to delete user ${row.display_name || row.email}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUserServer({ data: { userId: row.id } });
      toast.success(`User ${row.display_name || row.email} deleted.`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user";
      toast.error(msg);
    }
  }

  async function handleSavePassword(row: Row) {
    if (!editingPasswordVal || editingPasswordVal.trim().length < 3) {
      toast.error("Password must be at least 3 characters.");
      return;
    }
    try {
      await changePasswordServer({ data: { userId: row.id, newPassword: editingPasswordVal.trim() } });
      toast.success(`Password updated for ${row.display_name || row.email}`);
      setEditingUserId(null);
      setEditingPasswordVal("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    }
  }

  if (account && !account.isAdmin) {
    return (
      <PanelShell account={account}>
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-8 text-center space-y-4 backdrop-blur-2xl">
          <Lock className="size-10 text-rose-400 mx-auto" />
          <h1 className="text-2xl font-black text-white font-display">Admin Access Restricted</h1>
          <p className="text-xs font-mono text-slate-300">
            This command room is exclusively reserved for GrejLabs system administrators.
          </p>
        </div>
      </PanelShell>
    );
  }

  const totalResellers = (users.data ?? []).length;
  const pendingOrdersCount = (orders.data ?? []).filter((o) => !o.status.includes("Verified")).length;
  const totalOperations = (activity.data ?? []).length;
  const currentAction = ACTIONS.find((a) => a.key === action)!;

  return (
    <PanelShell account={account ?? null}>
      <div className="space-y-10">
        {/* TOP CATCHY MASTER HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-6 gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#def141]/50 bg-[#def141]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#def141]">
              <Radio className="size-3.5 text-[#def141] animate-pulse" />
              <span>OWNER COMMAND CENTER</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight flex items-center gap-3">
              Master Admin Control <Sparkles className="size-8 text-[#def141]" />
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Single-click user creation, UID action workstation, password management, and audit analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/panel"
              className="rounded-2xl border border-[#def141]/40 bg-[#def141]/10 px-4 py-3 font-mono text-xs font-bold text-[#def141] hover:bg-[#def141]/20 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(222,241,65,0.2)]"
            >
              <Layers className="size-4" />
              <span>Open Reseller Panel</span>
            </Link>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 font-mono text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Activity className="size-4 text-emerald-400 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* ULTRA CATCHY KPI METRICS CARDS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-3xl border border-[#def141]/40 bg-gradient-to-br from-[#def141]/10 via-white/5 to-slate-950 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(222,241,65,0.15)]"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>REGISTERED RESELLERS</span>
              <Users className="size-5 text-[#def141]" />
            </div>
            <p className="text-4xl font-black font-mono text-[#def141]">{totalResellers}</p>
            <p className="text-[11px] text-slate-400 font-mono">Active Account Directory</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-3xl border border-[#f88cd4]/40 bg-gradient-to-br from-[#f88cd4]/10 via-white/5 to-slate-950 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(248,140,212,0.15)]"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>PENDING TXID ORDERS</span>
              <CreditCard className="size-5 text-[#f88cd4]" />
            </div>
            <p className="text-4xl font-black font-mono text-[#f88cd4]">{pendingOrdersCount}</p>
            <p className="text-[11px] text-slate-400 font-mono">Awaiting TxID Verification</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-3xl border border-[#38bdf8]/40 bg-gradient-to-br from-[#38bdf8]/10 via-white/5 to-slate-950 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.15)]"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>EXECUTED AUDIT EVENTS</span>
              <Terminal className="size-5 text-[#38bdf8]" />
            </div>
            <p className="text-4xl font-black font-mono text-[#38bdf8]">{totalOperations}</p>
            <p className="text-[11px] text-slate-400 font-mono">Recorded Network Actions</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-3xl border border-[#5c31ff]/40 bg-gradient-to-br from-[#5c31ff]/10 via-white/5 to-slate-950 p-6 backdrop-blur-2xl space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(92,49,255,0.15)]"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-mono font-bold">
              <span>MASTER CLEARANCE</span>
              <Crown className="size-5 text-[#5c31ff]" />
            </div>
            <p className="text-3xl font-black font-mono text-white">UNLIMITED</p>
            <p className="text-[11px] text-slate-400 font-mono">Full System Authorization</p>
          </motion.div>
        </div>

        {/* INTEGRATED UID WORKSTATION FOR ADMIN */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
                UID Operation Workstation <Sparkles className="size-5 text-[#def141]" />
              </h2>
              <p className="text-xs text-slate-400 font-mono">Direct Master execution for client UID Add, Extend, Replace, Remove, Inspect & List</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5c31ff]/50 bg-[#5c31ff]/10 px-3 py-1 font-mono text-[10px] font-bold text-[#def141]">
              <Activity className="size-3 text-[#def141] animate-pulse" /> DIRECT ACCESS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
            {currentAction.blurb}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              uidMutation.mutate();
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
              disabled={uidMutation.isPending}
              className="w-full bg-[#5c31ff] hover:bg-[#4a22e0] text-white font-mono font-black py-4 text-xs shadow-[0_0_20px_rgba(92,49,255,0.4)] flex items-center justify-center gap-2 tracking-widest uppercase transition-all rounded-xl"
            >
              {uidMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" />
                  <span>EXECUTING OPERATION...</span>
                </>
              ) : (
                <>
                  <span>EXECUTE {action.toUpperCase()} OPERATION</span>
                </>
              )}
            </Button>
          </form>

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

        {/* OWNER ACCOUNT & ROLE CREATOR TERMINAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#def141]/50 bg-[#0d0e12]/90 p-8 backdrop-blur-3xl space-y-6 shadow-[0_0_50px_rgba(222,241,65,0.15)] relative overflow-hidden"
        >
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#def141] via-[#f88cd4] to-[#5c31ff] bg-[length:200%_100%]"
          />

          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#def141]/20 border border-[#def141]/50 text-[#def141] shadow-[0_0_15px_rgba(222,241,65,0.3)]">
                <UserPlus className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white font-display">Owner Account & Role Creator</h2>
                <p className="text-xs font-mono text-slate-400">Instantly create username/password with pre-assigned permissions</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1 font-mono text-xs text-[#def141] font-bold">
              <CheckCircle2 className="size-4 text-[#def141]" /> Auto Approval Enabled
            </span>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#def141] uppercase tracking-wider block">
                  Username / Email
                </label>
                <Input
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. reseller_alpha"
                  className="bg-slate-950/90 border-white/15 text-white font-mono text-xs h-12 focus:border-[#def141] focus:ring-1 focus:ring-[#def141] transition-all rounded-xl placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#def141] uppercase tracking-wider block">
                  Access Password
                </label>
                <Input
                  required
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-slate-950/90 border-white/15 text-white font-mono text-xs h-12 focus:border-[#def141] focus:ring-1 focus:ring-[#def141] transition-all rounded-xl placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#def141] uppercase tracking-wider block">
                  Display Name (Optional)
                </label>
                <Input
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Reseller Alpha"
                  className="bg-slate-950/90 border-white/15 text-white font-mono text-xs h-12 focus:border-[#def141] focus:ring-1 focus:ring-[#def141] transition-all rounded-xl placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#def141] uppercase tracking-wider block">
                  Assigned Reseller Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as ResellerRole)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-950/90 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#def141] focus:ring-1 focus:ring-[#def141] transition-all"
                >
                  <option value="starter">Starter (200 Active UIDs)</option>
                  <option value="pro">Pro (400 Active UIDs)</option>
                  <option value="developer">Developer (Unlimited UIDs)</option>
                  <option value="admin">Admin (Master Command)</option>
                </select>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={creatingUser}
                className="w-full bg-[#def141] hover:bg-[#c9dc35] text-slate-950 font-mono font-black py-4 text-xs shadow-[0_0_25px_rgba(222,241,65,0.4)] flex items-center justify-center gap-2 tracking-widest uppercase transition-all rounded-xl"
              >
                {creatingUser ? (
                  "CREATING USER & ASSIGNING ROLE..."
                ) : (
                  <>
                    <span>CREATE RESELLER & PROVISION ACCESS</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* RESELLER ROLE MATRIX DIRECTORY WITH DELETE & PASSWORD EDIT */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[#5c31ff]" />
              <h2 className="text-xl font-black text-white font-display">Reseller Role & Password Directory</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {(users.data ?? []).length} Resellers</span>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full min-w-[900px] text-xs font-mono">
              <thead className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="pb-3">Reseller Profile</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Password Management</th>
                  <th className="pb-3">Role Tier Switch</th>
                  <th className="pb-3 text-right">Delete / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(users.data ?? []).map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-white text-sm">{row.display_name || "Un-named"}</p>
                      <p className="text-[11px] text-slate-400">{row.email}</p>
                    </td>

                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold font-mono ${
                        row.computedRole === "admin"
                          ? "bg-[#def141]/20 text-[#def141] border border-[#def141]/40 shadow-[0_0_12px_rgba(222,241,65,0.2)]"
                          : row.computedRole === "developer"
                          ? "bg-[#5c31ff]/20 text-[#5c31ff] border border-[#5c31ff]/40 shadow-[0_0_12px_rgba(92,49,255,0.2)]"
                          : row.computedRole === "pro"
                          ? "bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                          : "bg-white/10 text-slate-300 border border-white/20"
                      }`}>
                        {row.computedRole === "admin" && <Crown className="size-3" />}
                        {row.computedRole === "developer" && <Code2 className="size-3" />}
                        {row.computedRole === "pro" && <Zap className="size-3" />}
                        {row.computedRole === "starter" && <ShieldCheck className="size-3" />}
                        {row.computedRole.toUpperCase()}
                      </span>
                    </td>

                    {/* PASSWORD DISPLAY & EDIT */}
                    <td className="py-4">
                      {editingUserId === row.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={editingPasswordVal}
                            onChange={(e) => setEditingPasswordVal(e.target.value)}
                            placeholder="New password"
                            className="bg-slate-950/90 border-[#def141]/50 text-white font-mono text-xs h-8 w-36 rounded-lg"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSavePassword(row)}
                            className="bg-[#def141] text-slate-950 hover:bg-[#c9dc35] font-bold text-[10px] h-8 px-2.5 rounded-lg"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingUserId(null)}
                            className="text-slate-400 hover:text-white text-[10px] h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#def141] font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10">
                            {showPasswords[row.id] ? row.password_hash : "••••••••"}
                          </span>
                          <button
                            onClick={() =>
                              setShowPasswords((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                            }
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Toggle Password Visibility"
                          >
                            {showPasswords[row.id] ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(row.id);
                              setEditingPasswordVal(row.password_hash);
                            }}
                            className="text-xs font-mono font-bold text-[#38bdf8] hover:underline flex items-center gap-1"
                          >
                            <KeyRound className="size-3" /> Edit
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setRoleTier(row, "starter")}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-white/10 text-slate-300 hover:bg-white/20 border border-white/20 transition-all"
                        >
                          Starter (200)
                        </button>
                        <button
                          onClick={() => setRoleTier(row, "pro")}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 hover:bg-[#38bdf8]/30 transition-all"
                        >
                          Pro (400)
                        </button>
                        <button
                          onClick={() => setRoleTier(row, "developer")}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-[#5c31ff]/20 text-[#5c31ff] border border-[#5c31ff]/40 hover:bg-[#5c31ff]/30 transition-all"
                        >
                          Developer (Unl)
                        </button>
                        <button
                          onClick={() => setRoleTier(row, "admin")}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-[#def141]/20 text-[#def141] border border-[#def141]/40 hover:bg-[#def141]/30 transition-all"
                        >
                          Admin
                        </button>
                      </div>
                    </td>

                    <td className="py-4 text-right">
                      {row.id !== "usr_owner_grej" && row.email.toLowerCase() !== "grej@grejlabs.local" && (
                        <Button
                          size="sm"
                          className="h-8 text-[11px] rounded-xl font-mono font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 transition-all flex items-center gap-1 ml-auto"
                          onClick={() => handleDeleteUser(row)}
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete User</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GLOBAL NETWORK AUDIT LOG */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
              Global Network Audit Stream <Terminal className="size-5 text-[#38bdf8]" />
            </h2>
            <span className="text-xs font-mono text-slate-400">Recent Operations</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 max-h-[500px] overflow-y-auto pr-1">
            {(activity.data ?? []).map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#def141] uppercase">{log.action}</span>
                  <Badge variant="outline" className={log.success ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-rose-500/40 text-rose-400 bg-rose-500/10"}>
                    {log.success ? "OK" : "FAILED"}
                  </Badge>
                </div>
                <p className="text-white text-[11px]">
                  UID: <span className="text-[#38bdf8] font-bold">{log.uid}</span>
                  {log.days ? ` · ${log.days}d` : ""}
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
