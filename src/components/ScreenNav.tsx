import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

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
        <div className="ml-auto pl-3">
          <SignOutButton />
        </div>
      </nav>
    </div>
  );
}
