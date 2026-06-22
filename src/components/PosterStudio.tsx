"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventType } from "@/lib/theme";
import type { WeekFormPayload } from "@/lib/types";
import {
  defaultStyle,
  shuffleStyle,
  styleVars,
  type PosterStyle,
} from "@/lib/style";

// Per-tab key for the current studio look, so the shuffled palette/fonts/motif
// survive tab switches and reloads alongside the open week.
const STUDIO_STYLE_KEY = "ng:studio-style";
import {
  calendarCaption,
  eventCaption,
  type CaptionEvent,
} from "@/lib/captions";
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
  const [capIdx, setCapIdx] = useState<Record<string, number>>({});
  // AI-generated caption variants appended per subject (beyond the templates).
  const [extra, setExtra] = useState<Record<string, string[]>>({});
  const [capBusy, setCapBusy] = useState<string | null>(null);
  // Per-subject provenance of the last caption fetch (openai vs template + why),
  // so the CM can see whether a live AI caption was actually produced.
  const [capMeta, setCapMeta] = useState<
    Record<string, { source?: string; reason?: string; sources?: string[] }>
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  // Caption variant sets, rebuilt only when the week data changes.
  const calVariants = useMemo(() => {
    const evs: CaptionEvent[] = payload.events.map((e) => ({
      emoji: emoji(e.typeSlug),
      name: e.name,
      date: e.date,
      time: e.time,
      price: e.price,
      location: e.location,
      description: e.description,
    }));
    return calendarCaption(evs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const eventVariants = useMemo(
    () =>
      payload.events.map((e) =>
        eventCaption({
          emoji: emoji(e.typeSlug),
          name: e.name,
          date: e.date,
          time: e.time,
          price: e.price,
          location: e.location,
          description: e.description,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payload],
  );

  // Instant caption shown before any regeneration; Refresh calls Claude.
  const calBase = [calVariants[0]];

  function shuffle() {
    setStyle(shuffleStyle());
    setSeed((s) => s + 1);
  }

  /** Template variants for the subject plus any AI-generated ones. */
  function combined(key: string, base: string[]): string[] {
    return [...base, ...(extra[key] ?? [])];
  }

  function captionText(key: string, base: string[]): string {
    const list = combined(key, base);
    return list[(capIdx[key] ?? 0) % list.length];
  }

  /**
   * Refresh cycles loaded variants; once they're exhausted it regenerates a
   * fresh batch via Claude (/api/caption), falling back to cycling on error.
   */
  async function refresh(
    key: string,
    base: string[],
    spec: { kind: "calendar" | "event"; eventIndex?: number },
  ) {
    const list = combined(key, base);
    const cur = capIdx[key] ?? 0;
    if (cur + 1 < list.length) {
      setCapIdx((m) => ({ ...m, [key]: cur + 1 }));
      return;
    }
    if (capBusy) return;
    setCapBusy(key);
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...spec, payload, eventTypes, count: 3 }),
      });
      if (!res.ok) throw new Error("caption request failed");
      const data = await res.json();
      setCapMeta((m) => ({
        ...m,
        [key]: { source: data?.source, reason: data?.reason, sources: data?.sources },
      }));
      const fresh: unknown = data?.variants;
      if (Array.isArray(fresh) && fresh.every((v) => typeof v === "string") && fresh.length > 0) {
        // Advance to the first fetched variant that differs from what's shown
        // (the template fallback repeats variant 0, which is the instant one).
        const currentText = list[cur % list.length];
        const merged = [...list, ...(fresh as string[])];
        let target = list.length;
        while (target < merged.length && merged[target] === currentText) target++;
        if (target >= merged.length) target = list.length;
        setExtra((m) => ({ ...m, [key]: [...(m[key] ?? []), ...(fresh as string[])] }));
        setCapIdx((m) => ({ ...m, [key]: target }));
      } else {
        setCapIdx((m) => ({ ...m, [key]: cur + 1 }));
      }
    } catch (err) {
      console.error(err);
      setCapIdx((m) => ({ ...m, [key]: cur + 1 })); // cycle templates on error
    } finally {
      setCapBusy(null);
    }
  }

  /** Copy a ready-made claude.ai prompt and open the chat in a new tab. Free —
   *  the CM runs it on their own Claude subscription, no API cost. */
  function copyPrompt(key: string, text: string) {
    try {
      navigator.clipboard?.writeText(text).catch(() => fallbackCopy(text));
    } catch {
      fallbackCopy(text);
    }
    window.open("https://claude.ai/new", "_blank", "noopener,noreferrer");
    setPromptCopiedId(key);
    window.setTimeout(() => setPromptCopiedId(null), 2500);
  }

  function copy(key: string, text: string) {
    const flag = () => {
      setCopiedId(key);
      window.setTimeout(() => setCopiedId(null), 1800);
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
          <CaptionCard
            label="WEEKLY LINEUP CAPTION"
            text={captionText("calendar", calBase)}
            copied={copiedId === "calendar"}
            loading={capBusy === "calendar"}
            onCopy={() => copy("calendar", captionText("calendar", calBase))}
            onRefresh={() => refresh("calendar", calBase, { kind: "calendar" })}
            meta={capMeta["calendar"]}
            promptCopied={promptCopiedId === "calendar"}
            onCopyPrompt={() =>
              copyPrompt("calendar", buildClaudePrompt("calendar", payload, eventTypes))
            }
          />
        </Section>

        {/* One set per event */}
        {payload.events.map((e, i) => {
          const key = `event-${i}`;
          const ev = buildEventProps(e, seed, photos);
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
              <CaptionCard
                label="EVENT CAPTION"
                text={captionText(key, [eventVariants[i][0]])}
                copied={copiedId === key}
                loading={capBusy === key}
                onCopy={() => copy(key, captionText(key, [eventVariants[i][0]]))}
                onRefresh={() =>
                  refresh(key, [eventVariants[i][0]], {
                    kind: "event",
                    eventIndex: i,
                  })
                }
                meta={capMeta[key]}
                promptCopied={promptCopiedId === key}
                onCopyPrompt={() =>
                  copyPrompt(key, buildClaudePrompt("event", payload, eventTypes, i))
                }
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

function CaptionCard({
  label,
  text,
  copied,
  loading,
  onCopy,
  onRefresh,
  meta,
  promptCopied,
  onCopyPrompt,
}: {
  label: string;
  text: string;
  copied: boolean;
  loading?: boolean;
  onCopy: () => void;
  onRefresh: () => void;
  meta?: { source?: string; reason?: string; sources?: string[] };
  promptCopied?: boolean;
  onCopyPrompt?: () => void;
}) {
  return (
    <div className="w-full max-w-[430px] rounded-[20px] border border-ng-border bg-white p-6 shadow-[0_24px_56px_-34px_rgba(60,40,20,0.4)] lg:w-[430px]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.1em] text-ng-mono-muted">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[30px] border border-ng-border-2 bg-white px-4 py-2.5 font-body text-[13.5px] font-bold text-ng-muted disabled:opacity-50"
          >
            {loading ? "✨ Writing…" : "🔄 Refresh"}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-[30px] bg-ng-dark-btn px-[18px] py-2.5 font-body text-[13.5px] font-bold text-ng-card"
          >
            📋 {copied ? "Copied ✓" : "Copy caption"}
          </button>
        </div>
      </div>
      {meta?.source && (
        <div className="mb-2.5 font-mono text-[10px] leading-[1.5] tracking-[0.04em] text-ng-mono-muted">
          {meta.source === "claude" || meta.source === "openai"
            ? `✨ Researched & written by ${meta.source === "claude" ? "Claude" : "OpenAI"}${
                meta.sources?.length
                  ? ` · ${meta.sources.length} source${meta.sources.length === 1 ? "" : "s"}`
                  : ""
              }`
            : `📝 Built-in template${meta.reason ? ` — AI off: ${meta.reason}` : ""}`}
        </div>
      )}
      <div className="whitespace-pre-line rounded-[14px] border border-[#f0e3d0] bg-ng-card px-5 py-[18px] font-body text-[14px] leading-[1.6] text-ng-ink-3">
        {text}
      </div>
      {onCopyPrompt && (
        <div className="mt-3.5 border-t border-[#f0e3d0] pt-3.5">
          <button
            type="button"
            onClick={onCopyPrompt}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[30px] border border-ng-border-2 bg-white px-4 py-2.5 font-body text-[13px] font-bold text-ng-muted"
          >
            {promptCopied
              ? "✓ Prompt copied — paste it into claude.ai"
              : "✦ Write with claude.ai (free)"}
          </button>
          <p className="mt-1.5 text-center font-mono text-[10px] leading-[1.5] text-ng-mono-muted">
            Copies a research-ready prompt &amp; opens claude.ai — runs on your
            Claude plan, no API cost. Paste the result back.
          </p>
        </div>
      )}
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
