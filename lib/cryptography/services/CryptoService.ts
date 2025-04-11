import { Buffer } from "buffer";
import { IEncryptionService } from "../interfaces/IEncryptionService";
import { IHashService } from "../interfaces/IHashService";
import { IEncrypted } from "../interfaces/IEncrypted";
import { NodeEncryptionService } from "./NodeEncryptionService";
import { NodeHashService } from "./NodeHashService";
import { WebEncryptionService } from "./WebEncryptionService";
import { WebHashService } from "./WebHashService";
import { EncBuffer } from "../models/EncBuffer";
import { EncString } from "../models/EncString";
import { SymmetricCryptoKey } from "../models/SymmetricCryptoKey";
import { EncType, KEY_LENGTH_BY_ENC_TYPE } from "../enums/EncType";
import { KdfConfig } from "../interfaces/KdfConfig";
import { KdfType } from "../enums/KdfType";

export class CryptoService {
  constructor(
    private encryptionService: IEncryptionService,
    private hashService: IHashService,
  ) {}

  static create(): CryptoService {
    const isBrowser =
      typeof window !== "undefined" && typeof window.crypto !== "undefined";

    const encryptionService = isBrowser
      ? new WebEncryptionService()
      : new NodeEncryptionService();

    const hashService = isBrowser
      ? new WebHashService()
      : new NodeHashService();

    return new CryptoService(encryptionService, hashService);
  }

  async deriveStretchedMasterKey(
    password: string,
    salt: string,
    { encType, iterations, kdfType }: KdfConfig,
  ) {
    let derivedKey = await this.deriveKey(password, salt, iterations, kdfType);
    derivedKey = await this.stretchKey(derivedKey, encType);
    return new SymmetricCryptoKey(derivedKey, encType);
  }

  async deriveKey(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    kdfType: KdfType,
  ): Promise<Buffer> {
    const passwordBuf =
      typeof password === "string" ? Buffer.from(password) : password;
    const saltBuf = typeof salt === "string" ? Buffer.from(salt) : salt;

    switch (kdfType) {
      case KdfType.PBKDF2_SHA256:
        return this.hashService.pbkdf2(
          passwordBuf,
          saltBuf,
          iterations,
          "sha256",
        );

      case KdfType.PBKDF2_SHA512:
        return this.hashService.pbkdf2(
          passwordBuf,
          saltBuf,
          iterations,
          "sha512",
        );

      default:
        throw new Error(`[deriveKey] Unsupported kdfType: ${kdfType}`);
    }
  }

  async deriveMasterPasswordHash(
    password: string,
    salt: string,
    iterations: number,
    kdfType: KdfType,
  ): Promise<Buffer> {
    let key: Buffer;
    switch (kdfType) {
      case KdfType.PBKDF2_SHA256:
        key = await this.deriveKey(password, salt, iterations, kdfType);
        return this.hashService.pbkdf2(key, Buffer.from(password), 1, "sha256");

      case KdfType.PBKDF2_SHA512:
        key = await this.deriveKey(password, salt, iterations, kdfType);
        return this.hashService.pbkdf2(key, Buffer.from(password), 1, "sha512");

      default:
        throw new Error(`[MasterPasswordHash] Unsupported kdfType: ${kdfType}`);
    }
  }

  async stretchKey(key: Buffer, encType: EncType): Promise<Buffer> {
    switch (encType) {
      case EncType.AesCbc256:
        if (key.byteLength !== 32) {
          throw new Error(
            "[stretchKey] AesCbc256 requires a 32-byte key. Truncating larger keys offers no benefit and is disallowed.",
          );
        }
        return key;

      case EncType.AesCbc128_HmacSha256:
        this.assertMinKeyLength(key, 32, "AesCbc128_HmacSha256");
        return Buffer.concat([
          await this.hashService.hkdfExpand(key, "enc", 16, "sha256"),
          await this.hashService.hkdfExpand(key, "mac", 32, "sha256"),
        ]);

      case EncType.AesCbc256_HmacSha256:
        this.assertMinKeyLength(key, 32, "AesCbc256_HmacSha256");
        return Buffer.concat([
          await this.hashService.hkdfExpand(key, "enc", 32, "sha256"),
          await this.hashService.hkdfExpand(key, "mac", 32, "sha256"),
        ]);

      case EncType.AesCbc256_HmacSha512:
        this.assertMinKeyLength(key, 64, "AesCbc256_HmacSha512");
        return Buffer.concat([
          await this.hashService.hkdfExpand(key, "enc", 32, "sha512"),
          await this.hashService.hkdfExpand(key, "mac", 64, "sha512"),
        ]);

      default:
        throw new Error(`[stretchKey] Unsupported encType: ${encType}`);
    }
  }

  async createKey(encType: EncType): Promise<SymmetricCryptoKey> {
    const byteLength = KEY_LENGTH_BY_ENC_TYPE[encType];
    if (!byteLength)
      throw new Error(`[createKey] Unsupported encType: ${encType}`);

    const key = await this.hashService.randomBytes(byteLength);
    return new SymmetricCryptoKey(key, encType);
  }

  async randomBytes(length: number): Promise<Buffer> {
    return this.hashService.randomBytes(length);
  }

  async encrypt(
    data: string | Buffer,
    key: SymmetricCryptoKey,
  ): Promise<EncString> {
    const { iv, encData, mac } = await this.encryptSymmetric(data, key);
    return new EncString(key.encType, encData, iv, mac);
  }

  async encryptToBuffer(
    data: string | Buffer,
    key: SymmetricCryptoKey,
  ): Promise<EncBuffer> {
    const { iv, encData, mac } = await this.encryptSymmetric(data, key);
    return new EncBuffer(key.encType, encData, iv, mac);
  }

  async decrypt(enc: IEncrypted, key: SymmetricCryptoKey): Promise<Buffer> {
    if (enc.encryptionType !== key.encType) {
      throw new Error("[decrypt] Key encType does not match Data encType");
    }

    switch (key.encType) {
      case EncType.AesCbc256:
        // No MAC to validate
        break;

      case EncType.AesCbc128_HmacSha256:
      case EncType.AesCbc256_HmacSha256:
        if (!key.macKey || !enc.mac) {
          throw new Error("[decrypt] MAC or MAC key is missing");
        }
        await this.validateMac(enc.iv, enc.data, enc.mac, key.macKey, "sha256");
        break;

      case EncType.AesCbc256_HmacSha512:
        if (!key.macKey || !enc.mac) {
          throw new Error("[decrypt] MAC or MAC key is missing");
        }
        await this.validateMac(enc.iv, enc.data, enc.mac, key.macKey, "sha512");
        break;

      default:
        throw new Error(`[decrypt] Unsupported encType: ${key.encType}`);
    }

    try {
      return await this.encryptionService.aesCbcDecrypt(
        enc.data,
        enc.iv,
        key.encKey,
      );
    } catch {
      throw new Error("Decryption failed.");
    }
  }

  private async encryptSymmetric(
    data: string | Buffer,
    key: SymmetricCryptoKey,
  ): Promise<{ iv: Buffer; encData: Buffer; mac?: Buffer }> {
    const iv = await this.hashService.randomBytes(16);
    const dataBuf = typeof data === "string" ? Buffer.from(data) : data;

    const encData = await this.encryptionService.aesCbcEncrypt(
      dataBuf,
      iv,
      key.encKey,
    );

    let mac: Buffer | undefined;

    switch (key.encType) {
      case EncType.AesCbc256:
        mac = undefined;
        break;

      case EncType.AesCbc128_HmacSha256:
      case EncType.AesCbc256_HmacSha256:
        if (!key.macKey) throw new Error("[encrypt] MAC key is missing");
        mac = await this.generateMac(iv, encData, key.macKey, "sha256");
        break;

      case EncType.AesCbc256_HmacSha512:
        if (!key.macKey) throw new Error("[encrypt] MAC key is missing");
        mac = await this.generateMac(iv, encData, key.macKey, "sha512");
        break;

      default:
        throw new Error(`[encrypt] Unsupported encType: ${key.encType}`);
    }

    return { iv, encData, mac };
  }

  private async generateMac(
    iv: Buffer,
    encData: Buffer,
    macKey: Buffer,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer> {
    const macData = Buffer.alloc(iv.byteLength + encData.byteLength);
    macData.set(iv, 0);
    macData.set(encData, iv.byteLength);
    const hmac = await this.hashService.hmac(macData, macKey, algorithm);
    return hmac;
  }

  private async validateMac(
    iv: Buffer,
    data: Buffer,
    receivedMac: Buffer,
    macKey: Buffer,
    algorithm: "sha256" | "sha512",
  ): Promise<void> {
    const computedMac = await this.generateMac(iv, data, macKey, algorithm);
    const isValid = await this.hashService.compare(computedMac, receivedMac);
    if (!isValid) {
      throw new Error("[decrypt] MAC validation failed");
    }
  }

  private assertMinKeyLength(key: Buffer, minBytes: number, context: string) {
    if (key.byteLength < minBytes) {
      throw new Error(
        `[CryptoService] ${context} requires a minimum key length of ${minBytes} bytes.`,
      );
    }
  }
}
