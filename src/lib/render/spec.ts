import type { EventType } from "@/lib/theme";
import type { WeekFormPayload } from "@/lib/types";
import type { PosterStyle } from "@/lib/style";

/** Everything needed to render one poster, shared by /api/render and /render. */
export interface RenderSpec {
  kind: "calendar" | "event";
  format: "square" | "story";
  payload: WeekFormPayload;
  eventTypes: EventType[];
  eventIndex?: number;
  seed?: number;
  style?: PosterStyle;
  /** Photo URLs per event-type slug (from the image library). */
  photos?: Record<string, string[]>;
  /** Brand logo URLs. */
  logos?: { nomadgao: string; hotpot: string };
}

/** Preview sizes the poster components render at (px). */
export const SIZES = {
  square: { w: 600, h: 600 },
  story: { w: 480, h: 853 },
} as const;

/** deviceScaleFactor to reach the canonical 1080-wide canvas. */
export function dsfFor(format: "square" | "story"): number {
  // square: 1080/600 = 1.8 → 1080×1080
  // story:  1920/853 ≈ 2.2509 → ~1080×1920
  return format === "square" ? 1080 / 600 : 1920 / 853;
}

export function encodeSpec(spec: RenderSpec): string {
  return Buffer.from(JSON.stringify(spec), "utf8").toString("base64url");
}

export function decodeSpec(encoded: string): RenderSpec {
  return JSON.parse(
    Buffer.from(encoded, "base64url").toString("utf8"),
  ) as RenderSpec;
}
