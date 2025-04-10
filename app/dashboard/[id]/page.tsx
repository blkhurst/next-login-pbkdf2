import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getNoteById } from "@/lib/db/queries";
import { ErrorPage } from "@/components/ErrorPage";
import { IoArrowBack } from "react-icons/io5";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const session = await auth();
  if (!session?.user.id) return <ErrorPage message="Not authenticated." />;

  const { id } = await params;
  const note = await getNoteById(session.user.id ?? "", id);
  if (!note) return <ErrorPage message="Note not found." />;

  return (
    <main className="max-w-container my-24">
      <Link
        href="/dashboard"
        className="text-copy-secondary absolute top-15 flex items-center text-sm font-medium hover:underline"
      >
        <IoArrowBack className="mr-1" />
        Back to Dashboard
      </Link>

      <div className="border-l-4 border-emerald-500 pl-4">
        <h1 className="text-4xl font-semibold tracking-tight">Note</h1>
        <p className="text-copy-secondary mt-1 text-base">
          View and edit your encrypted note.
        </p>
      </div>

      <div className="text-copy-secondary mt-6 space-y-1 text-sm break-all whitespace-pre-wrap">
        <p>
          <span className="text-copy-primary font-medium">Note ID:</span>{" "}
          {note.id}
        </p>
        <p>
          <span className="text-copy-primary font-medium">Created at:</span>{" "}
          {note.createdAt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p>
          <span className="text-copy-primary font-medium">Updated at:</span>{" "}
          {note.updatedAt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <hr className="my-6" />
    </main>
  );
}
