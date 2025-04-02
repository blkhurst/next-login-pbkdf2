import { EncType } from "../enums/EncType";
import { KdfType } from "../enums/KdfType";

export interface KdfConfig {
  kdfType: KdfType;
  encType: EncType;
  iterations: number;
}

export const getDefaultKdfConfig = (
  overrides: Partial<KdfConfig> = {},
): KdfConfig => ({
  kdfType: KdfType.PBKDF2_SHA256,
  encType: EncType.AesCbc256_HmacSha256,
  iterations: 600_000,
  ...overrides,
});
