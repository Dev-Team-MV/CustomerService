// @shared/components/Resource/ConstructionTab.jsx
import React,{ useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  Alert,
  IconButton
} from '@mui/material'
import {
  Construction,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lock,
  LockOpen
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePhases } from '@shared/hooks/usePhases'
import GalleryCarrousel from '../../../../apps/lakewood-p1/src/components/GalleryCarrousel'
import PropTypes from 'prop-types'

const PHASE_DESCRIPTIONS = [
  "Clearing and grading the land, setting up utilities and access",
  "Pouring concrete foundation and slab work",
  "Building the structure frame, walls, and roof structure",
  "Installing roof materials and waterproofing systems",
  "Installing plumbing lines, electrical wiring, and HVAC systems",
  "Adding insulation and hanging drywall throughout the home",
  "Installing flooring, painting, cabinets, and interior fixtures",
  "Completing siding, exterior painting, and landscaping",
  "Final walkthrough, quality checks, and project completion"
]

const PHASE_TITLES = [
  'Site Preparation',
  'Foundation',
  'Framing',
  'Roofing',
  'MEP Installation',
  'Insulation & Drywall',
  'Interior Finishes',
  'Exterior Finishes',
  'Final Inspection'
]

const extractMedia = (item) => {
  if (!item) return null
  if (typeof item === 'string') return { url: item, type: 'image' }
  if (item.url) {
    const type = item.mediaType || 'image'
    return { url: item.url, type }
  }
  return null
}

const ConstructionTab = ({ resourceId, resourceType, config }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])
  const { phases, loading } = usePhases({
    entityType: resourceType,
    entityId: resourceId
  })

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [phaseCarouselIndex, setPhaseCarouselIndex] = useState(0)
  const [galleryKey, setGalleryKey] = useState(0)
  const [galleryMedia, setGalleryMedia] = useState([])

  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(
        (p) => p.constructionPercentage < 100
      )
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  useEffect(() => {
    if (phases[currentPhaseIndex]?.mediaItems) {
      const media = phases[currentPhaseIndex].mediaItems
        .map(extractMedia)
        .filter(Boolean)
      setGalleryMedia(media)
    } else {
      setGalleryMedia([])
    }
    setPhaseCarouselIndex(0)
    setGalleryKey((prev) => prev + 1)
  }, [currentPhaseIndex, phases])

  const handlePreviousPhase = () => {
    setCurrentPhaseIndex((i) => Math.max(i - 1, 0))
  }

  const handleNextPhase = () => {
    setCurrentPhaseIndex((i) => Math.min(i + 1, phases.length - 1))
  }

  const currentPhase = phases[currentPhaseIndex]
  const canGoNext = currentPhaseIndex < phases.length - 1 && currentPhase?.constructionPercentage >= 100

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: 'white',
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress sx={{ color: config.colors.primary }} />
        </Box>
      </Paper>
    )
  }

  if (!phases || phases.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: 'white',
          borderRadius: 4,
          border: '1px solid #e0e0e0'
        }}
      >
        <Alert severity="info">
          {t(`${config.i18n.namespace}:noPhases`, 'No construction phases available yet')}
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        background: 'white',
        borderRadius: 4,
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={4}
        pb={3}
        sx={{ borderBottom: `2px solid ${config.colors.secondary}33` }}
      >
        <Box
          sx={{
            width: { xs: 48, sm: 52, md: 56 },
            height: { xs: 48, sm: 52, md: 56 },
            borderRadius: 3,
            bgcolor: config.colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${config.colors.primary}33`
          }}
        >
          <Construction sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: 'white' }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: config.colors.primary,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              letterSpacing: '0.5px'
            }}
          >
            {t(`${config.i18n.namespace}:constructionTab`, 'Construction Progress')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '0.75rem', sm: '0.85rem' }
            }}
          >
            {t(`${config.i18n.namespace}:trackPhases`, 'Track each phase of construction')}
          </Typography>
        </Box>
      </Box>

      {/* Phase Navigation */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={3}
        gap={2}
        sx={{
          p: 2.5,
          bgcolor: '#fafafa',
          borderRadius: 3,
          border: `1px solid ${config.colors.border}`
        }}
      >
        <IconButton
          onClick={handlePreviousPhase}
          disabled={currentPhaseIndex === 0}
          sx={{
            bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : config.colors.primary,
            color: 'white',
            '&:hover': {
              bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : config.colors.secondary
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#706f6f'
            }
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Box sx={{ textAlign: 'center', minWidth: 180 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: config.colors.primary,
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Phase {currentPhase?.phaseNumber} / {phases.length}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {currentPhase?.title || PHASE_TITLES[currentPhaseIndex]}
          </Typography>
        </Box>

        <IconButton
          onClick={handleNextPhase}
          disabled={!canGoNext}
          sx={{
            bgcolor: !canGoNext ? '#e0e0e0' : config.colors.primary,
            color: 'white',
            '&:hover': {
              bgcolor: !canGoNext ? '#e0e0e0' : config.colors.secondary
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#706f6f'
            }
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Phase Content */}
      {currentPhase && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: 3,
            bgcolor: '#fafafa',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            position: 'relative',
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: `0 8px 24px ${config.colors.primary}1A`
            }
          }}
        >
          {/* Decorative bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: { xs: 3, md: 4 },
              bgcolor: config.colors.secondary,
              opacity: 0.8,
              borderRadius: '12px 12px 0 0',
              zIndex: 1
            }}
          />

          {/* Phase Info */}
          <Box display="flex" alignItems="center" gap={2} mb={3} zIndex={2} position="relative">
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                bgcolor:
                  currentPhase.constructionPercentage === 100
                    ? config.colors.secondary
                    : currentPhase.constructionPercentage > 0
                    ? config.colors.accent
                    : '#9e9e9e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {currentPhase.constructionPercentage === 100 ? (
                <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
              ) : currentPhase.constructionPercentage > 0 ? (
                <LockOpen sx={{ fontSize: 32, color: 'white' }} />
              ) : (
                <Lock sx={{ fontSize: 32, color: 'white' }} />
              )}
            </Box>

            <Box flex={1}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: config.colors.primary,
                  letterSpacing: '0.5px',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                  mb: 1
                }}
              >
                {currentPhase.title || PHASE_TITLES[currentPhaseIndex]}
              </Typography>

              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 1, sm: 1.5 }}>
                <Chip
                  label={
                    currentPhase.constructionPercentage === 100
                      ? t(`${config.i18n.namespace}:complete`, 'Complete')
                      : `${currentPhase.constructionPercentage}% ${t(`${config.i18n.namespace}:complete`, 'Complete')}`
                  }
                  size="small"
                  sx={{
                    bgcolor: currentPhase.constructionPercentage === 100 ? config.colors.secondary : config.colors.accent,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    height: { xs: 24, sm: 28 },
                    fontFamily: '"Poppins", sans-serif'
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontWeight: 500,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  {PHASE_DESCRIPTIONS[currentPhase.phaseNumber - 1]}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box mb={{ xs: 2, md: 3 }} zIndex={2} position="relative">
            <LinearProgress
              variant="determinate"
              value={currentPhase.constructionPercentage}
              sx={{
                height: { xs: 8, sm: 10, md: 12 },
                borderRadius: 2,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: currentPhase.constructionPercentage === 100 ? config.colors.secondary : config.colors.accent,
                  borderRadius: 2
                }
              }}
            />
          </Box>

          {/* Image Gallery */}
          {galleryMedia.length > 0 ? (
            <Box
              key={galleryKey}
              sx={{
                mb: 2,
                width: '100%',
                height: 450,
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000'
              }}
            >
              <GalleryCarrousel
                key={`phase-${currentPhaseIndex}-${galleryMedia.length}`}
                images={galleryMedia}
                showPagination={true}
                showArrows={true}
                autoPlay={false}
                borderRadius={8}
                objectFit="contain"
                startIndex={0}
                onIndexChange={(newIndex) => setPhaseCarouselIndex(newIndex)}
              />
            </Box>
          ) : (
            <Alert
              severity="info"
              icon={<ImageIcon />}
              sx={{
                borderRadius: 3,
                bgcolor: `${config.colors.secondary}14`,
                border: `1px solid ${config.colors.secondary}4D`,
                fontFamily: '"Poppins", sans-serif',
                '& .MuiAlert-icon': { color: config.colors.secondary }
              }}
            >
              {t(`${config.i18n.namespace}:noPhaseImages`, 'No images uploaded for this phase yet')}
            </Alert>
          )}
        </Paper>
      )}
    </Paper>
  )
}

ConstructionTab.propTypes = {
  resourceId: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired
}

export default ConstructionTab