import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getCurrentAccount } from "@/lib/account";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const account = getCurrentAccount();
    if (!account) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
