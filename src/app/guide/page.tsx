import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "How to use · NomadGao Poster Studio",
};

/* eslint-disable @next/next/no-img-element */

function Shot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-6">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-[14px] border border-ng-border shadow-[0_24px_56px_-34px_rgba(60,40,20,0.45)]"
      />
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-[11px] text-ng-mono-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-3 border-t border-[#e6dcca] pt-7 font-display text-[26px] font-extrabold text-ng-ink">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[15.5px] leading-[1.6] text-ng-ink-3">{children}</p>;
}

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-[#cfc8b9]">
        <div className="mx-auto flex max-w-[820px] items-center justify-between gap-3 px-6 py-4 sm:px-8">
          <BrandMark />
          <Link
            href="/"
            className="font-body text-[13.5px] font-semibold text-ng-mono-muted hover:text-ng-ink"
          >
            Open the app →
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-[820px] px-6 py-12 sm:px-8">
        <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-ng-terracotta">
          Community Manager Guide
        </span>
        <h1 className="mt-2 font-display text-[40px] font-extrabold leading-[1.04] text-ng-ink">
          How to use the Poster Studio
        </h1>
        <P>
          This tool turns <strong>one weekly form</strong> into a full set of
          on-brand creatives for NomadGao × The Hotpot House, Dharamkot — a
          weekly calendar plus a poster and story for every event, each with a
          ready-made caption prompt. No design or tech skills needed: fill the
          form, download the images, copy the caption prompt.
        </P>
        <P>
          <strong>Live app:</strong>{" "}
          <a
            className="text-ng-terracotta underline"
            href="https://posterstudio-one.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            posterstudio-one.vercel.app
          </a>
        </P>

        <H2>1. Sign in</H2>
        <P>
          Open the app and click <strong>Continue with Google</strong> using
          your approved NomadGao email. If you see “access denied,” ask the admin
          to add your email.
        </P>
        <Shot src="/guide/login.png" alt="The team sign-in screen" caption="The sign-in screen" />

        <H2>2. The 3-minute flow</H2>
        <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-[15.5px] leading-[1.6] text-ng-ink-3">
          <li><strong>Plan the week</strong> — type in this week’s events.</li>
          <li><strong>Generate the week</strong> — the app makes all the images.</li>
          <li>For each event you get a <strong>square (1:1)</strong> image, a <strong>story (9:16)</strong> image, and a <strong>caption prompt</strong>.</li>
          <li>Download the images and copy the caption prompt.</li>
          <li>Post on Instagram. Done.</li>
        </ol>

        <H2>3. Fill in the weekly form</H2>
        <P>
          Set the <strong>week dates</strong> and <strong>theme</strong> at the
          top, then add each event with <strong>＋ Add event</strong>.
        </P>
        <Shot src="/guide/form.png" alt="The Plan the week form" caption="“Plan the week” — week dates, theme, and an event card" />
        <P>For each event, fill:</P>
        <ul className="mb-3 ml-5 list-disc space-y-1.5 text-[15.5px] leading-[1.6] text-ng-ink-3">
          <li><strong>Event name</strong> — e.g. “Sip &amp; Paint Sunset”.</li>
          <li><strong>Event type</strong> — pick from the list, or choose <strong>＋ Add new type…</strong> to create one (an emoji is picked for you).</li>
          <li><strong>Date</strong> and <strong>Time</strong> (30-minute slots).</li>
          <li><strong>Location</strong> — pick the venue from the dropdown.</li>
          <li><strong>Price</strong> — type it (e.g. ₹600) or tick <strong>Free</strong>.</li>
          <li><strong>Short description</strong> — one vivid line about the event. <strong>This matters most</strong> — it drives the caption.</li>
        </ul>
        <P>When everything’s in, click <strong>Generate the week →</strong>.</P>

        <H2>4. The Poster Studio (your output)</H2>
        <P>
          For the weekly calendar and for each event you get one block with two
          things: the <strong>images</strong> (a <strong>⤓ Download PNG</strong>{" "}
          button under each), and a <strong>caption prompt</strong>.
        </P>
        <Shot src="/guide/studio.png" alt="A studio output block: two poster images and a caption prompt" caption="Each block: square + story images, and the caption prompt card" />
        <P>
          Use <strong>🎲 Shuffle theme</strong> to reshuffle the colours, fonts
          and texture (always on-brand) until you like it, then download. Your
          work stays put if you switch tabs or refresh.
        </P>

        <H2>5. Get your caption (free)</H2>
        <P>
          The studio gives you a <strong>prompt</strong>, not the finished
          caption — so it costs nothing.
        </P>
        <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-[15.5px] leading-[1.6] text-ng-ink-3">
          <li>Click <strong>📋 Copy prompt</strong> on the card.</li>
          <li>Open <strong>claude.ai</strong> or <strong>ChatGPT</strong> (your normal account).</li>
          <li>Paste the prompt and send it.</li>
          <li>You’ll get 3 caption options — pick one, tweak, and post.</li>
        </ol>
        <P>
          The prompt already includes the event details, the location, the RSVP
          line, and the “no hashtags” rule, so captions come out on-brand.
        </P>

        <H2>6. Reuse a past week</H2>
        <P>
          On the form, scroll to <strong>Recent weeks</strong>. Click{" "}
          <strong>Open posters →</strong> to jump back into the studio for that
          week, or <strong>Load into form</strong> to tweak and re-generate.
        </P>

        <H2>7. Admin: the Image Library</H2>
        <P>
          Open the <strong>🗂 Image library · Admin</strong> tab to manage the
          photos and logos that go on the creatives.
        </P>
        <Shot src="/guide/library.png" alt="The Image Library admin screen" caption="Brand logos, event-type photo folders, and the Excel export" />
        <ul className="mb-3 ml-5 list-disc space-y-1.5 text-[15.5px] leading-[1.6] text-ng-ink-3">
          <li><strong>Event photos</strong> — under each type, <strong>Add images</strong>. Each poster uses a real photo from the matching type as its background. More good photos = better posters.</li>
          <li><strong>Brand logos</strong> — <strong>Replace</strong> the NomadGao / Hotpot House logos if they ever change.</li>
          <li><strong>Add event type</strong> — create a new category (also appears in the form dropdown).</li>
          <li><strong>⤓ Download events (Excel)</strong> — export every past event (no images) to a spreadsheet.</li>
        </ul>
        <P>Photos and logos you upload are saved for everyone until someone deletes them.</P>

        <H2>8. Tips for the best output</H2>
        <ul className="mb-3 ml-5 list-disc space-y-1.5 text-[15.5px] leading-[1.6] text-ng-ink-3">
          <li>Write a real <strong>description</strong> — it drives the caption.</li>
          <li>Add <strong>event photos</strong> so posters use real backgrounds.</li>
          <li><strong>Shuffle</strong> a few times before downloading.</li>
          <li>Download <strong>both sizes</strong> — square for the feed, story for stories.</li>
          <li>Pick the right <strong>venue</strong> — it shows on the poster and in the caption.</li>
        </ul>

        <H2>9. Quick troubleshooting</H2>
        <ul className="mb-3 ml-5 list-disc space-y-1.5 text-[15.5px] leading-[1.6] text-ng-ink-3">
          <li><strong>Can’t sign in</strong> — your email isn’t approved; ask the admin.</li>
          <li><strong>Event type missing</strong> — use <strong>＋ Add new type…</strong> in the dropdown.</li>
          <li><strong>The caption is just a prompt</strong> — that’s intended; paste it into claude.ai / ChatGPT (free).</li>
          <li><strong>Download takes a few seconds</strong> — it’s rendering full quality; normal.</li>
          <li><strong>Lost your week</strong> — check <strong>Recent weeks</strong> and click <strong>Open posters →</strong>.</li>
        </ul>

        <p className="mt-12 border-t border-[#e6dcca] pt-6 text-[14px] text-ng-muted-2">
          Questions or changes? Pass them to the admin who set this up.
        </p>
      </article>
    </div>
  );
}
