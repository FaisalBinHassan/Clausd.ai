"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setLoading(true);
    const ok = await signup(name, email, password);
    setLoading(false);
    if (ok) router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const ok = await loginWithGoogle();
    setGoogleLoading(false);
    if (ok) router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Left: branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-purple-500/5" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Clausd<span className="text-accent">.ai</span></span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
            Start creating<br /><span className="gradient-text">for free.</span>
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
            Join thousands of businesses creating regulation-ready legal documents in minutes.
          </p>
        </div>
        <div className="relative space-y-3">
          {["No credit card required", "2 free documents per month", "UK, US, EU, GCC jurisdictions"].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Clausd<span className="text-accent">.ai</span></span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-sm text-zinc-500 mb-8">Get started with Clausd in seconds</p>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition disabled:opacity-50 mb-6"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-zinc-600 uppercase">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith"
                className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-11 bg-accent hover:bg-accent-light text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </p>

          <p className="text-center text-[10px] text-zinc-600 mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
