"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveChapter } from "../actions";
import { generateSlug } from "@/lib/utils";
import { parseMarkdownWithFrontmatter } from "@/lib/parser";

interface ChapterFormProps {
  bookId: number;
  bookSlug: string;
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    body: string;
    orderIndex: number;
    status: "draft" | "published";
    pdfUrl?: string;
  };
  onCancel: () => void;
}

export default function ChapterForm({ bookId, bookSlug, initialData, onCancel }: ChapterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [orderIndex, setOrderIndex] = useState(initialData?.orderIndex || 1);
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");

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
      if (metadata.pdfUrl) setPdfUrl(metadata.pdfUrl);
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

      const textarea = document.getElementById("chapter-body-textarea") as HTMLTextAreaElement | null;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await saveChapter({
        id: initialData?.id,
        bookId,
        bookSlug,
        title,
        slug,
        body,
        orderIndex,
        status,
        pdfUrl: pdfUrl || undefined,
      });

      router.push("/admin/books");
      router.refresh();
      onCancel();
    } catch (err: any) {
      setError(err.message || "Failed to save chapter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-muted p-6 rounded-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border-muted pb-3">
        <h3 className="font-sans font-bold text-text-primary text-lg">
          {initialData?.id ? "Edit Chapter" : "Add Chapter"}
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
              Select an .md file to automatically fill in the title and body content.
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
              Select a .pdf document to serve as the main publication copy of this chapter.
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
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Chapter Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
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

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Order Index
            </label>
            <input
              type="number"
              required
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            />
          </div>
        </div>

        {/* Body (Markdown) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
              Chapter Content (Markdown)
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
            id="chapter-body-textarea"
            required
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onDrop={handleTextAreaDrop}
            onDragOver={handleTextAreaDragOver}
            className="w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary font-mono focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
            placeholder="# Chapter Heading..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* PDF File URL & Uploader */}
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
              placeholder="/uploads/pdfs/chapter.pdf"
            />
          </div>
        </div>

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
            {loading ? "Saving..." : "Save Chapter"}
          </button>
        </div>
      </form>
    </div>
  );
}
