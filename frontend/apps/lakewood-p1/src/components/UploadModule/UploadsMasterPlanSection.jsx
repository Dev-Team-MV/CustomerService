import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Button, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  Map,
  Tour,
  Park,
  FlightTakeoff
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import MasterPlanUploadModal from '../masterPlan/MasterPlanUpload'
import RecorridoImagesModal from '../masterPlan/RecorridoImagesModal'
import OutdoorAmenitiesModal from '../masterPlan/OutdoorAmenitiesModal'
import EagleViewModal from '../masterPlan/EagleViewModal'
import uploadService from '../../services/uploadService'

// Puntos de recorrido (mismo array que en RecorridoTab.jsx)
const puntosBase = [
  { id: 1, name: "Point 1", x: 77, y: 78 },
  { id: 2, name: "Point 2", x: 89.3, y: 50 },
  { id: 3, name: "Point 3", x: 93, y: 30 },
  { id: 4, name: "Point 4", x: 67, y: 49.8 },
  { id: 5, name: "Point 5", x: 37, y: 36},
  { id: 6, name: "Point 6", x: 30, y: 36 },
  { id: 7, name: "Point 7", x: 25, y: 32  },
  { id: 8, name: "Point 8", x: 17, y: 46 },
  { id: 9, name: "Point 9", x: 8, y: 35 },
  { id: 10, name: "Point 10", x: 8, y: 58 },
  { id: 11, name: "Point 11", x: 5, y: 65  },
  { id: 12, name: "Point 12", x: 13, y: 75  },
  { id: 13, name: "Point 13", x: 18, y: 70 },
  { id: 14, name: "Point 14", x: 26, y: 60 },
  { id: 15, name: "Point 15", x: 30, y: 45 },
  { id: 16, name: "Point 16", x: 32.7, y: 50 },
  { id: 17, name: "Point 17", x: 37, y: 59 },
  { id: 18, name: "Point 18", x: 36, y: 78.5 },
  { id: 19, name: "Point 19", x: 53, y: 78.5 },
  { id: 20, name: "Point 20", x: 65, y: 75 },
]

const UploadsMasterPlanSection = () => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()
  const [modalOpen, setModalOpen] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Estados para Recorrido
  const [imagesMap, setImagesMap] = useState({})
  
  // Estados para Amenidades
  const [amenitiesList, setAmenitiesList] = useState([])

  useEffect(() => {
    if (modalOpen?.modal === 'recorrido') {
      fetchRecorridoImages()
    } else if (modalOpen?.modal === 'amenities') {
      fetchAmenities()
    }
  }, [modalOpen])

const fetchRecorridoImages = async (skipCache = false) => {
  setLoading(true)
  try {
    // Usar versión sin caché si se especifica
    const response = skipCache 
      ? await uploadService.getFilesByFolderNoCache('recorrido', true)
      : await uploadService.getFilesByFolder('recorrido', true)
      
    const map = {}
    ;(response.files || []).forEach(file => {
      const name = file.name || file.filename || ''
      const match = name.match(/recorrido\.(\d+)\./)
      if (match) {
        const pointId = String(match[1])
        map[pointId] = {
          url: file.url || file.publicUrl || null,
          isPublic: !!file.isPublic,
          filename: name
        }
      }
    })
    setImagesMap(map)
  } catch (err) {
    console.error('Error fetching recorrido images:', err)
    setImagesMap({})
  } finally {
    setLoading(false)
  }
}



const fetchAmenities = async () => {
  setLoading(true)
  try {
    const response = await uploadService.getOutdoorAmenities()
    // Asegurar que siempre sea un array
    const amenitiesArray = Array.isArray(response) 
      ? response 
      : (response?.amenities || response?.data || [])
    setAmenitiesList(amenitiesArray)
  } catch (err) {
    console.error('Error fetching amenities:', err)
    setAmenitiesList([])
  } finally {
    setLoading(false)
  }
}

const handleVisibilityChange = async (id, data) => {
  try {
    await uploadService.updateRecorridoVisibility(data)
    await fetchRecorridoImages()
  } catch (err) {
    console.error('Error updating visibility:', err)
  }
}



const handleRecorridoUpload = async (id, file, isPublic = true) => {
  try {
    setLoading(true)
    const ext = file.name.substring(file.name.lastIndexOf('.'))
    const filename = `recorrido.${id}${ext}`
    
    console.log('📤 Uploading:', { id, filename, isPublic })
    
    const url = await uploadService.uploadImage(file, 'recorrido', filename, isPublic)
    
    console.log('✅ Upload successful, URL:', url)
    
    if (!url) {
      throw new Error('No URL returned from upload')
    }
    
    // Guardar metadata inmediatamente
    await uploadService.updateRecorridoVisibility({ filename, isPublic })
    
    // Actualizar UI
    await fetchRecorridoImages(true)
    
    alert('Imagen subida exitosamente')
  } catch (err) {
    console.error('❌ Error uploading recorrido image:', err)
    alert('Error al subir la imagen: ' + (err.message || 'Error desconocido'))
  } finally {
    setLoading(false)
  }
}
  const sections = [
    {
      id: 'masterplan',
      title: t('masterplan.main', 'Plano Maestro'),
      description: t('masterplan.mainDesc', 'Imagen principal del plano'),
      icon: Map,
      color: theme.palette.primary.main,
      modal: 'masterplan'
    },
    {
      id: 'recorrido',
      title: t('masterplan.tour', 'Recorrido Virtual'),
      description: t('masterplan.tourDesc', 'Puntos de recorrido con imágenes'),
      icon: Tour,
      color: theme.palette.secondary.main,
      modal: 'recorrido'
    },
    {
      id: 'amenities',
      title: t('masterplan.amenities', 'Amenidades Exteriores'),
      description: t('masterplan.amenitiesDesc', 'Pool, Gym, Playground, etc.'),
      icon: Park,
      color: theme.palette.success.main,
      modal: 'amenities'
    },
    {
      id: 'eagleview',
      title: t('masterplan.eagleview', 'Eagle View'),
      description: t('masterplan.eagleviewDesc', 'Vista aérea del proyecto'),
      icon: FlightTakeoff,
      color: theme.palette.info.main,
      modal: 'eagleview'
    }
  ]

  const handleCloseModal = () => {
    setModalOpen(null)
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            color: theme.palette.primary.main
          }}
        >
          🗺️ MasterPlan
        </Typography>
        <Chip
          label={`${sections.length} secciones`}
          size="small"
          sx={{ fontFamily: '"Poppins", sans-serif' }}
        />
      </Box>

      <Grid container spacing={2}>
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Grid item xs={12} sm={6} md={3} key={section.id}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setModalOpen(section)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: section.color,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: section.color,
                    bgcolor: `${section.color}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${section.color}30`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Icon sx={{ color: section.color, fontSize: 28 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary
                  }}
                >
                  {section.description}
                </Typography>
              </Button>
            </Grid>
          )
        })}
      </Grid>

      {/* Modals */}
      {modalOpen?.modal === 'masterplan' && (
        <MasterPlanUploadModal
          open={true}
          onClose={handleCloseModal}
          onUploaded={() => {
            handleCloseModal()
          }}
        />
      )}

      {modalOpen?.modal === 'recorrido' && (
        <RecorridoImagesModal
          open={true}
          onClose={handleCloseModal}
          puntos={puntosBase}
          imagesMap={imagesMap}
          onUpload={handleRecorridoUpload}
          onVisibilityChange={handleVisibilityChange}
          loading={loading}
        />
      )}

      {modalOpen?.modal === 'amenities' && (
        <OutdoorAmenitiesModal
          open={true}
          onClose={handleCloseModal}
          amenitiesList={amenitiesList}
          onUploaded={() => {
            fetchAmenities()
          }}
        />
      )}

      {modalOpen?.modal === 'eagleview' && (
        <EagleViewModal
          open={true}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  )
}

export default UploadsMasterPlanSection