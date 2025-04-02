"use client";
import { useCallback, useEffect, useState } from "react";
import { CryptoService } from "@/lib/Crypto/services/CryptoService";
import { SymmetricCryptoKey } from "@/lib/Crypto/models/SymmetricCryptoKey";
import { EncString } from "@/lib/Crypto/models/EncString";
import { KdfType } from "@/lib/Crypto/enums/KdfType";
import { EncType } from "@/lib/Crypto/enums/EncType";

export const useCryptoDemo = (
  password: string,
  salt: string,
  kdfIterations: number,
  kdfType: KdfType,
  encType: EncType,
  textToEncrypt: string,
) => {
  const [masterKey, setMasterKey] = useState("");
  const [masterKeyHash, setMasterKeyHash] = useState("");
  const [masterKeyStretched, setMasterKeyStretched] =
    useState<SymmetricCryptoKey>();
  const [aesSymmetricKey, setAesSymmetricKey] = useState<SymmetricCryptoKey>();
  const [aesSymmetricKeyEncrypted, setAesSymmetricKeyEncrypted] = useState("");
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

    const derived = await service.deriveKey(
      password,
      salt,
      kdfIterations,
      kdfType,
    );

    const derivedHash = await service.derivedKeyHash(
      password,
      salt,
      kdfIterations,
      kdfType,
    );

    const stretchedKey = await service.deriveKeyUsingConfig(password, salt, {
      encType,
      iterations: kdfIterations,
      kdfType,
    });

    setMasterKey(derived.toString("base64"));
    setMasterKeyHash(derivedHash.toString("base64"));
    setMasterKeyStretched(stretchedKey);
    setIsValid(true);
    console.log("updateKeys");
  }, [password, salt, kdfIterations, encType, kdfType, clearError]);

  const generateSymmetricKey = useCallback(async () => {
    if (!isValid) return;
    clearError();

    const service = CryptoService.create();
    const key = await service.createKey(encType);
    setAesSymmetricKey(key);
    console.log("generateSymmetricKey");
  }, [encType, isValid, clearError]);

  const encryptSymmetricKey = useCallback(async () => {
    if (!aesSymmetricKey || !masterKeyStretched || !isValid) return;
    clearError();

    const service = CryptoService.create();
    const encryptedKey = await service.encrypt(
      aesSymmetricKey.key,
      masterKeyStretched,
    );
    setAesSymmetricKeyEncrypted(encryptedKey.encryptedString);
    console.log("encryptSymmetricKey");
  }, [aesSymmetricKey, masterKeyStretched, isValid, clearError]);

  const encryptText = useCallback(async () => {
    if (!aesSymmetricKey || !isValid) return;
    clearError();

    const service = CryptoService.create();
    const encrypted = await service.encrypt(textToEncrypt, aesSymmetricKey);
    const decrypted = await service.decrypt(
      new EncString(encrypted.encryptedString),
      aesSymmetricKey,
    );

    setTextEncrypted(encrypted.encryptedString);
    setTextDecrypted(decrypted.toString());
    console.log("updateEncryption");
  }, [textToEncrypt, aesSymmetricKey, isValid, clearError]);

  const handleError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred.";
    setMasterKey("");
    setMasterKeyHash("");
    setMasterKeyStretched(undefined);
    setAesSymmetricKey(undefined);
    setAesSymmetricKeyEncrypted("");
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
    masterKeyHash,
    masterKeyStretched,
    aesSymmetricKey,
    aesSymmetricKeyEncrypted,
    textEncrypted,
    textDecrypted,
    regenerateKeys: generateSymmetricKey,
    error,
  };
};
