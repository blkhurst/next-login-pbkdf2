"use client";
import { FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

type NoteFormProps = {
  isUnlocked: boolean;
  error: string;
  onAdd: (content: string) => Promise<void>;
  onUnlock: (password: string) => Promise<void>;
  onLock: () => void;
};

export function NoteForm({
  isUnlocked,
  error,
  onAdd,
  onUnlock,
  onLock,
}: NoteFormProps) {
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    setFormValue("");
  }, [isUnlocked]);

  const handleUnlock = async () => {
    await onUnlock(formValue);
    setFormValue("");
  };

  const handleAdd = async () => {
    const content = formValue.trim();
    if (!content) return;
    await onAdd(content);
    setFormValue("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return isUnlocked ? handleAdd() : handleUnlock();
  };

  return (
    <div>
      <Label>{isUnlocked ? "Add Note" : "Enter Vault Password"}</Label>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:flex-row">
        <Input
          type={isUnlocked ? "text" : "password"}
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          autoComplete="off"
        />

        <div className="flex w-full gap-2 md:max-w-48">
          <Button className="w-full" type="submit">
            {isUnlocked ? "Add Note" : "Unlock"}
          </Button>

          {isUnlocked && (
            <Button className="w-full" type="button" onClick={onLock}>
              Lock
            </Button>
          )}
        </div>
      </form>

      <div className="mt-1 min-h-[1.25rem]">
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
