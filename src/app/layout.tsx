import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NomadGao · Weekly Poster Studio",
  description:
    "Turn one weekly form into a full set of on-brand event creatives for NomadGao × The Hotpot House, Dharamkot.",
};

// All six brand fonts are loaded via a stylesheet link (not next/font) so the
// posters can swap display/body family by literal name when the theme shuffles.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  "family=Bricolage+Grotesque:opsz,wght@12..96,400..800" +
  "&family=Hanken+Grotesk:wght@400;500;600;700;800" +
  "&family=Space+Mono:wght@400;700" +
  "&family=Big+Shoulders+Display:wght@600;700;800" +
  "&family=Darker+Grotesque:wght@600;700;800;900" +
  "&family=Schibsted+Grotesk:wght@400;500;600;700;800" +
  "&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
