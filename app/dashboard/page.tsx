import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getUserById, getNotesForUser } from "@/lib/db/queries";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.id) return <ErrorMessage message="Not authenticated." />;

  const user = await getUserById(session.user.id);
  if (!user) return <ErrorMessage message="User not found." />;

  const protectedNotes = await getNotesForUser(user.id);

  return (
    <main className="max-w-container my-24">
      <div className="border-l-4 border-emerald-500 pl-4">
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-copy-secondary mt-1 text-base">
          View and manage your encrypted notes.
        </p>
      </div>

      <div className="text-copy-secondary mt-6 space-y-1 text-sm break-all whitespace-pre-wrap">
        <p>
          <span className="text-copy-primary font-medium">User ID:</span>{" "}
          {user.id}
        </p>
        <p>
          <span className="text-copy-primary font-medium">Email:</span>{" "}
          {user.email}
        </p>
        <p>
          <span className="text-copy-primary font-medium">Role:</span>{" "}
          {user.role}
        </p>
        <p>
          <span className="text-copy-primary font-medium">
            Protected Symmetric Key:
          </span>{" "}
          {user.protectedSymmetricKey}
        </p>
      </div>

      <hr className="my-6" />
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
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
