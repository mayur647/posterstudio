import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import { GUIDE_URL } from "@/lib/links";

/** Top tab nav between the Poster Studio (/) and Image Library (/library). */
export default function ScreenNav({ active }: { active: "studio" | "library" }) {
  const tab = (href: string, key: "studio" | "library", label: string) => (
    <Link
      href={href}
      className={`-mb-px border-b-[3px] px-[22px] py-[13px] font-body text-[15px] font-bold ${
        active === key
          ? "border-ng-terracotta text-ng-ink"
          : "border-transparent text-ng-mono-muted"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="border-b border-[#cfc8b9]">
      <nav className="mx-auto flex max-w-[1580px] items-center gap-1.5 px-6 sm:px-14">
        {tab("/", "studio", "🖼 Poster studio")}
        {tab("/library", "library", "🗂 Image library · Admin")}
        <div className="ml-auto flex items-center gap-3 pl-3">
          <a
            href={GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[13.5px] font-semibold text-ng-mono-muted hover:text-ng-ink"
          >
            ❔ How to use
          </a>
          <SignOutButton />
        </div>
      </nav>
    </div>
  );
}
