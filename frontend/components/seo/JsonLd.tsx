/** Server-rendered JSON-LD. `<` is escaped so content can never close the script tag. */
export function JsonLd({data}: {data: unknown}) {
  return (
    <script
      type="application/ld+json"
      // Data blocks are not executed, so CSP does not apply.
      dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}
    />
  )
}
