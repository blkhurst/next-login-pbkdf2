"use client";
import { FormEvent, useState } from "react";
import { AuthFormState, SignupFormSchema } from "@/lib/auth/definitions";
import { CryptoService } from "@/lib/Crypto/services/CryptoService";
import { getDefaultKdfConfig } from "@/lib/Crypto/interfaces/KdfConfig";
import { signupAction } from "../app/signup/actions";
import { useRouter } from "next/navigation";
import { useKeyContext } from "@/lib/KeyProvider";
import { signIn } from "next-auth/react";

class ValidationFieldError extends Error {
  fieldErrors?: Record<string, string[]>;

  constructor(message?: string, fieldErrors?: Record<string, string[]>) {
    super(message ?? "");
    this.name = "ValidationFieldError";
    this.fieldErrors = fieldErrors;
  }
}

export function useSignup() {
  const [state, setState] = useState<AuthFormState>();
  const [pending, setPending] = useState(false);
  const { setSymmetricKey } = useKeyContext();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
      // Validate form and assert passwords match
      const { email, password, confirmPassword } = validateForm(event);
      assertPasswordsMatch(password, confirmPassword);

      // Create account
      const symmetricKey = await createAccount(email, password);

      // Set KeyProviders symmetricKey & Redirect to dashboard
      setSymmetricKey(symmetricKey);
      router.push("/dashboard");
    } catch (e) {
      //
      if (e instanceof ValidationFieldError) {
        setState({ error: e.message, errors: e.fieldErrors });
      } else {
        setState({ error: e instanceof Error ? e.message : "Unknown Error" });
      }
    } finally {
      //
      setPending(false);
    }
  };

  function validateForm(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = SignupFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw new ValidationFieldError("", parsed.error.flatten().fieldErrors);
    }
    return {
      email: parsed.data.email,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
    };
  }

  function assertPasswordsMatch(password: string, confirmPassword?: string) {
    if (password !== confirmPassword)
      throw new Error("Passwords do not match.");
  }

  const createAccount = async (email: string, password: string) => {
    // Get Default KdfConfig
    const kdfConfig = getDefaultKdfConfig();

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

    // Generate SymmetricKey; Encrypt with stretchedMasterKey
    const symmetricKey = await service.createKey(kdfConfig.encType);
    const protectedSymmetricKey = await service.encrypt(
      symmetricKey.key,
      masterKeyStretched,
    );

    // Create Account (Server Action)
    const signupResp = await signupAction(
      {
        email: email,
        password: masterPasswordHash.toString("base64"),
      },
      protectedSymmetricKey.encryptedString,
    );

    if (signupResp?.error || signupResp?.errors) {
      throw new ValidationFieldError(signupResp.error, signupResp.errors);
    }

    // Sign in using AuthJS
    const signinResp = await signIn("credentials", {
      email: email,
      password: masterPasswordHash.toString("base64"),
      redirect: false,
    });

    if (signinResp?.error) {
      throw new Error("An error occurred whilst signing in.");
    }

    return symmetricKey;
  };

  return { state, pending, handleSubmit };
}
