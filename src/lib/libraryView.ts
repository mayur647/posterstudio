import { DEFAULT_EVENT_TYPES, type EventType } from "@/lib/theme";
import { TYPE_BG } from "@/lib/posterData";
import { LOGO_NOMADGAO, LOGO_HOTPOT } from "@/components/posters/types";

/**
 * The library shaped for the form + posters: event types for the dropdown,
 * photo URLs per type slug (for event backgrounds), and brand logo URLs.
 */
export interface AppLibrary {
  eventTypes: EventType[];
  photos: Record<string, string[]>;
  logos: { nomadgao: string; hotpot: string };
}

/** Used when Supabase isn't configured — bundled defaults keep the app working. */
export const FALLBACK_LIBRARY: AppLibrary = {
  eventTypes: [...DEFAULT_EVENT_TYPES],
  photos: { ...TYPE_BG },
  logos: { nomadgao: LOGO_NOMADGAO, hotpot: LOGO_HOTPOT },
};

interface LibraryResult {
  types: { slug: string; name: string; emoji: string; photos: { url: string }[] }[];
  logos: Record<string, string>;
}

/** Map the DB library (from getLibrary) into the app-facing shape. */
export function toAppLibrary(lib: LibraryResult): AppLibrary {
  const photos: Record<string, string[]> = {};
  for (const t of lib.types) photos[t.slug] = t.photos.map((p) => p.url);
  return {
    eventTypes: lib.types.map((t) => ({
      slug: t.slug,
      name: t.name,
      emoji: t.emoji,
    })),
    photos,
    logos: {
      nomadgao: lib.logos.nomadgao ?? LOGO_NOMADGAO,
      hotpot: lib.logos.hotpot ?? LOGO_HOTPOT,
    },
  };
}
