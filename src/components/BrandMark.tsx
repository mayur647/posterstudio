import { DEFAULT_LOGOS, type Logos } from "@/components/posters/types";

/** Small NomadGao × Hotpot House logo lockup for app headers. */
export default function BrandMark({ logos = DEFAULT_LOGOS }: { logos?: Logos }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-[11px] border border-ng-border-2 bg-white px-3 py-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logos.nomadgao} alt="NomadGao" className="h-5 w-auto" />
      <span className="h-5 w-px bg-ng-border-2" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logos.hotpot} alt="The Hotpot House" className="h-7 w-auto" />
    </span>
  );
}
