"use server";
import { getUserByEmail } from "@/lib/db/queries";
import { KdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";
import { getDefaultKdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";

export async function preloginAction(email: string): Promise<KdfConfig> {
  const user = await getUserByEmail(email);
  if (!user) return getDefaultKdfConfig();
  return {
    kdfType: user.kdfType,
    encType: user.encType,
    iterations: user.iterations,
  };
}
