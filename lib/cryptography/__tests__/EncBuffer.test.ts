import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { EncType } from "../enums/EncType";
import { EncBuffer } from "../models/EncBuffer";

describe("EncBuffer", () => {
  const iv = Buffer.alloc(16, 1);
  const data = Buffer.from("message");
  const mac32 = Buffer.alloc(32, 2);
  const mac64 = Buffer.alloc(64, 3);

  it("should throw if constructor missing IV or Data", () => {
    expect(() => new EncBuffer(EncType.AesCbc256_HmacSha256)).toThrow();
  });

  it("should throw if buffer is too short", () => {
    const buf = Buffer.alloc(5);
    expect(() => new EncBuffer(buf)).toThrow("Buffer is too short or corrupt");
  });

  it("should throw if encType is invalid", () => {
    const buf = Buffer.from([99, ...iv, ...mac32, ...data]);
    expect(() => new EncBuffer(buf)).toThrow("Unsupported encType");
  });

  it("should serialise and deserialise AesCbc256", () => {
    const enc = new EncBuffer(EncType.AesCbc256, data, iv);
    const b64 = enc.getEncryptedB64();
    const decoded = EncBuffer.fromB64(b64);

    expect(decoded.encryptionType).toBe(EncType.AesCbc256);
    expect(decoded.iv.toString()).toBe(iv.toString());
    expect(decoded.mac).toBeUndefined();
    expect(decoded.data.toString()).toBe(data.toString());
  });

  it("should serialise and deserialise AesCbc256_HmacSha256", () => {
    const enc = new EncBuffer(EncType.AesCbc256_HmacSha256, data, iv, mac32);
    const b64 = enc.getEncryptedB64();
    const decoded = EncBuffer.fromB64(b64);

    expect(decoded.encryptionType).toBe(EncType.AesCbc256_HmacSha256);
    expect(decoded.iv.toString()).toBe(iv.toString());
    expect(decoded.mac?.toString()).toBe(mac32.toString());
    expect(decoded.data.toString()).toBe(data.toString());
  });

  it("should serialise and deserialise AesCbc256_HmacSha512", () => {
    const enc = new EncBuffer(EncType.AesCbc256_HmacSha512, data, iv, mac64);
    const b64 = enc.getEncryptedB64();
    const decoded = EncBuffer.fromB64(b64);

    expect(decoded.encryptionType).toBe(EncType.AesCbc256_HmacSha512);
    expect(decoded.iv.toString()).toBe(iv.toString());
    expect(decoded.mac?.toString()).toBe(mac64.toString());
    expect(decoded.data.toString()).toBe(data.toString());
  });
});
