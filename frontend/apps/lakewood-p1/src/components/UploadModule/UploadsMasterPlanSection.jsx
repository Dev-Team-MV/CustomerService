import { useState, useEffect } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  Map,
  Tour,
  Park,
  FlightTakeoff,
  Timeline
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import MasterPlanUploadModal from '../masterPlan/MasterPlanUpload'
import RecorridoImagesModal from '../masterPlan/RecorridoImagesModal'
import OutdoorAmenitiesModal from '../masterPlan/OutdoorAmenitiesModal'
import EagleViewModal from '../masterPlan/EagleViewModal'
import TimelineManagementSection from './TimelineManagementSection'
import uploadService from '../../services/uploadService'
import EagleViewService from '../../services/EagleViewService'

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
  const [selectedSection, setSelectedSection] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const primary = theme.palette.primary.main
  const cardAccent = theme.palette.chipAdmin?.color || '#8CA551'
  
  const [imagesMap, setImagesMap] = useState({})
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
      
      const url = await uploadService.uploadImage(file, 'recorrido', filename, isPublic)
      
      if (!url) {
        throw new Error('No URL returned from upload')
      }
      
      await uploadService.updateRecorridoVisibility({ filename, isPublic })
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
      modal: 'masterplan'
    },
    {
      id: 'recorrido',
      title: t('masterplan.tour', 'Recorrido Virtual'),
      description: t('masterplan.tourDesc', 'Puntos de recorrido con imágenes'),
      icon: Tour,
      modal: 'recorrido'
    },
    {
      id: 'amenities',
      title: t('masterplan.amenities', 'Amenidades Exteriores'),
      description: t('masterplan.amenitiesDesc', 'Pool, Gym, Playground, etc.'),
      icon: Park,
      modal: 'amenities'
    },
    {
      id: 'eagleview',
      title: t('masterplan.eagleview', 'Eagle View / Timeline'),
      description: t('masterplan.eagleviewDesc', 'Vista aérea y timeline del proyecto'),
      icon: FlightTakeoff,
      modal: 'eagleview'
    }
  ]

  const handleSectionClick = (section) => {
    if (section.id === 'eagleview') {
      setSelectedSection(section)
    } else {
      setModalOpen(section)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(null)
  }

  const handleBackFromTimeline = () => {
    setSelectedSection(null)
  }

  return (
    <Box>
      <AnimatePresence mode="wait">
        {!selectedSection ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 300,
                  color: primary,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                Master{' '}
                <Box component="span" sx={{ fontWeight: 800 }}>Plan</Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  color: '#706f6f',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {t('masterplan.subtitle', 'Gestiona el plano maestro, recorrido virtual y amenidades')}
              </Typography>
            </Box>

            {/* Cards Grid */}
            <Grid container spacing={2.5}>
              {sections.map((section, i) => {
                const Icon = section.icon
                return (
                  <Grid item xs={12} sm={6} md={3} key={section.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                    >
                      <Box
                        onClick={() => handleSectionClick(section)}
                        sx={{
                          bgcolor: primary,
                          borderRadius: 3,
                          p: { xs: 3, md: 4 },
                          minHeight: { xs: 160, md: 200 },
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${primary}40`
                          }
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography
                            sx={{
                              fontSize: { xs: '2.5rem', md: '3.5rem' },
                              fontWeight: 300,
                              color: cardAccent,
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1,
                              letterSpacing: '-2px',
                            }}
                          >
                            0{i + 1}
                          </Typography>
                          <Icon sx={{ fontSize: 24, color: cardAccent, opacity: 0.85 }} />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: '1.5rem', md: '2rem' },
                              fontWeight: 700,
                              color: 'white',
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1.1,
                              letterSpacing: '-0.5px',
                              mb: 0.5,
                            }}
                          >
                            {section.title}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: '0.78rem',
                              color: 'rgba(255,255,255,0.55)',
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            {section.description}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          </motion.div>
        ) : (
          <motion.div
            key="eagleview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TimelineManagementSection
              service={EagleViewService}
              onBack={handleBackFromTimeline}
              title={t('masterplan.eagleview', 'Eagle View / Timeline')}
              subtitle={t('masterplan.eagleviewDesc', 'Gestiona la vista aérea y timeline del proyecto')}
              ModalComponent={EagleViewModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
    </Box>
  )
}

export default UploadsMasterPlanSection