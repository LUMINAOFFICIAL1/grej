import { createServerFn } from "@tanstack/react-start";
import { mysqlDb, type ResellerRole } from "./db.server";

const API_BASE = "https://uidbypass.online/api/uid";

export type UidAction = "add" | "extend" | "replace" | "remove" | "info" | "list";

export type UidResult = {
  ok: boolean;
  message: string;
  data: string | null;
  uidLimitLeft: number | null;
  creditsLeft: number | null;
};

type Input = {
  userId?: string;
  action: UidAction;
  uid?: string;
  newUid?: string;
  days?: number;
};

function validate(input: Input): Input {
  const action = input.action;
  if (!["add", "extend", "replace", "remove", "info", "list"].includes(action)) {
    throw new Error("Unknown action");
  }
  const uid = (input.uid ?? "").trim();
  const newUid = (input.newUid ?? "").trim();
  const days = Number(input.days ?? 0);

  if (action !== "list" && !/^[0-9A-Za-z_-]{3,40}$/.test(uid)) {
    throw new Error("Enter a valid UID");
  }
  if (action === "replace" && !/^[0-9A-Za-z_-]{3,40}$/.test(newUid)) {
    throw new Error("Enter a valid new UID");
  }
  if ((action === "add" || action === "extend") && (!Number.isInteger(days) || days < 1 || days > 3650)) {
    throw new Error("Days must be between 1 and 3650");
  }
  return input;
}

function buildUrl(input: Input, apiKey: string): string {
  const params = new URLSearchParams();
  params.set("key", apiKey);

  switch (input.action) {
    case "add":
    case "extend":
      params.set("uid", input.uid!);
      params.set("days", String(input.days));
      return `${API_BASE}/${input.action}?${params}`;
    case "replace":
      params.set("old_uid", input.uid!);
      params.set("new_uid", input.newUid!);
      return `${API_BASE}/replace?${params}`;
    case "remove":
      params.set("uid", input.uid!);
      return `${API_BASE}/remove?${params}`;
    case "info":
      params.set("uid", input.uid!);
      return `${API_BASE}/info?${params}`;
    default:
      return `${API_BASE}/list?${params}`;
  }
}

// 1. Sign In Server Function
export const signInFn = createServerFn({ method: "POST" })
  .validator((data: { identifier: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await mysqlDb.findUserByCredential(data.identifier);
    if (!user) {
      throw new Error("Account not found. Please check credentials or contact Owner.");
    }

    if (user.password_hash !== data.password) {
      throw new Error("Invalid password credentials.");
    }

    if (!user.approved) {
      throw new Error("Your account is currently awaiting Owner approval.");
    }

    return {
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        approved: true,
        uidLimit: user.uid_limit ?? (user.role === "pro" ? 400 : user.role === "developer" || user.role === "admin" ? 999999 : 200),
        uid_limit: user.uid_limit ?? (user.role === "pro" ? 400 : user.role === "developer" || user.role === "admin" ? 999999 : 200),
        credits: user.uid_limit ?? 200,
        isAdmin: user.role === "admin" || user.username === "grej" || user.email === "grej@grejlabs.local",
      },
    };
  });

// 2. Owner Create User & Role Server Function
export const createUserByAdminFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      email: string;
      password: string;
      displayName?: string;
      role: ResellerRole;
    }) => data
  )
  .handler(async ({ data }) => {
    const username = data.email.includes("@")
      ? data.email.split("@")[0]
      : data.email.trim();
    const email = data.email.includes("@")
      ? data.email.trim()
      : `${data.email.trim()}@grejlabs.local`;

    let uid_limit = 200;
    if (data.role === "admin" || data.role === "developer") uid_limit = 999999;
    else if (data.role === "pro") uid_limit = 400;

    const newUser = await mysqlDb.createUser({
      username,
      email,
      password_hash: data.password,
      display_name: data.displayName || username,
      approved: true,
      role: data.role,
      uid_limit,
    });

    return {
      ok: true,
      user: newUser,
      message: `User '${newUser.username}' created successfully with role ${newUser.role.toUpperCase()}!`,
    };
  });

// 3. Admin Get All Users Server Function
export const getUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  return await mysqlDb.getUsers();
});

// 4. Update User Role & Capacity
export const updateUserRoleFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; role: ResellerRole }) => data)
  .handler(async ({ data }) => {
    let limit = 200;
    if (data.role === "admin" || data.role === "developer") limit = 999999;
    else if (data.role === "pro") limit = 400;

    const updated = await mysqlDb.updateUser(data.userId, {
      role: data.role,
      uid_limit: limit,
      approved: true,
    });

    return { ok: true, user: updated };
  });

// 5. Toggle User Approval Status
export const toggleUserApprovalFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; approved: boolean }) => data)
  .handler(async ({ data }) => {
    const updated = await mysqlDb.updateUser(data.userId, { approved: data.approved });
    return { ok: true, user: updated };
  });

// 6. Submit Purchase Order
export const submitRoleOrderFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; pkg: string; amount: number; method: string; txId: string }) => data)
  .handler(async ({ data }) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = await mysqlDb.addOrder({
      id: orderId,
      email: data.email,
      pkg: data.pkg,
      amount: data.amount,
      method: data.method,
      tx_id: data.txId,
      status: "Pending Admin Verification",
    });

    return { ok: true, orderId, message: "Order submitted to Admin", order: newOrder };
  });

// 7. Get Role Orders
export const getRoleOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  return await mysqlDb.getOrders();
});

// 8. Approve Order
export const approveOrderFn = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; status?: string }) => data)
  .handler(async ({ data }) => {
    const status = data.status || "Verified & Approved";
    await mysqlDb.updateOrderStatus(data.orderId, status);
    return { ok: true };
  });

// 9. Get Activity Audit Logs
export const getActivityLogsFn = createServerFn({ method: "GET" }).handler(async () => {
  return await mysqlDb.getLogs();
});

// 10. Delete User Server Function
export const deleteUserByAdminFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    await mysqlDb.deleteUser(data.userId);
    return { ok: true, message: "User deleted successfully." };
  });

// 11. Change User Password Server Function
export const changeUserPasswordByAdminFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; newPassword: string }) => data)
  .handler(async ({ data }) => {
    if (!data.newPassword || data.newPassword.length < 3) {
      throw new Error("Password must be at least 3 characters.");
    }
    const updated = await mysqlDb.updateUser(data.userId, { password_hash: data.newPassword.trim() });
    return { ok: true, message: `Password changed successfully for ${updated?.username}.` };
  });

// 10. Run UID Operation Action
export const runUidAction = createServerFn({ method: "POST" })
  .validator((input: Input) => validate(input))
  .handler(async ({ data }): Promise<UidResult> => {
    const userId = data.userId || "usr_owner_grej";
    const user = await mysqlDb.findUserById(userId);

    const uidLimit = user?.uid_limit ?? 999999;
    if (data.action === "add" && uidLimit <= 0) {
      throw new Error("You have reached your UID Limit. Request a UID limit upgrade from Owner.");
    }

    const key = process.env["UIDBYPASS_API_KEY"] || "uidbypass_055A964D256A4DF6A3C467E39A6A2C45_GrejBadwa.online";

    let ok = false;
    let message = "";
    let payload: Record<string, unknown> | null = null;

    try {
      const response = await fetch(buildUrl(data, key), {
        headers: { accept: "application/json" },
      });
      const text = await response.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
      const body = payload as Record<string, unknown> | null;
      const flagged =
        body && typeof body === "object" && "success" in body ? body["success"] !== false : true;
      ok = response.ok && flagged;
      message =
        (body && typeof body["message"] === "string" && body["message"]) ||
        (ok ? "Request completed" : `Service responded with ${response.status}`);
    } catch {
      ok = false;
      message = "Could not reach the UID service";
    }

    await mysqlDb.addLog({
      user_id: userId,
      action: data.action,
      uid: data.action === "list" ? "-" : data.uid!,
      target_uid: data.action === "replace" ? data.newUid! : null,
      days: data.action === "add" || data.action === "extend" ? data.days! : null,
      credits_used: 0,
      success: ok,
      message: message.slice(0, 500),
    });

    return {
      ok,
      message,
      data: payload ? JSON.stringify(payload, null, 2) : null,
      uidLimitLeft: uidLimit,
      creditsLeft: uidLimit,
    };
  });
