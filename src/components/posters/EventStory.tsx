import { type EventPosterProps, DEFAULT_LOGOS, PHOTO_SCRIM } from "./types";

const DISPLAY = "var(--ng-display,'Bricolage Grotesque'),sans-serif";
const MONO = "'Space Mono',monospace";

/** Individual event · 9:16 (shown at 480×853; canvas is 1080×1920). */
export default function EventStory({
  id,
  dateChip,
  title,
  description,
  time,
  where,
  price,
  bgUrl,
  logos = DEFAULT_LOGOS,
}: EventPosterProps & { id?: string }) {
  return (
    <div
      id={id}
      style={{
        width: 480,
        height: 853,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 30px 70px -34px rgba(50,35,18,.5)",
        background: "#cdbfa9",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: PHOTO_SCRIM,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 4,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: ".06em",
          color: "#fbf4ea",
          textShadow: "0 1px 6px rgba(0,0,0,.55)",
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
          position: "absolute",
          top: 82,
          left: 22,
          right: 22,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 11,
          zIndex: 3,
          flexDirection: "var(--ng-logo-dir,row)" as React.CSSProperties["flexDirection"],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(251,244,234,.95)",
            borderRadius: 18,
            padding: "10px 22px",
            boxShadow: "0 6px 18px -10px rgba(40,30,15,.4)",
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
              lineHeight: 1,
              fontFamily: MONO,
              fontWeight: 700,
              color: "#5e3522",
            }}
          >
            <span style={{ fontSize: 30, letterSpacing: ".04em" }}>
              {dateChip.dow}
            </span>
            <span style={{ fontSize: 24, letterSpacing: ".02em" }}>
              {dateChip.md}
            </span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            background: "rgba(251,244,234,.95)",
            borderRadius: 16,
            padding: "9px 13px",
            boxShadow: "0 6px 18px -8px rgba(40,30,15,.45)",
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
            style={{ height: 34, width: "auto", display: "block" }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 20,
          zIndex: 2,
          background: "rgba(251,244,234,.8)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          borderRadius: 22,
          padding: "28px 28px",
          boxShadow: "0 18px 40px -18px rgba(40,30,15,.55)",
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 0.96,
            margin: 0,
            color: "#4a3f36",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.45,
              color: "#7a6e60",
              margin: "12px 0 0",
            }}
          >
            {description}
          </p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 14,
            marginTop: 24,
          }}
        >
          <MetaCell label="TIME" value={time} />
          <MetaCell label="WHERE" value={where} />
          <MetaCell label="PRICE" value={price} />
        </div>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--ng-header,#f6c3a8)",
            borderRadius: 14,
            padding: "15px 18px",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: ".12em",
              color: "var(--ng-header-ink,#6b4030)",
            }}
          >
            RSVP BIPASHA
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 21,
              color: "var(--ng-header-ink,#6b4030)",
            }}
          >
            77700 28833
          </span>
        </div>
      </div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: ".13em",
          color: "#a3917a",
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: 21, color: "#4a3f36" }}>
        {value}
      </div>
    </div>
  );
}
