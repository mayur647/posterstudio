"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a fixed-size poster (e.g. 600×600) scaled down to fit the available
 * width on narrow screens, preserving aspect ratio. The poster keeps its exact
 * pixel canvas (so server-side PNG export is unaffected) — only the on-screen
 * preview is scaled. At scale 1 (desktop) overflow is visible so the drop
 * shadow shows; when scaled (mobile) it's clipped so the page can't overflow.
 */
export default function ScaledPoster({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      style={{
        width,
        maxWidth: "100%",
        height: height * scale,
        overflow: scale < 1 ? "hidden" : "visible",
      }}
    >
      <div
        style={{
          width,
          height,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
