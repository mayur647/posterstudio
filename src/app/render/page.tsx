import { decodeSpec } from "@/lib/render/spec";
import { styleVars, defaultStyle } from "@/lib/style";
import {
  CAL_TITLE,
  buildCalendarTiles,
  buildEventProps,
  calendarRange,
  weekPlace,
} from "@/lib/posterData";
import CalendarSquare from "@/components/posters/CalendarSquare";
import CalendarStory from "@/components/posters/CalendarStory";
import EventSquare from "@/components/posters/EventSquare";
import EventStory from "@/components/posters/EventStory";

/**
 * Headless render target. Puppeteer (via /api/render) navigates here with the
 * spec encoded in ?d= and screenshots #poster. Not linked from the app UI.
 * Rendering through a real route means logos/photos load over HTTP normally
 * and the shared font <link> from the root layout applies.
 */
export default async function RenderPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  if (!d) return <div>Missing render spec.</div>;

  const spec = decodeSpec(d);
  const style = spec.style ?? defaultStyle();

  const logos = spec.logos;
  let node: React.ReactNode;
  if (spec.kind === "calendar") {
    const tiles = buildCalendarTiles(spec.payload, spec.eventTypes);
    const range = calendarRange(spec.payload);
    const place = weekPlace(spec.payload);
    node =
      spec.format === "square" ? (
        <CalendarSquare id="poster" title={CAL_TITLE} dateRange={range} tiles={tiles} place={place} logos={logos} />
      ) : (
        <CalendarStory id="poster" title={CAL_TITLE} dateRange={range} tiles={tiles} place={place} logos={logos} />
      );
  } else {
    const ev = buildEventProps(
      spec.payload.events[spec.eventIndex ?? 0],
      spec.seed ?? 0,
      spec.photos,
    );
    node =
      spec.format === "square" ? (
        <EventSquare id="poster" {...ev} logos={logos} />
      ) : (
        <EventStory id="poster" {...ev} logos={logos} />
      );
  }

  return (
    <div style={styleVars(style)}>
      {/* Export a clean rectangle on a white page (no card radius/shadow). */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "html,body{margin:0!important;padding:0!important;background:#fff!important}" +
            "#poster{border-radius:0!important;box-shadow:none!important}",
        }}
      />
      {node}
    </div>
  );
}
