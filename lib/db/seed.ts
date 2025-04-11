import { db } from "./drizzle";
import { users } from "./schema";
import { createNote, getNotesForUser, getUserByEmail } from "./queries";
import { CryptoService } from "@/lib/cryptography/services/CryptoService";
import { SymmetricCryptoKey } from "@/lib/cryptography/models/SymmetricCryptoKey";
import { getDefaultKdfConfig } from "@/lib/cryptography/interfaces/KdfConfig";

const service = CryptoService.create();
const kdfConfig = getDefaultKdfConfig();

async function addAccount(email: string, password: string) {
  const salt = await service.randomBytes(16);
  const masterKeyStretched = await service.deriveStretchedMasterKey(
    password,
    email,
    kdfConfig,
  );
  const masterPasswordHash = await service.deriveMasterPasswordHash(
    password,
    email,
    kdfConfig.iterations,
    kdfConfig.kdfType,
  );
  const masterPasswordServerHash = await service.deriveKey(
    masterPasswordHash,
    salt,
    kdfConfig.iterations,
    kdfConfig.kdfType,
  );

  const symmetricKey = await service.createKey(kdfConfig.encType);
  const protectedSymmetricKey = await service.encrypt(
    symmetricKey.key,
    masterKeyStretched,
  );

  let user = await getUserByEmail(email);
  if (user) {
    console.log("User already exists. Skipping user seed.");
    return { userId: user.id, symmetricKey };
  }

  [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        hash: masterPasswordServerHash.toString("base64"),
        salt: salt.toString("base64"),
        role: "admin",
        protectedSymmetricKey: protectedSymmetricKey.encryptedString,
        kdfType: kdfConfig.kdfType,
        encType: kdfConfig.encType,
        iterations: kdfConfig.iterations,
      },
    ])
    .returning();

  console.log("User created.");
  return { userId: user.id, symmetricKey };
}

async function addNotes(userId: string, symmetricKey: SymmetricCryptoKey) {
  const notes = [
    "Secure Notes",
    "Using End-To-End Encryption",
    "No one else can read these - not even the server!",
  ];

  const existingNotes = await getNotesForUser(userId);
  if (existingNotes.length > 0) {
    console.log("Notes already exists. Skipping note seed.");
    return;
  }

  for (const plainText of notes) {
    const encryptedNote = await service.encrypt(plainText, symmetricKey);
    await createNote(userId, encryptedNote.encryptedString);
  }

  console.log("Notes created.");
}

async function seed() {
  const { userId, symmetricKey } = await addAccount(
    "test@test.com",
    "password",
  );
  await addNotes(userId, symmetricKey);
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
