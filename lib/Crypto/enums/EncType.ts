export enum EncType {
  AesCbc256 = 0,
  AesCbc128_HmacSha256 = 1,
  AesCbc256_HmacSha256 = 2,
  AesCbc256_HmacSha512 = 7,
}

export const encOptions = [
  { label: "AesCbc256", value: EncType.AesCbc256 },
  { label: "AesCbc128_HmacSha256", value: EncType.AesCbc128_HmacSha256 },
  { label: "AesCbc256_HmacSha256", value: EncType.AesCbc256_HmacSha256 },
  { label: "AesCbc256_HmacSha512", value: EncType.AesCbc256_HmacSha512 },
];

export const KEY_LENGTH_BY_ENC_TYPE = {
  [EncType.AesCbc256]: 32, // 256-bit encryption only
  [EncType.AesCbc128_HmacSha256]: 48, // 128-bit encryption + 256-bit MAC
  [EncType.AesCbc256_HmacSha256]: 64, // 256-bit encryption + 256-bit MAC
  [EncType.AesCbc256_HmacSha512]: 96, // 256-bit encryption + 512-bit MAC
};

export const EXPECTED_NUM_PARTS_BY_ENCRYPTION_TYPE = {
  [EncType.AesCbc256]: 2,
  [EncType.AesCbc128_HmacSha256]: 3,
  [EncType.AesCbc256_HmacSha256]: 3,
  [EncType.AesCbc256_HmacSha512]: 3,
};

// Encrypted Payload Formats:
//  EncString: EncType.IV|Data|MAC
//  EncBuffer: [EncType][IV][MAC][Data]

// export enum EncType {
//   AesCbc256_B64 = 0,
//   AesCbc128_HmacSha256_B64 = 1,
//   AesCbc256_HmacSha256_B64 = 2,
//   Rsa2048_OaepSha256_B64 = 3,
//   Rsa2048_OaepSha1_B64 = 4,
//   Rsa2048_OaepSha256_HmacSha256_B64 = 5,
//   Rsa2048_OaepSha1_HmacSha256_B64 = 6,
// }

// export const EXPECTED_NUM_PARTS_BY_ENCRYPTION_TYPE = {
//   [EncType.AesCbc256_B64]: 2,
//   [EncType.AesCbc128_HmacSha256_B64]: 3,
//   [EncType.AesCbc256_HmacSha256_B64]: 3,
//   [EncType.Rsa2048_OaepSha256_B64]: 1,
//   [EncType.Rsa2048_OaepSha1_B64]: 1,
//   [EncType.Rsa2048_OaepSha256_HmacSha256_B64]: 2,
//   [EncType.Rsa2048_OaepSha1_HmacSha256_B64]: 2,
// };
