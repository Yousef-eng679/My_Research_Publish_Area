"use client";

import { useEffect } from "react";

interface TrackProgressProps {
  bookSlug: string;
  chapterSlug: string;
}

export default function TrackProgress({ bookSlug, chapterSlug }: TrackProgressProps) {
  useEffect(() => {
    try {
      localStorage.setItem(`last_read_${bookSlug}`, chapterSlug);
    } catch (err) {
      console.error("Failed to write reading progress to localStorage:", err);
    }
  }, [bookSlug, chapterSlug]);

  return null; // Invisible component
}
