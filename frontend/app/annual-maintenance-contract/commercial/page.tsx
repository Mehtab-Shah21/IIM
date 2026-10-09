import {AmcPlanPage, amcMetadata} from '@/components/sections/AmcPages'

export const generateMetadata = () =>
  amcMetadata(
    'amc-commercial',
    'Commercial Maintenance Contract Dubai | Offices, Shops | IIM',
    'Annual maintenance for offices, shops and buildings in Dubai: planned visits around your opening hours, priority response and one contractor for all jobs.',
  )

export default function Page() {
  return <AmcPlanPage pageKey="amc-commercial" plan="commercial" />
}
