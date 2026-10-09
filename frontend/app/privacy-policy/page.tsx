import {LegalPage, legalMetadata} from '@/components/sections/LegalPage'

export const generateMetadata = () =>
  legalMetadata('privacy-policy', 'Privacy Policy | IIM Technical Services')

export default function Page() {
  return <LegalPage pageKey="privacy-policy" />
}
