import { EncType } from "../enums/EncType";

export interface IEncrypted {
  encryptionType: EncType;
  iv: Buffer;
  data: Buffer;
  mac?: Buffer;
}
