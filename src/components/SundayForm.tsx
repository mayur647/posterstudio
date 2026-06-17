"use client";

import { useRef, useState } from "react";
import {
  PALETTE_NAMES,
  DEFAULT_PALETTE,
  emojiForType,
  type EventType,
} from "@/lib/theme";
import type { EventDraft, WeekFormPayload } from "@/lib/types";
import type { AppLibrary } from "@/lib/libraryView";
import PosterStudio from "@/components/PosterStudio";
import ScreenNav from "@/components/ScreenNav";

const DEFAULT_LOCATION = "NomadGao Rooftop, Dharamkot";

// Sentinel value for the "add a new type" option in the type dropdown.
const ADD_TYPE = "__add__";

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const labelCls =
  "block font-mono text-[11px] tracking-[0.14em] uppercase text-ng-mono-muted mb-2";
const inputBase =
  "rounded-xl border border-ng-border-2 bg-white px-4 py-3 text-[15px] text-ng-ink outline-none transition-colors focus:border-ng-terracotta";
const inputCls = `w-full ${inputBase}`;
const errorCls = "mt-1.5 font-mono text-[11px] text-ng-terracotta";

function emptyEvent(id: string): EventDraft {
  return {
    id,
    name: "",
    typeSlug: "",
    date: "",
    time: "",
    location: DEFAULT_LOCATION,
    price: "",
    description: "",
  };
}

interface EventErrors {
  name?: string;
  typeSlug?: string;
  date?: string;
}

interface FormErrors {
  startDate?: string;
  endDate?: string;
  events: Record<string, EventErrors>;
}

export default function SundayForm({
  initialLibrary,
}: {
  initialLibrary: AppLibrary;
}) {
  // Deterministic seed id so server and client render the same markup.
  const [events, setEvents] = useState<EventDraft[]>([emptyEvent("e0")]);
  const [week, setWeek] = useState({
    startDate: "",
    endDate: "",
    theme: DEFAULT_PALETTE,
  });
  const [errors, setErrors] = useState<FormErrors>({ events: {} });
  const [submitted, setSubmitted] = useState<WeekFormPayload | null>(null);
  // Bumped on each generate so the studio remounts (and resets) per week.
  const [genId, setGenId] = useState(0);
  // Event types are shared across every event's dropdown, so a type added on
  // one event is immediately selectable on the others. Seeded from the pilot
  // defaults; in the full app this list also comes from the Image Library.
  const [eventTypes, setEventTypes] = useState<EventType[]>(
    initialLibrary.eventTypes,
  );
  const nextId = useRef(1);

  function addEvent() {
    setEvents((prev) => [...prev, emptyEvent(`e${nextId.current++}`)]);
  }

  function localSlug(trimmed: string): string {
    const base = slugify(trimmed) || `type-${eventTypes.length + 1}`;
    const existing = new Set(eventTypes.map((t) => t.slug));
    let slug = base;
    let n = 2;
    while (existing.has(slug)) slug = `${base}-${n++}`;
    return slug;
  }

  /**
   * Creates a new event type and returns its slug. Persists to the image
   * library (so it gets a photo repository); if Supabase isn't configured the
   * server falls back and we add it locally. Emoji is auto-picked from the name.
   */
  async function addEventType(name: string): Promise<string> {
    const trimmed = name.trim();
    try {
      const res = await fetch("/api/library/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const { type } = await res.json();
        setEventTypes((prev) =>
          prev.some((t) => t.slug === type.slug)
            ? prev
            : [...prev, { slug: type.slug, name: type.name, emoji: type.emoji }],
        );
        return type.slug;
      }
    } catch {
      /* fall through to local-only */
    }
    const slug = localSlug(trimmed);
    setEventTypes((prev) => [
      ...prev,
      { slug, name: trimmed, emoji: emojiForType(trimmed) },
    ]);
    return slug;
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEvent(id: string, patch: Partial<EventDraft>) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function validate(): FormErrors | null {
    const next: FormErrors = { events: {} };
    let ok = true;

    if (!week.startDate) {
      next.startDate = "Required";
      ok = false;
    }
    if (!week.endDate) {
      next.endDate = "Required";
      ok = false;
    }
    if (week.startDate && week.endDate && week.endDate < week.startDate) {
      next.endDate = "End date is before start date";
      ok = false;
    }

    for (const e of events) {
      const ee: EventErrors = {};
      if (!e.name.trim()) ee.name = "Required";
      if (!e.typeSlug) ee.typeSlug = "Pick a type";
      if (!e.date) ee.date = "Required";
      if (ee.name || ee.typeSlug || ee.date) {
        next.events[e.id] = ee;
        ok = false;
      }
    }

    return ok ? null : next;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const problems = validate();
    if (problems) {
      setErrors(problems);
      setSubmitted(null);
      return;
    }
    setErrors({ events: {} });
    const payload: WeekFormPayload = {
      week,
      events: events.map((e) => ({
        name: e.name,
        typeSlug: e.typeSlug,
        date: e.date,
        time: e.time,
        location: e.location,
        price: e.price,
        description: e.description,
      })),
    };
    // Next build phase: POST to /api/weeks → persist + kick off poster/caption
    // generation. For now we surface the typed payload so it can be verified.
    setSubmitted(payload);
    setGenId((g) => g + 1);
    // Persist the week (best-effort; non-blocking, no-ops if Supabase is off).
    void fetch("/api/weeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  if (submitted) {
    return (
      <PosterStudio
        key={genId}
        payload={submitted}
        eventTypes={eventTypes}
        photos={initialLibrary.photos}
        logos={initialLibrary.logos}
        onEdit={() => setSubmitted(null)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-10">
        <ScreenNav active="studio" />
      </div>
      <div className="px-6 pb-16 pt-8 sm:px-14">
      <div className="mx-auto max-w-[860px]">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#e89f7e] font-display text-[18px] font-extrabold text-ng-card">
              N
            </div>
            <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-ng-mono-muted">
              NomadGao × Hotpot House · Dharamkot pilot
            </span>
          </div>
          <h1 className="mb-3 max-w-[640px] font-display text-[44px] font-extrabold leading-[1.02] text-ng-ink">
            Plan the week.
          </h1>
          <p className="max-w-[560px] text-[17px] leading-[1.5] text-ng-muted">
            Enter this week&apos;s events once. We&apos;ll turn them into a
            weekly calendar plus a poster, story and caption for every event —
            all on-brand.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
            {/* Week-level fields */}
            <section className="mb-8 rounded-[20px] border border-ng-border bg-ng-card p-6 shadow-[0_24px_56px_-34px_rgba(60,40,20,0.4)] sm:p-7">
              <h2 className="mb-5 font-display text-[22px] font-bold text-ng-ink-2">
                The week
              </h2>
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className={labelCls} htmlFor="week-start">
                    Week starts
                  </label>
                  <input
                    id="week-start"
                    type="date"
                    className={inputCls}
                    value={week.startDate}
                    onChange={(e) =>
                      setWeek((w) => ({ ...w, startDate: e.target.value }))
                    }
                  />
                  {errors.startDate && (
                    <p className={errorCls}>{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls} htmlFor="week-end">
                    Week ends
                  </label>
                  <input
                    id="week-end"
                    type="date"
                    className={inputCls}
                    value={week.endDate}
                    onChange={(e) =>
                      setWeek((w) => ({ ...w, endDate: e.target.value }))
                    }
                  />
                  {errors.endDate && <p className={errorCls}>{errors.endDate}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="week-theme">
                    Theme
                  </label>
                  <select
                    id="week-theme"
                    className={inputCls}
                    value={week.theme}
                    onChange={(e) =>
                      setWeek((w) => ({ ...w, theme: e.target.value }))
                    }
                  >
                    {PALETTE_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Events */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[22px] font-bold text-ng-ink-2">
                Events{" "}
                <span className="font-mono text-[13px] font-normal text-ng-mono-muted">
                  · {events.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              {events.map((event, i) => (
                <EventCard
                  key={event.id}
                  index={i}
                  event={event}
                  eventTypes={eventTypes}
                  errors={errors.events[event.id]}
                  canRemove={events.length > 1}
                  onChange={(patch) => updateEvent(event.id, patch)}
                  onAddType={addEventType}
                  onRemove={() => removeEvent(event.id)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addEvent}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed border-[#d8b9a6] bg-[#fdf8ef] p-4 font-body text-[14.5px] font-bold text-[#b07a5a] transition-colors hover:bg-[#fbf1e3]"
            >
              <span className="text-[20px] leading-none">＋</span> Add event
            </button>

            <div className="mt-9 flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-[30px] bg-ng-dark-btn px-6 py-3.5 font-body text-[15px] font-bold text-ng-card"
              >
                Generate the week →
              </button>
              <span className="font-mono text-[12px] text-ng-mono-muted">
                Posters &amp; captions generate next
              </span>
            </div>
          </form>
      </div>
      </div>
    </div>
  );
}

function EventCard({
  index,
  event,
  eventTypes,
  errors,
  canRemove,
  onChange,
  onAddType,
  onRemove,
}: {
  index: number;
  event: EventDraft;
  eventTypes: EventType[];
  errors?: EventErrors;
  canRemove: boolean;
  onChange: (patch: Partial<EventDraft>) => void;
  onAddType: (name: string) => Promise<string>;
  onRemove: () => void;
}) {
  const isFree = event.price.trim().toLowerCase() === "free";
  const selectedType = eventTypes.find((t) => t.slug === event.typeSlug);

  // Inline "add a new type" flow, opened from the dropdown's last option.
  // The emoji is auto-picked from the name (previewed live as you type).
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  async function confirmAddType() {
    if (!newName.trim()) return;
    const slug = await onAddType(newName);
    onChange({ typeSlug: slug });
    setAdding(false);
    setNewName("");
  }

  function cancelAddType() {
    setAdding(false);
    setNewName("");
  }

  return (
    <section className="rounded-[20px] border border-ng-border bg-ng-card p-6 shadow-[0_24px_56px_-34px_rgba(60,40,20,0.4)] sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ng-terracotta">
          {selectedType ? `${selectedType.emoji} ` : ""}Event {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-[14px] border border-[#e7c9bf] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#b0563c]"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Event name</label>
          <input
            className={inputCls}
            placeholder="e.g. Sip & Paint Sunset"
            value={event.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
          {errors?.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        <div>
          <label className={labelCls}>Event type</label>
          <select
            className={inputCls}
            value={adding ? ADD_TYPE : event.typeSlug}
            onChange={(e) => {
              if (e.target.value === ADD_TYPE) {
                setAdding(true);
              } else {
                setAdding(false);
                onChange({ typeSlug: e.target.value });
              }
            }}
          >
            <option value="">Choose a type…</option>
            {eventTypes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.emoji} {t.name}
              </option>
            ))}
            <option value={ADD_TYPE}>＋ Add new type…</option>
          </select>

          {adding && (
            <>
              <div className="mt-2.5 flex items-stretch gap-2">
                <div
                  aria-hidden
                  title="Emoji auto-picked from the name"
                  className="flex w-14 shrink-0 items-center justify-center rounded-xl border border-ng-border-2 bg-white text-[22px]"
                >
                  {emojiForType(newName)}
                </div>
                <input
                  className={`${inputBase} min-w-0 flex-1`}
                  placeholder="New type name — e.g. Open Mic Night"
                  aria-label="New event type name"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmAddType();
                    } else if (e.key === "Escape") {
                      cancelAddType();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={confirmAddType}
                  disabled={!newName.trim()}
                  className="shrink-0 rounded-[14px] bg-ng-dark-btn px-4 font-body text-[13px] font-bold text-ng-card disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={cancelAddType}
                  className="shrink-0 rounded-[14px] border border-ng-border-2 bg-white px-3 font-body text-[13px] font-semibold text-ng-muted"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-ng-mono-muted">
                Emoji auto-picked from the name
              </p>
            </>
          )}
          {errors?.typeSlug && <p className={errorCls}>{errors.typeSlug}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="date"
              className={inputCls}
              value={event.date}
              onChange={(e) => onChange({ date: e.target.value })}
            />
            {errors?.date && <p className={errorCls}>{errors.date}</p>}
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <input
              className={inputCls}
              placeholder="6:00 PM"
              value={event.time}
              onChange={(e) => onChange({ time: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Location</label>
          <input
            className={inputCls}
            value={event.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <div>
          <label className={labelCls}>Price</label>
          <div className="flex items-center gap-3">
            <input
              className={`${inputCls} ${isFree ? "opacity-50" : ""}`}
              placeholder="₹600"
              value={isFree ? "" : event.price}
              disabled={isFree}
              onChange={(e) => onChange({ price: e.target.value })}
            />
            <label className="flex shrink-0 cursor-pointer items-center gap-2 font-body text-[13px] font-semibold text-ng-muted">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) =>
                  onChange({ price: e.target.checked ? "Free" : "" })
                }
              />
              Free
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Short description</label>
          <textarea
            className={`${inputCls} min-h-[72px] resize-y`}
            placeholder="One line for the poster — e.g. Brushes, canvas and a sundowner. No skills needed."
            value={event.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
}
