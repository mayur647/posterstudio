/**
 * The "How to use" guide link, shown in the nav and on the login page.
 * Defaults to the shared Google Doc; override with NEXT_PUBLIC_GUIDE_URL
 * (set it in Vercel + .env.local if the doc ever moves).
 */
export const GUIDE_URL =
  process.env.NEXT_PUBLIC_GUIDE_URL ||
  "https://docs.google.com/document/d/1HlfiYOuPTbYAWAcrJIHBMpy485mo0KThuTo4HiXsdbw/edit?usp=sharing";
