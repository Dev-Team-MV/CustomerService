import { Box } from '@mui/material'
import PriceBreakdown from './PriceBreakdown'
import SelectedOptionsPanel from './SelectedOptionsPanel'

const QuoteResultPanel = ({ 
  quoteResult, 
  customizationData, 
  catalogConfig, 
  facadeEnabled 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PriceBreakdown 
        quoteResult={quoteResult} 
        facadeEnabled={facadeEnabled} 
      />
      <SelectedOptionsPanel 
        customizationData={customizationData} 
        catalogConfig={catalogConfig} 
      />
    </Box>
  )
}

export default QuoteResultPanel