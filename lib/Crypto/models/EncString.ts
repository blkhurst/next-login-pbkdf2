import { Buffer } from "buffer";
import { IEncrypted } from "../interfaces/IEncrypted";
import {
  EncType,
  EXPECTED_NUM_PARTS_BY_ENCRYPTION_TYPE,
} from "../enums/EncType";

export class EncString implements IEncrypted {
  encryptedString!: string;
  encryptionType!: EncType;
  iv!: Buffer;
  data!: Buffer;
  mac?: Buffer;

  constructor(
    input: string | EncType,
    data?: Buffer,
    iv?: Buffer,
    mac?: Buffer,
  ) {
    // Initialise from string
    if (typeof input === "string") {
      this.initFromEncryptedString(input);
      return;
    }

    // Initialise from data
    if (!data || !iv) throw new Error("[EncString] Missing data or IV");
    this.encryptionType = input;
    this.iv = iv;
    this.data = data;
    this.mac = mac;

    this.encryptedString = `${input}.${iv.toString("base64")}|${data.toString("base64")}`;
    if (mac != null) {
      this.encryptedString = `${this.encryptedString}|${mac.toString("base64")}`;
    }
  }

  private initFromEncryptedString(encryptedString: string) {
    const [typePart, dataPart] = encryptedString.split(".");
    const encType = parseInt(typePart) as EncType;
    const encParts = dataPart?.split("|");

    if (!Object.values(EncType).includes(encType)) {
      throw new Error(`[EncString] Unknown encType: ${encType}`);
    }

    const expectedParts = EXPECTED_NUM_PARTS_BY_ENCRYPTION_TYPE[encType];
    if (!encParts || encParts.length !== expectedParts) {
      throw new Error("[EncString] Unexpected number of parts for encType");
    }

    this.encryptedString = encryptedString;
    this.encryptionType = encType;
    this.iv = Buffer.from(encParts[0], "base64");
    this.data = Buffer.from(encParts[1], "base64");

    switch (encType) {
      case EncType.AesCbc256:
        break;

      case EncType.AesCbc128_HmacSha256:
      case EncType.AesCbc256_HmacSha256:
      case EncType.AesCbc256_HmacSha512:
        this.mac = Buffer.from(encParts[2], "base64");
        break;

      default:
        throw new Error(`[EncBuffer] Unsupported encType: ${encType}`);
    }
  }
}
