"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Processing...");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    async function handle() {
      try {
        const hash = window.location.hash;
        setDebug(`Hash present: ${hash.length > 0}, length: ${hash.length}`);

        if (!hash || !hash.includes("access_token")) {
          setStatus("No access token found in URL");
          // Still redirect after a moment
          setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
          return;
        }

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          setStatus("Missing tokens");
          setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
          return;
        }

        setDebug(`Tokens found. AT length: ${accessToken.length}, RT: ${refreshToken}`);
        setStatus("Setting session...");

        // Create client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setDebug(`setSession error: ${error.message}`);
          setStatus(`Error: ${error.message}`);

          // FALLBACK: manually store in localStorage
          const storageKey = `sb-meeqwxkwveqaijfkjjvk-auth-token`;
          const sessionData = {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: "bearer",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: JSON.parse(atob(accessToken.split(".")[1])),
          };
          localStorage.setItem(storageKey, JSON.stringify(sessionData));
          setDebug(prev => prev + " | Stored manually in localStorage");
        } else {
          setDebug(`setSession success. User: ${data.session?.user?.email}`);
          setStatus("Success! Redirecting...");
        }

        // Redirect
        window.location.href = "/dashboard";
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus(`Unexpected error: ${msg}`);
        setDebug(msg);
        // Still redirect
        setTimeout(() => { window.location.href = "/dashboard"; }, 3000);
      }
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
      flexDirection: "column" as const,
      gap: 16,
      padding: 20,
    }}>
      <div style={{
        width: 32, height: 32, border: "3px solid #7c5cfc",
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{ color: "#a1a1aa", fontSize: 14 }}>{status}</p>
      <p style={{ color: "#52525b", fontSize: 10, maxWidth: 600, wordBreak: "break-all" as const }}>{debug}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
