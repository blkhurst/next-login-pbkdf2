"use client";
import Link from "next/link";
import { FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type NoteItemProps = {
  id: string;
  content: string;
  isUnlocked: boolean;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  onSave: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
};

export function NoteItem({
  id,
  content,
  isUnlocked,
  editingNoteId,
  setEditingNoteId,
  onSave,
  onDelete,
}: NoteItemProps) {
  const isEditing = editingNoteId === id;

  const handleStartEdit = () => setEditingNoteId(id);
  const handleCancelEdit = () => setEditingNoteId(null);
  const handleDelete = () => onDelete(id);

  const handleSubmitEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newContent = (form.get("note-content") as string).trim();

    if (newContent) {
      onSave(id, newContent);
      handleCancelEdit();
    }
  };

  return (
    <div className="border-border bg-surface flex min-h-13 items-center justify-between rounded border px-4 py-2 text-sm shadow-sm">
      {isEditing ? (
        <EditNoteForm
          defaultValue={content}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <Link href={`/dashboard/${id}`} className="flex-1 truncate text-left">
            <span
              className={`truncate ${isUnlocked ? "" : "text-copy-secondary"}`}
            >
              {content}
            </span>
          </Link>

          {isUnlocked && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-none bg-red-500 hover:bg-red-400"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type EditNoteFormProps = {
  defaultValue: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function EditNoteForm({ defaultValue, onSubmit, onCancel }: EditNoteFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <Input
        name="note-content"
        defaultValue={defaultValue}
        autoFocus
        className="h-8 md:text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
