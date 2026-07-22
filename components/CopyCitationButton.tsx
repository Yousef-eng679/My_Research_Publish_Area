"use client";

import { useState } from "react";

interface CopyCitationButtonProps {
  text: string;
}

export default function CopyCitationButton({ text }: CopyCitationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border text-xs font-mono transition-all duration-300 ${
        copied
          ? "border-green-accent bg-green-dark/30 text-green-accent scale-[0.98]"
          : "border-border-muted bg-bg-surface text-text-secondary hover:border-green-accent hover:text-green-accent"
      }`}
    >
      {copied ? (
        <>
          <svg
            className="h-3 w-3 animate-ping"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          <span>Copy Citation</span>
        </>
      )}
    </button>
  );
}
