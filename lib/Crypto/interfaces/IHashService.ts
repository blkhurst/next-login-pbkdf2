export interface IHashService {
  randomBytes(length: number): Promise<Buffer>;

  pbkdf2(
    password: Buffer,
    salt: Buffer,
    iterations: number,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer>;

  hmac(
    value: Buffer,
    key: Buffer,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer>;

  hkdfExpand(
    prk: Buffer,
    info: string,
    outputByteSize: number,
    algorithm: "sha256" | "sha512",
  ): Promise<Buffer>;

  // Safely compare two values in a way that protects against timing attacks (Double HMAC Verification).
  // ref: https://paragonie.com/blog/2015/11/preventing-timing-attacks-on-string-comparison-with-double-hmac-strategy
  compare(a: Buffer, b: Buffer): Promise<boolean>;
}
