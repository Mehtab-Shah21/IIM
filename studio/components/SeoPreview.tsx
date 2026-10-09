/**
 * Search-result preview for the SEO object: shows roughly how the title and description
 * appear on Google, above the normal fields.
 */
import type {ObjectInputProps} from 'sanity'

type SeoValue = {metaTitle?: string; metaDescription?: string; noindex?: boolean}

export function SeoPreview(props: ObjectInputProps<SeoValue>) {
  const title = props.value?.metaTitle?.trim() || 'Add a meta title'
  const description = props.value?.metaDescription?.trim() || 'Add a meta description (140–155 characters).'
  return (
    <div>
      <div
        aria-label="Search result preview"
        style={{
          border: '1px solid #dedcd4',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontFamily: 'Arial, sans-serif',
          background: '#fff',
        }}
      >
        <div style={{fontSize: 12, color: '#4d5156'}}>www.iimtechnicalservices.com</div>
        <div
          style={{
            fontSize: 18,
            color: '#1a0dab',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title.length > 60 ? `${title.slice(0, 60)}…` : title}
        </div>
        <div style={{fontSize: 13, color: '#4d5156', lineHeight: 1.5}}>
          {description.length > 160 ? `${description.slice(0, 157)}…` : description}
        </div>
        {props.value?.noindex ? (
          <div style={{marginTop: 6, fontSize: 12, fontWeight: 600, color: '#c0392b'}}>
            noindex: this page is hidden from search engines
          </div>
        ) : null}
      </div>
      {props.renderDefault(props)}
    </div>
  )
}
