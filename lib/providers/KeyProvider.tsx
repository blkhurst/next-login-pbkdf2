"use client";
import { createContext, useState, useContext } from "react";
import { SymmetricCryptoKey } from "../Crypto/models/SymmetricCryptoKey";

type KeyContextType = {
  symmetricKey: SymmetricCryptoKey | null;
  setSymmetricKey: React.Dispatch<
    React.SetStateAction<SymmetricCryptoKey | null>
  >;
};

const KeyContext = createContext<KeyContextType | undefined>(undefined);

export const KeyProvider = ({ children }: { children: React.ReactNode }) => {
  const [symmetricKey, setSymmetricKey] = useState<SymmetricCryptoKey | null>(
    null,
  );

  return (
    <KeyContext.Provider value={{ symmetricKey, setSymmetricKey }}>
      {children}
    </KeyContext.Provider>
  );
};

export const useKeyContext = () => {
  const context = useContext(KeyContext);
  if (!context) throw new Error("useKey must be used within KeyProvider");
  return context;
};
