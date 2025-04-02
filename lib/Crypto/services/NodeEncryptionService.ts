import * as crypto from "crypto";
import { Buffer } from "buffer";
import { IEncryptionService } from "../interfaces/IEncryptionService";

export class NodeEncryptionService implements IEncryptionService {
  async aesCbcEncrypt(data: Buffer, iv: Buffer, key: Buffer): Promise<Buffer> {
    const algorithm = this.getAlgorithmName(key);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encBuf = Buffer.concat([cipher.update(data), cipher.final()]);
    return encBuf;
  }

  async aesCbcDecrypt(data: Buffer, iv: Buffer, key: Buffer): Promise<Buffer> {
    const algorithm = this.getAlgorithmName(key);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decBuf = Buffer.concat([decipher.update(data), decipher.final()]);
    return decBuf;
  }

  private getAlgorithmName(key: Buffer): string {
    const keyLength = key.byteLength * 8;

    if (keyLength === 128) return "aes-128-cbc";
    if (keyLength === 192) return "aes-192-cbc";
    if (keyLength === 256) return "aes-256-cbc";

    throw new Error(`Invalid AES key length: ${keyLength}`);
  }
}
