// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/models/BaseInfoTab.jsx

import { Box, Grid, TextField, Typography, Paper } from '@mui/material'
import { Home, Bed, Bathtub, SquareFoot, Layers } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const BaseInfoTab = ({ model, editMode, formData, onChange }) => {
  const theme = useTheme()

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      bgcolor: editMode ? 'white' : 'transparent',
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused': { color: theme.palette.primary.main }
    }
  }

  const InfoCard = ({ icon: Icon, label, value, color }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `2px solid ${color}20`,
        bgcolor: `${color}08`,
        textAlign: 'center'
      }}
    >
      <Icon sx={{ fontSize: 40, color, mb: 1 }} />
      <Typography variant="h4" fontWeight={700} sx={{ color, fontFamily: '"Poppins", sans-serif' }}>
        {value || '-'}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
        {label}
      </Typography>
    </Paper>
  )

  if (!editMode) {
    // Modo lectura
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif', mb: 3 }}>
          Información Base del Modelo
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}>
                Nombre del Modelo
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {model?.model || '-'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}>
                Número de Modelo
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {model?.modelNumber || '-'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}>
                Precio Base
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
                ${model?.price?.toLocaleString() || '0'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard icon={Layers} label="Pisos" value={model?.stories || 4} color={theme.palette.primary.main} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard icon={Bed} label="Habitaciones" value={model?.bedrooms} color={theme.palette.secondary.main} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard icon={Bathtub} label="Baños" value={model?.bathrooms} color={theme.palette.info.main} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard icon={SquareFoot} label="Área (ft²)" value={model?.sqft} color={theme.palette.warning.main} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <InfoCard icon={Home} label="Estado" value={model?.status || 'active'} color={theme.palette.success.main} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Modo edición
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif', mb: 3 }}>
        Editar Información Base
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Nombre del Modelo"
            value={formData.model}
            onChange={(e) => onChange('model', e.target.value)}
            placeholder="Ej: Modelo Base, Casa Estándar"
            fullWidth
            required
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Número"
            value={formData.modelNumber}
            onChange={(e) => onChange('modelNumber', e.target.value)}
            placeholder="M1"
            fullWidth
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Precio Base"
            type="number"
            value={formData.price}
            onChange={(e) => onChange('price', e.target.value)}
            placeholder="280000"
            fullWidth
            required
            sx={fieldSx}
            InputProps={{
              startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>$</Box>
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Área (ft²)"
            type="number"
            value={formData.sqft}
            onChange={(e) => onChange('sqft', e.target.value)}
            placeholder="1800"
            fullWidth
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Habitaciones"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => onChange('bedrooms', e.target.value)}
            placeholder="3"
            fullWidth
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Baños"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => onChange('bathrooms', e.target.value)}
            placeholder="3"
            fullWidth
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Pisos"
            type="number"
            value={formData.stories}
            onChange={(e) => onChange('stories', e.target.value)}
            placeholder="4"
            fullWidth
            sx={fieldSx}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default BaseInfoTab