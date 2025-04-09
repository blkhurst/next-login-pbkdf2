import NextAuth, { AuthError, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CryptoService } from "@/lib/Crypto/services/CryptoService";
import { LoginFormSchema } from "@/lib/auth/definitions";
import { getUserByEmail } from "@/lib/db/queries";
import { timingSafeEqual } from "crypto";

export class CustomAuthError extends AuthError {
  constructor(msg: string) {
    super();
    // this.code = msg;
    this.message = msg;
    this.stack = undefined;
  }
}

declare module "next-auth" {
  interface User {
    role: string;
    protectedSymmetricKey: string;
  }

  interface Session {
    user: {
      role: string;
      protectedSymmetricKey: string;
    } & DefaultSession["user"];
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt";
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    protectedSymmetricKey: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        masterPasswordHash: {},
      },
      authorize: async (credentials) => {
        const parsed = LoginFormSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new CustomAuthError(parsed.error.errors[0].message);
        }

        const { email, password: masterPasswordHash } = parsed.data;
        const user = await getUserByEmail(email);
        if (!user) {
          throw new CustomAuthError("User Not Found.");
        }

        const service = CryptoService.create();
        const userHash = await service.deriveKey(
          Buffer.from(masterPasswordHash, "base64"),
          Buffer.from(user.salt, "base64"),
          user.iterations,
          user.kdfType,
        );

        const storedHash = Buffer.from(user.hash, "base64");
        const passwordMatch = timingSafeEqual(userHash, storedHash);
        if (!passwordMatch) {
          throw new CustomAuthError("Incorrect Password.");
        }

        return {
          id: user.id,
          role: user.role,
          email: user.email,
          protectedSymmetricKey: user.protectedSymmetricKey,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = user.role;
        token.protectedSymmetricKey = user.protectedSymmetricKey;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.protectedSymmetricKey = token.protectedSymmetricKey;
      return session;
    },
  },
});
