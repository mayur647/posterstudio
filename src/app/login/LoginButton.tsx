"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginButton() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
        setBusy(false);
      }
      // On success the browser redirects to Google.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="inline-flex items-center gap-3 rounded-[30px] bg-ng-dark-btn px-6 py-3.5 font-body text-[15px] font-bold text-ng-card disabled:opacity-50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[12px] font-extrabold text-ng-ink">
          G
        </span>
        {busy ? "Redirecting…" : "Sign in with Google"}
      </button>
      {error && (
        <p className="mt-3 font-mono text-[12px] text-ng-terracotta">{error}</p>
      )}
    </div>
  );
}
