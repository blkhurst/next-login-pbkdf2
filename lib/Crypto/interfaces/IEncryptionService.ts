export interface IEncryptionService {
  aesCbcEncrypt(data: Buffer, iv: Buffer, key: Buffer): Promise<Buffer>;
  aesCbcDecrypt(data: Buffer, iv: Buffer, key: Buffer): Promise<Buffer>;
}
