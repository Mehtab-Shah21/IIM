import {AmcPlanPage, amcMetadata} from '@/components/sections/AmcPages'

export const generateMetadata = () =>
  amcMetadata(
    'amc-residential',
    'Residential Maintenance Contract Dubai | Villas, Flats | IIM',
    'Annual maintenance for villas, apartments and townhouses in Dubai, with scheduled AC, electrical and plumbing check-ups and priority help for breakdowns.',
  )

export default function Page() {
  return <AmcPlanPage pageKey="amc-residential" plan="residential" />
}
