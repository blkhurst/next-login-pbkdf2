"use client";

import { useEffect, useState } from "react";
import { Note } from "@/lib/db/schema";
import { CryptoService } from "@/lib/Crypto/services/CryptoService";
import { useKeyContext } from "@/lib/providers/KeyProvider";
import { EncString } from "@/lib/Crypto/models/EncString";
import { updateNoteAction } from "@/app/dashboard/actions";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";

type NoteViewerProps = {
  protectedNote: Note;
};

export function NoteViewer({ protectedNote }: NoteViewerProps) {
  const { symmetricKey } = useKeyContext();

  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const decrypt = async () => {
      if (!symmetricKey) return;

      try {
        const service = CryptoService.create();
        const decrypted = await service.decrypt(
          new EncString(protectedNote.content),
          symmetricKey,
        );
        const text = decrypted.toString();
        setContent(text);
        setOriginalContent(text);
      } catch {
        setError("Failed to decrypt note.");
      }
    };

    decrypt();
  }, [protectedNote, symmetricKey]);

  const handleSave = async () => {
    if (!symmetricKey) return;
    if (content.trim() === originalContent.trim()) {
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      const service = CryptoService.create();
      const encrypted = await service.encrypt(content, symmetricKey);
      await updateNoteAction(protectedNote.id, encrypted.encryptedString);
      setOriginalContent(content);
      setEditing(false);
      setError("");
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setEditing(false);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          disabled={!editing}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-surface min-h-42 border border-l-emerald-500 focus-visible:border-emerald-500"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex gap-2">
        {editing ? (
          <>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="ghost" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )}
      </div>
    </div>
  );
}
