import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { EncType } from "../enums/EncType";
import { EncString } from "../models/EncString";

describe("EncString", () => {
  const iv = Buffer.alloc(16, 1);
  const data = Buffer.from("message");
  const mac = Buffer.alloc(32, 2);

  it("should throw if constructor missing IV or Data", () => {
    expect(() => new EncString(EncType.AesCbc256_HmacSha256)).toThrow();
  });

  it("should throw if encType is invalid", () => {
    expect(() => new EncString("99.abc|def")).toThrow();
  });

  it("should throw if parts are missing", () => {
    expect(() => new EncString("1.invalid|string")).toThrow();
  });

  it("should serialise and deserialise AesCbc256", () => {
    const enc = new EncString(EncType.AesCbc256, data, iv);
    const deserialized = new EncString(enc.encryptedString);

    expect(deserialized.encryptionType).toBe(EncType.AesCbc256);
    expect(deserialized.iv.toString("base64")).toBe(iv.toString("base64"));
    expect(deserialized.data.toString("base64")).toBe(data.toString("base64"));
    expect(deserialized.mac).toBeUndefined();
  });

  it("should serialise and deserialise AesCbc256_HmacSha256", () => {
    const enc = new EncString(EncType.AesCbc256_HmacSha256, data, iv, mac);
    const deserialized = new EncString(enc.encryptedString);

    expect(deserialized.encryptionType).toBe(EncType.AesCbc256_HmacSha256);
    expect(deserialized.iv.toString("base64")).toBe(iv.toString("base64"));
    expect(deserialized.data.toString("base64")).toBe(data.toString("base64"));
    expect(deserialized.mac?.toString("base64")).toBe(mac.toString("base64"));
  });
});
