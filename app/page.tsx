import Link from "next/link";

export default function Home() {
  const links = [
    { href: "/login", label: "Login" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/demo", label: "Key Derivation Demo" },
  ];

  return (
    <main className="max-w-container flex min-h-[100svh] flex-col justify-center gap-4 text-center">
      <section>
        <h2 className="mb-4 text-5xl font-medium tracking-tight">
          Explore Zero Knowledge Encryption
        </h2>
        <p className="text-copy-secondary mx-auto max-w-xl text-lg">
          PBKDF2 key derivation, HKDF key expansion, AES-CBC encryption with
          HMAC validation, JWT session management via NextAuth, with PostgreSQL and
          Drizzle ORM.
        </p>
      </section>

      <section className="mt-4 flex w-full flex-col items-center gap-3">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="border-border bg-surface text-copy-primary hover:bg-border w-full max-w-sm rounded-md border px-6 py-3 transition"
          >
            {label}
          </Link>
        ))}
      </section>
    </main>
  );
}
