/**
 * NomadGao theme system — green-anchored palettes, font pairings, corner radii,
 * and the default event types.
 *
 * Brand rule: every palette is led by a Matcha-green header so the whole set
 * reads as one identity, while the accent + tile mix rotates so no two looks
 * feel the same. "Shuffle" rerolls palette, fonts, radius, motif and layout —
 * the green thread stays constant. Tuned for a millennial / GenZ / digital-nomad
 * audience: warm, playful, a little editorial, never corporate.
 */

export type PaletteColor = readonly [bg: string, ink: string];

export interface Palette {
  /** Display name, also the "Palette · {name}" indicator label. */
  name: string;
  /** Header band [background, ink] — always a Matcha-green (the brand anchor). */
  header: PaletteColor;
  /** Playful accent used for stickers, motifs and decorative rings. */
  accent: string;
  /** The four calendar tiles, each [background, ink]. */
  tiles: readonly [PaletteColor, PaletteColor, PaletteColor, PaletteColor];
}

export const PALETTES: readonly Palette[] = [
  {
    name: "Matcha Studio",
    header: ["#cdd9a5", "#36431f"],
    accent: "#e08a5f",
    tiles: [
      ["#efe7d2", "#5b5230"],
      ["#e7b59a", "#6e4430"],
      ["#b8cccf", "#33545a"],
      ["#ecd98f", "#665119"],
    ],
  },
  {
    name: "Matcha + Mango",
    header: ["#c6d79f", "#39491f"],
    accent: "#eaa13f",
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#f5cf8a", "#6a5320"],
      ["#f4c3a4", "#6e4632"],
      ["#e9dcc0", "#5d5330"],
    ],
  },
  {
    name: "Sage & Clay",
    header: ["#bcd3bf", "#3e4f40"],
    accent: "#d8795a",
    tiles: [
      ["#cdd9a5", "#414c24"],
      ["#f3c4b1", "#6e4434"],
      ["#ead9b6", "#6a5a32"],
      ["#b4d6cf", "#325852"],
    ],
  },
  {
    name: "Matcha & Berry",
    header: ["#c8d7a3", "#384720"],
    accent: "#a86cae",
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#d9b8de", "#4e3a57"],
      ["#f3c4b1", "#6e4434"],
      ["#ecd98f", "#665119"],
    ],
  },
  {
    name: "Forest & Peach",
    header: ["#aecb9c", "#36461f"],
    accent: "#e8956d",
    tiles: [
      ["#cfe0b4", "#3d4a23"],
      ["#f6c3a8", "#6b4030"],
      ["#b8cccf", "#33545a"],
      ["#efe7d2", "#5b5230"],
    ],
  },
  {
    name: "Matcha & Coast",
    header: ["#c5d6a6", "#39481f"],
    accent: "#3f8e87",
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#b4d6cf", "#325852"],
      ["#f5de9c", "#6a5526"],
      ["#e7b59a", "#6e4430"],
    ],
  },
  {
    name: "Olive & Honey",
    header: ["#c9d3a0", "#414a22"],
    accent: "#d99b2e",
    tiles: [
      ["#bcd3bf", "#3e4f40"],
      ["#ecd98f", "#665119"],
      ["#ead9b6", "#6a5a32"],
      ["#eab69b", "#6e4230"],
    ],
  },
] as const;

export const DEFAULT_PALETTE = "Matcha Studio";

/**
 * Display + body font pairings the Shuffle rerolls between. Bodies stay clean
 * grotesks for legibility; displays range from refined (Bricolage, Schibsted)
 * to loud-and-fun (Unbounded, Big Shoulders) to editorial (Fraunces) so the
 * set never feels monotonous. Every family is loaded in the root layout.
 */
export const FONT_PAIRS: readonly (readonly [display: string, body: string])[] =
  [
    ["'Bricolage Grotesque'", "'Hanken Grotesk'"],
    ["'Unbounded'", "'Hanken Grotesk'"],
    ["'Fraunces'", "'Hanken Grotesk'"],
    ["'Big Shoulders Display'", "'Hanken Grotesk'"],
    ["'Space Grotesk'", "'Hanken Grotesk'"],
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
