import Link from "next/link";

export function ErrorPage({ message }: { message: string }) {
  return (
    <main className="max-w-container flex h-[100svh] items-center justify-center">
      <div className="bg-surface border-border/50 w-full max-w-sm space-y-4 rounded-md border p-6 text-center drop-shadow-sm">
        <p className="text-copy-secondary">{message}</p>
        <Link href="/" className="mt-4 text-sm font-medium hover:underline">
          Go home
        </Link>
      </div>
    </main>
  );
}
