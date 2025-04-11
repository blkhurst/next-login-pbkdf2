"use client";
import { FormEvent, useRef, useState } from "react";
import { AuthFormState, LoginFormSchema } from "@/lib/auth/definitions";
import { CryptoService } from "@/lib/cryptography/services/CryptoService";
import { SymmetricCryptoKey } from "@/lib/cryptography/models/SymmetricCryptoKey";
import { EncString } from "@/lib/cryptography/models/EncString";
import { preloginAction } from "@/app/login/actions";
import { useRouter } from "next/navigation";
import { useKeyContext } from "@/lib/providers/KeyProvider";
import { getSession, signIn } from "next-auth/react";

export function useLogin() {
  const [state, setState] = useState<AuthFormState>();
  const [pending, setPending] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { setSymmetricKey } = useKeyContext();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
      // Validate form and Authenticate user
      const { email, password } = validateForm(event);
      const symmetricKey = await authenticate(email, password);

      // Set KeyProviders symmetricKey & Redirect to dashboard
      setSymmetricKey(symmetricKey);
      router.push("/dashboard");
    } catch (e) {
      //
      setState({ error: e instanceof Error ? e.message : "Unknown Error" });
    } finally {
      //
      setPending(false);
      if (passwordRef.current) passwordRef.current.value = "";
    }
  };

  function validateForm(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = LoginFormSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) throw new Error(parsed.error.errors[0].message);

    return { email: parsed.data.email, password: parsed.data.password };
  }

  const authenticate = async (email: string, password: string) => {
    // Fetch User's KdfConfig (Server Action)
    const kdfConfig = await preloginAction(email);

    // Derive Keys
    const service = CryptoService.create();
    const masterKeyStretched = await service.deriveKeyUsingConfig(
      password,
      email,
      kdfConfig,
    );
    const masterPasswordHash = await service.derivedKeyHash(
      password,
      email,
      kdfConfig.iterations,
      kdfConfig.kdfType,
    );

    // Sign in using AuthJS
    const resp = await signIn("credentials", {
      email: email,
      password: masterPasswordHash.toString("base64"),
      redirect: false,
    });

    if (resp?.error) {
      throw new Error("Invalid credentials.");
    }

    // Retrieve & Decrypt protectedSymmetricKey from session
    const session = await getSession();
    const protectedSymmetricKey = session?.user?.protectedSymmetricKey;
    if (!session || !protectedSymmetricKey) {
      throw new Error("Failed to retrieve protectedSymmetricKey from session.");
    }

    const symmetricKey = await service.decrypt(
      new EncString(protectedSymmetricKey),
      masterKeyStretched,
    );

    return new SymmetricCryptoKey(symmetricKey, kdfConfig.encType);
  };

  return { state, pending, passwordRef, handleSubmit };
}
