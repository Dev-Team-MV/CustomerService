import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Construction, Add } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import PhaseUploadDialog from '@shared/components/constructionPhases/PhaseUploadDialog'
import api from '../../services/api'

const PHASES = [
  'Site Preparation and Groundbreaking',
  'Foundation, Framing & Windows',
  'Exterior Cladding and Roofing Installation',
  "All MEP's starts rough in work",
  'Drywall Work and Paint',
  'Flooring and Millwork',
  'Kitchen and Bathrooms',
  'Interior Finishes, Driveway Applainces & Landscaping',
  'Inspections (Delays)'
]

const UploadsConstructionSection = () => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const response = await api.get('/properties')
      setProperties(response.data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPhaseDialog = (phaseNumber) => {
    setSelectedPhase({
      phaseNumber,
      title: PHASES[phaseNumber - 1],
      constructionPercentage: 0
    })
  }

  const handleUploadMedia = async (phaseNumber, uploadForm) => {
    // This will be handled by the parent component or hook
    console.log('Upload media:', phaseNumber, uploadForm)
    setSelectedPhase(null)
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2
          }}
        >
          🏗️ {t('construction.title', 'Fases de Construcción')}
        </Typography>

        {/* Property Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>{t('construction.selectProperty', 'Seleccionar Propiedad')}</InputLabel>
          <Select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            label={t('construction.selectProperty', 'Seleccionar Propiedad')}
            disabled={loading}
          >
            {properties.map((property) => (
              <MenuItem key={property._id} value={property._id}>
                {`Lote ${property.lot?.number || 'N/A'} - Modelo ${property.model?.name || 'N/A'}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!selectedProperty && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {t('construction.selectPropertyFirst', 'Selecciona una propiedad para gestionar sus fases de construcción')}
          </Alert>
        )}
      </Box>

      {/* Phases Grid */}
      {selectedProperty && (
        <Grid container spacing={2}>
          {PHASES.map((phase, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleOpenPhaseDialog(index + 1)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: `${theme.palette.primary.main}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${theme.palette.primary.main}30`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                  <Construction sx={{ color: theme.palette.primary.main }} />
                  <Chip
                    label={`Fase ${index + 1}`}
                    size="small"
                    color="primary"
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  {phase}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Add fontSize="small" />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary
                    }}
                  >
                    {t('construction.uploadMedia', 'Subir media')}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Phase Upload Dialog */}
      {selectedPhase && (
        <PhaseUploadDialog
          open={!!selectedPhase}
          onClose={() => setSelectedPhase(null)}
          phase={selectedPhase}
          onUpload={handleUploadMedia}
          uploading={uploading}
          config={{ allowVideo: true, maxPercentage: 100 }}
        />
      )}
    </Box>
  )
}

export default UploadsConstructionSection