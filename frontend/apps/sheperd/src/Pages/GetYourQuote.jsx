// apps/sheperd/src/Pages/GetYourQuote.jsx
import PropertyQuotePage from '@shared/components/PropertyQuote/PropertyQuotePage'

const GetYourQuote = () => (
  <PropertyQuotePage
    projectSlug="sheperd"
    projectId={import.meta.env.VITE_PROJECT_ID}
  />
)

export default GetYourQuote