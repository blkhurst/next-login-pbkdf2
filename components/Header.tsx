"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !visible) setVisible(true);
  }, [status, visible]);

  return (
    <div
      className={`duration-500", fixed top-4 right-4 z-50 transition ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-surface/60 flex items-center gap-1 rounded-md px-1 py-1 shadow-sm backdrop-blur-md">
        <Button
          className="text-copy-secondary hover:text-copy-primary px-2 text-xs"
          size="sm"
          variant="ghost"
          asChild
        >
          <Link href="/">{session ? session.user.email : "Homepage"}</Link>
        </Button>

        {session && (
          <Button
            type="button"
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="text-copy-secondary hover:text-copy-primary px-2 text-xs"
          >
            Sign out
          </Button>
        )}

        {!session && (
          <Button
            className="text-copy-secondary hover:text-copy-primary px-2 text-xs"
            size="sm"
            variant="ghost"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
