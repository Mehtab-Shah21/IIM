import {LegalPage, legalMetadata} from '@/components/sections/LegalPage'

export const generateMetadata = () =>
  legalMetadata('accessibility', 'Accessibility Statement | IIM Technical Services')

export default function Page() {
  return <LegalPage pageKey="accessibility" />
}
