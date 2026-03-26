"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./lib/auth-context";
import {
  FileText,
  Shield,
  Zap,
  Globe,
  Palette,
  ArrowRight,
  Check,
  ChevronDown,
  MessageSquare,
  ListChecks,
  Download,
  ArrowUpRight,
  Sparkles,
  Lock,
  BarChart3,
  Star,
  X,
} from "lucide-react";

// ─── Scroll reveal hook ─────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(reveal, {
      threshold: 0,
      rootMargin: "100px 0px 0px 0px",
    });

    // Observe the container itself
    if (!el.classList.contains("visible")) {
      observer.observe(el);
    }

    // Observe all children with .reveal
    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Animated counter ───────────────────────────────────────────────

function Counter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const dur = 1800;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.04]" : "bg-transparent"}`}>
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Clausd<span className="text-accent">.ai</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-400">
          {["How it works", "Features", "Pricing", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        {isAuthenticated ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition">
            <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
            <span className="text-sm font-medium hidden sm:inline">{user?.name?.split(" ")[0]}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition hidden sm:inline">Log in</Link>
            <Link href="/signup" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-zinc-200 transition btn-lift">
              Start Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/[0.07] rounded-full blur-[150px]" />
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-purple-600/[0.05] rounded-full blur-[120px] animate-float" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-zinc-400 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          AI-powered legal documents
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          Just <span className="gradient-text">Clausd</span> it.
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
          Create regulation-ready, professionally designed legal documents in minutes. No solicitor. No templates. No hallucinations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <Link href="/draft" className="group bg-accent hover:bg-accent-light text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all animate-pulse-glow flex items-center gap-2">
            Start Drafting — Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="#how-it-works" className="group text-zinc-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
            See how it works
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-zinc-500 animate-fade-in-up" style={{ animationDelay: "0.65s", animationFillMode: "both" }}>
          {["Free to start", "No legal knowledge needed", "UK, US, EU, GCC", "Zero hallucinations"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500/70" />{t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem stats ──────────────────────────────────────────────────

function ProblemSection() {
  const ref = useReveal();

  return (
    <section ref={ref} className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
      <div className="mx-auto max-w-5xl relative">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">The Problem</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Legal documents are <span className="text-red-400">broken</span>
          </h2>
          <p className="text-zinc-500 mt-4 text-sm md:text-base max-w-lg mx-auto">
            For 99% of businesses, getting legal documents right is either too expensive, too risky, or too confusing.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { v: 500, pre: "£", suf: "+", label: "Cost of one NDA\nfrom a solicitor" },
            { v: 58, pre: "", suf: "–88%", label: "Legal queries\nhallucinated by LLMs" },
            { v: 38, pre: "", suf: "%", label: "UK SMEs face a legal\nproblem each year" },
            { v: 6700, pre: "£", suf: "", label: "Average financial\nimpact per business" },
          ].map((s, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} text-center glass-card rounded-2xl p-5 md:p-6`}>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                <Counter value={s.v} prefix={s.pre} suffix={s.suf} />
              </div>
              <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed whitespace-pre-line">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "💸", title: "Hire a Solicitor", desc: "£500+ per NDA. £350–£1,200 per custom contract. Days of waiting. Thousands annually for routine paperwork.", tag: "Expensive", tagColor: "bg-red-500/10 text-red-400 border-red-500/20" },
            { icon: "📋", title: "Use a Template", desc: "Generic, one-size-fits-all, often unenforceable. Overwhelmingly US-centric — leaves UK/EU users exposed.", tag: "Risky", tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
            { icon: "🤖", title: "Ask ChatGPT", desc: "58–88% hallucination rate on legal queries (Stanford). 729+ court cases involve AI-fabricated legal content.", tag: "Unreliable", tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
          ].map((p, i) => (
            <div key={p.title} className={`reveal reveal-delay-${i + 1} glass-card rounded-2xl p-6`}>
              <div className="text-3xl mb-4">{p.icon}</div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mb-3 ${p.tagColor}`}>{p.tag}</span>
              <h3 className="text-base font-bold mb-2">{p.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ───────────────────────────────────────────────────

function HowItWorks() {
  const ref = useReveal();
  const steps = [
    { icon: <MessageSquare className="w-5 h-5" />, title: "Describe what you need", desc: "Tell us in plain English. \"I need an NDA for a freelancer\" — that's it.", color: "bg-indigo-500" },
    { icon: <ListChecks className="w-5 h-5" />, title: "Answer smart questions", desc: "AI generates adaptive MCQs tailored to your situation. Every answer maps to a validated clause.", color: "bg-violet-500" },
    { icon: <Palette className="w-5 h-5" />, title: "Pick your design", desc: "Choose from professional templates. Your documents look as polished as they read.", color: "bg-purple-500" },
    { icon: <Download className="w-5 h-5" />, title: "Download & sign", desc: "Get a regulation-ready, jurisdiction-aware document. PDF, share link, or e-signature.", color: "bg-pink-500" },
  ];

  return (
    <section ref={ref} id="how-it-works" className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent" />
      <div className="mx-auto max-w-5xl relative">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">How it works</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            From zero to signed<br /><span className="text-zinc-600">in minutes.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {steps.map((step, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} glass-card rounded-2xl p-5 md:p-6`}>
              <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center text-white mb-4`}>
                {step.icon}
              </div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Step 0{i + 1}</p>
              <h3 className="text-sm font-bold mb-1.5">{step.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center reveal reveal-delay-5">
          <Link href="/draft" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-semibold transition-all btn-lift hover:shadow-lg hover:shadow-white/5">
            Try it now — Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Features ───────────────────────────────────────────────────────

function Features() {
  const ref = useReveal();
  const features = [
    { icon: <Shield className="w-5 h-5" />, title: "Zero Hallucinations", desc: "Every clause comes from a validated legal library — not LLM guesswork." },
    { icon: <Globe className="w-5 h-5" />, title: "Multi-Jurisdiction", desc: "UK, US, EU, and GCC compliance built in from day one." },
    { icon: <Zap className="w-5 h-5" />, title: "Minutes, Not Days", desc: "What costs £500 and takes a week with a solicitor takes 5 minutes." },
    { icon: <Palette className="w-5 h-5" />, title: "Professional Design", desc: "Templates that impress investors, partners, and clients." },
    { icon: <Lock className="w-5 h-5" />, title: "Encrypted & Private", desc: "End-to-end encryption. We never train on your documents." },
    { icon: <BarChart3 className="w-5 h-5" />, title: "Document Dashboard", desc: "Manage, update, and version-control all your documents." },
  ];

  return (
    <section ref={ref} id="features" className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/[0.04] rounded-full blur-[120px]" />
      <div className="mx-auto max-w-5xl relative">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Built different.
          </h2>
          <p className="text-zinc-500 mt-3 text-sm">Everything you need. Nothing you don&apos;t.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={f.title} className={`reveal reveal-delay-${(i % 3) + 1} glass-card rounded-2xl p-6 group`}>
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold mb-1.5">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Document Types Marquee ─────────────────────────────────────────

function DocTypesBanner() {
  const types = ["NDAs", "Employment Contracts", "Service Agreements", "Founder Agreements", "Privacy Policies", "SAFE Notes", "Contractor Agreements", "Terms of Service", "IP Assignment", "Tenancy Agreements", "Advisor Agreements", "Loan Agreements", "Vesting Schedules", "Supplier Terms", "GDPR Notices"];

  return (
    <section className="py-32 md:py-44 overflow-hidden relative">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">Document Types</p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">30+ documents and counting</h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#09090b] to-transparent z-10" />
        <div className="flex gap-3 animate-marquee whitespace-nowrap">
          {[...types, ...types].map((t, i) => (
            <div key={i} className="px-4 py-2 rounded-full border border-white/[0.06] text-xs font-medium text-zinc-400 bg-white/[0.02] shrink-0">{t}</div>
          ))}
        </div>
      </div>

      <div className="relative mt-3">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#09090b] to-transparent z-10" />
        <div className="flex gap-3 animate-marquee whitespace-nowrap" style={{ animationDirection: "reverse", animationDuration: "40s" }}>
          {[...types.slice().reverse(), ...types.slice().reverse()].map((t, i) => (
            <div key={i} className="px-4 py-2 rounded-full border border-white/[0.06] text-xs font-medium text-zinc-400 bg-white/[0.02] shrink-0">{t}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Comparison ─────────────────────────────────────────────────────

function Comparison() {
  const ref = useReveal();
  const rows: [string, boolean | string, boolean | string, boolean | string][] = [
    ["Guided MCQ flow", true, false, false],
    ["Zero hallucinations", true, true, false],
    ["Multi-jurisdiction", true, "⚠️", false],
    ["Professional design", true, "⚠️", false],
    ["Ready in minutes", true, false, true],
    ["From £0", true, false, true],
    ["Compliance built-in", true, true, false],
  ];

  return (
    <section ref={ref} className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12 reveal">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">Why Clausd</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The smart alternative</h2>
        </div>

        <div className="reveal reveal-delay-1 overflow-x-auto rounded-2xl glass-card">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-zinc-500 font-medium text-xs">Feature</th>
                <th className="px-5 py-3.5 text-accent font-bold text-xs">Clausd</th>
                <th className="px-5 py-3.5 text-zinc-500 font-medium text-xs">Solicitor</th>
                <th className="px-5 py-3.5 text-zinc-500 font-medium text-xs">ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([feature, clausd, sol, gpt], i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-none">
                  <td className="px-5 py-3 text-zinc-300 text-xs">{feature as string}</td>
                  {[clausd, sol, gpt].map((val, j) => (
                    <td key={j} className="px-5 py-3 text-center">
                      {val === true ? <Check className={`w-4 h-4 mx-auto ${j === 0 ? "text-emerald-400" : "text-zinc-600"}`} /> : val === false ? <X className="w-4 h-4 mx-auto text-zinc-700" /> : <span className="text-xs">{val as string}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ────────────────────────────────────────────────────────

function Pricing() {
  const ref = useReveal();
  const plans = [
    { name: "Free", price: "£0", period: "forever", desc: "Perfect for trying Clausd", features: ["2 documents per month", "UK jurisdiction", "Standard templates", "PDF download"], cta: "Start Free", highlight: false },
    { name: "Pro", price: "£9.99", period: "/mo", desc: "For freelancers & sole traders", features: ["Unlimited documents", "All jurisdictions", "Premium templates", "E-signature integration", "Document dashboard", "Priority support"], cta: "Get Pro", highlight: true },
    { name: "Business", price: "£29.99", period: "/mo", desc: "For growing teams", features: ["Everything in Pro", "Team access & roles", "Custom branding", "Document analytics", "API access", "Dedicated support"], cta: "Get Business", highlight: false },
  ];

  return (
    <section ref={ref} id="pricing" className="py-32 md:py-48 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent" />
      <div className="mx-auto max-w-4xl relative">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="text-zinc-500 mt-3 text-sm">Save thousands compared to solicitor fees. No credit card required.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div key={plan.name} className={`reveal reveal-delay-${i + 1} rounded-2xl p-6 transition-all ${plan.highlight ? "bg-accent/[0.08] border-2 border-accent/30 md:scale-[1.03]" : "glass-card"}`}>
              {plan.highlight && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent uppercase tracking-wider mb-4">
                  <Star className="w-3 h-3 fill-accent" /> Most popular
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{plan.desc}</p>
              <div className="mt-4 mb-5">
                <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                <span className="text-xs text-zinc-500">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/draft" className={`block text-center py-2.5 rounded-full text-sm font-semibold transition-all btn-lift ${plan.highlight ? "bg-accent hover:bg-accent-light text-white" : "bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08]"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ────────────────────────────────────────────────────────────

function FAQ() {
  const ref = useReveal();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "Are the documents legally binding?", a: "Yes. Clausd generates documents based on validated clause libraries that comply with jurisdiction-specific legal requirements. Every clause is grounded in real legal frameworks." },
    { q: "How is Clausd different from ChatGPT?", a: "ChatGPT generates free-form text with no structure or compliance. Clausd uses an adaptive MCQ engine where every answer maps to a validated legal clause — eliminating hallucinations entirely." },
    { q: "Which jurisdictions are supported?", a: "UK, US, EU, and GCC from launch. We're expanding to APAC and additional regions." },
    { q: "Can I edit the document after generation?", a: "Absolutely. You'll see a full draft preview before choosing your template. Review, adjust, and regenerate any section." },
    { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. We never train AI models on your documents. Your legal information stays private." },
    { q: "Who is Clausd for?", a: "Freelancers, sole traders, SME owners, startup founders, and individuals. If you've ever needed a contract and didn't want to pay £500+ for a solicitor, Clausd is for you." },
  ];

  return (
    <section ref={ref} id="faq" className="py-32 md:py-48 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-12 reveal">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Got questions?</h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className={`reveal reveal-delay-${Math.min(i + 1, 3)} glass-card rounded-xl overflow-hidden`}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 shrink-0 ml-4 ${open === i ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-5 pb-4 text-xs text-zinc-500 leading-relaxed">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ──────────────────────────────────────────────────────

function FinalCTA() {
  const ref = useReveal();
  return (
    <section ref={ref} className="relative py-24 md:py-36 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.04] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/[0.08] rounded-full blur-[150px]" />
      <div className="relative mx-auto max-w-2xl text-center reveal">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
          Ready to <span className="gradient-text">Clausd</span> it?
        </h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">
          Join thousands of businesses creating legal documents the smart way. Free to start.
        </p>
        <Link href="/draft" className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-bold transition-all btn-lift hover:shadow-lg hover:shadow-white/10">
          Start Drafting — Free
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-8 px-6">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold">Clausd<span className="text-accent">.ai</span></span>
        </div>
        <div className="flex items-center gap-6 text-xs text-zinc-600">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="text-zinc-700 text-[11px]">&copy; {new Date().getFullYear()} Clausd.ai</p>
      </div>
    </footer>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-auto max-w-5xl px-6"><div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" /></div>;
}

export default function Home() {
  return (
    <main className="bg-[#09090b]">
      <Navbar />
      <Hero />
      <Divider />
      <ProblemSection />
      <Divider />
      <HowItWorks />
      <Divider />
      <Features />
      <Divider />
      <DocTypesBanner />
      <Divider />
      <Comparison />
      <Divider />
      <Pricing />
      <Divider />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
