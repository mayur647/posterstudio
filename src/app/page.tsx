import SundayForm from "@/components/SundayForm";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { getLibrary } from "@/lib/db/library";
import { toAppLibrary, FALLBACK_LIBRARY, type AppLibrary } from "@/lib/libraryView";

// Reads the image library per request (event types + photos + logos).
export const dynamic = "force-dynamic";

export default async function Home() {
  let library: AppLibrary = FALLBACK_LIBRARY;
  if (isSupabaseConfigured()) {
    try {
      library = toAppLibrary(await getLibrary());
    } catch {
      library = FALLBACK_LIBRARY;
    }
  }
  return <SundayForm initialLibrary={library} />;
}
