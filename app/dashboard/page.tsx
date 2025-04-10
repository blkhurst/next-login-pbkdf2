import { auth } from "@/lib/auth/auth";
import { getUserById, getNotesForUser } from "@/lib/db/queries";
import { Notes } from "@/components/Notes/Notes";
import { ErrorPage } from "@/components/ErrorPage";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user.id) return <ErrorPage message="Not authenticated." />;

  const user = await getUserById(session.user.id);
  if (!user) return <ErrorPage message="User not found." />;

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

      <Notes
        email={user.email}
        kdfConfig={{
          iterations: user.iterations,
          kdfType: user.kdfType,
          encType: user.encType,
        }}
        protectedSymmetricKey={user.protectedSymmetricKey}
        protectedNotes={protectedNotes}
      />
    </main>
  );
}
