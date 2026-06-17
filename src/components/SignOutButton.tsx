"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function SignOutButton() {
  // Only meaningful when auth is configured.
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;

  async function signOut() {
    try {
      await createSupabaseBrowser().auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ng-mono-muted hover:text-ng-ink"
    >
      Sign out
    </button>
  );
}
