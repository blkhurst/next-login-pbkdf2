import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { CryptoService } from "../services/CryptoService";
import { SymmetricCryptoKey } from "../models/SymmetricCryptoKey";
import { EncType, KEY_LENGTH_BY_ENC_TYPE } from "../enums/EncType";
import { KdfType } from "../enums/KdfType";

const service = CryptoService.create();
const password = "password";
const salt = "salt";
const iterations = 600_000;
const kdfType = KdfType.PBKDF2_SHA256;
const encType = EncType.AesCbc256_HmacSha256;

/**
 * Incompatible KdfConfig Permutations
 *  PBKDF2_SHA256 + AesCbc256_HmacSha512
 *  PBKDF2_SHA512 + AesCbc256
 */

describe("CryptoService", () => {
  it("should derive consistent stretched master keys", async () => {
    const config = {
      encType,
      kdfType,
      iterations,
    };

    const k1 = await service.deriveStretchedMasterKey(password, salt, config);
    const k2 = await service.deriveStretchedMasterKey(password, salt, config);

    expect(k1.key.equals(k2.key)).toBe(true);
    expect(k1).toBeInstanceOf(SymmetricCryptoKey);
    expect(k1.key).toHaveLength(KEY_LENGTH_BY_ENC_TYPE[encType]);
  });

  it("should create a random key for supported encType", async () => {
    const key = await service.createKey(encType);
    expect(key).toBeInstanceOf(SymmetricCryptoKey);
    expect(key.key.byteLength).toBe(KEY_LENGTH_BY_ENC_TYPE[encType]);
  });

  it("should encrypt and decrypt a string correctly", async () => {
    const key = await service.createKey(encType);
    const encrypted = await service.encrypt("top secret", key);
    const decrypted = await service.decrypt(encrypted, key);
    expect(decrypted.toString()).toBe("top secret");
  });

  it("should encrypt and decrypt a buffer correctly", async () => {
    const key = await service.createKey(encType);
    const encrypted = await service.encryptToBuffer(Buffer.from("secret"), key);
    const decrypted = await service.decrypt(encrypted, key);
    expect(decrypted.toString()).toBe("secret");
  });

  it("should throw if encryption and key encType mismatch", async () => {
    const key1 = await service.createKey(encType);
    const enc = await service.encrypt("fail", key1);
    const key2 = await service.createKey(EncType.AesCbc256);
    await expect(service.decrypt(enc, key2)).rejects.toThrow(
      "[decrypt] Key encType does not match",
    );
  });

  it("should throw on MAC tampering", async () => {
    const key = await service.createKey(encType);
    const encrypted = await service.encrypt("integrity check", key);
    encrypted.mac![0] ^= 0xff; // corrupt MAC
    await expect(service.decrypt(encrypted, key)).rejects.toThrow(
      "MAC validation failed",
    );
  });

  it("should throw on unsupported kdfType and encType", async () => {
    const invalidEncType = 99 as EncType;
    const invalidKdfType = 99 as KdfType;
    const validKey = Buffer.alloc(64);

    await expect(
      service.deriveKey(password, salt, iterations, invalidKdfType),
    ).rejects.toThrow("[deriveKey]");

    await expect(
      service.deriveMasterPasswordHash(
        password,
        salt,
        iterations,
        invalidKdfType,
      ),
    ).rejects.toThrow("[MasterPasswordHash]");

    await expect(service.stretchKey(validKey, invalidEncType)).rejects.toThrow(
      "[stretchKey]",
    );

    await expect(service.createKey(invalidEncType)).rejects.toThrow(
      "[createKey]",
    );
  });
});
