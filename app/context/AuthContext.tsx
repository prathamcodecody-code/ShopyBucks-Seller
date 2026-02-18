"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const COOKIE_NAME = "seller_token";
const STORAGE_KEY = "seller_token";

function setCookie(name: string, value: string) {
  // No expiry = session cookie. Add max-age for persistence if needed.
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ─────────────────────────────────────────────
     INITIAL AUTH CHECK (runs ONCE on mount)
  ───────────────────────────────────────────── */
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Make sure cookie is also set (in case it was cleared but localStorage wasn't)
    setCookie(COOKIE_NAME, storedToken);
    setToken(storedToken);

    fetchUser(storedToken).finally(() => setLoading(false));
  }, []);

  /* ─────────────────────────────────────────────
     FETCH USER
  ───────────────────────────────────────────── */
  const fetchUser = async (tkn: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller/me`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      setUser(data);
      return data;
    } catch {
      logout(false);
      return null;
    }
  };

  /* ─────────────────────────────────────────────
     LOGIN — awaits user fetch so caller can read user.role/sellerStatus
  ───────────────────────────────────────────── */
  const loginWithToken = async (token: string) => {
    // 1. Persist everywhere FIRST
    localStorage.setItem(STORAGE_KEY, token);
    setCookie(COOKIE_NAME, token);
    setToken(token);

    // 2. Fetch + set user so redirect logic in the auth page has the data
    await fetchUser(token);
  };

  /* ─────────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────────── */
  const logout = (redirect = true) => {
    clearCookie(COOKIE_NAME);
    localStorage.removeItem(STORAGE_KEY);

    setToken(null);
    setUser(null);
    setLoading(false);

    if (redirect) {
      window.location.href = "/auth/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
