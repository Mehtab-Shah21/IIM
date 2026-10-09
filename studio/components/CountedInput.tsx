/**
 * Shows a live character (or word) count under a string/text field, coloured when it falls
 * outside the recommended range. The range itself is enforced as a validation warning.
 */
import type {StringInputProps, TextInputProps} from 'sanity'

type Range = {min: number; max: number; unit: 'characters' | 'words'}

function count(value: string | undefined, unit: Range['unit']): number {
  const v = (value ?? '').trim()
  if (!v) return 0
  return unit === 'words' ? v.split(/\s+/).length : v.length
}

function Counter({value, range}: {value?: string; range: Range}) {
  const n = count(value, range.unit)
  const ok = n === 0 || (n >= range.min && n <= range.max)
  return (
    <div
      style={{
        marginTop: 6,
        fontSize: 12,
        fontWeight: ok ? 400 : 600,
        color: ok ? 'var(--card-muted-fg-color, #5c6370)' : '#c0392b',
      }}
    >
      {n} {range.unit} · aim for {range.min}–{range.max}
    </div>
  )
}

export function countedInput(range: Range) {
  function CountedInput(props: StringInputProps | TextInputProps) {
    return (
      <div>
        {props.renderDefault(props)}
        <Counter value={props.value} range={range} />
      </div>
    )
  }
  return CountedInput
}
