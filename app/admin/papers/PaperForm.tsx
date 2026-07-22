"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { savePaper } from "../actions";
import { generateSlug } from "@/lib/utils";
import { parseMarkdownWithFrontmatter } from "@/lib/parser";

interface Citation {
  author: string;
  year: string;
  title: string;
  url?: string;
}

interface PaperFormProps {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    abstract: string;
    authors: string[];
    body: string;
    citations: Citation[];
    pdfUrl?: string;
    doi?: string;
    citeAs?: string;
    topics: string[];
    status: "draft" | "published";
    coverImage?: string;
    readingTimeMinutes?: number;
  };
  onCancel: () => void;
}

export default function PaperForm({ initialData, onCancel }: PaperFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [abstract, setAbstract] = useState(initialData?.abstract || "");
  const [authorsInput, setAuthorsInput] = useState(initialData?.authors.join(", ") || "Admin");
  const [body, setBody] = useState(initialData?.body || "");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");
  const [doi, setDoi] = useState(initialData?.doi || "");
  const [citeAs, setCiteAs] = useState(initialData?.citeAs || "");
  const [topicsInput, setTopicsInput] = useState(initialData?.topics.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [readingTime, setReadingTime] = useState(initialData?.readingTimeMinutes || 0);

  // Dynamic citations array
  const [citations, setCitations] = useState<Citation[]>(initialData?.citations || []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData?.id) {
      setSlug(generateSlug(val));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Read and parse markdown file
  const handleMdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { metadata, body: parsedBody } = parseMarkdownWithFrontmatter(text);
      
      if (metadata.title) setTitle(metadata.title);
      if (metadata.abstract) setAbstract(metadata.abstract);
      if (metadata.topics) setTopicsInput(metadata.topics.join(", "));
      if (metadata.authors) setAuthorsInput(metadata.authors.join(", "));
      if (metadata.doi) setDoi(metadata.doi);
      setBody(parsedBody);
      
      if (!initialData?.id && metadata.title) {
        setSlug(generateSlug(metadata.title));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Upload file API call
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Upload failed");
    }

    const data = await res.json();
    return data.url;
  };

  // Upload PDF and set pdfUrl
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setLoading(true);
    try {
      const url = await uploadFile(file);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload PDF.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // Upload image and insert it
  const handleImageBtnUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await uploadFile(file);
      const imageMarkdown = `\n![${file.name.split(".")[0]}](${url})\n`;

      const textarea = document.getElementById("paper-body-textarea") as HTMLTextAreaElement | null;
      if (textarea) {
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const val = textarea.value;
        const newVal = val.substring(0, selectionStart) + imageMarkdown + val.substring(selectionEnd);
        setBody(newVal);
      } else {
        setBody((prev) => prev + imageMarkdown);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleTextAreaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    e.preventDefault();
    setLoading(true);
    try {
      const url = await uploadFile(file);
      const imageMarkdown = `![${file.name.split(".")[0]}](${url})`;

      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const val = textarea.value;

      const newVal = val.substring(0, selectionStart) + imageMarkdown + val.substring(selectionEnd);
      setBody(newVal);
    } catch (err: any) {
      setError(err.message || "Failed to upload dropped image.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextAreaDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
    }
  };

  const addCitation = () => {
    setCitations([...citations, { author: "", year: "", title: "", url: "" }]);
  };

  const updateCitation = (index: number, field: keyof Citation, value: string) => {
    const updated = [...citations];
    updated[index] = { ...updated[index], [field]: value };
    setCitations(updated);
  };

  const removeCitation = (index: number) => {
    setCitations(citations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const topics = topicsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "");

    const authors = authorsInput
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a !== "");

    // Filter citations to make sure they have a title and author
    const validCitations = citations
      .map((c) => ({
        author: c.author.trim(),
        year: c.year.trim(),
        title: c.title.trim(),
        url: c.url?.trim() || undefined,
      }))
      .filter((c) => c.title !== "" && c.author !== "");

    try {
      await savePaper({
        id: initialData?.id,
        title,
        slug,
        abstract,
        authors,
        body,
        citations: validCitations,
        pdfUrl: pdfUrl || undefined,
        doi: doi || undefined,
        citeAs: citeAs || undefined,
        topics,
        status,
        coverImage: coverImage || undefined,
        readingTimeMinutes: readingTime > 0 ? readingTime : undefined,
      });

      router.push("/admin/papers");
      router.refresh();
      onCancel();
    } catch (err: any) {
      setError(err.message || "Failed to save research paper.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-muted p-6 rounded-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border-muted pb-3">
        <h3 className="font-sans font-bold text-text-primary text-lg">
          {initialData?.id ? "Edit Research Paper" : "Publish New Research Paper"}
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-mono text-text-secondary hover:text-text-primary"
        >
          [Cancel]
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* File Upload / Import Panel */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* MD file upload loader */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border-muted bg-bg-base/30">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-text-primary">
              Import Markdown (.md)
            </h4>
            <p className="text-[10px] text-text-secondary">
              Select an .md file to automatically fill in the title, abstract, authors, and body.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".md"
              onChange={handleMdUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded border border-border-muted text-xs font-mono hover:border-green-accent hover:text-green-accent transition-colors duration-300"
            >
              Choose File
            </button>
          </div>
        </div>

        {/* PDF file upload loader */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border-muted bg-bg-base/30">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-text-primary">
              Attach PDF Document (.pdf)
            </h4>
            <p className="text-[10px] text-text-secondary">
              Select a .pdf document to serve as the main publication copy of this work.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={pdfInputRef}
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="px-3 py-1.5 rounded border border-border-muted text-xs font-mono hover:border-green-accent hover:text-green-accent transition-colors duration-300"
            >
              Choose File
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Paper Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="Paper title..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Slug */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            />
          </div>

          {/* Authors */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Authors (comma-separated)
            </label>
            <input
              type="text"
              required
              value={authorsInput}
              onChange={(e) => setAuthorsInput(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            />
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Abstract
          </label>
          <textarea
            required
            rows={3}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="Executive summary of the research..."
          />
        </div>

        {/* Body (Markdown) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Main Paper Body (Markdown with sections)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageBtnUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-2.5 py-1 text-[10px] font-mono border border-border-muted rounded text-text-secondary hover:border-green-accent hover:text-green-accent transition-colors duration-300"
              >
                + Upload & Insert Image
              </button>
              <span className="text-[9px] font-mono text-text-secondary hidden sm:inline">
                (or drag & drop images below)
              </span>
            </div>
          </div>
          <textarea
            id="paper-body-textarea"
            required
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onDrop={handleTextAreaDrop}
            onDragOver={handleTextAreaDragOver}
            className="w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary font-mono focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="## 1. Introduction&#10;Write content here..."
          />
        </div>

        {/* Citation Auto-Generator helper settings */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
                PDF File URL (optional)
              </label>
              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="text-[10px] font-mono text-green-accent hover:underline"
              >
                [Upload PDF]
              </button>
            </div>
            <input
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className="w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
              placeholder="e.g. /uploads/pdfs/paper-123.pdf"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              DOI (optional)
            </label>
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
              placeholder="e.g. 10.1000/xyz123"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Cite As string (APA template)
            </label>
            <input
              type="text"
              value={citeAs}
              onChange={(e) => setCiteAs(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
              placeholder="Leave blank for auto-generation"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Topics */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Dynamic Citation List Editor */}
        <div className="border-t border-border-muted pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Bibliography / Citations
            </label>
            <button
              type="button"
              onClick={addCitation}
              className="px-2 py-1 border border-green-accent/30 bg-green-dark/10 text-green-accent text-[10px] font-mono hover:bg-green-dark/30 rounded"
            >
              + Add Reference
            </button>
          </div>

          <div className="space-y-3">
            {citations.map((citation, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-5 items-end border border-border-muted/50 p-3 rounded bg-bg-base"
              >
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-mono text-text-secondary">Author(s)</span>
                  <input
                    type="text"
                    required
                    value={citation.author}
                    onChange={(e) => updateCitation(index, "author", e.target.value)}
                    className="w-full rounded border border-border-muted bg-bg-surface px-2 py-1 text-xs text-text-primary"
                    placeholder="e.g. Smith, J."
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-text-secondary">Year</span>
                  <input
                    type="text"
                    required
                    value={citation.year}
                    onChange={(e) => updateCitation(index, "year", e.target.value)}
                    className="w-full rounded border border-border-muted bg-bg-surface px-2 py-1 text-xs text-text-primary"
                    placeholder="e.g. 2026"
                  />
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-mono text-text-secondary">Title</span>
                  <input
                    type="text"
                    required
                    value={citation.title}
                    onChange={(e) => updateCitation(index, "title", e.target.value)}
                    className="w-full rounded border border-border-muted bg-bg-surface px-2 py-1 text-xs text-text-primary"
                    placeholder="Title of work..."
                  />
                </div>
                <div className="sm:col-span-4">
                  <span className="text-[10px] font-mono text-text-secondary">URL / Link (optional)</span>
                  <input
                    type="text"
                    value={citation.url || ""}
                    onChange={(e) => updateCitation(index, "url", e.target.value)}
                    className="w-full rounded border border-border-muted bg-bg-surface px-2 py-1 text-xs text-text-primary"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeCitation(index)}
                    className="px-2 py-1 text-xs font-mono text-red-400 border border-red-950/30 hover:bg-red-950/20 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {citations.length === 0 && (
              <p className="text-[10px] font-mono text-text-secondary italic text-center py-2">
                No citations added yet.
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 border-t border-border-muted pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border-muted rounded text-xs font-mono hover:bg-bg-hover transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-green-accent bg-green-dark/20 text-green-accent rounded text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Paper"}
          </button>
        </div>
      </form>
    </div>
  );
}
