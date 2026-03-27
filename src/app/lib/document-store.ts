import { supabase } from "./supabase";

export interface SavedDocument {
  id: string;
  user_id: string;
  title: string;
  type: string;
  template_id: string;
  created_at: string;
  updated_at: string;
  raw_text: string;
  answers_count: number;
  html_content?: string;
}

// ---- Supabase-backed functions ----

export async function listDocuments(userId: string): Promise<SavedDocument[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing documents:", error);
    // Fallback to localStorage
    return listDocumentsLocal();
  }
  return data || [];
}

export async function saveDocument(
  userId: string,
  doc: {
    title: string;
    type: string;
    templateId: string;
    rawText: string;
    answersCount: number;
    htmlContent?: string;
  }
): Promise<SavedDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: doc.title,
      type: doc.type,
      template_id: doc.templateId,
      raw_text: doc.rawText,
      answers_count: doc.answersCount,
      html_content: doc.htmlContent || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving document:", error);
    // Fallback to localStorage
    return saveDocumentLocal(doc);
  }
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    console.error("Error deleting document:", error);
    deleteDocumentLocal(id);
  }
}

export async function updateDocument(
  id: string,
  updates: Partial<{ title: string; template_id: string; raw_text: string; html_content: string }>
): Promise<SavedDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating document:", error);
    return null;
  }
  return data;
}

export async function getDocument(id: string): Promise<SavedDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting document:", error);
    return null;
  }
  return data;
}

// ---- localStorage fallback (when Supabase not configured) ----

interface LocalDoc {
  id: string;
  title: string;
  type: string;
  templateId: string;
  createdAt: string;
  rawText: string;
  answersCount: number;
}

const STORAGE_KEY = "clausd_documents";

function getLocalAll(): LocalDoc[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function listDocumentsLocal(): SavedDocument[] {
  return getLocalAll()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((d) => ({
      id: d.id,
      user_id: "local",
      title: d.title,
      type: d.type,
      template_id: d.templateId,
      created_at: d.createdAt,
      updated_at: d.createdAt,
      raw_text: d.rawText,
      answers_count: d.answersCount,
    }));
}

function saveDocumentLocal(
  doc: Omit<LocalDoc, "id" | "createdAt">
): SavedDocument {
  const newDoc: LocalDoc = {
    ...doc,
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const all = getLocalAll();
  all.push(newDoc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return {
    id: newDoc.id,
    user_id: "local",
    title: newDoc.title,
    type: newDoc.type,
    template_id: newDoc.templateId,
    created_at: newDoc.createdAt,
    updated_at: newDoc.createdAt,
    raw_text: newDoc.rawText,
    answers_count: newDoc.answersCount,
  };
}

function deleteDocumentLocal(id: string): void {
  const all = getLocalAll().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
