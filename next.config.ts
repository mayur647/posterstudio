import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the headless-browser packages external to the server bundle.
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
  ],
};

export default nextConfig;
