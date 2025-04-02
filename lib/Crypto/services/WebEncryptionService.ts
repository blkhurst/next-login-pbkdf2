"use client";
import { Buffer } from "buffer";
import { IEncryptionService } from "../interfaces/IEncryptionService";

export class WebEncryptionService implements IEncryptionService {
  async aesCbcEncrypt(data: Buffer, iv: Buffer, key: Buffer): Promise<Buffer> {
    this.checkKeyLength(key);

    const impKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["encrypt"],
    );

    const buffer = await window.crypto.subtle.encrypt(
      { name: "AES-CBC", iv: iv },
      impKey,
      data,
    );

    return Buffer.from(buffer);
  }

  async aesCbcDecrypt(data: Buffer, iv: Buffer, key: Buffer): Promise<Buffer> {
    this.checkKeyLength(key);

    const impKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["decrypt"],
    );

    const buffer = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      impKey,
      data,
    );

    return Buffer.from(buffer);
  }

  private checkKeyLength(key: Buffer): void {
    const keyLength = key.byteLength * 8;

    if (keyLength !== 128 && keyLength !== 192 && keyLength !== 256) {
      throw new Error(`Invalid AES key length: ${keyLength}`);
    }
  }
}
