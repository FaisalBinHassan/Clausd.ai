export interface SavedDocument {
  id: string;
  title: string;
  type: string;
  templateId: string;
  createdAt: string;
  rawText: string;
  answersCount: number;
}

const STORAGE_KEY = "clausd_documents";

function getAll(): SavedDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAll(docs: SavedDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function listDocuments(): SavedDocument[] {
  return getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveDocument(doc: Omit<SavedDocument, "id" | "createdAt">): SavedDocument {
  const newDoc: SavedDocument = {
    ...doc,
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const all = getAll();
  all.push(newDoc);
  saveAll(all);
  return newDoc;
}

export function deleteDocument(id: string): void {
  const all = getAll().filter(d => d.id !== id);
  saveAll(all);
}

export function getDocument(id: string): SavedDocument | null {
  return getAll().find(d => d.id === id) || null;
}
