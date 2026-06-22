import { type EventPosterProps, DEFAULT_LOGOS, PHOTO_SCRIM } from "./types";
import { PosterGrain } from "./decor";

const DISPLAY = "var(--ng-display,'Bricolage Grotesque'),sans-serif";
const MONO = "'Space Mono',monospace";

/** Individual event · 1:1 (shown at 600×600; canvas is 1080×1080). */
export default function EventSquare({
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
        width: 600,
        height: 600,
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
          top: 16,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 4,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 14,
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
          top: 70,
          left: 18,
          right: 18,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          zIndex: 3,
          flexDirection: "var(--ng-logo-dir,row)" as React.CSSProperties["flexDirection"],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(251,244,234,.95)",
            border: "2px solid var(--ng-accent,#e08a5f)",
            borderRadius: 16,
            padding: "8px 18px",
            transform: "rotate(-4deg)",
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
            <span style={{ fontSize: 26, letterSpacing: ".04em" }}>
              {dateChip.dow}
            </span>
            <span style={{ fontSize: 21, letterSpacing: ".02em" }}>
              {dateChip.md}
            </span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(251,244,234,.95)",
            borderRadius: 14,
            padding: "8px 12px",
            boxShadow: "0 6px 18px -8px rgba(40,30,15,.45)",
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
      </div>
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          zIndex: 2,
          background: "rgba(251,244,234,.8)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          border: "1.5px solid var(--ng-accent,#e08a5f)",
          borderRadius: 18,
          padding: "22px 24px",
          boxShadow: "0 16px 36px -18px rgba(40,30,15,.5)",
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 34,
            lineHeight: 0.98,
            margin: 0,
            color: "#4a3f36",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.45,
              color: "#7a6e60",
              margin: "8px 0 0",
            }}
          >
            {description}
          </p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginTop: 18,
          }}
        >
          <MetaCell label="TIME" value={time} />
          <MetaCell label="WHERE" value={where} />
          <MetaCell label="PRICE" value={price} />
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--ng-header,#f6c3a8)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
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
              fontSize: 18,
              color: "var(--ng-header-ink,#6b4030)",
            }}
          >
            77700 28833
          </span>
        </div>
      </div>
      <PosterGrain />
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: ".13em",
          color: "#a3917a",
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, color: "#4a3f36" }}>
        {value}
      </div>
    </div>
  );
}
