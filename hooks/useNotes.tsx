"use client";
import {
  createNoteAction,
  deleteNoteAction,
  updateNoteAction,
} from "@/app/dashboard/actions";
import { useCallback, useEffect, useState } from "react";
import { useKeyContext } from "@/lib/providers/KeyProvider";
import { SymmetricCryptoKey } from "@/lib/Crypto/models/SymmetricCryptoKey";
import { CryptoService } from "@/lib/Crypto/services/CryptoService";
import { EncString } from "@/lib/Crypto/models/EncString";
import { KdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";
import { Note } from "@/lib/db/schema";

export function useNotes(
  email: string,
  kdfConfig: KdfConfig,
  protectedNotes: Note[],
  protectedSymmetricKey: string,
) {
  const service = CryptoService.create();
  const { symmetricKey, setSymmetricKey } = useKeyContext();

  const [notes, setNotes] = useState<Note[]>(protectedNotes);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  const lockNotes = useCallback(() => {
    setSymmetricKey(null);
    setIsUnlocked(false);
    setNotes(protectedNotes);
  }, [setSymmetricKey, protectedNotes]);

  const decryptNotes = useCallback(async () => {
    if (!symmetricKey) {
      lockNotes();
      return;
    }

    const decrypted: Note[] = [];
    for (const note of protectedNotes) {
      const decryptedContent = await service.decrypt(
        new EncString(note.content),
        symmetricKey,
      );

      decrypted.push({
        ...note,
        content: decryptedContent.toString(),
      });
    }

    setNotes(decrypted);
    setIsUnlocked(true);
    setError("");
  }, [symmetricKey, protectedNotes]);

  const unlockNotes = useCallback(
    async (password: string) => {
      try {
        const masterKeyStretched = await service.deriveKeyUsingConfig(
          password,
          email,
          kdfConfig,
        );

        const decryptedKey = await service.decrypt(
          new EncString(protectedSymmetricKey),
          masterKeyStretched,
        );

        const symmetric = new SymmetricCryptoKey(
          decryptedKey,
          kdfConfig.encType,
        );
        setSymmetricKey(symmetric);
      } catch {
        setError("Invalid password.");
      }
    },
    [email, kdfConfig, protectedSymmetricKey, setSymmetricKey],
  );

  const addNote = useCallback(
    async (content: string) => {
      if (!symmetricKey) {
        setError("[addNote] No key available.");
        return;
      }

      const encrypted = await service.encrypt(content, symmetricKey);
      await createNoteAction(encrypted.encryptedString);
    },
    [symmetricKey],
  );

  const updateNote = useCallback(
    async (id: string, newContent: string) => {
      if (!symmetricKey) {
        setError("[updateNote] No key available");
        return;
      }

      const encrypted = await service.encrypt(newContent, symmetricKey);
      await updateNoteAction(id, encrypted.encryptedString);
    },
    [symmetricKey],
  );

  const deleteNote = useCallback(async (id: string) => {
    await deleteNoteAction(id.toString());
  }, []);

  useEffect(() => {
    decryptNotes().catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to decrypt notes.");
      lockNotes();
    });
  }, [decryptNotes]);

  return {
    state: {
      notes,
      isUnlocked,
      symmetricKey,
      error,
    },
    actions: {
      lockNotes,
      unlockNotes,
      addNote,
      updateNote,
      deleteNote,
    },
  };
}
