// apps/isq/src/Pages/GetYourQuote.jsx
import { PropertyQuotePage } from '@shared/components/PropertyQuote'

const GetYourQuote = () => (
  <PropertyQuotePage
    projectSlug="isq"
    projectId={import.meta.env.VITE_PROJECT_ID}
  />
)

export default GetYourQuote