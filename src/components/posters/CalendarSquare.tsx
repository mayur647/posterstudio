import { type CalendarPosterProps, DEFAULT_LOGOS } from "./types";
import { MotifLayer, PosterGrain, Sticker, STICKER_TILTS } from "./decor";

const DISPLAY = "var(--ng-display,'Bricolage Grotesque'),sans-serif";
const MONO = "'Space Mono',monospace";

/** Weekly calendar · 1:1 (shown at 600×600; canvas is 1080×1080). */
export default function CalendarSquare({
  id,
  title,
  dateRange,
  tiles,
  place = "Dharamkot",
  logos = DEFAULT_LOGOS,
}: CalendarPosterProps & { id?: string }) {
  return (
    <div
      id={id}
      style={{
        width: 600,
        height: 600,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 30px 70px -34px rgba(50,35,18,.5)",
        background: "#fbf4ea",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--ng-header,#f6c3a8)",
          color: "var(--ng-header-ink,#6b4030)",
          padding: "22px 30px 24px",
          textAlign: "var(--ng-head-align,left)" as React.CSSProperties["textAlign"],
        }}
      >
        <MotifLayer opacity={0.6} />
        <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            textAlign: "center",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: ".05em",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              display: "inline-block",
              border: "1.5px solid currentColor",
              borderRadius: 999,
              padding: "5px 16px",
            }}
          >
            NomadGao × The Hotpot House
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexDirection: "var(--ng-logo-dir,row)" as React.CSSProperties["flexDirection"],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: "#fff",
              borderRadius: 13,
              padding: "8px 13px",
              boxShadow: "0 6px 16px -10px rgba(40,30,15,.4)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-logo="nomadgao"
              src={logos.nomadgao}
              alt="NomadGao"
              style={{ height: 22, width: "auto", display: "block" }}
            />
            <div style={{ width: 1, height: 22, background: "#e2d2bd" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-logo="hotpot"
              src={logos.hotpot}
              alt="The Hotpot House"
              style={{ height: 30, width: "auto", display: "block" }}
            />
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: ".12em",
              opacity: 0.92,
            }}
          >
            {place}
          </div>
        </div>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 0.98,
            margin: "0 0 6px",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: ".08em",
            opacity: 0.9,
            fontWeight: 700,
          }}
        >
          {dateRange}
        </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: 8,
        }}
      >
        {tiles.slice(0, 4).map((t, i) => {
          const n = i + 1;
          return (
            <div
              key={i}
              style={{
                background: `var(--ng-t${n},#bcd3bf)`,
                color: `var(--ng-t${n}i,#3e4f40)`,
                borderRadius: "var(--ng-tile-radius,14px)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Sticker emoji={t.emoji} size={28} tilt={STICKER_TILTS[i % 4]} />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 17,
                    background: "rgba(255,255,255,.6)",
                    padding: "5px 12px",
                    borderRadius: 18,
                    boxShadow: "inset 0 0 0 1.5px var(--ng-accent,#e08a5f)",
                  }}
                >
                  {[t.weekday, t.monthDay].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 21,
                    lineHeight: 1.05,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    marginTop: 5,
                    opacity: 0.7,
                  }}
                >
                  {[t.time, t.price].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: "14px 30px",
          textAlign: "center",
          background: "var(--ng-header,#f6c3a8)",
          color: "var(--ng-header-ink,#6b4030)",
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".08em",
        }}
      >
        RSVP BIPASHA · 77700 28833
      </div>
      <PosterGrain />
    </div>
  );
}
