import { PropertyQuoteProvider } from '@shared/context/ProperyQuoteContext'
import GetYourQuoteContent from '../Components/quote/GetYourQuote/index'

const GetYourQuote = () => (
  <PropertyQuoteProvider>
    <GetYourQuoteContent />
  </PropertyQuoteProvider>
)

export default GetYourQuote