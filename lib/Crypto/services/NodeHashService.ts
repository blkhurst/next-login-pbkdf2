import * as crypto from "crypto";
import { Buffer } from "buffer";
import { IHashService } from "../interfaces/IHashService";

export class NodeHashService implements IHashService {
  async randomBytes(byteLength: number): Promise<Buffer> {
    return crypto.randomBytes(byteLength);
  }

  async pbkdf2(
    password: Buffer,
    salt: Buffer,
    iterations: number,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer> {
    const keyLength = algorithm === "sha256" ? 32 : 64;
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, algorithm);
  }

  async hmac(
    value: Buffer,
    key: Buffer,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer> {
    const hmac = crypto.createHmac(algorithm, key);
    hmac.update(value);
    return hmac.digest();
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

  // Avoids timing attacks by taking constant time.
  async compare(a: Buffer, b: Buffer): Promise<boolean> {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}
