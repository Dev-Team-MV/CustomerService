import { Box, Typography, Paper, Divider, Grid } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import HotelIcon from '@mui/icons-material/Hotel'
import BathtubIcon from '@mui/icons-material/Bathtub'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import { useProperty } from '../../context/PropertyContext'

const PropertyStats = () => {
  const { selectedModel, getLotCounts, selectedLot, selectedFacade } = useProperty()
  const lotCounts = getLotCounts()

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Lot Status Section */}
      <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
        1/3 LOT STATUS
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            {lotCounts.hold}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: '500' }}>
            HOLD
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
            {lotCounts.available}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: '500' }}>
            AVAILABLE
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
            {lotCounts.sold}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: '500' }}>
            SOLD
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* House Information Section */}
      <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', mb: 2, display: 'block', letterSpacing: 1 }}>
        HOUSE INFORMATION
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Selected Lot Info */}
        <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9' }}>
          <Typography variant="caption" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>ACTIVE SELECTION</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
            {selectedLot ? `Lot ${selectedLot.number}` : 'None selected'}
          </Typography>
          {selectedLot && (
            <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
              {selectedLot.size || '540m²'} • {selectedLot.section || 'Phase II'}
            </Typography>
          )}
        </Box>

        {selectedModel ? (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <InfoItem icon={<HomeIcon fontSize="small" />} label="MODEL" value={selectedModel.modelNumber} />
            </Grid>
            <Grid item xs={6}>
              <InfoItem icon={<HomeIcon fontSize="small" />} label="FACADE" value={selectedFacade?.name || '-'} />
            </Grid>
            <Grid item xs={6}>
              <InfoItem icon={<HotelIcon fontSize="small" />} label="BEDS" value={selectedModel.bedrooms} />
            </Grid>
            <Grid item xs={6}>
              <InfoItem icon={<BathtubIcon fontSize="small" />} label="BATHS" value={selectedModel.bathrooms} />
            </Grid>
            <Grid item xs={12}>
              <InfoItem icon={<SquareFootIcon fontSize="small" />} label="SQFT" value={selectedModel.sqft.toLocaleString()} />
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ccc' }}>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Select a model to view house details
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ p: 1.5, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #eee' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
      <Box sx={{ color: '#4a7c59', display: 'flex' }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {value}
    </Typography>
  </Box>
)

export default PropertyStats
