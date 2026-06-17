import { type CalendarPosterProps, DEFAULT_LOGOS } from "./types";

const DISPLAY = "var(--ng-display,'Bricolage Grotesque'),sans-serif";
const MONO = "'Space Mono',monospace";

/** Weekly calendar · 9:16 (shown at 480×853; canvas is 1080×1920). */
export default function CalendarStory({
  id,
  title,
  dateRange,
  tiles,
  logos = DEFAULT_LOGOS,
}: CalendarPosterProps & { id?: string }) {
  return (
    <div
      id={id}
      style={{
        width: 480,
        height: 853,
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
          background: "var(--ng-header,#f6c3a8)",
          color: "var(--ng-header-ink,#6b4030)",
          padding: "30px 34px 28px",
          textAlign: "var(--ng-head-align,left)" as React.CSSProperties["textAlign"],
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: ".05em",
            marginBottom: 16,
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
            marginBottom: 20,
            flexDirection: "var(--ng-logo-dir,row)" as React.CSSProperties["flexDirection"],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              background: "#fff",
              borderRadius: 15,
              padding: "9px 15px",
              boxShadow: "0 6px 16px -10px rgba(40,30,15,.4)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-logo="nomadgao"
              src={logos.nomadgao}
              alt="NomadGao"
              style={{ height: 26, width: "auto", display: "block" }}
            />
            <div style={{ width: 1, height: 26, background: "#e2d2bd" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-logo="hotpot"
              src={logos.hotpot}
              alt="The Hotpot House"
              style={{ height: 36, width: "auto", display: "block" }}
            />
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: ".12em",
              opacity: 0.92,
            }}
          >
            Dharamkot
          </div>
        </div>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 34,
            lineHeight: 1.04,
            margin: "0 0 8px",
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

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 14,
        }}
      >
        {tiles.slice(0, 4).map((t, i) => {
          const n = i + 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: `var(--ng-t${n},#bcd3bf)`,
                color: `var(--ng-t${n}i,#3e4f40)`,
                borderRadius: "var(--ng-tile-radius,18px)",
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <span style={{ fontSize: 42, lineHeight: 1 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 25,
                    lineHeight: 1.02,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 15,
                    marginTop: 6,
                    opacity: 0.78,
                    whiteSpace: "nowrap",
                  }}
                >
                  {[t.weekday, t.monthDay, t.time].filter(Boolean).join(" · ")}
                </div>
              </div>
              {t.price && (
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    background: "rgba(255,255,255,.55)",
                    padding: "6px 12px",
                    borderRadius: 16,
                  }}
                >
                  {t.price}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: "13px 34px",
          textAlign: "center",
          background: "var(--ng-header,#f6c3a8)",
          color: "var(--ng-header-ink,#6b4030)",
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: ".08em",
        }}
      >
        RSVP BIPASHA · 77700 28833
      </div>
    </div>
  );
}
