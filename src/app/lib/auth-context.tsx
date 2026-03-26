"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateAvatar(name: string): string {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#2563eb"];
  const color = colors[name.length % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="system-ui" font-size="28" font-weight="600">${initials}</text></svg>`)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clausd_user");
      if (stored) Promise.resolve().then(() => setUser(JSON.parse(stored)));
    } catch { /* */ }
    Promise.resolve().then(() => setIsLoading(false));
  }, []);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem("clausd_user", JSON.stringify(u));
  };

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock: accept any email/password
    await new Promise(r => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    saveUser({ name, email, avatar: generateAvatar(name), createdAt: new Date().toISOString() });
    return true;
  };

  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    saveUser({ name, email, avatar: generateAvatar(name), createdAt: new Date().toISOString() });
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    saveUser({
      name: "Demo User",
      email: "demo@clausd.ai",
      avatar: generateAvatar("Demo User"),
      createdAt: new Date().toISOString(),
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("clausd_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
