import Link from "next/link";

export default function LoginPage() {
  const spellViaTalisman = "/talisman/login?next=%2Fspell";
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-muted-foreground">
          Use the product login flows to establish your session.
        </p>
      </div>

      <div className="grid gap-3">
        <Link
          href="/talisman/login"
          className="rounded border border-border px-4 py-3 text-sm hover:bg-muted"
        >
          Talisman Login
        </Link>
        <Link
          href={spellViaTalisman}
          className="rounded border border-border px-4 py-3 text-sm hover:bg-muted"
        >
          Spell (via Talisman)
        </Link>
      </div>
    </div>
  );
}
