import LoginButton from "./LoginButton";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[420px] rounded-[20px] border border-ng-border bg-ng-card p-8 shadow-[0_24px_56px_-34px_rgba(60,40,20,0.4)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#e89f7e] font-display text-[18px] font-extrabold text-ng-card">
            N
          </div>
          <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-ng-mono-muted">
            NomadGao · Poster Studio
          </span>
        </div>
        <h1 className="mb-2 font-display text-[28px] font-extrabold text-ng-ink">
          Team sign-in
        </h1>
        <p className="mb-6 text-[15px] leading-[1.5] text-ng-muted">
          This is an internal tool for the NomadGao team. Sign in with your
          approved Google account to continue.
        </p>

        {denied && (
          <div className="mb-5 rounded-[12px] border border-[#e7c9bf] bg-white px-4 py-3 font-body text-[13.5px] text-[#b0563c]">
            That Google account isn&apos;t on the approved list. Ask an admin to
            add your email, then try again.
          </div>
        )}

        <LoginButton />
      </div>
    </div>
  );
}
