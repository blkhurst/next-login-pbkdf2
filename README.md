# Zero-Knowledge Key Derivation Demo

A secure notes app demonstrating true **zero-knowledge encryption**, inspired by [Bitwarden's Security Whitepaper](https://bitwarden.com/help/bitwarden-security-white-paper). Only you can access your data. All cryptographic operations happen **client-side**. The server **never sees** your password or encryption keys and **cannot decrypt** your notes - even if compromised.

![](/docs/demo.gif)

While this repository includes full authentication, session management, and database integration, the **primary focus** is the cryptographic implementation. The _Key Derivation Demo_ page illustrates how a user’s password and email are used to derive a master key and a master password hash from a single input.

### 🛠 Built With

- **Framework**: Next.js 15 + TypeScript
- **Styling**: TailwindCSS
- **Linting, Formatting, Testing**: ESLint, Prettier, Vitest
- **Database**: PostgreSQL (Containerised using Docker)
- **ORM**: Drizzle
- **Authentication**: AuthJS v5 (NextAuth)

## Key Features (Cryptography Library)

- ✅ **Key Derivation**\
  Supports **PBKDF2-SHA256** and **PBKDF2-SHA512** with configurable iterations.

- ✅ **Key Stretching**\
  Expands derived keys into two **cryptographically independent** keys using **HKDF** ([RFC 5869](https://datatracker.ietf.org/doc/html/rfc5869)), supporting both **SHA256** and **SHA512**.

- ✅ **AES-CBC + HMAC Encryption**\
  Encrypts data using 256-bit **AES-CBC**, with optional **HMAC-SHA256 / HMAC-SHA512** to ensure message integrity.

- ✅ **Cross-Environment CryptoService**\
  A factory-based service using a shared interface to select between Web and Node crypto implementations.

- ✅ **Crypto Model Abstractions**  
  Models like `SymmetricCryptoKey` and `EncString` offer high-level, type-safe abstractions that simplify usage - including auto-parsing and destructuring of encrypted payloads.

## Cryptographic Model Explained

1. **Derived Master Key**\
   When an account is created, a **256-bit key** is derived using **Password-Based Key Derivation Function** (**PBKDF2**) with **600,000 iterations**, using the user's **password** as the payload and the user's **email** as the salt.

2. **Stretched Master Key**\
   The resulting **256-bit master key** is then stretched to **512 bits** using [**HMAC-based Extract-and-Expand Key Derivation Function**](https://datatracker.ietf.org/doc/html/rfc5869) (**HKDF**). 256 bits for **encryption** and **message authentication** respectively.

3. **Generated Symmetric Key**\
   Next, a **512-bit Symmetric Key** and **128-bit Initialisation Vector (IV)** are generated using a **Cryptographically Secure Pseudorandom Number Generator** (**CSPRNG**).

4. **Protected Symmetric Key**\
   The **Generated Symmetric Key** is encrypted with **AES-256** using the **Stretched Master Key** and **IV**. The resulting **Protected Symmetric Key** is then sent to the server for storage.

5. **Master Password Hash**\
   Finally, a **Master Password Hash** is generated using **1 iteration of PBKDF2-SHA256**, with a payload of the **Master Key** and a salt of the **Master Password**. The **Master Password Hash** is sent to the server and **re-hashed** using **PBKDF2-SHA256** with a **random salt** and **600,000 iterations**. The final result is stored on the server and used for **login authentication**.

> **Note**: The iteration count of **600,000** for PBKDF2-HMAC-SHA256 aligns with the [OWASP recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) as of January 2023. ​

## 🔒 Security Practices

- ✅ **Zero Knowledge Encryption / End-To-End Encryption**\
  All encryption is performed client-side. The server **never has access** to your password or encryption keys, and cannot decrypt your data - even if compromised.

- ✅ **Protected Key Storage (Key Wrapping)**  
  Symmetric AES keys are encrypted with the user’s stretched master key before being stored (i.e., wrapped). The raw key **never touches the server**.

- ✅ **In-Memory Key Handling**\
  Sensitive keys are stored in a volatile **React context** (`KeyProvider`). Nothing is written to disk, localStorage, or cookies.

- ✅ **MAC Authentication (HMAC)**  
  Ciphertext is authenticated with a separate MAC key (SHA256 or SHA512), ensuring integrity and preventing tampering.

- ✅ **Unique, Secure IVs & Salt Generation**\
  Each encryption operation uses a **new 128-bit Initialisation Vector (IV)** generated via a **CSPRNG** to ensure high-entropy.

- ✅ **Timing-Safe Comparisons**\
  Constant-time comparisons for sensitive values (hashes, HMACs) to prevent **timing-based side-channel attacks** - such as leaking information through **early-exit byte comparisons**.

- ✅ **No Vault Re-Encryption on Password Change**\
  Password changes do **not** require re-encrypting all user data. Only the **protected symmetric key** (which is encrypted with the master key) is re-encrypted. It's recommended to **periodically rotate this key**.

- ✅ **Server-Side Form Validation**\
  All forms are first validated client-side for instant user feedback, then revalidated server-side using **Zod** to ensure integrity. **Never trusts client input** for critical operations.

- ✅ **Auth.js Session Management**\
  Stateless sessions are managed using **signed JWTs** via Auth.js. No sensitive information is stored in the token. Can be configured to use database-backed sessions if required.

- ✅ **Environment-Based Secret Management**  
  All secrets are loaded via environment variables and **never committed to source**.

### Why Use HKDF After PBKDF2

While PBKDF2 can produce long keys (e.g. 512 bits), it’s **not cryptographically safe** to **split** its output into multiple keys - it’s **not a composable KDF**. In contrast, **HKDF** (_HMAC-based Extract-and-Expand Key Derivation Function_) is purpose-built to **expand** key material into multiple **independent, cryptographically unrelated keys** from a **single input**. This is crucial when we need one key for **encryption** and another for **authentication**.

## 💻 Programming Practices

- ✅ **Single Responsibility & Separation of Concerns**  
  Each module, component, or function handles one job. UI is clearly decoupled from logic and state.

- ✅ **Modular & Reusable Architecture**  
  Hooks, components, and logic are designed to be modular and reusable, making them flexible across different contexts.

- ✅ **DRY (Don’t Repeat Yourself)**  
  Common logic is abstracted and reused across the app, reducing code duplication.

- ✅ **Type Safety**  
  Strong typing via TypeScript throughout the stack - catching issues at compile time, not runtime.

- ✅ **Interfaces, Enums & Abstractions**  
  Uses OOP patterns, enums, and interfaces to improve code structure and readability.

- ✅ **Testable Architecture**  
  Cleanly separated logic makes adding unit tests easy and helps prevent unexpected bugs during development.

- ✅ **App Router, Server Actions & RSC**  
  Prioritise these for server-side rendering (SSR), SEO benefits, and static site generation (SSG) when possible.

- ✅ **Context for Global State**  
  Uses React context to pass global states down the component tree without prop-drilling.

- ✅ **Self-Documenting Code**  
  Consistent naming & casing conventions (`PascalCase`, `camelCase`, `kebab-case`) and clean abstraction make the code easy to read and identify.

> _These practices serve as a personal reference when switching back to frontend development after time spent working in other problem-solving domains._

## 📦 Usage

```shell
# 1. Setup Environment Variables
cp .env.example .env
openssl rand -base64 32   # Generate AUTH_SECRET

# 2. Start PostgreSQL (Docker required)
npm run db:up

# 3. Setup Database
npm run db:generate # Generate SQL Schema
npm run db:migrate  # Apply Schema To Postgres Database
npm run db:seed     # Seed demo data

# 4. Start Development Server
npm run dev
```

**⚠️ When not on `localhost`:**

```bash
# 1. Requires a secure context to use WebCrypto.
next dev --experimental-https

# 2. Set AUTH_URL to fix redirect issues (Auth.js beta bug)
echo "AUTH_URL=https://192.168.1.1:3000" >> .env
```

## Developer

### Technical Notes

- **Client-Side `Buffer` Polyfill**  
  The project uses `Buffer` in client components. Next.js automatically polyfills Node's `Buffer` API on the client using [feross/buffer](https://github.com/feross/buffer), adding ~6.75KB. This greatly aided development allowing me to use `Buffer` for the interface that defines both Web and Node crypto implementations - reducing boilerplate and unnecessary conversions.

- **Docker Bind Mount Permissions**\
  Avoid using bind mounts with restricted permissions (`700 root:root`) in the project directory. Even a single inaccessible folder can silently break file watchers - specifically Tailwind’s - resulting in missing styles and confusing UI issues. Use **named Docker volumes** to ensure reliable development behavior.

- **Auth.js v5 (Beta) Intricacies**\
  Auth.js (formerly NextAuth) is currently in beta and has a few intricacies:\
  **1 -** Sign-in and session retrieval must both be performed client-side or server-side - mixing them can prevent UI components from updating instantly on session changes.\
  **2 -** Server-side `signIn` calls must catch `AuthError` and re-throw other errors.\
  **3 -** `AUTH_URL` must be set to avoid unexpected redirects to `localhost`.\
  **4 -** While Auth.js is compatible with Next.js Middleware and the **Edge Runtime**, using non-edge-compatible libraries - such as `pg` - within `auth` will cause **bundling errors**. See [_Auth.js Edge Compatibility Guide_](https://authjs.dev/guides/edge-compatibility#authjs).

### 🗂 Project Structure

```C
app/
  └─ api/             // REST endpoints
  └─ dashboard/       // Encrypted notes
  └─ decrypt/         // Decryption demo
  └─ demo/            // Key derivation demo
  └─ login/           // Login UI + Server Action
  └─ signup/          // Signup UI + Server Action

components/
  └─ Notes/           // Note UI components
  └─ ui/              // Design system components

hooks/
  └─ useCryptoDemo.ts // Key derivation demo state
  └─ useLogin.ts      // Client-side login logic
  └─ useSignup.ts     // Client-side signup logic
  └─ useNotes.ts      // Manage notes state

lib/
  └─ auth/            // Auth.js config & validation schemas
  └─ cryptography/    // Cryptographic enums, interfaces, models, services
  └─ db/              // Drizzle schema, queries, migrations, seed
  └─ providers/       // Context providers (KeyContext + SessionProvider)
```

### Future Improvements

- [ ] Add **Argon2id** support.

- [ ] Add **Key Rotation** & **KDF Configuration** support for accounts.

- [ ] **Improve UX for Async Actions**\
       Currently, server actions do not trigger pending UI states. Add loading indicators or use `useOptimistic` for a smoother UX and instant feedback.

- [ ] **Refactor** `useNotes` hook to improve reusability - e.g. `NoteViewer` components.

- [ ] **Experiment** with other session management libraries like `jose` or `iron-session`.

### References

- [Bitwarden's Security Whitepaper](https://bitwarden.com/help/bitwarden-security-white-paper)
- [Bitwarden's Source Code](https://github.com/bitwarden/clients/tree/main)
- [RFC 5869 – HKDF](https://datatracker.ietf.org/doc/html/rfc5869)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Drizzle Documentation](https://orm.drizzle.team/docs/overview)
- [Auth.js Documentation](https://authjs.dev/)
- [Auth.js Middleware Edge Runtime Compatibility](https://authjs.dev/guides/edge-compatibility#authjs)
