"use client";
import { useNotes } from "@/hooks/useNotes";
import { NoteForm } from "./NoteForm";
import { NoteItem } from "./NoteItem";
import { Note } from "@/lib/db/schema";
import { KdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";
import { Label } from "../ui/Label";
import { useState } from "react";

type NotesProps = {
  email: string;
  kdfConfig: KdfConfig;
  protectedSymmetricKey: string;
  protectedNotes: Note[];
};

export function Notes({
  email,
  kdfConfig,
  protectedSymmetricKey,
  protectedNotes,
}: NotesProps) {
  const {
    state: { notes, isUnlocked, symmetricKey, error },
    actions: { lockNotes, unlockNotes, addNote, updateNote, deleteNote },
  } = useNotes(email, kdfConfig, protectedNotes, protectedSymmetricKey);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div>
          <Label>Symmetric Key</Label>
          <p className="bg-surface min-h-9 overflow-x-scroll rounded border px-2 py-2 text-sm text-nowrap text-emerald-500">
            {isUnlocked ? symmetricKey?.keyB64 : "Requires Decryption"}
          </p>
        </div>

        <NoteForm
          onAdd={addNote}
          onLock={lockNotes}
          onUnlock={unlockNotes}
          isUnlocked={isUnlocked}
          error={error}
        />
      </div>

      <div className="space-y-2">
        {notes.length === 0 && (
          <p className="text-copy-secondary text-sm">No entries yet.</p>
        )}

        {notes.map((note) => (
          <NoteItem
            key={note.id}
            id={note.id.toString()}
            content={note.content}
            isUnlocked={isUnlocked}
            onSave={updateNote}
            onDelete={deleteNote}
            editingNoteId={editingNoteId}
            setEditingNoteId={setEditingNoteId}
          />
        ))}
      </div>
    </section>
  );
}
