"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CryptoService } from "@/lib/cryptography/services/CryptoService";
import { SymmetricCryptoKey } from "@/lib/cryptography/models/SymmetricCryptoKey";
import { EncString } from "@/lib/cryptography/models/EncString";
import { getDefaultKdfConfig } from "@/lib/cryptography/interfaces/KdfConfig";
import { encOptions } from "@/lib/cryptography/enums/EncType";
import { kdfOptions } from "@/lib/cryptography/enums/KdfType";

export default function DecryptPage() {
  const kdfDefaults = getDefaultKdfConfig();
  const [password, setPassword] = useState("password");
  const [salt, setSalt] = useState("salt");
  const [kdfIterations, setKdfIterations] = useState(kdfDefaults.iterations);
  const [encType, setEncType] = useState(kdfDefaults.encType);
  const [kdfType, setKdfType] = useState(kdfDefaults.kdfType);

  const [protectedKey, setProtectedKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");

  const [decryptedKey, setDecryptedKey] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const decrypt = async () => {
      if (!protectedKey || !ciphertext) return;

      try {
        const service = CryptoService.create();

        const stretchedKey = await service.deriveStretchedMasterKey(password, salt, {
          encType,
          iterations: kdfIterations,
          kdfType,
        });

        const decryptedKeyBuffer = await service.decrypt(
          new EncString(protectedKey),
          stretchedKey,
        );
        const decryptedKey = new SymmetricCryptoKey(decryptedKeyBuffer, encType);

        const plaintextBuffer = await service.decrypt(
          new EncString(ciphertext),
          decryptedKey,
        );

        setDecryptedKey(decryptedKeyBuffer.toString("base64"));
        setDecryptedText(plaintextBuffer.toString());
        setError(null);
      } catch (err) {
        setDecryptedKey("");
        setDecryptedText("");
        setError(err instanceof Error ? err.message : "Decryption failed.");
      }
    };

    decrypt();
  }, [password, salt, kdfIterations, kdfType, encType, protectedKey, ciphertext]);

  return (
    <section className="max-w-container my-8">
      <div className="flex w-full flex-col">
        <h1 className="text-3xl font-medium tracking-tight">Decrypt</h1>
        {error && <p className="mt-2 w-full text-red-500">Error: {error}</p>}
      </div>

      {/* Inputs */}
      <div className="mt-4 grid w-full grid-cols-1 gap-2 md:grid-cols-3 md:gap-x-6">
        <SelectInput label="Key Derivation Function" value={kdfType} onChange={setKdfType} options={kdfOptions} />
        <SelectInput label="Encryption Type" value={encType} onChange={setEncType} options={encOptions} className="md:col-span-2" />
        <LabeledInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <LabeledInput label="Salt" value={salt} onChange={(e) => setSalt(e.target.value)} />
        <LabeledInput
          label="Iterations"
          type="number"
          value={kdfIterations}
          onChange={(e) => setKdfIterations(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      {/* Cipher Input */}
      <div className="mt-8 space-y-2">
        <h2 className="text-xl font-medium tracking-tight">Encrypted Inputs</h2>
        <LabeledInput label="Protected AES Key" value={protectedKey} onChange={(e) => setProtectedKey(e.target.value)} />
        <LabeledInput label="Encrypted Text" value={ciphertext} onChange={(e) => setCiphertext(e.target.value)} />
      </div>

      {/* Output */}
      <div className="mt-8 space-y-2">
        <h2 className="text-xl font-medium tracking-tight">Decrypted Outputs</h2>
        <LabeledValue label="Decrypted AES Key">{decryptedKey}</LabeledValue>
        <LabeledValue label="Decrypted Text">{decryptedText}</LabeledValue>
      </div>
    </section>
  );
}

function LabeledValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="bg-surface min-h-9 overflow-x-scroll rounded border px-2 py-2 text-sm text-nowrap text-emerald-500">
        {children}
      </p>
    </div>
  );
}

function LabeledInput({
  label,
  ...inputProps
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <Input {...inputProps} />
    </div>
  );
}

type Option = {
  label: string;
  value: number;
};

function SelectInput({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: Option[];
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <select
        className="w-full rounded border p-2 text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
