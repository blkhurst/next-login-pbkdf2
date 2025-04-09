"use client";
import Link from "next/link";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
  const { state, pending, passwordRef, handleSubmit } = useLogin();

  return (
    <main className="max-w-container mt-[20svh] max-w-sm text-center">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Login</h1>
        <p className="text-copy-secondary text-sm">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-left">
          <div>
            <Label>Email</Label>
            <Input name="email" autoComplete="off" />
          </div>

          <div>
            <Label>Password</Label>
            <Input name="password" type="password" ref={passwordRef} />
          </div>

          <Button disabled={pending} type="submit" className="mt-2 w-full">
            {pending ? "Processing..." : "Login"}
          </Button>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
        </form>
      </div>

      <p className="mt-4 text-sm">
        Don&apos;t have an account?{" "}
        <Link className="underline" href="/signup">
          Sign up
        </Link>
      </p>
    </main>
  );
}
