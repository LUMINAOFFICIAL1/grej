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

type DbState = {
  users: DbUser[];
  user_roles: { id: string; user_id: string; role: ResellerRole; created_at: string }[];
  role_orders: DbRoleOrder[];
  uid_logs: DbUidLog[];
};

declare global {
  var __dbStateSingleton: DbState | undefined;
}

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

const DEFAULT_INITIAL_STATE: DbState = {
  users: [
    {
      id: "usr_owner_grej",
      username: "grej",
      email: "grej@grejlabs.local",
      password_hash: "987760",
      display_name: "Grej (Owner)",
      approved: true,
      role: "admin",
      uid_limit: 999999,
      created_at: new Date().toISOString(),
    },
    {
      id: "usr_master_ali",
      username: "alisaleem98776",
      email: "alisaleem98776@gmail.com",
      password_hash: "987760",
      display_name: "Master Admin",
      approved: true,
      role: "admin",
      uid_limit: 999999,
      created_at: new Date().toISOString(),
    },
  ],
  user_roles: [],
  role_orders: [],
  uid_logs: [],
};

async function loadDbFromSupabase(): Promise<DbState> {
  if (globalThis.__dbStateSingleton) {
    return globalThis.__dbStateSingleton;
  }

  try {
    const { data, error } = await supabase
      .from("role_orders")
      .select("*")
      .eq("id", "SYS_CLOUD_DB")
      .maybeSingle();

    if (data && data.tx_id) {
      const parsed = JSON.parse(data.tx_id) as DbState;
      if (parsed && Array.isArray(parsed.users)) {
        globalThis.__dbStateSingleton = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("[Supabase Cloud DB Read Error]", err);
  }

  globalThis.__dbStateSingleton = DEFAULT_INITIAL_STATE;
  saveDbToSupabase(DEFAULT_INITIAL_STATE).catch(() => {});
  return DEFAULT_INITIAL_STATE;
}

function loadDbSync(): DbState {
  if (globalThis.__dbStateSingleton) {
    return globalThis.__dbStateSingleton;
  }
  // If not loaded yet, initiate async fetch and return default
  loadDbFromSupabase().catch(() => {});
  return DEFAULT_INITIAL_STATE;
}

async function saveDbToSupabase(state: DbState): Promise<void> {
  globalThis.__dbStateSingleton = state;
  try {
    await supabase.from("role_orders").upsert({
      id: "SYS_CLOUD_DB",
      email: "system@grejlabs.local",
      pkg: "CLOUD_DB",
      amount: 0,
      method: "POSTGRES",
      tx_id: JSON.stringify(state),
      status: "ACTIVE",
    });
  } catch (err) {
    console.error("[Supabase Cloud DB Write Error]", err);
  }
}

export const mysqlDb = {
  async getUsers(): Promise<DbUser[]> {
    const state = await loadDbFromSupabase();
    return state.users;
  },

  async findUserById(id: string): Promise<DbUser | undefined> {
    const state = await loadDbFromSupabase();
    return state.users.find((u) => u.id === id);
  },

  async findUserByCredential(identifier: string): Promise<DbUser | undefined> {
    const state = await loadDbFromSupabase();
    const clean = identifier.trim().toLowerCase();
    return state.users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        u.email.toLowerCase().startsWith(`${clean}@`)
    );
  },

  async createUser(user: Omit<DbUser, "id" | "created_at">): Promise<DbUser> {
    const state = await loadDbFromSupabase();
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: DbUser = {
      ...user,
      approved: true,
      id,
      created_at: new Date().toISOString(),
    };

    state.users = state.users.filter(
      (u) =>
        u.username.toLowerCase() !== newUser.username.toLowerCase() &&
        u.email.toLowerCase() !== newUser.email.toLowerCase()
    );

    state.users.push(newUser);

    if (newUser.role === "admin") {
      state.user_roles.push({
        id: `ur_${Date.now()}`,
        user_id: id,
        role: "admin",
        created_at: new Date().toISOString(),
      });
    }

    await saveDbToSupabase(state);
    return newUser;
  },

  async updateUser(id: string, patch: Partial<DbUser>): Promise<DbUser | null> {
    const state = await loadDbFromSupabase();
    const index = state.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    state.users[index] = { ...state.users[index], ...patch };

    if (patch.role) {
      if (patch.role === "admin") {
        if (!state.user_roles.some((r) => r.user_id === id && r.role === "admin")) {
          state.user_roles.push({
            id: `ur_${Date.now()}`,
            user_id: id,
            role: "admin",
            created_at: new Date().toISOString(),
          });
        }
      } else {
        state.user_roles = state.user_roles.filter(
          (r) => !(r.user_id === id && r.role === "admin")
        );
      }
    }

    await saveDbToSupabase(state);
    return state.users[index];
  },

  async deleteUser(id: string): Promise<void> {
    const state = await loadDbFromSupabase();
    state.users = state.users.filter((u) => u.id !== id);
    state.user_roles = state.user_roles.filter((r) => r.user_id !== id);
    await saveDbToSupabase(state);
  },

  async getOrders(): Promise<DbRoleOrder[]> {
    const state = await loadDbFromSupabase();
    return state.role_orders;
  },

  async addOrder(order: Omit<DbRoleOrder, "created_at">): Promise<DbRoleOrder> {
    const state = await loadDbFromSupabase();
    const newOrder: DbRoleOrder = {
      ...order,
      created_at: new Date().toISOString(),
    };
    state.role_orders.unshift(newOrder);
    await saveDbToSupabase(state);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const state = await loadDbFromSupabase();
    const order = state.role_orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      await saveDbToSupabase(state);
    }
  },

  async getLogs(limit = 40): Promise<DbUidLog[]> {
    const state = await loadDbFromSupabase();
    return state.uid_logs.slice(0, limit);
  },

  async addLog(log: Omit<DbUidLog, "id" | "created_at">): Promise<DbUidLog> {
    const state = await loadDbFromSupabase();
    const newLog: DbUidLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    state.uid_logs.unshift(newLog);
    await saveDbToSupabase(state);
    return newLog;
  },
};
