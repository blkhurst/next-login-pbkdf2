"use client";
import { SessionProvider } from "next-auth/react";
import { KeyProvider } from "@/lib/providers/KeyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <KeyProvider>{children}</KeyProvider>
    </SessionProvider>
  );
}
