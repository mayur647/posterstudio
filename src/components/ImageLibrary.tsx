"use client";

import { useEffect, useState } from "react";
import ScreenNav from "@/components/ScreenNav";

interface PhotoView {
  id: string;
  url: string;
}
interface TypeView {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  photos: PhotoView[];
}
interface Library {
  types: TypeView[];
  logos: Record<string, string>;
}

/** Opens a file dialog and resolves with the chosen image files. */
function pickFiles(multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/avif,image/svg+xml";
    input.multiple = multiple;
    input.onchange = () => resolve(input.files ? Array.from(input.files) : []);
    input.click();
  });
}

const LOGO_META: { key: "nomadgao" | "hotpot"; label: string }[] = [
  { key: "nomadgao", label: "NomadGao" },
  { key: "hotpot", label: "The Hotpot House" },
];

export default function ImageLibrary() {
  const [lib, setLib] = useState<Library | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/library", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      setLib(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load library");
    }
  }
  useEffect(() => {
    // Fetch on mount; load() sets state only after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function replaceLogo(key: string) {
    const [file] = await pickFiles(false);
    if (!file) return;
    setBusy(`logo-${key}`);
    try {
      const form = new FormData();
      form.append("key", key);
      form.append("file", file);
      const res = await fetch("/api/library/logos", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error || "upload failed");
      const { logo } = await res.json();
      setLib((l) => (l ? { ...l, logos: { ...l.logos, [logo.key]: logo.url } } : l));
    } catch (e) {
      alert(e instanceof Error ? e.message : "upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function addPhotos(typeId: string) {
    const files = await pickFiles(true);
    if (files.length === 0) return;
    setBusy(`add-${typeId}`);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("eventTypeId", typeId);
        form.append("file", file);
        const res = await fetch("/api/library/photos", { method: "POST", body: form });
        if (!res.ok) throw new Error((await res.json()).error || "upload failed");
        const { photo } = await res.json();
        setLib((l) =>
          l
            ? {
                ...l,
                types: l.types.map((t) =>
                  t.id === typeId ? { ...t, photos: [...t.photos, photo] } : t,
                ),
              }
            : l,
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function deletePhoto(typeId: string, photoId: string) {
    setLib((l) =>
      l
        ? {
            ...l,
            types: l.types.map((t) =>
              t.id === typeId
                ? { ...t, photos: t.photos.filter((p) => p.id !== photoId) }
                : t,
            ),
          }
        : l,
    );
    await fetch(`/api/library/photos/${photoId}`, { method: "DELETE" });
  }

  async function deleteType(typeId: string) {
    if (!window.confirm("Delete this event type and its photos?")) return;
    setLib((l) => (l ? { ...l, types: l.types.filter((t) => t.id !== typeId) } : l));
    await fetch(`/api/library/types/${typeId}`, { method: "DELETE" });
  }

  async function addType() {
    const name = (window.prompt("Name the new event type (e.g. Open Mic Night)") || "").trim();
    if (!name) return;
    setBusy("add-type");
    try {
      const res = await fetch("/api/library/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "create failed");
      const { type } = await res.json();
      setLib((l) =>
        l ? { ...l, types: [...l.types, { ...type, photos: [] }] } : l,
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "create failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="pt-10">
        <ScreenNav active="library" />
      </div>
      <div className="mx-auto max-w-[900px] px-6 py-10 sm:px-14">
        <div className="mb-6 flex flex-col gap-2">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-ng-terracotta">
            App screen · Event image library
          </span>
          <h1 className="font-display text-[32px] font-extrabold text-ng-ink">
            Your photo repository
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-[14px] border border-[#e7c9bf] bg-white px-5 py-4 font-body text-[14px] text-[#b0563c]">
            Couldn&apos;t load the library: {error}
          </div>
        )}

        {!lib && !error && (
          <div className="font-mono text-[13px] text-ng-mono-muted">Loading…</div>
        )}

        {lib && (
          <div className="rounded-[20px] border border-ng-border bg-white p-7 shadow-[0_24px_56px_-34px_rgba(60,40,20,0.4)]">
            <p className="mb-6 text-[14.5px] leading-[1.5] text-ng-muted-2">
              Upload past-event photos by type. The generator pulls a real photo
              from the matching type for each poster.
            </p>

            {/* Brand logos */}
            <div className="border-b border-[#f0e6d6] pb-6">
              <div className="mb-3.5 flex items-center gap-3">
                <span className="text-[24px] leading-none">🏔️</span>
                <div className="flex-1">
                  <div className="font-display text-[19px] font-bold text-ng-ink-2">
                    Brand logos
                  </div>
                  <div className="font-mono text-[11px] text-ng-mono-muted">
                    Locked onto every poster &amp; calendar
                  </div>
                </div>
                <span className="rounded-[14px] bg-[#f3ebdb] px-2.5 py-1 font-mono text-[11px] text-ng-mono-muted">
                  BRAND
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {LOGO_META.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3.5 rounded-[14px] border border-[#efe3d2] bg-[#faf5ec] px-4 py-3"
                  >
                    <div className="flex h-[54px] w-[118px] items-center justify-center rounded-[10px] bg-white p-2">
                      {lib.logos[key] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={lib.logos[key]}
                          alt={label}
                          className="max-h-full max-w-full"
                        />
                      ) : (
                        <span className="font-mono text-[10px] text-ng-mono-muted">
                          none
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-body text-[14px] font-bold text-ng-ink-2">
                        {label}
                      </div>
                      <button
                        type="button"
                        onClick={() => replaceLogo(key)}
                        disabled={busy === `logo-${key}`}
                        className="mt-1.5 rounded-[20px] border border-ng-border-2 bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-ng-muted disabled:opacity-50"
                      >
                        {busy === `logo-${key}` ? "Uploading…" : "⤓ Replace"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event types */}
            {lib.types.map((t) => (
              <div key={t.id} className="border-t border-[#f0e6d6] py-[18px] first:border-t-0">
                <div className="mb-3.5 flex items-center gap-3">
                  <span className="text-[26px] leading-none">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="font-display text-[19px] font-bold text-ng-ink-2">
                      {t.name}
                    </div>
                    <div className="font-mono text-[11px] text-ng-mono-muted">
                      Pulled into {t.name} posters
                    </div>
                  </div>
                  <span className="rounded-[14px] bg-[#f3ebdb] px-2.5 py-1 font-mono text-[11px] text-ng-mono-muted">
                    REPOSITORY
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteType(t.id)}
                    className="ml-2 rounded-[14px] border border-[#e7c9bf] bg-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#b0563c]"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {t.photos.map((p) => (
                    <div
                      key={p.id}
                      className="group relative h-32 w-32 overflow-hidden rounded-[14px] border border-ng-border-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => deletePhoto(t.id, p.id)}
                        aria-label="Delete photo"
                        className="absolute right-1.5 top-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-black/55 font-mono text-[13px] text-white group-hover:flex"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPhotos(t.id)}
                    disabled={busy === `add-${t.id}`}
                    className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-[#d8b9a6] bg-[#fdf8ef] font-body text-[#b07a5a] disabled:opacity-50"
                  >
                    <span className="text-[26px] leading-none">＋</span>
                    <span className="text-[12.5px] font-bold">
                      {busy === `add-${t.id}` ? "Uploading…" : "Add images"}
                    </span>
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-1 border-t border-[#f0e6d6] pt-[18px]">
              <button
                type="button"
                onClick={addType}
                disabled={busy === "add-type"}
                className="flex w-full items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed border-[#d8b9a6] bg-[#fdf8ef] p-4 font-body text-[14.5px] font-bold text-[#b07a5a] disabled:opacity-50"
              >
                <span className="text-[20px] leading-none">＋</span> Add event type
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
