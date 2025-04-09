import { validate } from "uuid";
import { db } from "./drizzle";
import { users, notes } from "./schema";
import { and, eq, isNull, desc } from "drizzle-orm";

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) return null;
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) return null;
  return user;
}

export async function getNoteById(userId: string, noteId: string) {
  // noteId exposed for dynamic route, need strict UUID format validation.
  if (!validate(noteId)) return null;

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  if (!note) return null;
  return note;
}

export async function getNotesForUser(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));
}

export async function createNote(userId: string, encryptedContent: string) {
  const [note] = await db
    .insert(notes)
    .values({
      userId,
      content: encryptedContent,
    })
    .returning();

  if (!note) return null;
  return note;
}

export async function deleteNoteById(userId: string, noteId: string) {
  return await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

export async function updateNote(
  noteId: string,
  userId: string,
  content: string,
) {
  return await db
    .update(notes)
    .set({
      content: content,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}
