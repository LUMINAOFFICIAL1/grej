import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Particles,
  SplitText,
  TiltedCard,
  SpotlightCard,
  Magnet,
  DockNavbar,
} from "@/components/reactbits";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Zap,
  Receipt,
  Clock,
  Send,
  Code2,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitRoleOrderFn } from "@/lib/uid.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Role Tiers & Pricing — GrejLabs UID Bypass" },
      { name: "description", content: "Select reseller roles: Starter, Pro, Developer, or Admin for web UID limits and access controls." },
    ],
  }),
  component: PricingCheckoutPage,
});

interface PaymentMethod {
  id: string;
  name: string;
  iconName: string;
  detail: string;
  note: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "usdt",
    name: "USDT (TRC20)",
    iconName: "USDT",
    detail: "TGrejLabsBypassAddressTRC20USDT8899",
    note: "Network: TRC-20 (Tron). Fast 1-2 min confirmation.",
  },
  {
    id: "binance",
    name: "Binance Pay",
    iconName: "BINANCE",
    detail: "Binance Pay ID: 893019284",
    note: "Zero fees for Binance users. Instant ID matching.",
  },
  {
    id: "upi",
    name: "UPI / IN Payment",
    iconName: "UPI",
    detail: "grejlabs@upi",
    note: "GPay, PhonePe, Paytm accepted. Attach UTR number.",
  },
  {
    id: "paypal",
    name: "PayPal / Invoice",
    iconName: "PAYPAL",
    detail: "payments@grejlabs.io",
    note: "Send via Friends & Family or ask support for invoice.",
  },
];

const ROLES = [
  {
    id: "starter",
    roleName: "STARTER ROLE",
    limitText: "200 Active UIDs",
    price: 20,
    badge: "Entry Reseller",
    icon: <ShieldCheck className="size-5 text-gold" />,
    perks: ["200 Active Concurrent UIDs Limit", "Web Panel UID Add / Extend / Replace", "Standard Audit History"],
  },
  {
    id: "pro",
    roleName: "PRO ROLE",
    limitText: "400 Active UIDs",
    price: 30,
    discount: "Most Popular",
    badge: "High Volume",
    icon: <Zap className="size-5 text-gold" />,
    perks: ["400 Active Concurrent UIDs Limit", "Priority Limit Upgrades & Fast Processing", "24/7 Priority Support Channel"],
  },
  {
    id: "developer",
    roleName: "DEVELOPER ROLE",
    limitText: "Unlimited UIDs",
    price: 40,
    discount: "Full Dev Suite",
    badge: "Unlimited + API",
    icon: <Code2 className="size-5 text-emerald-400" />,
    perks: ["Unlimited Active UIDs Capacity", "Direct API Token & Automation Access", "Custom Integration Webhooks"],
  },
];

interface SubmittedOrder {
  id: string;
  email: string;
  pkg: string;
  amount: number;
  method: string;
  txId: string;
  status: string;
  time: string;
}

export function PricingCheckoutPage() {
  const submitOrderServer = useServerFn(submitRoleOrderFn);
  const [selectedRole, setSelectedRole] = useState(ROLES[1]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [txId, setTxId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState<SubmittedOrder[]>([]);

  useEffect(() => {
    try {
      supabase
        .from("role_orders")
        .select("id, email, pkg, amount, method, tx_id, status, created_at")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setOrdersHistory(
              data.map((o) => ({
                id: o.id,
                email: o.email,
                pkg: o.pkg,
                amount: Number(o.amount),
                method: o.method,
                txId: o.tx_id,
                status: o.status,
                time: new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }))
            );
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Payment details copied to clipboard!");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      toast.error("Please enter your account email");
      return;
    }
    if (!txId.trim()) {
      toast.error("Please enter your Transaction ID / UTR reference number");
      return;
    }
    setSubmitting(true);

    const pkgName = `${selectedRole.roleName} (${selectedRole.limitText})`;

    try {
      const result = await submitOrderServer({
        data: {
          email: userEmail.trim(),
          pkg: pkgName,
          amount: selectedRole.price,
          method: paymentMethod.name,
          txId: txId.trim(),
        },
      });

      const newOrder: SubmittedOrder = {
        id: result?.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        email: userEmail,
        pkg: pkgName,
        amount: selectedRole.price,
        method: paymentMethod.name,
        txId,
        status: "Pending Admin Verification",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setOrdersHistory((prev) => [newOrder, ...prev]);
      toast.success(`Role order submitted! Admin will verify TxID for ${userEmail} shortly.`);
      setTxId("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-gold/30 selection:text-gold pb-20">
      <Particles particleCount={65} speed={0.4} particleColor="rgba(243, 200, 104, 0.4)" glowColor="rgba(223, 168, 55, 0.15)" />
      <DockNavbar currentPath="/showcase" />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-md">
            <span>Royal Web Role Tiers</span>
          </div>

          <h1 className="text-6xl font-display font-extrabold tracking-tight sm:text-7xl">
            <SplitText text="Web Roles & Access Limits" highlightWords={["Roles", "Limits"]} />
          </h1>

          <p className="text-muted-foreground text-lg">
            Choose your web access role: Starter (200 UIDs / $20), Pro (400 UIDs / $30), Developer (Unlimited UIDs + API / $40), or Admin.
          </p>
        </div>

        {/* ROLE SELECTION TIERS */}
        <div className="grid gap-6 md:grid-cols-3">
          {ROLES.map((role) => {
            const isSelected = selectedRole.id === role.id;
            return (
              <TiltedCard
                key={role.id}
                maxTilt={10}
                className={`p-7 cursor-pointer transition-all ${
                  isSelected ? "border-gold bg-gold/10 ring-2 ring-gold/50 shadow-2xl" : "border-border/80 hover:border-gold/50"
                }`}
              >
                <div onClick={() => setSelectedRole(role)}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gold uppercase tracking-wider flex items-center gap-1.5">
                      {role.icon} {role.roleName}
                    </span>
                    {role.discount && (
                      <span className="rounded-full bg-gold/20 border border-gold/40 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                        {role.discount}
                      </span>
                    )}
                  </div>

                  <h3 className="text-3xl font-display font-bold mt-3">{role.limitText}</h3>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-foreground font-mono">${role.price}</span>
                    <span className="text-sm text-gold font-mono font-bold">/ One-time setup</span>
                  </div>

                  <p className="mt-2 text-xs text-gold font-mono flex items-center gap-1">
                    <Zap className="size-3" /> Full role permission level
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    {role.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="size-3.5 text-gold shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`mt-6 w-full rounded-xl p-3.5 font-bold text-xs transition-all ${
                      isSelected
                        ? "bg-gold text-slate-950 shadow-lg shadow-gold/30"
                        : "bg-muted text-foreground hover:bg-accent"
                    }`}
                  >
                    {isSelected ? "Selected Role" : "Select Role"}
                  </button>
                </div>
              </TiltedCard>
            );
          })}
        </div>

        {/* ADMIN ROLE CARD OVERVIEW */}
        <SpotlightCard className="p-7 border-gold/50 bg-gold/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/20 text-gold border border-gold/40">
              <Crown className="size-7" />
            </div>
            <div>
              <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold">ADMIN ROLE LEVEL</span>
              <h3 className="text-3xl font-display font-bold">Master Owner & System Control</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Full network audit logs, reseller approval controls, role assignment, and unlimited UID capacity.
              </p>
            </div>
          </div>
          <div className="font-mono text-xs text-gold border border-gold/40 rounded-xl px-4 py-2 bg-slate-950">
            OWNER PERMISSION ONLY
          </div>
        </SpotlightCard>

        {/* CHECKOUT & PAYMENT METHOD SECTION */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl border border-gold/40 bg-card/70 p-7 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/40">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold">1. Choose Payment Method</h3>
                <p className="text-xs text-muted-foreground">Direct transfer details</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod.id === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-gold bg-gold/15 ring-1 ring-gold text-foreground shadow-lg"
                        : "border-border/80 bg-background/40 text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gold">{method.iconName}</span>
                      {isSelected && <CheckCircle2 className="size-4 text-gold" />}
                    </div>
                    <p className="mt-2 text-sm font-bold text-foreground">{method.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{method.note}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-gold/40 bg-slate-950 p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>PAYMENT ADDRESS / ID</span>
                <span className="text-gold font-semibold">{paymentMethod.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 p-3">
                <span className="text-gold font-bold select-all truncate pr-2">{paymentMethod.detail}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(paymentMethod.detail)}
                  className="inline-flex items-center gap-1 rounded-md bg-gold/20 px-2.5 py-1 text-gold hover:bg-gold/30 text-[11px]"
                >
                  <Copy className="size-3" /> Copy
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{paymentMethod.note}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gold/40 bg-card/70 p-7 backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/40">
                <Receipt className="size-5" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold">2. Submit Order Transaction ID</h3>
                <p className="text-xs text-muted-foreground">Submit TxID for admin role activation</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/60 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-mono">SELECTED ROLE</p>
                <p className="text-base font-bold text-gold">{selectedRole.roleName} ({selectedRole.limitText})</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-mono">TOTAL DUE</p>
                <p className="text-3xl font-extrabold text-foreground font-mono">${selectedRole.price} USD</p>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase">Your Account Email</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="reseller@domain.com"
                  className="w-full rounded-xl border border-border/80 bg-background/80 px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase">Transaction ID / Hash / UTR No.</label>
                <input
                  type="text"
                  required
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="e.g. 0x8f29...910d or UTR-940291"
                  className="w-full rounded-xl border border-border/80 bg-background/80 px-4 py-3 font-mono text-sm text-foreground focus:border-gold focus:outline-none"
                />
              </div>

              <Magnet strength={0.2} className="w-full pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-emerald-500 p-4 font-bold text-slate-950 shadow-xl shadow-gold/20 hover:brightness-110 active:scale-95 text-sm"
                >
                  <Send className="size-4" />
                  <span>{submitting ? "Submitting Request…" : `Pay $${selectedRole.price} USD & Submit Order`}</span>
                </button>
              </Magnet>
            </form>
          </div>
        </div>

        {/* ORDER TRACKER STREAM */}
        <div className="rounded-2xl border border-gold/40 bg-card/60 p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/40">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold">Role Assignment Order Stream</h3>
                <p className="text-xs text-muted-foreground">Live orders submitted by resellers for verification</p>
              </div>
            </div>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-xs text-gold">
              Admin Verifier Active
            </span>
          </div>

          <div className="space-y-3">
            {ordersHistory.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-background/40 p-6 text-center text-xs font-mono text-muted-foreground">
                No role orders submitted yet. Fill out the form above to submit your transaction ID.
              </div>
            ) : (
              ordersHistory.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/60 p-4 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gold">{order.id}</span>
                      <span className="text-muted-foreground">· {order.pkg}</span>
                      <span className="text-foreground">({order.email})</span>
                    </div>
                    <p className="text-muted-foreground">
                      TxID: <span className="text-gold font-bold">{order.txId}</span> ({order.method})
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${
                        order.status.includes("Verified")
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-muted-foreground text-[10px]">{order.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
