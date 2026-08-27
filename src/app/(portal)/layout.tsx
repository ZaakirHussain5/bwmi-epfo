import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";

export default async function PortalLayout({ children }: PropsWithChildren) {
  const isAuthenticated = await hasAuthenticatedSessionFromCookies();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <AppShell>{children}</AppShell>
  );
}
