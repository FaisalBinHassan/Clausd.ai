"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Plus, LogOut, Download, Trash2, Clock,
  BarChart3, FolderOpen, ChevronRight, Search,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { listDocuments, deleteDocument, SavedDocument } from "../lib/document-store";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setDocuments(listDocuments());
  }, []);

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setDocuments(listDocuments());
  };

  const handleDownload = (doc: SavedDocument) => {
    const blob = new Blob([doc.rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, "_")}.txt`;
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
    const created = new Date(d.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const typeCounts: Record<string, number> = {};
  documents.forEach(d => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1; });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
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
              <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-none">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{user?.email}</p>
              </div>
              <button onClick={() => { logout(); router.push("/"); }} className="text-zinc-500 hover:text-white transition p-1.5">
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

        {/* Documents grid */}
        {filtered.length === 0 ? (
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
                {/* Type badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{doc.type}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm mb-1 truncate">{doc.title}</h3>
                <p className="text-[11px] text-zinc-500 mb-4">{doc.answersCount} questions answered &middot; {doc.templateId} template</p>

                {/* Preview snippet */}
                <div className="bg-white/[0.02] rounded-lg p-3 mb-4 border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{doc.rawText.slice(0, 200)}...</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(doc)} className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium transition">
                    <Download className="w-3 h-3" /> Download
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* New document card */}
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
