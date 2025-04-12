import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { SymmetricCryptoKey } from "../models/SymmetricCryptoKey";
import { EncType } from "../enums/EncType";

describe("SymmetricCryptoKey", () => {
  it("should throw if key length does not match encType", () => {
    const shortKey = Buffer.alloc(10);
    expect(() => new SymmetricCryptoKey(shortKey, EncType.AesCbc256)).toThrow(
      "[SymmetricCryptoKey] Expected",
    );
  });

  it("should throw if encType is unsupported", () => {
    const validKey = Buffer.alloc(32);
    expect(() => new SymmetricCryptoKey(validKey, 99 as EncType)).toThrow();
  });

  it("should handle AesCbc256 correctly", () => {
    const key = Buffer.alloc(32);
    const k = new SymmetricCryptoKey(key, EncType.AesCbc256);

    expect(k.encKey).toBe(key);
    expect(k.macKey).toBeUndefined();
  });

  it("should handle AesCbc128_HmacSha256 correctly", () => {
    const key = Buffer.alloc(48);
    const k = new SymmetricCryptoKey(key, EncType.AesCbc128_HmacSha256);

    expect(k.encKey.equals(key.subarray(0, 16))).toBe(true);
    expect(k.macKey?.equals(key.subarray(16, 48))).toBe(true);
  });

  it("should handle AesCbc256_HmacSha256 correctly", () => {
    const key = Buffer.alloc(64);
    const k = new SymmetricCryptoKey(key, EncType.AesCbc256_HmacSha256);

    expect(k.encKey.equals(key.subarray(0, 32))).toBe(true);
    expect(k.macKey?.equals(key.subarray(32, 64))).toBe(true);
  });

  it("should handle AesCbc256_HmacSha512 correctly", () => {
    const key = Buffer.alloc(96);
    const k = new SymmetricCryptoKey(key, EncType.AesCbc256_HmacSha512);

    expect(k.encKey.equals(key.subarray(0, 32))).toBe(true);
    expect(k.macKey?.equals(key.subarray(32, 96))).toBe(true);
  });

  it("should initialise key from base64", () => {
    const originalKey = Buffer.alloc(32);
    const original = new SymmetricCryptoKey(originalKey, EncType.AesCbc256);
    const recreated = SymmetricCryptoKey.fromB64(
      original.keyB64,
      EncType.AesCbc256,
    );

    expect(recreated.key.equals(original.key)).toBe(true);
    expect(recreated.encType).toBe(original.encType);
  });
});
