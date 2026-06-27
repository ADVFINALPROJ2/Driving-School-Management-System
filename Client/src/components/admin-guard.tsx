"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isAdmin } from "@/lib/auth";

function useAdminCheck() {
  return useSyncExternalStore(
    () => () => {},
    () => isAdmin(),
    () => false,
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const admin = useAdminCheck();
  const router = useRouter();

  if (!admin) {
    router.replace("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
