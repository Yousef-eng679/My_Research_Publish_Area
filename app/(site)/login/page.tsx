"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const retryAfter = res.headers.get("Retry-After") || "900";
          throw new Error(data.error || `Too many failed attempts. Try again in ${retryAfter} seconds.`);
        }
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-12">
      {/* Background Radial Glow */}
      <div className="absolute top-[50%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="spotlight-card p-8 bg-bg-surface border border-border-muted rounded-xl shadow-2xl">
          {/* Form Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-green-accent bg-green-dark/30 text-green-accent shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <span className="font-mono text-sm font-bold">AG</span>
            </div>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary">
              Admin Access
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Enter credentials to access the library dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-mono uppercase tracking-wider text-text-secondary"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border-muted bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent transition-colors duration-300"
                placeholder="e.g. admin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-wider text-text-secondary"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border-muted bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-green-accent focus:outline-none focus:ring-1 focus:ring-green-accent transition-colors duration-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex items-center justify-center py-3 rounded-lg border border-green-accent bg-green-dark/20 text-green-accent font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-green-accent hover:text-bg-base transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
