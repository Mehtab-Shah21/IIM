import Link from 'next/link'

export type Crumb = {name: string; href?: string}

/** Visible breadcrumb trail; the same items feed the BreadcrumbList schema (lib/seo/jsonld). */
export function Breadcrumbs({items}: {items: Crumb[]}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 text-small text-cream-muted">
        {items.map((c, i) => (
          <li key={`${c.name}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="text-cream underline-offset-4 hover:text-accent">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
