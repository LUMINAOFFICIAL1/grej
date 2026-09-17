import { createClient } from "@supabase/supabase-js";

export type ResellerRole = "starter" | "pro" | "developer" | "admin";

export type DbUser = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  approved: boolean;
  role: ResellerRole;
  uid_limit: number;
  created_at: string;
};

export type DbRoleOrder = {
  id: string;
  email: string;
  pkg: string;
  amount: number;
  method: string;
  tx_id: string;
  status: string;
  created_at: string;
};

export type DbUidLog = {
  id: string;
  user_id: string;
  action: string;
  uid: string;
  target_uid: string | null;
  days: number | null;
  credits_used: number;
  success: boolean;
  message: string;
  created_at: string;
};

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://truqxykzqgmsikcalabo.supabase.co";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydXF4eWt6cWdtc2lrY2FsYWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTY0NTAxMSwiZXhwIjoyMTA1MjIxMDExfQ.ru75XKV-YDeRH6MQUPcO7gZpwjWYjDYKHa29QOU8lPE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const mysqlDb = {
  async getUsers(): Promise<DbUser[]> {
    try {
      const { data, error } = await supabase
        .from("role_orders")
        .select("*")
        .eq("status", "USER_ACCOUNT");

      if (data && data.length > 0) {
        return data
          .map((row) => {
            try {
              return JSON.parse(row.tx_id) as DbUser;
            } catch {
              return null;
            }
          })
          .filter((u): u is DbUser => u !== null);
      }
    } catch (err) {
      console.error("[Supabase getUsers Error]", err);
    }
    return [];
  },

  async findUserById(id: string): Promise<DbUser | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id);
  },

  async findUserByCredential(identifier: string): Promise<DbUser | undefined> {
    const users = await this.getUsers();
    const clean = identifier.trim().toLowerCase();
    return users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        u.email.toLowerCase().startsWith(`${clean}@`)
    );
  },

  async createUser(user: Omit<DbUser, "id" | "created_at">): Promise<DbUser> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: DbUser = {
      ...user,
      approved: true,
      id,
      created_at: new Date().toISOString(),
    };

    const rowId = `USR_${newUser.username.toLowerCase()}`;
    await supabase.from("role_orders").upsert({
      id: rowId,
      email: newUser.email,
      pkg: newUser.role,
      amount: newUser.uid_limit,
      method: newUser.password_hash,
      tx_id: JSON.stringify(newUser),
      status: "USER_ACCOUNT",
    });

    return newUser;
  },

  async updateUser(id: string, patch: Partial<DbUser>): Promise<DbUser | null> {
    const users = await this.getUsers();
    const existing = users.find((u) => u.id === id);
    if (!existing) return null;

    const updatedUser: DbUser = { ...existing, ...patch };
    const rowId = `USR_${updatedUser.username.toLowerCase()}`;

    await supabase.from("role_orders").upsert({
      id: rowId,
      email: updatedUser.email,
      pkg: updatedUser.role,
      amount: updatedUser.uid_limit,
      method: updatedUser.password_hash,
      tx_id: JSON.stringify(updatedUser),
      status: "USER_ACCOUNT",
    });

    return updatedUser;
  },

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    const existing = users.find((u) => u.id === id);
    if (!existing) return;

    const rowId = `USR_${existing.username.toLowerCase()}`;
    await supabase.from("role_orders").delete().eq("id", rowId);
  },

  async getOrders(): Promise<DbRoleOrder[]> {
    try {
      const { data } = await supabase
        .from("role_orders")
        .select("*")
        .neq("status", "USER_ACCOUNT")
        .neq("status", "ACTIVE");

      return (data ?? []).map((row) => ({
        id: row.id,
        email: row.email,
        pkg: row.pkg,
        amount: Number(row.amount),
        method: row.method,
        tx_id: row.tx_id,
        status: row.status,
        created_at: row.created_at,
      }));
    } catch {
      return [];
    }
  },

  async addOrder(order: Omit<DbRoleOrder, "created_at">): Promise<DbRoleOrder> {
    const newOrder: DbRoleOrder = {
      ...order,
      created_at: new Date().toISOString(),
    };

    await supabase.from("role_orders").insert([{
      id: newOrder.id,
      email: newOrder.email,
      pkg: newOrder.pkg,
      amount: newOrder.amount,
      method: newOrder.method,
      tx_id: newOrder.tx_id,
      status: newOrder.status,
    }]);

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await supabase.from("role_orders").update({ status }).eq("id", orderId);
  },

  async getLogs(limit = 40): Promise<DbUidLog[]> {
    try {
      const { data } = await supabase
        .from("uid_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      return (data ?? []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        action: row.action,
        uid: row.uid,
        target_uid: row.target_uid,
        days: row.days,
        credits_used: row.credits_used ?? 0,
        success: row.status === "success" || row.success === true,
        message: row.message ?? "",
        created_at: row.created_at,
      }));
    } catch {
      return [];
    }
  },

  async addLog(log: Omit<DbUidLog, "id" | "created_at">): Promise<DbUidLog> {
    const newLog: DbUidLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("uid_logs").insert([{
        user_id: newLog.user_id,
        action: newLog.action,
        uid: newLog.uid,
        target_uid: newLog.target_uid,
        days: newLog.days,
        status: newLog.success ? "success" : "failed",
        message: newLog.message,
      }]);
    } catch (err) {
      console.error("[Add Log Error]", err);
    }

    return newLog;
  },
};
