"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveBook } from "../actions";
import { generateSlug } from "@/lib/utils";

interface BookFormProps {
  initialData?: {
    id?: number;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    topics: string[];
    status: "draft" | "published";
    pdfUrl?: string;
  };
  onCancel: () => void;
}

export default function BookForm({ initialData, onCancel }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [topicsInput, setTopicsInput] = useState(initialData?.topics.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData?.id) {
      setSlug(generateSlug(val));
    }
  };

  const coverInputRef = useRef<HTMLInputElement>(null);

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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setLoading(true);
    try {
      const url = await uploadFile(file);
      setCoverImage(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload cover image.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const topics = topicsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "");

    try {
      await saveBook({
        id: initialData?.id,
        title,
        slug,
        description,
        coverImage,
        topics,
        status,
        pdfUrl: pdfUrl || undefined,
      });

      router.push("/admin/books");
      router.refresh();
      onCancel();
    } catch (err: any) {
      setError(err.message || "Failed to save book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border-muted p-6 rounded-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border-muted pb-3">
        <h3 className="font-sans font-bold text-text-primary text-lg">
          {initialData?.id ? "Edit Book Settings" : "Create New Book"}
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
        {/* Cover Image upload loader */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border-muted bg-bg-base/30">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-text-primary">
              Upload Cover Image
            </h4>
            <p className="text-[10px] text-text-secondary">
              Select a cover image to display on the library shelf.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
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
              Attach Book PDF (.pdf)
            </h4>
            <p className="text-[10px] text-text-secondary">
              Select a .pdf document to serve as the main copy of this book.
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
            Book Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
                Cover Image URL
              </label>
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="text-[10px] font-mono text-green-accent hover:underline"
              >
                [Upload Image]
              </button>
            </div>
            <input
              type="text"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
              placeholder="/uploads/images/book-cover.png"
            />
          </div>
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
              placeholder="/uploads/pdfs/book.pdf"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
            Description
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
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
            {loading ? "Saving..." : "Save Book"}
          </button>
        </div>
      </form>
    </div>
  );
}
