"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateAvatar(name: string): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#2563eb",
  ];
  const color = colors[name.length % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="system-ui" font-size="28" font-weight="600">${initials}</text></svg>`
  )}`;
}

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  const name =
    meta.full_name ||
    meta.name ||
    su.email?.split("@")[0]?.replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
    "User";
  return {
    id: su.id,
    name,
    email: su.email || "",
    avatar: meta.avatar_url || meta.picture || generateAvatar(name),
    createdAt: su.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSession = useCallback((session: Session | null) => {
    if (session?.user) {
      setUser(mapSupabaseUser(session.user));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      // Check if URL has hash fragment from OAuth redirect
      if (
        typeof window !== "undefined" &&
        window.location.hash.includes("access_token")
      ) {
        // Manually parse hash fragment and set session
        const params = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && data.session) {
            handleSession(data.session);
            // Clean up hash from URL
            window.history.replaceState(
              null,
              "",
              window.location.pathname
            );
            return;
          }
        }
      }

      // Normal flow: get existing session
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    init();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
