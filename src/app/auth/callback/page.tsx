"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      router.push("/dashboard");
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
        <p className="text-sm text-zinc-400">Signing you in...</p>
      </div>
    </div>
  );
}
