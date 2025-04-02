"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useCryptoDemo } from "./useCryptoDemo";
import { encOptions } from "@/lib/Crypto/enums/EncType";
import { kdfOptions } from "@/lib/Crypto/enums/KdfType";
import { getDefaultKdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";
import { IoRefresh } from "react-icons/io5"; // Causes +500kB in development build

export default function Home() {
  const kdfDefaults = getDefaultKdfConfig();
  const [password, setPassword] = useState("password");
  const [salt, setSalt] = useState("salt");
  const [kdfIterations, setKdfIterations] = useState(kdfDefaults.iterations);
  const [encType, setEncType] = useState(kdfDefaults.encType);
  const [kdfType, setKdfType] = useState(kdfDefaults.kdfType);
  const [textToEncrypt, setTextToEncrypt] = useState("This is a secret.");

  const {
    masterKey,
    masterKeyHash,
    masterKeyStretched,
    aesSymmetricKey,
    aesSymmetricKeyEncrypted,
    textEncrypted,
    textDecrypted,
    regenerateKeys,
    error,
  } = useCryptoDemo(
    password,
    salt,
    kdfIterations,
    kdfType,
    encType,
    textToEncrypt,
  );

  return (
    <section className="max-w-container my-8">
      <div className="flex w-full flex-col">
        <h1 className="text-3xl font-medium tracking-tight">
          Key Derivation Demo
        </h1>
        {error && <p className="mt-2 w-full text-red-500">Error: {error}</p>}
      </div>

      {/* Inputs */}
      <div className="mt-4 grid w-full grid-cols-1 gap-2 md:grid-cols-3 md:gap-x-6">
        <SelectInput label="Key Derivation Function" value={kdfType} onChange={setKdfType} options={kdfOptions} />
        <SelectInput label="Encryption Type" value={encType} onChange={setEncType} options={encOptions} className="md:col-span-2" />
        <div>
          <Label>Password</Label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        <div>
          <Label>Salt</Label>
          <Input value={salt} onChange={(e) => setSalt(e.target.value)} />
        </div>
        <div>
          <Label>Iterations</Label>
          <Input type="number" value={kdfIterations} onChange={(e) => setKdfIterations(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>
      </div>

      {/* Derived Keys */}
      <div className="mt-8 space-y-2">
        <h2 className="text-xl font-medium tracking-tight">Derived Keys</h2>
        <LabeledValue label="Master Key">{masterKey}</LabeledValue>
        <LabeledValue label="Master Key Hash">{masterKeyHash}</LabeledValue>
        <LabeledValue label="Stretched Master Key">{masterKeyStretched?.keyB64}</LabeledValue>
        <LabeledValue label="AES Key">{masterKeyStretched?.encKeyB64}</LabeledValue>
        <LabeledValue label="MAC Key">{masterKeyStretched?.macKeyB64}</LabeledValue>
      </div>

      {/* AES Keys */}
      <div className="mt-8 space-y-2">
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <h2 className="text-xl font-medium tracking-tight">AES Symmetric Key</h2>
          <Button className="max-w-48 cursor-pointer" onClick={regenerateKeys}><IoRefresh /> Regenerate Keys</Button>
        </div>
        <LabeledValue label="Full Key">{aesSymmetricKey?.keyB64}</LabeledValue>
        <LabeledValue label="AES Key">{aesSymmetricKey?.encKeyB64}</LabeledValue>
        <LabeledValue label="MAC Key">{aesSymmetricKey?.macKeyB64}</LabeledValue>
        <LabeledValue label="Encrypted Full Key"> {aesSymmetricKeyEncrypted}</LabeledValue>
      </div>

      {/* Encryption */}
      <div className="mt-8 space-y-2">
        <h2 className="text-xl font-medium tracking-tight">Encryption</h2>
        <div>
          <Label>Text To Encrypt</Label>
          <Textarea className="bg-surface border-border" value={textToEncrypt} onChange={(e) => setTextToEncrypt(e.target.value)} />
        </div>
        <div>
          <Label>Ciphertext</Label>
        <Textarea className="bg-surface border-border" disabled  value={textEncrypted} />
        </div>
        <div>
          <Label>Decrypted</Label>
          <Textarea className="bg-surface border-border" disabled value={textDecrypted} />
        </div>
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
