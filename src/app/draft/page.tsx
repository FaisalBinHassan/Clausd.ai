"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, ArrowLeft, ArrowRight, Check, Loader2, Download,
  RefreshCw, ChevronRight, Sparkles, Scale, Building2, Users,
  UserCheck, ShieldCheck, ScrollText, Briefcase, Home, PenTool,
  Printer, Copy, FileDown, ChevronDown, Save,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { saveDocument } from "../lib/document-store";
import { Answer, Step, CustomizationOptions, DocumentAST, PlaceholderMap } from "./lib/types";
import { parseDocument } from "./lib/document-parser";
import { templates, getTemplate } from "./lib/template-registry";
import { renderDocumentHTML, renderPlainText, extractPlaceholders } from "./lib/document-renderer";
import SignaturePad from "./components/SignaturePad";
import LogoUploader from "./components/LogoUploader";
import CustomizationPanel from "./components/CustomizationPanel";

// ─── Document Types ──────────────────────────────────────────────────

const documentTypes = [
  { id: "nda", name: "Non-Disclosure Agreement", description: "Protect confidential information shared between parties", icon: <ShieldCheck className="w-6 h-6" />, category: "Business" },
  { id: "employment", name: "Employment Contract", description: "Define terms of employment for new hires", icon: <Users className="w-6 h-6" />, category: "Employment" },
  { id: "service", name: "Service Agreement", description: "Outline terms for professional or consulting services", icon: <Briefcase className="w-6 h-6" />, category: "Business" },
  { id: "contractor", name: "Contractor Agreement", description: "Engage independent contractors with clear terms", icon: <UserCheck className="w-6 h-6" />, category: "Employment" },
  { id: "founder", name: "Founder Agreement", description: "Establish co-founder equity, roles, and responsibilities", icon: <Building2 className="w-6 h-6" />, category: "Startup" },
  { id: "privacy", name: "Privacy Policy", description: "Comply with GDPR, UK GDPR, and data protection laws", icon: <Scale className="w-6 h-6" />, category: "Compliance" },
  { id: "terms", name: "Terms of Service", description: "Set usage terms for your website or platform", icon: <ScrollText className="w-6 h-6" />, category: "Compliance" },
  { id: "tenancy", name: "Tenancy Agreement", description: "Define rental terms between landlord and tenant", icon: <Home className="w-6 h-6" />, category: "Personal" },
  { id: "freelance", name: "Freelance Contract", description: "Protect yourself and your clients as a freelancer", icon: <PenTool className="w-6 h-6" />, category: "Personal" },
];

// ─── Progress Bar ────────────────────────────────────────────────────

function ProgressBar({ step, onNavigate }: { step: Step; onNavigate: (target: Step) => void }) {
  const steps: { key: Step; label: string; num: number }[] = [
    { key: "select", label: "Type", num: 1 },
    { key: "mcq", label: "Details", num: 2 },
    { key: "preview", label: "Preview", num: 3 },
    { key: "template", label: "Design", num: 4 },
    { key: "final", label: "Export", num: 5 },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className="mb-8">
      {/* Line + dots */}
      <div className="relative flex items-center justify-between max-w-md mx-auto">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-white/[0.06] -translate-y-1/2" />
        {/* Filled line */}
        <div className="absolute left-0 top-1/2 h-[2px] bg-accent -translate-y-1/2 transition-all duration-500" style={{ width: `${(idx / (steps.length - 1)) * 100}%` }} />

        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          const clickable = done;
          return (
            <button
              key={s.key}
              onClick={() => { if (clickable) onNavigate(s.key); }}
              disabled={!clickable}
              className="relative flex flex-col items-center gap-1.5 z-10"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? "bg-accent text-white cursor-pointer hover:scale-110" :
                active ? "bg-accent text-white ring-4 ring-accent/20" :
                "bg-[#1a1a1e] text-zinc-600 border border-white/[0.08]"
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-[10px] font-medium absolute -bottom-5 whitespace-nowrap ${
                done ? "text-accent" : active ? "text-white" : "text-zinc-600"
              }`}>{s.label}</span>
            </button>
          );
        })}
      </div>
      {/* Spacing for labels below */}
      <div className="h-6" />
    </div>
  );
}

// ─── Step 1: Document Type Selection ─────────────────────────────────

function DocTypeSelector({ onSelect }: { onSelect: (id: string, name: string) => void }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Business", "Employment", "Startup", "Compliance", "Personal"];
  const filtered = filter === "All" ? documentTypes : documentTypes.filter((d) => d.category === filter);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">What document do you need?</h2>
      <p className="text-zinc-500 mb-8">Choose your document type and we&apos;ll guide you through the rest.</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === c ? "bg-accent text-white" : "bg-white/[0.03] text-zinc-500 hover:text-white border border-white/[0.06]"}`}>{c}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <button key={doc.id} onClick={() => onSelect(doc.id, doc.name)} className="glass-card rounded-xl p-6 text-left hover:border-accent/30 transition-all group">
            <div className="text-accent mb-3 group-hover:scale-110 transition-transform">{doc.icon}</div>
            <h3 className="font-semibold mb-1 text-sm">{doc.name}</h3>
            <p className="text-xs text-zinc-500">{doc.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: MCQ Flow ────────────────────────────────────────────────

function MCQFlow({ documentType, documentName, onComplete, onBack }: {
  documentType: string; documentName: string; onComplete: (answers: Answer[]) => void; onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [qNum, setQNum] = useState(0);
  const [phase, setPhase] = useState<string>("core");
  const [done, setDone] = useState(false);
  const qRef = useRef<HTMLDivElement>(null);

  const fetchNext = async (prev: Answer[]) => {
    setLoading(true); setSelected(null); setCustomInput("");
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, previousAnswers: prev }),
      });
      const d = await res.json();
      if (d.done) { setDone(true); } else { setQuestion(d.question); setOptions(d.options); setQNum(d.questionNumber); setPhase(d.phase || "core"); }
    } catch { /* */ }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void Promise.resolve().then(() => fetchNext([])); }, []);
  useEffect(() => { qRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [question]);

  const handleNext = () => {
    if (!selected) return;
    const ans = selected.toLowerCase().includes("other") && customInput ? customInput : selected;
    const next = [...answers, { question, answer: ans }];
    setAnswers(next); fetchNext(next);
  };
  const handleCreate = () => {
    if (selected) {
      const ans = selected.toLowerCase().includes("other") && customInput ? customInput : selected;
      onComplete([...answers, { question, answer: ans }]);
    } else { onComplete(answers); }
  };

  if (loading && answers.length === 0) {
    return <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up"><Loader2 className="w-8 h-8 text-accent animate-spin mb-4" /><p className="text-zinc-500">Preparing questions for your {documentName}...</p></div>;
  }

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
        <div><h2 className="text-xl font-bold">{documentName}</h2><p className="text-xs text-zinc-500">Answer questions to customise your document</p></div>
      </div>

      {answers.length > 0 && (
        <div className="space-y-2 mb-6">
          {answers.map((a, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="min-w-0"><p className="text-[10px] text-zinc-500">{a.question}</p><p className="text-xs font-medium truncate">{a.answer}</p></div>
            </div>
          ))}
        </div>
      )}

      {!done && !loading && (
        <div ref={qRef} className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-zinc-500">Question {qNum}</span>
            {phase === "follow-up" && <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Tailored follow-up</span>}
          </div>
          <h3 className="text-base font-semibold mb-4">{question}</h3>
          <div className="space-y-2">
            {options.map((opt) => (
              <button key={opt} onClick={() => setSelected(opt)} className={`mcq-option w-full text-left px-4 py-3 rounded-xl border transition text-sm ${selected === opt ? "selected border-accent bg-accent/10" : "border-white/[0.06] bg-white/[0.02]"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${selected === opt ? "border-accent bg-accent" : "border-zinc-600"}`}>{selected === opt && <Check className="w-2.5 h-2.5 text-white" />}</div>
                  <span className="text-xs">{opt}</span>
                </div>
              </button>
            ))}
          </div>
          {selected?.toLowerCase().includes("other") && (
            <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Please specify..." className="w-full mt-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm placeholder:text-zinc-600 focus:outline-none focus:border-accent" />
          )}
        </div>
      )}

      {loading && answers.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6 flex items-center justify-center"><Loader2 className="w-5 h-5 text-accent animate-spin mr-3" /><span className="text-zinc-500 text-xs">Loading...</span></div>
      )}

      <div className="flex items-center gap-3">
        {!done && !loading && (
          <button onClick={handleNext} disabled={!selected} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${selected ? "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]" : "bg-white/[0.03] text-zinc-600 cursor-not-allowed"}`}>
            Next Question <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {(answers.length >= 3 || done) && (
          <button onClick={handleCreate} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition bg-accent hover:bg-accent-light text-white animate-pulse-glow">
            <FileText className="w-3.5 h-3.5" /> Generate Document
          </button>
        )}
      </div>
      {answers.length >= 3 && !done && !loading && (
        <p className="text-center text-[10px] text-zinc-600 mt-2">More questions refine your document further, or generate now</p>
      )}
    </div>
  );
}

// ─── Step 3: Document Preview ────────────────────────────────────────

function DocumentPreview({ ast, documentName, onNext, onBack }: {
  ast: DocumentAST; documentName: string; onNext: () => void; onBack: () => void;
}) {
  const defaultTemplate = getTemplate("professional");
  const defaultOptions: CustomizationOptions = { accentColor: null, fontOverride: null, spacing: "normal", margins: "standard" };
  const html = renderDocumentHTML(ast, defaultTemplate, defaultOptions);

  return (
    <div className="animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Document Preview</h2><p className="text-xs text-zinc-500">Review your {documentName} before choosing a design</p></div>
      </div>
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] mb-6 max-h-[60vh] overflow-y-auto bg-white">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-white/[0.06] text-zinc-500 hover:text-white text-sm font-medium transition flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Redo</button>
        <button onClick={onNext} className="flex-1 bg-accent hover:bg-accent-light text-white py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">Choose Design <ArrowRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ─── Step 4: Template & Customization ────────────────────────────────

type DesignTab = "templates" | "details" | "style" | "branding";

function TemplateDesigner({ ast, documentName, onComplete, onBack, customization, setCustomization, logoDataUrl, setLogoDataUrl, signatureDataUrl, setSignatureDataUrl, placeholders, setPlaceholders }: {
  ast: DocumentAST; documentName: string; onComplete: (templateId: string) => void; onBack: () => void;
  customization: CustomizationOptions; setCustomization: (o: CustomizationOptions) => void;
  logoDataUrl: string | null; setLogoDataUrl: (v: string | null) => void;
  signatureDataUrl: string | null; setSignatureDataUrl: (v: string | null) => void;
  placeholders: PlaceholderMap; setPlaceholders: (p: PlaceholderMap) => void;
}) {
  const [selectedId, setSelectedId] = useState("professional");
  const [activeTab, setActiveTab] = useState<DesignTab>("templates");
  const template = getTemplate(selectedId);
  const html = renderDocumentHTML(ast, template, customization, logoDataUrl, signatureDataUrl, placeholders);
  const placeholderKeys = extractPlaceholders(ast.rawText);
  const filledCount = placeholderKeys.filter(k => placeholders[k]?.trim()).length;

  return (
    <div className="animate-fade-in-up -mx-6 -mt-2">
      {/* Full-width two-panel layout */}
      <div className="flex min-h-[calc(100vh-120px)]">

        {/* ═══ LEFT PANEL ═══ */}
        <div className="w-[340px] lg:w-[380px] shrink-0 border-r border-white/[0.05] flex flex-col bg-[#0b0b0d]">

          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1 text-zinc-500 hover:text-white text-[11px] transition">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <button onClick={() => onComplete(selectedId)} className="bg-accent hover:bg-accent-light text-white h-8 px-4 rounded-lg text-[11px] font-semibold transition flex items-center gap-1">
              Export <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.05]">
            {([
              { key: "templates" as DesignTab, label: "Templates" },
              { key: "details" as DesignTab, label: "Details", badge: placeholderKeys.length > 0 ? `${filledCount}/${placeholderKeys.length}` : undefined },
              { key: "style" as DesignTab, label: "Style" },
              { key: "branding" as DesignTab, label: "Branding" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 py-2.5 text-[11px] font-medium text-center transition ${
                  activeTab === tab.key ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {tab.label}
                {tab.badge && <span className="ml-0.5 text-[8px] text-accent">{tab.badge}</span>}
                {activeTab === tab.key && <div className="absolute bottom-0 inset-x-3 h-[2px] bg-accent rounded-full" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* Templates */}
            {activeTab === "templates" && (
              <div className="p-3 grid grid-cols-3 gap-1.5">
                {templates.map((t) => {
                  const on = selectedId === t.id;
                  return (
                    <button key={t.id} onClick={() => setSelectedId(t.id)} className={`rounded-lg overflow-hidden transition-all ${on ? "ring-2 ring-accent ring-offset-1 ring-offset-[#0b0b0d]" : "hover:opacity-80"}`}>
                      <div className="aspect-[3/4] overflow-hidden bg-white relative">
                        <div style={{ transform: "scale(0.065)", transformOrigin: "top left", width: "800px", height: "1100px", pointerEvents: "none" }} dangerouslySetInnerHTML={{ __html: renderDocumentHTML(ast, t, { accentColor: null, fontOverride: null, spacing: "normal", margins: "standard" }) }} />
                        {on && <div className="absolute inset-0 bg-accent/10" />}
                      </div>
                      <div className={`py-1.5 px-1 text-center ${on ? "bg-accent/10" : "bg-white/[0.02]"}`}>
                        <p className={`text-[9px] font-semibold leading-none ${on ? "text-accent" : "text-zinc-400"}`}>{t.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Details */}
            {activeTab === "details" && (
              <div className="p-4 space-y-2.5">
                <p className="text-[10px] text-zinc-500 leading-relaxed">Fill in your details below. Highlighted fields in the preview will update live.</p>
                {placeholderKeys.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-600">No fields to fill</div>
                ) : (
                  placeholderKeys.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="w-24 shrink-0 text-[9px] font-semibold text-zinc-500 uppercase tracking-wide text-right leading-tight">{key.replace(/_/g, " ").replace("PARTY A ", "Party A\n").replace("PARTY B ", "Party B\n")}</label>
                      <input
                        type="text"
                        value={placeholders[key] || ""}
                        onChange={(e) => setPlaceholders({ ...placeholders, [key]: e.target.value })}
                        placeholder={key.toLowerCase().replace(/_/g, " ")}
                        className="flex-1 h-8 px-2.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent transition"
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Style */}
            {activeTab === "style" && (
              <div className="p-4">
                <CustomizationPanel options={customization} onChange={setCustomization} />
              </div>
            )}

            {/* Branding (logo + signature combined) */}
            {activeTab === "branding" && (
              <div className="p-4 space-y-4">
                <LogoUploader logoDataUrl={logoDataUrl} onLogoChange={setLogoDataUrl} />
                <SignaturePad onSignatureChange={setSignatureDataUrl} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL: LIVE PREVIEW ═══ */}
        <div className="flex-1 flex flex-col bg-[#111114] min-w-0">
          {/* Preview header bar */}
          <div className="h-10 px-5 border-b border-white/[0.05] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">{template.name} &middot; {documentName}</p>
            <div className="w-16" />
          </div>

          {/* Document */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ background: "radial-gradient(ellipse at center, #18181b 0%, #111114 100%)" }}>
            <div className="rounded-lg overflow-hidden bg-white shadow-2xl shadow-black/50 max-w-[680px] mx-auto">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Final Export ────────────────────────────────────────────

function FinalExport({ ast, documentName, documentType, templateId, customization, logoDataUrl, signatureDataUrl, placeholders, answersCount, onStartOver }: {
  ast: DocumentAST; documentName: string; documentType: string; templateId: string;
  customization: CustomizationOptions; logoDataUrl: string | null; signatureDataUrl: string | null;
  placeholders: PlaceholderMap; answersCount: number; onStartOver: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const template = getTemplate(templateId);
  const html = renderDocumentHTML(ast, template, customization, logoDataUrl, signatureDataUrl, placeholders);

  const handleSave = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    saveDocument({ title: documentName, type: documentType, templateId, rawText: ast.rawText, answersCount });
    setSaved(true);
  };

  const downloadHTML = () => {
    const fullHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${documentName}</title><style>body{margin:0;padding:20px;background:#f5f5f5;}@media print{body{background:#fff;padding:0;}}</style></head><body>${html}</body></html>`;
    const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${documentName.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPlainText = () => {
    const blob = new Blob([renderPlainText(ast)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${documentName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${documentName}</title><style>body{margin:0;padding:20px;}@media print{body{padding:0;}}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ast.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7" /></div>
        <h2 className="text-2xl font-bold">Your {documentName} is ready!</h2>
        <p className="text-xs text-zinc-500 mt-1">Template: {template.name}</p>
      </div>

      {/* Document preview */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white max-h-[55vh] overflow-y-auto mb-8 mx-auto max-w-3xl">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button onClick={downloadHTML} className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 btn-lift">
          <Download className="w-4 h-4" /> Download HTML
        </button>
        <button onClick={handlePrint} className="bg-white/[0.05] hover:bg-white/[0.1] text-white px-6 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-white/[0.08]">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
        <button onClick={downloadPlainText} className="bg-white/[0.05] hover:bg-white/[0.1] text-white px-6 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-white/[0.08]">
          <FileDown className="w-4 h-4" /> Plain Text
        </button>
        <button onClick={handleCopy} className="bg-white/[0.05] hover:bg-white/[0.1] text-white px-6 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-white/[0.08]">
          <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Text"}
        </button>
      </div>

      {/* Save to dashboard */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition flex items-center gap-2 ${saved ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08]"}`}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved to Dashboard</> : <><Save className="w-4 h-4" /> {isAuthenticated ? "Save to Dashboard" : "Sign in to Save"}</>}
        </button>
        <button onClick={onStartOver} className="px-6 py-3 rounded-xl text-sm text-zinc-500 hover:text-white transition flex items-center gap-2 border border-white/[0.06]">
          <RefreshCw className="w-3.5 h-3.5" /> Create Another
        </button>
      </div>

      {saved && (
        <div className="text-center mb-4">
          <Link href="/dashboard" className="text-xs text-accent hover:underline">View in Dashboard &rarr;</Link>
        </div>
      )}
    </div>
  );
}

// ─── Main Draft Page ─────────────────────────────────────────────────

export default function DraftPage() {
  const [step, setStep] = useState<Step>("select");
  const [documentType, setDocumentType] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [rawDocument, setRawDocument] = useState("");
  const [parsedDoc, setParsedDoc] = useState<DocumentAST | null>(null);
  const [templateId, setTemplateId] = useState("professional");
  const [customization, setCustomization] = useState<CustomizationOptions>({ accentColor: null, fontOverride: null, spacing: "normal", margins: "standard" });
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<PlaceholderMap>({});
  const [generating, setGenerating] = useState(false);

  const handleSelectDoc = (id: string, name: string) => { setDocumentType(id); setDocumentName(name); setStep("mcq"); };

  const handleMCQComplete = async (ans: Answer[]) => {
    setAnswers(ans);
    setGenerating(true);
    setStep("preview");
    try {
      const res = await fetch("/api/generate-document", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, answers: ans }),
      });
      const data = await res.json();
      setRawDocument(data.document);
      setParsedDoc(parseDocument(data.document));
    } catch { setRawDocument("Error generating document."); }
    setGenerating(false);
  };

  const handleStartOver = () => {
    setStep("select"); setDocumentType(""); setDocumentName(""); setAnswers([]);
    setRawDocument(""); setParsedDoc(null); setTemplateId("professional");
    setCustomization({ accentColor: null, fontOverride: null, spacing: "normal", margins: "standard" });
    setLogoDataUrl(null); setSignatureDataUrl(null); setPlaceholders({});
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <header className="border-b border-white/[0.04] bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-white" /></div>
            <span className="text-lg font-bold tracking-tight">Clausd<span className="text-accent">.ai</span></span>
          </Link>
          {documentName && <span className="text-xs text-zinc-500">Drafting: <span className="text-white font-medium">{documentName}</span></span>}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <ProgressBar step={step} onNavigate={(target) => setStep(target)} />

        {step === "select" && <DocTypeSelector onSelect={handleSelectDoc} />}
        {step === "mcq" && <MCQFlow documentType={documentType} documentName={documentName} onComplete={handleMCQComplete} onBack={() => setStep("select")} />}

        {step === "preview" && generating && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
            <p className="text-zinc-500 text-sm">Generating your {documentName}...</p>
            <p className="text-[10px] text-zinc-600 mt-1">Mapping answers to validated clauses...</p>
          </div>
        )}
        {step === "preview" && !generating && parsedDoc && (
          <DocumentPreview ast={parsedDoc} documentName={documentName} onNext={() => setStep("template")} onBack={() => setStep("mcq")} />
        )}

        {step === "template" && parsedDoc && (
          <TemplateDesigner
            ast={parsedDoc} documentName={documentName}
            onComplete={(tId) => { setTemplateId(tId); setStep("final"); }}
            onBack={() => setStep("preview")}
            customization={customization} setCustomization={setCustomization}
            logoDataUrl={logoDataUrl} setLogoDataUrl={setLogoDataUrl}
            signatureDataUrl={signatureDataUrl} setSignatureDataUrl={setSignatureDataUrl}
            placeholders={placeholders} setPlaceholders={setPlaceholders}
          />
        )}

        {step === "final" && parsedDoc && (
          <FinalExport
            ast={parsedDoc} documentName={documentName} documentType={documentType} templateId={templateId}
            customization={customization} logoDataUrl={logoDataUrl} signatureDataUrl={signatureDataUrl}
            placeholders={placeholders} answersCount={answers.length} onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  );
}
