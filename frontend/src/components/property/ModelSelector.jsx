import { Box, Paper, Typography, Card, CardContent, CardMedia, Chip, IconButton } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HotelIcon from '@mui/icons-material/Hotel'
import BathtubIcon from '@mui/icons-material/Bathtub'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useProperty } from '../../context/PropertyContext'

const ModelSelector = () => {
  const { models, selectedModel, selectModel } = useProperty()

  const handleModelClick = (model) => {
    selectModel(model)
  }

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
          02 SELECCIÓN DE MODELO
        </Typography>
        <Typography variant="caption" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>
          {models.length} OPTIONS
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3, 
          overflowX: 'auto', 
          pb: 2,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 3 }
        }}
      >
        {models.map((model) => (
          <Card
            key={model._id}
            onClick={() => handleModelClick(model)}
            sx={{
              minWidth: 320,
              flexShrink: 0,
              cursor: 'pointer',
              bgcolor: selectedModel?._id === model._id ? '#e8f5e9' : '#fff',
              border: selectedModel?._id === model._id ? '2px solid #4a7c59' : '1px solid #e0e0e0',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}
          >
            {selectedModel?._id === model._id && (
              <Chip
                label="SELECTED"
                size="small"
                color="success"
                icon={<CheckCircleIcon />}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  fontWeight: 'bold'
                }}
              />
            )}

            <CardMedia
              component="img"
              height="180"
              image={model.image || `https://via.placeholder.com/400x300?text=Model+${model.modelNumber}`}
              alt={`Model ${model.modelNumber}`}
              sx={{ borderBottom: '1px solid #eee' }}
            />
            
            <CardContent p={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0 }}>
                    {model.model || `Model ${model.modelNumber}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Starting at ${model.price?.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>
                  $ { (model.price / 1000).toFixed(0) }K
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HotelIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption">{model.bedrooms} Beds</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BathtubIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption">{model.bathrooms} Baths</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SquareFootIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="caption">{model.sqft.toLocaleString()} ft²</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        {/* Placeholder for "More" */}
        <Box 
          sx={{ 
            minWidth: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: '#f9f9f9',
            borderRadius: 3,
            border: '1px dashed #ddd'
          }}
        >
          <IconButton sx={{ bgcolor: '#fff', boxShadow: 1 }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default ModelSelector
