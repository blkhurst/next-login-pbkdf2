"use client";
import Link from "next/link";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { AuthFormState } from "@/lib/auth/definitions";

export default function SignupPage() {
  const handleSubmit = async () => {};
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<AuthFormState>({});

  return (
    <main className="max-w-container mt-[20svh] max-w-sm text-center">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">
          Create an account
        </h1>
        <p className="text-copy-secondary text-sm">
          Enter your details to get started.
        </p>
      </div>

      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-left">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" autoComplete="off" />
          </div>

          {state?.errors?.email && (
            <p className="text-sm text-red-500">{state.errors.email}</p>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" />
          </div>

          <div>
            <Label htmlFor="password">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
            />
          </div>

          {state?.errors?.password && (
            <div className="text-sm text-red-500">
              <p>Password must:</p>
              <ul>
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}

          <Button disabled={pending} type="submit" className="mt-2">
            {pending ? "Processing..." : "Create account"}
          </Button>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
        </form>
      </div>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link className="underline" href="/login">
          Login
        </Link>
      </p>
    </main>
  );
}
