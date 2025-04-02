import { Buffer } from "buffer";
import { EncType, KEY_LENGTH_BY_ENC_TYPE } from "../enums/EncType";

export class SymmetricCryptoKey {
  key: Buffer;
  encKey: Buffer;
  macKey?: Buffer;
  encType: EncType;

  keyB64: string;
  encKeyB64: string;
  macKeyB64?: string;

  constructor(key: Buffer, encType: EncType) {
    this.key = key;
    this.encType = encType;

    const expectedLen = KEY_LENGTH_BY_ENC_TYPE[encType];
    if (key.byteLength !== expectedLen)
      throw new Error(`[SymmetricCryptoKey] Expected ${expectedLen}-byte key`);

    switch (encType) {
      case EncType.AesCbc256:
        this.encKey = key;
        this.macKey = undefined;
        break;

      case EncType.AesCbc128_HmacSha256:
        this.encKey = key.subarray(0, 16);
        this.macKey = key.subarray(16, 48);
        break;

      case EncType.AesCbc256_HmacSha256:
        this.encKey = key.subarray(0, 32);
        this.macKey = key.subarray(32, 64);
        break;

      case EncType.AesCbc256_HmacSha512:
        this.encKey = key.subarray(0, 32);
        this.macKey = key.subarray(32, 96);
        break;

      default:
        throw new Error(`[SymmetricCryptoKey] Unsupported encType: ${encType}`);
    }

    this.keyB64 = this.key.toString("base64");
    this.encKeyB64 = this.encKey.toString("base64");
    this.macKeyB64 = this.macKey ? this.macKey.toString("base64") : undefined;
  }

  toJSON() {
    return { keyB64: this.keyB64 };
  }

  static fromB64(b64: string, encType: EncType) {
    const keyBuf = Buffer.from(b64, "base64");
    return new SymmetricCryptoKey(keyBuf, encType);
  }
}
