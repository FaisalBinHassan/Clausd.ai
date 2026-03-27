"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Create a standalone client — don't rely on shared instance or auth context
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handle() {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        // Parse tokens from hash fragment
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Store the session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }

      // Always redirect to dashboard with a full page load
      window.location.href = "/dashboard";
    }

    handle();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "system-ui",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #7c5cfc",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 1s linear infinite", margin: "0 auto 16px",
        }} />
        <p style={{ color: "#71717a", fontSize: 14 }}>Signing you in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
