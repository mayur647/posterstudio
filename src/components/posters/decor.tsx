/**
 * Shared "playful & textured" decoration for the posters: a subtle paper-grain
 * overlay, a motif layer (dots / rings / rays / grid / waves, tinted with the
 * shuffled accent), and sticker-style emoji badges. All of it reads the CSS
 * custom properties set by `styleVars`, so it travels through the headless
 * render pipeline (Puppeteer screenshots the same components) unchanged.
 */
import type { CSSProperties } from "react";

/** Fixed fractal-noise tile — a faint riso/paper grain over the whole poster. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
  "width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence " +
  "type='fractalNoise' baseFrequency='0.85' numOctaves='2' " +
  "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' " +
  "height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Full-bleed paper grain. Drop in as the last child of a poster root. */
export function PosterGrain() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        mixBlendMode: "multiply",
        opacity: 0.06,
        backgroundImage: GRAIN,
        backgroundSize: "140px 140px",
      }}
    />
  );
}

/**
 * Decorative motif layer. Position it inside a `position:relative` parent and
 * keep the real content above it (zIndex ≥ 1). Reads `--ng-motif`.
 */
export function MotifLayer({
  opacity = 1,
  radius = 0,
}: {
  opacity?: number;
  radius?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        borderRadius: radius,
        opacity,
        backgroundImage: "var(--ng-motif)",
        backgroundSize: "var(--ng-motif-size)",
      }}
    />
  );
}

/**
 * Emoji in a playful, slightly-tilted blob badge ringed with the accent —
 * reads like a hand-placed sticker. Used on calendar tiles.
 */
export function Sticker({
  emoji,
  size = 30,
  tilt = -5,
}: {
  emoji: string;
  size?: number;
  tilt?: number;
}) {
  const box = size + 16;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        width: box,
        height: box,
        fontSize: size,
        lineHeight: 1,
        borderRadius: "42% 58% 57% 43% / 55% 44% 56% 45%",
        background: "rgba(255,255,255,.62)",
        border: "2px solid var(--ng-accent,#e08a5f)",
        boxShadow: "0 5px 12px -7px rgba(40,30,15,.55)",
        transform: `rotate(${tilt}deg)`,
      } as CSSProperties}
    >
      {emoji}
    </span>
  );
}

/** Small alternating tilts so a row/grid of stickers feels hand-placed. */
export const STICKER_TILTS = [-6, 5, -3, 6];
