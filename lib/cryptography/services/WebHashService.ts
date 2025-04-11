"use client";
import { Buffer } from "buffer";
import { IHashService } from "../interfaces/IHashService";

/**
 * Using Web Crypto SubtleCrypto API
 *
 * - Safari requires HTTPS to use Web Crypto.
 * - Uses Node's Buffer via polyfill; replace with `new Uint8Array(...);` if needed.
 * - Supports HKDF expand using HMAC (RFC 5869).
 */

export class WebHashService implements IHashService {
  async randomBytes(byteLength: number): Promise<Buffer> {
    const arr = Buffer.alloc(byteLength);
    window.crypto.getRandomValues(arr);
    return arr;
  }

  async pbkdf2(
    password: Buffer,
    salt: Buffer,
    iterations: number,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer> {
    const keyLength = algorithm === "sha256" ? 32 : 64;

    const importedKey = await window.crypto.subtle.importKey(
      "raw",
      password,
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );

    const derivedKeyBuffer = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: "SHA-256",
      },
      importedKey,
      keyLength * 8,
    );

    return Buffer.from(derivedKeyBuffer);
  }

  async hmac(
    value: Buffer,
    key: Buffer,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer> {
    const signingAlgorithm = {
      name: "HMAC",
      hash: { name: this.toWebCryptoAlgorithm(algorithm) },
    };

    const impKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      signingAlgorithm,
      false,
      ["sign"],
    );

    const buffer = await window.crypto.subtle.sign(
      signingAlgorithm,
      impKey,
      value,
    );

    return Buffer.from(buffer);
  }

  async hkdfExpand(
    prk: Buffer,
    info: string,
    outputByteSize: number,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer> {
    const hashLen = algorithm === "sha256" ? 32 : 64;

    if (outputByteSize > 255 * hashLen) {
      throw new Error("outputByteSize is too large.");
    }

    if (prk.length < hashLen) {
      throw new Error("prk is too small.");
    }

    const infoBuf = Buffer.from(info);
    let runningOkmLength = 0;
    let previousT: Buffer = Buffer.alloc(0);
    const n = Math.ceil(outputByteSize / hashLen);
    const okm = Buffer.alloc(n * hashLen);

    for (let i = 0; i < n; i++) {
      const t = Buffer.concat([previousT, infoBuf, Buffer.from([i + 1])]);
      previousT = await this.hmac(t, prk, algorithm);
      previousT.copy(okm, runningOkmLength);
      runningOkmLength += previousT.length;
      if (runningOkmLength >= outputByteSize) {
        break;
      }
    }

    return okm.subarray(0, outputByteSize);
  }

  // Safely compare two values in a way that protects against timing attacks (Double HMAC Verification).
  // ref: https://paragonie.com/blog/2015/11/preventing-timing-attacks-on-string-comparison-with-double-hmac-strategy
  async compare(a: Buffer, b: Buffer): Promise<boolean> {
    const macKey = await this.randomBytes(32);
    const signingAlgorithm = {
      name: "HMAC",
      hash: { name: "SHA-256" },
    };

    const impKey = await window.crypto.subtle.importKey(
      "raw",
      macKey,
      signingAlgorithm,
      false,
      ["sign"],
    );
    const mac1 = await window.crypto.subtle.sign(signingAlgorithm, impKey, a);
    const mac2 = await window.crypto.subtle.sign(signingAlgorithm, impKey, b);

    if (mac1.byteLength !== mac2.byteLength) {
      return false;
    }

    let diff = 0;
    const arr1 = Buffer.from(mac1);
    const arr2 = Buffer.from(mac2);
    for (let i = 0; i < arr1.length; i++) {
      diff |= arr1[i] ^ arr2[i];
    }
    return diff === 0;
  }

  private toWebCryptoAlgorithm(algorithm: "sha256" | "sha512"): string {
    if (algorithm === "sha256") return "SHA-256";
    if (algorithm === "sha512") return "SHA-512";

    throw new Error(`Invalid hash algorithm: ${algorithm}`);
  }
}
