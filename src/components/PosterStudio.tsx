"use client";

import { useEffect, useState } from "react";
import type { EventType } from "@/lib/theme";
import type { WeekFormPayload } from "@/lib/types";
import {
  defaultStyle,
  shuffleStyle,
  styleVars,
  type PosterStyle,
} from "@/lib/style";
import { buildClaudePrompt } from "@/lib/captionPrompt";
import {
  CAL_TITLE,
  buildCalendarTiles,
  buildEventProps,
  calendarRange,
  emojiFor,
} from "@/lib/posterData";
import ScreenNav from "@/components/ScreenNav";
import ScaledPoster from "@/components/ScaledPoster";
import BrandMark from "@/components/BrandMark";
import CalendarSquare from "@/components/posters/CalendarSquare";
import CalendarStory from "@/components/posters/CalendarStory";
import EventSquare from "@/components/posters/EventSquare";
import EventStory from "@/components/posters/EventStory";

// Per-tab key for the current studio look, so the shuffled palette/fonts/motif
// survive tab switches and reloads alongside the open week.
const STUDIO_STYLE_KEY = "ng:studio-style";

export default function PosterStudio({
  payload,
  eventTypes,
  photos,
  logos,
  onEdit,
}: {
  payload: WeekFormPayload;
  eventTypes: EventType[];
  photos: Record<string, string[]>;
  logos: { nomadgao: string; hotpot: string };
  onEdit: () => void;
}) {
  const [style, setStyle] = useState(defaultStyle());
  const [seed, setSeed] = useState(0);
  const [promptCopiedId, setPromptCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [styleReady, setStyleReady] = useState(false);
  // Note: per-week state resets via a `key` on this component in SundayForm,
  // which remounts it when a new week is generated.

  // Restore the last shuffled look so it survives navigation / reload. Guarded
  // against older saved shapes that predate the accent/motif fields.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STUDIO_STYLE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { style?: PosterStyle; seed?: number };
        const s = saved.style;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (s && s.palette && s.fonts && s.accent && s.motif) setStyle(s);
        if (typeof saved.seed === "number") setSeed(saved.seed);
      }
    } catch {
      /* ignore malformed / unavailable storage */
    }
    setStyleReady(true);
  }, []);

  // Persist the look on every change once restore has run.
  useEffect(() => {
    if (!styleReady) return;
    try {
      sessionStorage.setItem(STUDIO_STYLE_KEY, JSON.stringify({ style, seed }));
    } catch {
      /* storage may be unavailable */
    }
  }, [style, seed, styleReady]);

  const emoji = (slug: string) => emojiFor(eventTypes, slug);
  const tiles = buildCalendarTiles(payload, eventTypes);
  const range = calendarRange(payload);
  const calPrompt = buildClaudePrompt("calendar", payload, eventTypes);

  function shuffle() {
    setStyle(shuffleStyle());
    setSeed((s) => s + 1);
  }

  /** Copy a caption-generation prompt to the clipboard. */
  function copyPrompt(key: string, text: string) {
    const flag = () => {
      setPromptCopiedId(key);
      window.setTimeout(() => setPromptCopiedId(null), 1800);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(flag).catch(() => {
        fallbackCopy(text);
        flag();
      });
    } else {
      fallbackCopy(text);
      flag();
    }
  }

  async function download(
    spec: { kind: "calendar" | "event"; format: "square" | "story"; eventIndex?: number },
    filename: string,
  ) {
    if (busy) return;
    setBusy(filename);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...spec,
          filename,
          payload,
          eventTypes,
          photos,
          logos,
          seed,
          style,
        }),
      });
      if (!res.ok) throw new Error("render failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="pt-10">
        <ScreenNav active="studio" />
      </div>
      <div style={styleVars(style)} className="min-h-screen px-6 pb-12 pt-8 sm:px-14">
      <div className="mx-auto max-w-[1580px]">
        {/* Top bar */}
        <header className="mb-9">
          <div className="mb-4 flex items-center gap-3">
            <BrandMark logos={logos} />
            <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-ng-mono-muted">
              Dharamkot pilot
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-[40px] font-extrabold leading-[1.02] text-ng-ink">
              Poster studio
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-[30px] border border-ng-border-2 bg-white px-5 py-3 font-body text-[14px] font-bold text-ng-muted"
              >
                ← Edit the week
              </button>
              <button
                type="button"
                onClick={shuffle}
                className="inline-flex items-center gap-2 rounded-[30px] bg-ng-dark-btn px-5 py-3 font-body text-[15px] font-bold text-ng-card"
              >
                🎲 Shuffle theme
              </button>
              <span className="font-mono text-[12px] tracking-[0.08em] text-ng-mono-muted">
                Palette · {style.palette.name}
              </span>
            </div>
          </div>
        </header>

        {/* Weekly calendar */}
        <Section eyebrow="Output · Weekly calendar" heading="Weekly Calendar">
          <PosterColumn label="SQUARE · 1:1">
            <ScaledPoster width={600} height={600}>
              <CalendarSquare
                id="cal-square"
                title={CAL_TITLE}
                dateRange={range}
                tiles={tiles}
                logos={logos}
              />
            </ScaledPoster>
            <DownloadButton
              busy={busy === "nomadgao-weekly-calendar-1x1.png"}
              onClick={() =>
                download(
                  { kind: "calendar", format: "square" },
                  "nomadgao-weekly-calendar-1x1.png",
                )
              }
            />
          </PosterColumn>
          <PosterColumn label="STORY · 9:16">
            <ScaledPoster width={480} height={853}>
              <CalendarStory
                id="cal-story"
                title={CAL_TITLE}
                dateRange={range}
                tiles={tiles}
                logos={logos}
              />
            </ScaledPoster>
            <DownloadButton
              busy={busy === "nomadgao-weekly-calendar-story.png"}
              onClick={() =>
                download(
                  { kind: "calendar", format: "story" },
                  "nomadgao-weekly-calendar-story.png",
                )
              }
            />
          </PosterColumn>
          <PromptCard
            label="WEEKLY LINEUP · CAPTION PROMPT"
            prompt={calPrompt}
            copied={promptCopiedId === "calendar"}
            onCopy={() => copyPrompt("calendar", calPrompt)}
          />
        </Section>

        {/* One set per event */}
        {payload.events.map((e, i) => {
          const key = `event-${i}`;
          const ev = buildEventProps(e, seed, photos);
          const evPrompt = buildClaudePrompt("event", payload, eventTypes, i);
          return (
            <Section
              key={key}
              eyebrow={`Output · Event ${i + 1}`}
              heading={`${emoji(e.typeSlug)} ${e.name}`}
            >
              <PosterColumn label="SQUARE · 1:1">
                <ScaledPoster width={600} height={600}>
                  <EventSquare id={`${key}-square`} {...ev} logos={logos} />
                </ScaledPoster>
                <DownloadButton
                  busy={busy === `nomadgao-${slug(e.name)}-1x1.png`}
                  onClick={() =>
                    download(
                      { kind: "event", format: "square", eventIndex: i },
                      `nomadgao-${slug(e.name)}-1x1.png`,
                    )
                  }
                />
              </PosterColumn>
              <PosterColumn label="STORY · 9:16">
                <ScaledPoster width={480} height={853}>
                  <EventStory id={`${key}-story`} {...ev} logos={logos} />
                </ScaledPoster>
                <DownloadButton
                  busy={busy === `nomadgao-${slug(e.name)}-story.png`}
                  onClick={() =>
                    download(
                      { kind: "event", format: "story", eventIndex: i },
                      `nomadgao-${slug(e.name)}-story.png`,
                    )
                  }
                />
              </PosterColumn>
              <PromptCard
                label="EVENT · CAPTION PROMPT"
                prompt={evPrompt}
                copied={promptCopiedId === key}
                onCopy={() => copyPrompt(key, evPrompt)}
              />
            </Section>
          );
        })}
      </div>
      </div>
    </div>
  );
}

/* ---------- small presentational helpers ---------- */

function Section({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="mb-7 flex flex-col gap-2 border-t border-[#cfc8b9] pt-6">
        <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-ng-terracotta">
          {eyebrow}
        </span>
        <h2 className="font-display text-[32px] font-extrabold text-ng-ink">
          {heading}
        </h2>
      </div>
      <div className="flex flex-col gap-9 lg:flex-row lg:flex-wrap lg:items-start">
        {children}
      </div>
    </section>
  );
}

function PosterColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3.5">
        <span className="font-mono text-[11px] tracking-[0.14em] text-ng-mono-muted">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function DownloadButton({
  onClick,
  busy,
}: {
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="mt-3.5 inline-flex items-center gap-2 rounded-[30px] bg-ng-dark-btn px-[18px] py-2.5 font-body text-[13.5px] font-bold text-ng-card disabled:opacity-50"
    >
      {busy ? "⏳ Rendering…" : "⤓ Download PNG"}
    </button>
  );
}

/** The week's/event's caption-generation prompt, copy-ready for any AI chat. */
function PromptCard({
  label,
  prompt,
  copied,
  onCopy,
}: {
  label: string;
  prompt: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="w-full max-w-[430px] rounded-[20px] border border-ng-border bg-white p-6 shadow-[0_24px_56px_-34px_rgba(60,40,20,0.4)] lg:w-[430px]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.1em] text-ng-mono-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-[30px] bg-ng-dark-btn px-[18px] py-2.5 font-body text-[13.5px] font-bold text-ng-card"
        >
          📋 {copied ? "Copied ✓" : "Copy prompt"}
        </button>
      </div>
      <p className="mb-3 font-body text-[13px] leading-[1.5] text-ng-muted-2">
        Paste this into your AI chat (Claude, ChatGPT…) to write the caption — it
        researches the brands and returns ready-to-post options.
      </p>
      <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap rounded-[14px] border border-[#f0e3d0] bg-ng-card px-4 py-3.5 font-mono text-[11.5px] leading-[1.55] text-ng-ink-3">
        {prompt}
      </pre>
    </div>
  );
}

/* ---------- utils ---------- */

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "event"
  );
}

function fallbackCopy(text: string) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    document.execCommand("copy");
    ta.remove();
  } catch {
    /* no-op */
  }
}
