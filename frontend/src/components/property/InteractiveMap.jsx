import { Box, Paper, Typography, Select, MenuItem, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useProperty } from '../../context/PropertyContext'

const InteractiveMap = () => {
  const { lots, selectedLot, selectLot } = useProperty()

  const handleLotSelect = (e) => {
    const lotNumber = e.target.value
    const lot = lots.find(l => l.number === lotNumber)
    selectLot(lot)
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 0, 
        bgcolor: '#fff', 
        color: '#000',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header - Now relative to ensure it doesn't cover content */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333', letterSpacing: 0.5 }}>
          01 VISTA PANORÁMICA DE TERRENOS
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Available</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Hold</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Sold</Typography>
          </Box>
        </Box>
      </Box>

      {/* Map Content Container */}
      <Box
        sx={{
          width: '100%',
          height: 400,
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Lot Markers - Reduced size and gap for "zoom out" effect */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1.5, 
            justifyContent: 'center', 
            maxWidth: 800,
            p: 3,
            maxHeight: '100%',
            overflow: 'auto'
          }}
        >
          {lots.map((lot) => (
            <Tooltip key={lot._id} title={`Lot ${lot.number} - $${lot.price?.toLocaleString()}`}>
              <Box
                onClick={() => selectLot(lot)}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: lot.status === 'pending' ? '#1976d2' : lot.status === 'sold' ? '#f44336' : '#4caf50',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  boxShadow: selectedLot?._id === lot._id ? '0 0 0 3px rgba(74, 124, 89, 0.3)' : '0 1px 2px rgba(0,0,0,0.1)',
                  border: selectedLot?._id === lot._id ? '2px solid #fff' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'scale(1.25)',
                    zIndex: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  },
                  animation: selectedLot?._id === lot._id ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(74, 124, 89, 0.6)' },
                    '70%': { boxShadow: '0 0 0 6px rgba(74, 124, 89, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(74, 124, 89, 0)' }
                  }
                }}
              >
                {lot.number}
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Floating Zoom Controls */}
        <Box sx={{ position: 'absolute', bottom: 15, right: 15, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5 }}>
            <IconButton size="small"><AddIcon fontSize="inherit" /></IconButton>
            <IconButton size="small"><RemoveIcon fontSize="inherit" /></IconButton>
          </Paper>
          <Paper elevation={1} sx={{ borderRadius: 1.5 }}>
            <IconButton size="small"><MyLocationIcon fontSize="inherit" /></IconButton>
          </Paper>
        </Box>

        {/* Phase Label */}
        <Box sx={{ position: 'absolute', bottom: 15, left: 15 }}>
          <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid #ddd' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}>PHASE II - NORTH CREEK</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Lot Selector Dropdown */}
      <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderTop: '1px solid #eee' }}>
        <Select
          fullWidth
          value={selectedLot?.number || ''}
          onChange={handleLotSelect}
          displayEmpty
          size="small"
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }
          }}
        >
          <MenuItem value="" disabled>Seleccione un lote...</MenuItem>
          {lots.map(lot => (
            <MenuItem key={lot._id} value={lot.number}>
              Lot {lot.number} - {lot.status.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Paper>
  )
}

export default InteractiveMap
