"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorParam = url.searchParams.get("error_description");

        if (errorParam) {
          setError(errorParam);
          return;
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }
        }

        // Wait for onAuthStateChange to process the session
        // (handles both code exchange and hash fragment flows)
        let attempts = 0;
        const checkSession = async (): Promise<boolean> => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          return !!session;
        };

        while (attempts < 10) {
          if (await checkSession()) {
            router.push("/dashboard");
            return;
          }
          await new Promise((r) => setTimeout(r, 500));
          attempts++;
        }

        setError("Could not sign in. Please try again.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-red-400">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in failed</h2>
          <p className="text-zinc-400 text-sm mb-6">{error}</p>
          <a
            href="/login"
            className="text-accent hover:underline text-sm font-medium"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
        <p className="text-sm text-zinc-400">Signing you in...</p>
      </div>
    </div>
  );
}
