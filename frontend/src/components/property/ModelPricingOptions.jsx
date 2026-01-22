import { Box, Typography, Paper, Chip, Grid, Card, CardContent, FormControlLabel, Checkbox } from '@mui/material'
import { useProperty } from '../../context/PropertyContext'

const ModelPricingOptions = () => {
  const { 
    selectedModel, 
    modelPricingOptions, 
    selectedPricingOption,
    options,
    toggleOption,
    getModelPricingInfo
  } = useProperty()

  if (!selectedModel) return null

  const pricingInfo = getModelPricingInfo()
  
  // Si el modelo no tiene opciones de pricing, no mostrar nada
  if (!pricingInfo?.hasBalcony && !pricingInfo?.hasUpgrade && !pricingInfo?.hasStorage) {
    return null
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Model Configuration Options
      </Typography>
      
      <Typography variant="body2" color="text.secondary" mb={3}>
        Customize your {selectedModel.model} with these available options
      </Typography>

      <Grid container spacing={2}>
        {/* Upgrade Option */}
        {pricingInfo.hasUpgrade && (
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              variant="outlined" 
              sx={{ 
                cursor: 'pointer',
                border: options.upgrade ? '2px solid' : '1px solid',
                borderColor: options.upgrade ? 'secondary.main' : 'divider',
                bgcolor: options.upgrade ? 'secondary.50' : 'white'
              }}
              onClick={() => toggleOption('upgrade')}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={options.upgrade}
                        onChange={() => toggleOption('upgrade')}
                      />
                    }
                    label={<Typography fontWeight="bold">Upgrade Version</Typography>}
                    sx={{ m: 0 }}
                  />
                </Box>
                <Typography variant="h6" color="secondary" fontWeight="bold">
                  +${pricingInfo.upgradePrice.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Premium finishes and features
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Balcony Option */}
        {pricingInfo.hasBalcony && (
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              variant="outlined"
              sx={{ 
                cursor: 'pointer',
                border: options.balcony ? '2px solid' : '1px solid',
                borderColor: options.balcony ? 'info.main' : 'divider',
                bgcolor: options.balcony ? 'info.50' : 'white'
              }}
              onClick={() => toggleOption('balcony')}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={options.balcony}
                        onChange={() => toggleOption('balcony')}
                      />
                    }
                    label={<Typography fontWeight="bold">Balcony</Typography>}
                    sx={{ m: 0 }}
                  />
                </Box>
                <Typography variant="h6" color="info.main" fontWeight="bold">
                  +${pricingInfo.balconyPrice.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Private outdoor space
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Storage Option */}
        {pricingInfo.hasStorage && (
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              variant="outlined"
              sx={{ 
                cursor: 'pointer',
                border: options.storage ? '2px solid' : '1px solid',
                borderColor: options.storage ? 'success.main' : 'divider',
                bgcolor: options.storage ? 'success.50' : 'white'
              }}
              onClick={() => toggleOption('storage')}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={options.storage}
                        onChange={() => toggleOption('storage')}
                      />
                    }
                    label={<Typography fontWeight="bold">Storage</Typography>}
                    sx={{ m: 0 }}
                  />
                </Box>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  +${pricingInfo.storagePrice.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Additional storage unit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Selected Configuration Summary */}
      {selectedPricingOption && (
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Selected Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedPricingOption.label}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold" mt={1}>
            ${selectedPricingOption.price.toLocaleString()}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default ModelPricingOptions