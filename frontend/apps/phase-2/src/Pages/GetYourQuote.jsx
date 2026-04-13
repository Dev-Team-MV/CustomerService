import PropertyQuotePage from '@shared/components/PropertyQuote/PropertyQuotePage'

const GetYourQuote = () => (
  <PropertyQuotePage
    projectSlug="phase-2"
    projectId={import.meta.env.VITE_PROJECT_ID}
  />
)

export default GetYourQuote