import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface A11yContextType {
  isHighContrast: boolean;
  toggleContrast: () => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

const STORAGE_KEY = "sud-a11y-contrast";

export const A11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.dataset.a11y = isHighContrast ? "true" : "false";
    try {
      localStorage.setItem(STORAGE_KEY, isHighContrast ? "1" : "0");
    } catch {
      // ignore
    }
  }, [isHighContrast]);

  const toggleContrast = useCallback(() => setIsHighContrast((prev) => !prev), []);

  return <A11yContext.Provider value={{ isHighContrast, toggleContrast }}>{children}</A11yContext.Provider>;
};

export const useA11y = (): A11yContextType => {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used within A11yProvider");
  return ctx;
};
