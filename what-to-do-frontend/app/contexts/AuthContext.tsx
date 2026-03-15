"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const AUTH_STORAGE_KEY = "whattodo_auth";

export type User = {
  id: string;
  username?: string;
  email?: string;
};

type StoredAuth = {
  user: User;
  token?: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  setAuth: (payload: { user: User; token?: string }) => void;
  logout: () => void;
};

function readStored(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function writeStored(payload: StoredAuth) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function clearStored() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStored();
    if (stored?.user) {
      setUser(stored.user);
    }
    setIsLoading(false);
  }, []);

  const setAuth = useCallback((payload: { user: User; token?: string }) => {
    writeStored({ user: payload.user, token: payload.token });
    setUser(payload.user);
  }, []);

  const logout = useCallback(() => {
    clearStored();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    isLoggedIn: !!user,
    isLoading,
    user,
    setAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
