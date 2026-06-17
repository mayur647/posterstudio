/**
 * NomadGao theme system — the 7 curated palettes, font pairings, corner radii,
 * and the default event types. Values are lifted verbatim from the design
 * handoff (README "Design Tokens" + the prototype's palette array).
 *
 * Matcha Studio is the default theme; "Shuffle" rerolls among all palettes.
 */

export type PaletteColor = readonly [bg: string, ink: string];

export interface Palette {
  /** Display name, also the "Palette · {name}" indicator label. */
  name: string;
  /** Header band [background, ink]. */
  header: PaletteColor;
  /** The four calendar tiles, each [background, ink]. */
  tiles: readonly [PaletteColor, PaletteColor, PaletteColor, PaletteColor];
}

export const PALETTES: readonly Palette[] = [
  {
    name: "Matcha Studio",
    header: ["#cdd9a5", "#36431f"],
    tiles: [
      ["#efe7d2", "#5b5230"],
      ["#e7b59a", "#6e4430"],
      ["#b8cccf", "#33545a"],
      ["#ecd98f", "#665119"],
    ],
  },
  {
    name: "Sunset Clay",
    header: ["#f6c3a8", "#6b4030"],
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#f5de9c", "#6a5526"],
      ["#f3c4b1", "#6e4434"],
      ["#b4d6cf", "#325852"],
    ],
  },
  {
    name: "Olive Grove",
    header: ["#bcd3bf", "#3e4f40"],
    tiles: [
      ["#f6c3a8", "#6b4030"],
      ["#f5de9c", "#6a5526"],
      ["#b4d6cf", "#325852"],
      ["#eab69b", "#6e4230"],
    ],
  },
  {
    name: "Golden Hour",
    header: ["#f5de9c", "#6a5526"],
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#f3c4b1", "#6e4434"],
      ["#b4d6cf", "#325852"],
      ["#f6c3a8", "#6b4030"],
    ],
  },
  {
    name: "Coastal Pine",
    header: ["#b4d6cf", "#325852"],
    tiles: [
      ["#f6c3a8", "#6b4030"],
      ["#f5de9c", "#6a5526"],
      ["#bcd3bf", "#3e4f40"],
      ["#f3c4b1", "#6e4434"],
    ],
  },
  {
    name: "Rosewood",
    header: ["#f3c4b1", "#6e4434"],
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#f5de9c", "#6a5526"],
      ["#b4d6cf", "#325852"],
      ["#cdc1e0", "#463a5e"],
    ],
  },
  {
    name: "Sandstone",
    header: ["#ead9b6", "#6a5a32"],
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#eab69b", "#6e4230"],
      ["#b4d6cf", "#325852"],
      ["#cdc1e0", "#463a5e"],
    ],
  },
] as const;

export const DEFAULT_PALETTE = "Matcha Studio";

/** Display + body font pairings the Shuffle rerolls between. */
export const FONT_PAIRS: readonly (readonly [display: string, body: string])[] =
  [
    ["'Bricolage Grotesque'", "'Hanken Grotesk'"],
    ["'Big Shoulders Display'", "'Hanken Grotesk'"],
    ["'Darker Grotesque'", "'Schibsted Grotesk'"],
    ["'Schibsted Grotesk'", "'Hanken Grotesk'"],
  ] as const;

/** Tile corner-radius options (README: 6 / 14 / 24). */
export const CORNER_RADII = {
  Sharp: "6px",
  Balanced: "14px",
  Soft: "24px",
} as const;

export type CornerStyle = keyof typeof CORNER_RADII;
export const DEFAULT_CORNER: CornerStyle = "Balanced";

/**
 * Default event types seeded for the Dharamkot pilot. In the full app these
 * are CRUD rows in the Image Library; the form's type dropdown reads from here
 * (and, later, from any types the CM adds).
 */
export interface EventType {
  /** Stable slug, also the image-library folder key. */
  slug: string;
  /** Human label shown in the dropdown and on posters. */
  name: string;
  /** Calendar-tile emoji. */
  emoji: string;
}

export const DEFAULT_EVENT_TYPES: readonly EventType[] = [
  { slug: "sip", name: "Sip & Paint", emoji: "🎨" },
  { slug: "board", name: "Board Game Night", emoji: "🎲" },
  { slug: "karaoke", name: "Karaoke Night", emoji: "🎤" },
  { slug: "nature", name: "Nature Walk & Cleanup", emoji: "🥾" },
] as const;

export const PALETTE_NAMES = PALETTES.map((p) => p.name);

/**
 * Keyword → emoji table for auto-picking an emoji from an event-type name.
 * Ordered most-specific first; the first matching entry wins. Single-word
 * keywords match on a word-stem basis (so "painting" matches "paint" but
 * "ceramic" does NOT match "mic"); multi-word keywords match as a substring.
 */
const EMOJI_KEYWORDS: readonly (readonly [readonly string[], string])[] = [
  [["paint", "art", "draw", "sketch", "canvas", "mural"], "🎨"],
  [["board", "chess", "card", "domino"], "🎲"],
  [["karaoke"], "🎤"],
  [["open mic", "mic", "spoken word"], "🎙️"],
  [["comedy", "standup", "stand-up"], "😂"],
  [["dance", "salsa", "zumba", "ballroom"], "💃"],
  [["music", "concert", "band", "jam", "acoustic", "gig", "dj"], "🎶"],
  [["yoga", "meditat", "breath", "wellness", "sound bath", "soundbath"], "🧘"],
  [["hike", "trek", "walk", "trail"], "🥾"],
  [["nature", "cleanup", "clean-up", "garden", "plant", "forest", "eco"], "🌿"],
  [["coffee", "cafe", "café", "espresso"], "☕"],
  [["tea", "chai"], "🍵"],
  [["wine", "beer", "drinks", "cocktail", "brew"], "🍷"],
  [["pizza"], "🍕"],
  [["bbq", "barbecue", "grill"], "🍖"],
  [["cook", "bake", "baking", "kitchen"], "🍳"],
  [["food", "dinner", "lunch", "brunch", "feast", "potluck", "supper", "meal", "hotpot"], "🍽️"],
  [["film", "movie", "cinema", "screening"], "🎬"],
  [["book", "read", "poetry", "write", "journal"], "📖"],
  [["quiz", "trivia"], "🧠"],
  [["photo", "photography", "camera"], "📷"],
  [["market", "bazaar", "pop-up", "popup", "flea"], "🛍️"],
  [["bonfire", "campfire", "fire"], "🔥"],
  [["star", "astronom", "stargaz", "cosmos"], "🌌"],
  [["pottery", "clay", "ceramic"], "🏺"],
  [["craft", "diy", "knit", "macrame"], "🧶"],
  [["workshop", "class", "learn", "skill", "seminar", "lecture", "talk"], "🛠️"],
  [["run", "marathon", "fitness", "workout", "gym"], "🏃"],
  [["swim", "pool"], "🏊"],
  [["video game", "gaming", "esport", "console"], "🎮"],
  [["birthday", "anniversary"], "🎂"],
  [["party", "celebration", "festival", "fest", "fiesta"], "🎉"],
  [["meet", "social", "mixer", "networking", "hangout", "community", "gather", "circle"], "🤝"],
] as const;

/** Fallback when nothing matches. */
export const DEFAULT_EVENT_EMOJI = "✨";

/** Picks an on-theme emoji from an event-type name. */
export function emojiForType(name: string): string {
  const lower = name.toLowerCase();
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  for (const [keywords, emoji] of EMOJI_KEYWORDS) {
    for (const k of keywords) {
      const matched = k.includes(" ")
        ? lower.includes(k)
        : tokens.some((t) => t.startsWith(k));
      if (matched) return emoji;
    }
  }
  return DEFAULT_EVENT_EMOJI;
}
