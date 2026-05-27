import { useState } from 'react'
import { Box, Typography, Grid, Button, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  MeetingRoom,
  Landscape,
  Architecture,
  Deck as DeckIcon,
  Timeline
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ClubImagesModal from '../ClubHouse/ClubImagesModal'
import ClubHouseUnderConstructionModal from '../ClubHouse/ClubHouseUnderContructionModal'
import { useAuth } from '@shared/context/AuthContext'

const UploadsClubHouseSection = () => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [modalOpen, setModalOpen] = useState(null)

  const sections = [
    {
      id: 'interior',
      title: t('clubhouse.interior', 'Interior'),
      description: t('clubhouse.interiorDesc', 'Reception, Gym, Pool, etc.'),
      icon: MeetingRoom,
      color: theme.palette.primary.main,
      modal: 'clubImages',
      initialTab: 2 // Interior tab
    },
    {
      id: 'exterior',
      title: t('clubhouse.exterior', 'Exterior'),
      description: t('clubhouse.exteriorDesc', 'Imágenes exteriores del club'),
      icon: Landscape,
      color: theme.palette.secondary.main,
      modal: 'clubImages',
      initialTab: 0 // Exterior tab
    },
    {
      id: 'blueprints',
      title: t('clubhouse.blueprints', 'Planos'),
      description: t('clubhouse.blueprintsDesc', 'Planos arquitectónicos'),
      icon: Architecture,
      color: theme.palette.info.main,
      modal: 'clubImages',
      initialTab: 1 // Blueprints tab
    },
    {
      id: 'deck',
      title: t('clubhouse.deck', 'Deck'),
      description: t('clubhouse.deckDesc', 'Imágenes del deck'),
      icon: DeckIcon,
      color: theme.palette.warning.main,
      modal: 'clubImages',
      initialTab: 3 // Deck tab
    },
    {
      id: 'timeline',
      title: t('clubhouse.timeline', 'Timeline de Construcción'),
      description: t('clubhouse.timelineDesc', 'Pasos de construcción del club'),
      icon: Timeline,
      color: theme.palette.success.main,
      modal: 'timeline'
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
          🏠 ClubHouse
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
            <Grid item xs={12} sm={6} md={4} key={section.id}>
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
      {modalOpen?.modal === 'clubImages' && (
        <ClubImagesModal
          open={true}
          onClose={handleCloseModal}
          isOwner={isOwner}
          onImagesUploaded={() => {
            handleCloseModal()
            // Refresh data if needed
          }}
        />
      )}

      {modalOpen?.modal === 'timeline' && (
        <ClubHouseUnderConstructionModal
          open={true}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  )
}

export default UploadsClubHouseSection