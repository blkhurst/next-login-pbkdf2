"use client";
import { useCallback, useEffect, useState } from "react";
import { CryptoService } from "@/lib/cryptography/services/CryptoService";
import { SymmetricCryptoKey } from "@/lib/cryptography/models/SymmetricCryptoKey";
import { EncString } from "@/lib/cryptography/models/EncString";
import { KdfType } from "@/lib/cryptography/enums/KdfType";
import { EncType } from "@/lib/cryptography/enums/EncType";

export const useCryptoDemo = (
  password: string,
  salt: string,
  kdfIterations: number,
  kdfType: KdfType,
  encType: EncType,
  textToEncrypt: string,
) => {
  const [masterKey, setMasterKey] = useState("");
  const [masterPasswordHash, setMasterPasswordHash] = useState("");
  const [masterKeyStretched, setMasterKeyStretched] =
    useState<SymmetricCryptoKey>();
  const [symmetricKey, setSymmetricKey] = useState<SymmetricCryptoKey>();
  const [protectedSymmetricKey, setProtectedSymmetricKey] = useState("");
  const [textEncrypted, setTextEncrypted] = useState("");
  const [textDecrypted, setTextDecrypted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  const clearError = useCallback(() => {
    if (isValid) setError(null);
  }, [isValid]);

  const updateKeys = useCallback(async () => {
    clearError();
    const service = CryptoService.create();

    const masterKey = await service.deriveKey(
      password,
      salt,
      kdfIterations,
      kdfType,
    );

    const masterPasswordHash = await service.derivedKeyHash(
      password,
      salt,
      kdfIterations,
      kdfType,
    );

    const masterKeyStretched = await service.deriveKeyUsingConfig(password, salt, {
      encType,
      iterations: kdfIterations,
      kdfType,
    });

    setMasterKey(masterKey.toString("base64"));
    setMasterPasswordHash(masterPasswordHash.toString("base64"));
    setMasterKeyStretched(masterKeyStretched);
    setIsValid(true);
    console.log("updateKeys");
  }, [password, salt, kdfIterations, encType, kdfType, clearError]);

  const generateSymmetricKey = useCallback(async () => {
    if (!isValid) return;
    clearError();

    const service = CryptoService.create();
    const key = await service.createKey(encType);
    setSymmetricKey(key);
    console.log("generateSymmetricKey");
  }, [encType, isValid, clearError]);

  const encryptSymmetricKey = useCallback(async () => {
    if (!symmetricKey || !masterKeyStretched || !isValid) return;
    clearError();

    const service = CryptoService.create();
    const encryptedKey = await service.encrypt(
      symmetricKey.key,
      masterKeyStretched,
    );
    setProtectedSymmetricKey(encryptedKey.encryptedString);
    console.log("encryptSymmetricKey");
  }, [symmetricKey, masterKeyStretched, isValid, clearError]);

  const encryptText = useCallback(async () => {
    if (!symmetricKey || !isValid) return;
    clearError();

    const service = CryptoService.create();
    const encrypted = await service.encrypt(textToEncrypt, symmetricKey);
    const decrypted = await service.decrypt(
      new EncString(encrypted.encryptedString),
      symmetricKey,
    );

    setTextEncrypted(encrypted.encryptedString);
    setTextDecrypted(decrypted.toString());
    console.log("updateEncryption");
  }, [textToEncrypt, symmetricKey, isValid, clearError]);

  const handleError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred.";
    setMasterKey("");
    setMasterPasswordHash("");
    setMasterKeyStretched(undefined);
    setSymmetricKey(undefined);
    setProtectedSymmetricKey("");
    setTextEncrypted("");
    setTextDecrypted("");
    setIsValid(false);
    setError(message);
  };

  useEffect(() => {
    updateKeys().catch(handleError);
  }, [updateKeys]);

  useEffect(() => {
    generateSymmetricKey().catch(handleError);
  }, [generateSymmetricKey]);

  useEffect(() => {
    encryptSymmetricKey().catch(handleError);
  }, [encryptSymmetricKey]);

  useEffect(() => {
    encryptText().catch(handleError);
  }, [encryptText]);

  return {
    masterKey,
    masterPasswordHash,
    masterKeyStretched,
    symmetricKey,
    protectedSymmetricKey,
    textEncrypted,
    textDecrypted,
    regenerateKeys: generateSymmetricKey,
    error,
  };
};
