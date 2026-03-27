"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Plus, LogOut, Download, Trash2, Clock,
  BarChart3, FolderOpen, Search, Loader2, Pencil, X,
  Eye, Check, ChevronDown,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { listDocuments, deleteDocument, updateDocument, SavedDocument } from "../lib/document-store";

const TEMPLATES = [
  { id: "professional", name: "Professional" },
  { id: "corporate", name: "Corporate" },
  { id: "modern", name: "Modern" },
  { id: "classic", name: "Classic Legal" },
  { id: "startup", name: "Startup" },
  { id: "executive", name: "Executive" },
];

function EditModal({ doc, onClose, onSave }: {
  doc: SavedDocument;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; template_id?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(doc.title);
  const [templateId, setTemplateId] = useState(doc.template_id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(doc.id, { title, template_id: templateId });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Edit Document</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Document Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-accent transition"
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Template</label>
            <div className="relative">
              <select
                value={templateId}
                onChange={e => setTemplateId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-accent transition appearance-none"
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#18181b]">{t.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Type (read only) */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Document Type</label>
            <p className="text-sm text-zinc-300 bg-white/[0.02] rounded-lg px-3 py-2.5 border border-white/[0.04]">{doc.type}</p>
          </div>

          {/* Info */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>{doc.answers_count} questions answered</span>
            <span>Created {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-white/[0.08] text-sm font-medium text-zinc-400 hover:text-white transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1 h-10 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ doc, onClose }: { doc: SavedDocument; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#18181b] border border-white/[0.08] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06] shrink-0">
          <div>
            <h3 className="text-lg font-bold">{doc.title}</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">{doc.type} &middot; {doc.template_id} template &middot; {doc.answers_count} questions</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {doc.html_content ? (
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div dangerouslySetInnerHTML={{ __html: doc.html_content }} />
            </div>
          ) : (
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">{doc.raw_text}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editDoc, setEditDoc] = useState<SavedDocument | null>(null);
  const [viewDoc, setViewDoc] = useState<SavedDocument | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  const loadDocs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const docs = await listDocuments(user.id);
    setDocuments(docs);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      void Promise.resolve().then(() => loadDocs());
    }
  }, [user, loadDocs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await deleteDocument(id);
    await loadDocs();
  };

  const handleEdit = async (id: string, updates: { title?: string; template_id?: string }) => {
    await updateDocument(id, updates);
    await loadDocs();
  };

  const handleDownload = (doc: SavedDocument) => {
    const content = doc.html_content || doc.raw_text;
    const isHTML = !!doc.html_content;
    const blob = new Blob([content], { type: isHTML ? "text/html;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, "_")}.${isHTML ? "html" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const thisMonth = documents.filter(d => {
    const created = new Date(d.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const typeCounts: Record<string, number> = {};
  documents.forEach(d => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1; });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Modals */}
      {editDoc && <EditModal doc={editDoc} onClose={() => setEditDoc(null)} onSave={handleEdit} />}
      {viewDoc && <ViewModal doc={viewDoc} onClose={() => setViewDoc(null)} />}

      {/* Navbar */}
      <header className="border-b border-white/[0.04] bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Clausd<span className="text-accent">.ai</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/draft" className="bg-accent hover:bg-accent-light text-white h-8 px-4 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Document
            </Link>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-none">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{user?.email}</p>
              </div>
              <button onClick={async () => { await logout(); router.push("/"); }} className="text-zinc-500 hover:text-white transition p-1.5">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your legal documents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-[11px] text-zinc-500">Total Documents</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{thisMonth}</p>
                <p className="text-[11px] text-zinc-500">This Month</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold truncate">{topType}</p>
                <p className="text-[11px] text-zinc-500">Most Created</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Your Documents</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="h-9 pl-9 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent w-48 transition"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              {documents.length === 0 ? "No documents yet" : "No results"}
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              {documents.length === 0
                ? "Create your first legal document to get started."
                : "Try a different search term."}
            </p>
            {documents.length === 0 && (
              <Link href="/draft" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
                <Plus className="w-4 h-4" /> Create Document
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => (
              <div key={doc.id} className="glass-card rounded-xl p-5 group hover:border-white/[0.1] transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{doc.type}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">{doc.title}</h3>
                <p className="text-[11px] text-zinc-500 mb-4">{doc.answers_count} questions answered &middot; {doc.template_id} template</p>
                <div className="bg-white/[0.02] rounded-lg p-3 mb-4 border border-white/[0.04] cursor-pointer hover:border-white/[0.08] transition" onClick={() => setViewDoc(doc)}>
                  <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{doc.raw_text.slice(0, 200)}...</p>
                  <p className="text-[9px] text-accent mt-1.5">Click to preview</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewDoc(doc)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition" title="View">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditDoc(doc)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDownload(doc)} className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium transition">
                    <Download className="w-3 h-3" /> Download
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <Link href="/draft" className="rounded-xl border-2 border-dashed border-white/[0.06] hover:border-accent/30 flex flex-col items-center justify-center p-8 text-center transition group min-h-[200px]">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:bg-accent group-hover:text-white transition">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">New Document</p>
              <p className="text-[10px] text-zinc-600 mt-1">Create a new legal document</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
