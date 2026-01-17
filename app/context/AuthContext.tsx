"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean; // ✅ Add loading to interface
  loginWithToken: (token: string) => Promise<void>; // ✅ Make it properly async
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("seller_token");
    if (token) {
      setToken(token);
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } finally {
      setLoading(false);
    }
  };

const loginWithToken = async (token: string) => {
  // Set cookie (for middleware)
  document.cookie = `seller_token=${token}; path=/;`;

  // Optional: still keep localStorage for client
  localStorage.setItem("seller_token", token);

  setToken(token);
  await fetchUser(token);
};

const logout = () => {
  // 🔴 THIS LINE IS CRITICAL
  document.cookie =
    "seller_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

  localStorage.removeItem("seller_token");
  setToken(null);
  setUser(null);
};

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout }}>
      {/* ✅ Include loading in the value */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};