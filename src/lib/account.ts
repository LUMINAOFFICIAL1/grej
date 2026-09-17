import { useQuery } from "@tanstack/react-query";

export type ResellerRole = "starter" | "pro" | "developer" | "admin";

export type Account = {
  id: string;
  username: string;
  email: string;
  display_name: string;
  approved: boolean;
  uidLimit: number;
  credits: number;
  role: ResellerRole;
  isAdmin: boolean;
};

const LOCAL_STORAGE_KEY = "grejlabs_auth_session";

export function setCurrentAccount(account: Account | null) {
  if (typeof window !== "undefined") {
    if (account) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
}

export function getCurrentAccount(): Account | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async (): Promise<Account | null> => {
      return getCurrentAccount();
    },
  });
}

export async function signOutEverywhere() {
  setCurrentAccount(null);
}
