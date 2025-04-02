import { Buffer } from "buffer";
import { EncType } from "../enums/EncType";
import { IEncrypted } from "../interfaces/IEncrypted";

const ENC_TYPE_LENGTH = 1;
const IV_LENGTH = 16;
const MIN_DATA_LENGTH = 1;

export class EncBuffer implements IEncrypted {
  encryptedBuffer!: Buffer;
  encryptionType!: EncType;
  iv!: Buffer;
  data!: Buffer;
  mac?: Buffer;

  constructor(
    input: Buffer | EncType,
    data?: Buffer,
    iv?: Buffer,
    mac?: Buffer,
  ) {
    // Initialise from buffer
    if (Buffer.isBuffer(input) && data == null) {
      this.initFromEncryptedBuffer(input);
      return;
    }

    // Initialise from data
    if (!data || !iv) throw new Error("[EncBuffer] Missing data or IV");
    this.encryptionType = input as EncType;
    this.iv = iv;
    this.data = data;
    this.mac = mac;

    const parts: Buffer[] = [Buffer.from([this.encryptionType]), iv];
    if (this.mac) parts.push(this.mac);
    parts.push(data);
    this.encryptedBuffer = Buffer.concat(parts);
  }

  private initFromEncryptedBuffer(buffer: Buffer) {
    const encType = buffer[0];
    this.encryptionType = encType;
    this.encryptedBuffer = buffer;

    const offsetIV = ENC_TYPE_LENGTH;
    const offsetMAC = offsetIV + IV_LENGTH;
    const macLength = this.getMacLength(encType);
    const offsetData = offsetMAC + macLength;

    const minimumLength = offsetData + MIN_DATA_LENGTH;
    if (buffer.byteLength < minimumLength) {
      throw new Error("[EncBuffer] Buffer is too short or corrupt");
    }

    switch (encType) {
      case EncType.AesCbc256:
        this.iv = buffer.subarray(offsetIV, offsetMAC);
        this.data = buffer.subarray(offsetMAC);
        break;

      case EncType.AesCbc128_HmacSha256:
      case EncType.AesCbc256_HmacSha256:
      case EncType.AesCbc256_HmacSha512:
        this.iv = buffer.subarray(offsetIV, offsetMAC);
        this.mac = buffer.subarray(offsetMAC, offsetData);
        this.data = buffer.subarray(offsetData);
        break;

      default:
        throw new Error(`[EncBuffer] Unsupported encType: ${encType}`);
    }
  }

  static fromB64(b64: string) {
    return new EncBuffer(Buffer.from(b64, "base64"));
  }

  getEncryptedB64(): string {
    return this.encryptedBuffer.toString("base64");
  }

  private getMacLength(encType: EncType): number {
    switch (encType) {
      case EncType.AesCbc256:
        return 0;

      case EncType.AesCbc128_HmacSha256:
      case EncType.AesCbc256_HmacSha256:
        return 32;

      case EncType.AesCbc256_HmacSha512:
        return 64;

      default:
        throw new Error(`[EncBuffer] Unsupported encType: ${encType}`);
    }
  }
}
