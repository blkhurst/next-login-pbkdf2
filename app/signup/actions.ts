"use server";
import { AuthFormState, SignupFormSchema } from "@/lib/auth/definitions";
import { CryptoService } from "@/lib/Crypto/services/CryptoService";
import { getDefaultKdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";
import { getUserByEmail } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";

type SignupPayload = {
  email: string;
  password: string; // masterPasswordHash
};

export async function signupAction(
  body: SignupPayload,
  protectedSymmetricKey: string,
): Promise<AuthFormState> {
  // Validate
  const parsed = SignupFormSchema.safeParse(body);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Check if user exists
  const { email, password: masterPasswordHash } = parsed.data;
  const userExists = await getUserByEmail(email);
  if (userExists) {
    return { errors: { email: ["Email already exists."] } };
  }

  // Derive server-side hash
  const service = CryptoService.create();
  const kdfConfig = getDefaultKdfConfig();
  const saltBuf = await service.randomBytes(16);
  const userHash = await service.deriveKey(
    Buffer.from(masterPasswordHash, "base64"),
    saltBuf,
    kdfConfig.iterations,
    kdfConfig.kdfType,
  );

  // Insert user into Database
  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        hash: userHash.toString("base64"),
        salt: saltBuf.toString("base64"),
        protectedSymmetricKey: protectedSymmetricKey,
        kdfType: kdfConfig.kdfType,
        encType: kdfConfig.encType,
        iterations: kdfConfig.iterations,
      },
    ])
    .returning();

  if (!user) {
    return { error: "An error occurred while creating your account." };
  }

  return {};
}
