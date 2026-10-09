import type {CSSProperties} from 'react'

/**
 * Heading text that rises word by word (adapted from the owner-supplied "TextAnimation"
 * component, rebuilt in CSS instead of Framer Motion). Headings only, never body text.
 *
 * - `load`: plays on page load in pure CSS (page H1s; works without JavaScript).
 * - `inview`: plays when scrolled into view. components/layout/Enhancements.tsx arms it only
 *   below the first screen, so text is never hidden without JavaScript or above the fold.
 *
 * Reduced motion turns both off. The text stays one readable string for screen readers.
 */
export function WordReveal({
  text,
  mode = 'inview',
  startIndex = 0,
}: {
  text: string
  mode?: 'load' | 'inview'
  /** Continue the stagger from an earlier WordReveal in the same heading. */
  startIndex?: number
}) {
  const words = text.trim().split(/\s+/)
  return (
    <span className={mode === 'load' ? 'words words-load' : 'words'} data-words={mode}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="word">
            <span className="word-in" style={{'--i': startIndex + i} as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  )
}
