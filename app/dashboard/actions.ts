"use server";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { createNote, deleteNoteById, updateNote } from "@/lib/db/queries";

export async function createNoteAction(content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const resp = await createNote(session.user.id, content);
  revalidatePath("/dashboard");
  return resp;
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rowsModified = await deleteNoteById(session.user.id, noteId);
  revalidatePath("/dashboard");
  return rowsModified.rowCount ?? 0;
}

export async function updateNoteAction(noteId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rowsModified = await updateNote(noteId, session.user.id, content);
  revalidatePath("/dashboard");
  return rowsModified.rowCount ?? 0;
}
