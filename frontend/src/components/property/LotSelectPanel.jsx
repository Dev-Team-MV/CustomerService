import { Box, Paper, Typography, FormControl, Select, MenuItem, Divider } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import HomeIcon from '@mui/icons-material/Home'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import PaletteIcon from '@mui/icons-material/Palette'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

const LotSelectPanel = () => {
  const { lots, selectedLot, selectLot, selectedModel, selectedFacade, getLotCounts } = useProperty()

  const lotCounts = getLotCounts()

  const handleLotSelect = (event) => {
    const lotNumber = event.target.value
    const lot = lots.find(l => l.number === lotNumber)
    if (lot) {
      selectLot(lot)
    }
  }

  const getStatusLabel = (status) => {
    if (status === 'pending') return 'Hold'
    if (status === 'available') return 'Available'
    if (status === 'sold') return 'Sold'
    return status
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 3,
        height: '100%'
      }}
    >
      {/* Lot Selection Dropdown */}
      <Typography variant="h6" sx={{ mb: 2, color: '#1f2937', fontWeight: 'bold' }}>
        LOT SELECT
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Select
          value={selectedLot?.number || ''}
          onChange={handleLotSelect}
          displayEmpty
          sx={{
            bgcolor: '#f9fafb',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6'
            }
          }}
        >
          <MenuItem value="" disabled>
            Select a lot
          </MenuItem>
          {lots.map((lot) => (
            <MenuItem 
              key={lot._id} 
              value={lot.number}
              disabled={lot.status === 'sold'}
            >
              Lot {lot.number} - {getStatusLabel(lot.status)} - ${lot.price.toLocaleString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status Counts */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {lotCounts.hold} Hold
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
            {lotCounts.hold}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {lotCounts.available} Available
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
            {lotCounts.available}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {lotCounts.sold} Sold
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
            {lotCounts.sold}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* House Information */}
      <Typography variant="h6" sx={{ mb: 2, color: '#1f2937', fontWeight: 'bold' }}>
        HOUSE INFORMATION
      </Typography>

      {selectedLot || selectedModel || selectedFacade ? (
        <Box>
          {/* Lot Info */}
          {selectedLot && (
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
              <HomeIcon sx={{ mr: 2, color: '#3b82f6', mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Lot
                </Typography>
                <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                  Lot {selectedLot.number}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {selectedLot.section} • {selectedLot.size}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                ${selectedLot.price.toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Model Info */}
          {selectedModel && (
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
              <SquareFootIcon sx={{ mr: 2, color: '#3b82f6', mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Model
                </Typography>
                <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                  Model {selectedModel.modelNumber}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {selectedModel.model}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                ${selectedModel.price.toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Facade Info */}
          {selectedFacade && (
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
              <PaletteIcon sx={{ mr: 2, color: '#3b82f6', mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Facade
                </Typography>
                <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: '500' }}>
                  {selectedFacade.name}
                </Typography>
              </Box>
              {selectedFacade.priceModifier > 0 && (
                <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                  +${selectedFacade.priceModifier.toLocaleString()}
                </Typography>
              )}
              {selectedFacade.priceModifier === 0 && (
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  Included
                </Typography>
              )}
            </Box>
          )}

          {/* Total */}
          {(selectedLot || selectedModel) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#eff6ff', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon sx={{ mr: 1, color: '#3b82f6' }} />
                  <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
                    Estimated Total
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                  ${((selectedLot?.price || 0) + (selectedModel?.price || 0) + (selectedFacade?.priceModifier || 0)).toLocaleString()}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            Select a lot and model to view details
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default LotSelectPanel
