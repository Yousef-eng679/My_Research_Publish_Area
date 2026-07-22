"use client";

import { useState } from "react";
import PaperForm from "./PaperForm";
import { deletePaper } from "../actions";

interface Citation {
  author: string;
  year: string;
  title: string;
  url?: string;
}

interface ResearchPaper {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  authors: string[];
  body: string;
  citations: unknown; // JSONB
  pdfUrl: string | null;
  doi: string | null;
  citeAs: string | null;
  topics: string[];
  status: "draft" | "published";
  coverImage: string | null;
  readingTimeMinutes: number;
  publishedAt: Date;
}

interface PaperManagerProps {
  initialPapers: ResearchPaper[];
}

export default function PaperManager({ initialPapers }: PaperManagerProps) {
  const [papersList, setPapersList] = useState<ResearchPaper[]>(initialPapers);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, slug: string) => {
    if (!confirm("Are you sure you want to delete this research paper?")) return;
    setDeletingId(id);
    try {
      await deletePaper(id, slug);
      setPapersList(papersList.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete paper.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border-muted pb-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-text-primary">
            Manage Research Papers
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Write academic publications, add bib citations, and upload PDF attachments.
          </p>
        </div>
        {!isCreating && !editingPaper && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 border border-green-accent bg-green-dark/20 text-green-accent rounded text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-all duration-300"
          >
            + Publish New Paper
          </button>
        )}
      </div>

      {isCreating && (
        <PaperForm onCancel={() => setIsCreating(false)} />
      )}

      {editingPaper && (
        <PaperForm
          initialData={{
            id: editingPaper.id,
            title: editingPaper.title,
            slug: editingPaper.slug,
            abstract: editingPaper.abstract,
            authors: editingPaper.authors,
            body: editingPaper.body,
            citations: (editingPaper.citations as Citation[]) || [],
            pdfUrl: editingPaper.pdfUrl || undefined,
            doi: editingPaper.doi || undefined,
            citeAs: editingPaper.citeAs || undefined,
            topics: editingPaper.topics,
            status: editingPaper.status,
            coverImage: editingPaper.coverImage || undefined,
            readingTimeMinutes: editingPaper.readingTimeMinutes,
          }}
          onCancel={() => setEditingPaper(null)}
        />
      )}

      {!isCreating && !editingPaper && (
        <div className="border border-border-muted rounded-xl bg-bg-surface overflow-hidden">
          {papersList.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary font-mono">
              No research papers found. Click "+ Publish New Paper" to upload your first academic work.
            </div>
          ) : (
            <div className="divide-y divide-border-muted">
              {papersList.map((paper) => (
                <div
                  key={paper.id}
                  className="p-6 flex flex-col justify-between sm:flex-row sm:items-center gap-4 hover:bg-bg-hover/30 transition-colors duration-300"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                          paper.status === "published"
                            ? "bg-green-dark/30 border-green-accent/30 text-green-accent"
                            : "bg-bg-base border-border-muted text-text-secondary"
                        }`}
                      >
                        {paper.status}
                      </span>
                      <span className="text-xs text-text-secondary font-mono">
                        {new Date(paper.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-sans font-bold text-text-primary text-base">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-text-secondary">
                      <span>Authors: {paper.authors.join(", ")}</span>
                      {paper.doi && <span>DOI: {paper.doi}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <button
                      onClick={() => setEditingPaper(paper)}
                      className="px-3 py-1.5 border border-border-muted text-text-primary hover:border-green-accent hover:text-green-accent rounded text-xs font-mono transition-colors duration-300"
                    >
                      Edit
                    </button>
                    <button
                      disabled={deletingId === paper.id}
                      onClick={() => handleDelete(paper.id, paper.slug)}
                      className="px-3 py-1.5 border border-red-950/30 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded text-xs font-mono transition-colors duration-300 disabled:opacity-50"
                    >
                      {deletingId === paper.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
