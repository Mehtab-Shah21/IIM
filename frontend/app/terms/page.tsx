import {LegalPage, legalMetadata} from '@/components/sections/LegalPage'

export const generateMetadata = () => legalMetadata('terms', 'Terms of Service | IIM Technical Services')

export default function Page() {
  return <LegalPage pageKey="terms" />
}
