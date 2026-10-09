import type {Metadata} from 'next'

import {Callout, Checklist, DirectAnswer, FaqList, Steps} from '@/components/sections/Blocks'
import {PageHero} from '@/components/sections/PageHero'
import {Button, ButtonLink} from '@/components/ui/Button'
import {Card, PhotoPlaceholder} from '@/components/ui/Card'
import {Checkbox, ChoiceGroup, Field, Select, TextInput, Textarea} from '@/components/ui/Field'
import {Badge, Chip, Section, SectionHeader} from '@/components/ui/Layout'
import {routes} from '@/lib/routes'

/** Internal reference for every token and component state (CLAUDE.md §7). Never indexed. */
export const metadata: Metadata = {
  title: {absolute: 'Style guide | IIM Technical Services'},
  robots: {index: false, follow: false},
}

const colours = ['ink-950', 'ink-900', 'ink-800', 'ink-700', 'gold', 'accent', 'accent-600', 'cream', 'cream-muted', 'navy', 'white', 'neutral-50', 'neutral-100', 'neutral-200', 'neutral-600', 'success', 'error', 'whatsapp']
const spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function StyleGuide() {
  return (
    <>
      <PageHero title="Style guide" lead="Every token and component state, for checking changes against the design system." crumbs={[{name: 'Home', href: routes.home}, {name: 'Style guide'}]} />

      <Section labelledBy="sg-colour">
        <SectionHeader id="sg-colour" title="Colour" />
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-6">
          {colours.map((c) => (
            <li key={c} className="grid gap-2 text-xs">
              <span className="sg-swatch block h-8 rounded-sm border border-neutral-200" style={{background: `var(--${c})`}} />
              <code>--{c}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section surface="neutral" labelledBy="sg-type">
        <SectionHeader id="sg-type" title="Typography" />
        <div className="grid gap-4">
          <p className="font-heading text-h1 font-extrabold">H1 Electrician in Dubai</p>
          <p className="font-heading text-h2 font-bold">H2 Book in three steps</p>
          <p className="font-heading text-h3 font-bold">H3 Card title</p>
          <p className="text-lead text-neutral-600">Lead paragraph for introductions.</p>
          <p className="max-w-prose">Body text at the fluid body size with a 1.6 line height, capped at 68 characters for comfortable reading on every screen.</p>
          <p className="text-small text-neutral-600">Small muted text.</p>
        </div>
      </Section>

      <Section labelledBy="sg-space">
        <SectionHeader id="sg-space" title="Spacing, radii and shadows" />
        <div className="grid gap-2">
          {spaces.map((n) => (
            <div key={n} className="flex items-center gap-4">
              <code className="text-xs">--space-{n}</code>
              <span className="block h-4 rounded-sm bg-accent" style={{width: `var(--space-${n})`}} />
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-4">
          {['sm', 'md', 'lg', 'pill'].map((r) => (
            <div key={r} className="grid h-8 w-9 place-items-center border border-neutral-200 bg-neutral-100 text-xs" style={{borderRadius: `var(--radius-${r})`}}>
              {r}
            </div>
          ))}
          {['sm', 'md', 'lg'].map((s) => (
            <div key={s} className="grid h-8 w-9 place-items-center rounded-md bg-white text-xs" style={{boxShadow: `var(--shadow-${s})`}}>
              shadow-{s}
            </div>
          ))}
        </div>
      </Section>

      <Section surface="neutral" labelledBy="sg-buttons">
        <SectionHeader id="sg-buttons" title="Buttons" />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="whatsapp" icon="whatsapp">
            WhatsApp
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading>
            Loading
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 rounded-lg bg-ink-900 p-card">
          <ButtonLink href="#" variant="primary">
            Primary on dark
          </ButtonLink>
          <ButtonLink href="#" variant="secondary" tone="dark">
            Secondary on dark
          </ButtonLink>
          <ButtonLink href="#" variant="ghost" tone="dark">
            Ghost on dark
          </ButtonLink>
        </div>
      </Section>

      <Section labelledBy="sg-cards">
        <SectionHeader id="sg-cards" title="Cards" />
        <div className="grid items-stretch gap-gap md:grid-cols-2 lg:grid-cols-3">
          <Card href={routes.services} title="Card with media" text="Media is fixed at 16:10 and clipped to the card radius." icon="zap" cta="View service" media={<PhotoPlaceholder label="16:10" />} />
          <Card href={routes.services} title="Card without media" text="A longer text to show that cards in one row stay the same height and the call to action stays pinned to the bottom of every card." icon="droplets" cta="View service" />
          <Card title="Dark card" text="Used on dark sections." icon="star" tone="dark" />
        </div>
      </Section>

      <Section surface="neutral" labelledBy="sg-forms">
        <SectionHeader id="sg-forms" title="Form fields" />
        <div className="grid gap-5 rounded-md border border-neutral-200 bg-white p-card md:grid-cols-2">
          <Field id="sg-a" label="Default field">
            <TextInput id="sg-a" />
          </Field>
          <Field id="sg-b" label="With an error" required error="This field is required.">
            <TextInput id="sg-b" aria-invalid aria-describedby="sg-b-error" />
          </Field>
          <Field id="sg-c" label="Select" hint="A hint below the label.">
            <Select id="sg-c" defaultValue="a">
              <option value="a">Option</option>
            </Select>
          </Field>
          <Field id="sg-d" label="Textarea" optionalNote="optional">
            <Textarea id="sg-d" />
          </Field>
          <div className="md:col-span-2">
            <ChoiceGroup name="sg-choice" legend="Choice tiles" defaultValue="morning" options={[{value: 'morning', label: 'Morning'}, {value: 'evening', label: 'Evening'}]} />
          </div>
          <div className="md:col-span-2">
            <Checkbox id="sg-check" label="A checkbox with a longer label that wraps on small screens." />
          </div>
        </div>
      </Section>

      <Section labelledBy="sg-blocks">
        <SectionHeader id="sg-blocks" title="Content blocks" />
        <div className="grid gap-7">
          <DirectAnswer text="The direct answer box: 40 to 60 words that answer the main question of the page first, in plain language." />
          <Checklist items={['First item', 'Second item', 'Third item', 'Fourth item']} />
          <Steps items={[{title: 'Step one', text: 'Text.'}, {title: 'Step two', text: 'Text.'}, {title: 'Step three', text: 'Text.'}]} />
          <Callout heading="Highlighted note" text="Used for safety advice." />
          <FaqList items={[{question: 'An FAQ question?', answer: 'Its answer.'}]} />
          <div className="flex flex-wrap gap-2">
            <Badge>Badge</Badge>
            <Badge tone="neutral">Neutral badge</Badge>
            <Chip>Chip</Chip>
          </div>
        </div>
      </Section>
    </>
  )
}
