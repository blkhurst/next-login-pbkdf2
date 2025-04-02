export enum KdfType {
  PBKDF2_SHA256 = 0,
  PBKDF2_SHA512 = 2,
  Argon2id = 1,
}

export const kdfOptions = [
  { label: "PBKDF2_SHA256", value: KdfType.PBKDF2_SHA256 },
  { label: "PBKDF2_SHA512", value: KdfType.PBKDF2_SHA512 },
  // { label: "Argon2id", value: KdfType.Argon2id },
];
