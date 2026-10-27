import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-black/[0.06] bg-[var(--rm-bg)]">
      <div className="rm-frame py-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-[12px] leading-none">
          <li>
            <Link href="/" className="opacity-60 hover:opacity-100 underline underline-offset-4 decoration-black/20 hover:decoration-black/40">
              Home
            </Link>
          </li>
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="opacity-30">/</span>
              {item.href ? (
                <Link href={item.href} className="opacity-60 hover:opacity-100 underline underline-offset-4 decoration-black/20 hover:decoration-black/40">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="opacity-90 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
