import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material'
import {
  Construction,
  Image as ImageIcon
} from '@mui/icons-material'
import GalleryCarrousel from '../GalleryCarrousel'
import { useTranslation } from 'react-i18next'

const PHASE_DESCRIPTIONS = [
  "Clearing and grading the land, setting up utilities and access",
  "Pouring concrete foundation and slab work",
  "Building the structure frame, walls, and roof structure",
  "Installing roof materials and waterproofing systems",
  "Installing plumbing lines, electrical wiring, and HVAC systems",
  "Adding insulation and hanging drywall throughout the home",
  "Installing flooring, painting, cabinets, and interior fixtures",
  "Completing siding, exterior painting, and landscaping",
  "Final walkthrough, quality checks, and project completion",
]

// Helper para extraer URLs de cualquier formato
const extractMedia = (item) => {
  if (!item) return null
  if (typeof item === 'string') return { url: item, type: 'image' } // Asumimos que es una imagen si es un string
  if (item.url) {
    const type = item.mediaType || 'image' // Determinamos si es imagen o video
    return { url: item.url, type }
  }
  return null
}

const ConstructionTab = ({ phases, loadingPhases }) => {
  const { t } = useTranslation(['myProperty', 'common'])
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [phaseCarouselIndex, setPhaseCarouselIndex] = useState(0)
  const [galleryKey, setGalleryKey] = useState(0)
    const [galleryMedia, setGalleryMedia] = useState([])


  // Auto-select first incomplete phase
  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(
        (p) => p.constructionPercentage < 100
      )
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  // Reset carousel when phase changes + force remount + prepare images
  // Reset carousel when phase changes + force remount + prepare media
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

  if (loadingPhases) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: "white",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress sx={{ color: "#333F1F" }} />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        background: "white",
        borderRadius: 4,
        border: "1px solid #e0e0e0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* HEADER */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={4}
        pb={3}
        sx={{ borderBottom: '2px solid rgba(140, 165, 81, 0.2)' }}
      >
        <Box
          sx={{
            width: { xs: 48, sm: 52, md: 56 },
            height: { xs: 48, sm: 52, md: 56 },
            borderRadius: 3,
            bgcolor: "#333F1F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
          }}
        >
          <Construction sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: "white" }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "#333F1F",
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
              letterSpacing: '0.5px'
            }}
          >
            {t('myProperty:constructionTab', 'Construction Progress')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.85rem" }
            }}
          >
            {t('myProperty:trackPhases', 'Track each phase of your property construction')}
          </Typography>
        </Box>
      </Box>

      {/* PHASE CONTENT */}
      {phases[currentPhaseIndex] && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: 3,
            bgcolor: "#fafafa",
            borderRadius: 3,
            border: "1px solid #e0e0e0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            position: "relative",
            transition: "box-shadow 0.3s",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(51, 63, 31, 0.1)",
            },
          }}
        >
          {/* Decorative bar */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: { xs: 3, md: 4 },
              bgcolor: "#8CA551",
              opacity: 0.8,
              borderRadius: '12px 12px 0 0',
              zIndex: 1,
            }}
          />

          {/* Phase Navigation */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems="center"
            gap={{ xs: 2, sm: 2, md: 3 }}
            mb={{ xs: 2, md: 3 }}
            zIndex={2}
            position="relative"
          >
            <Button
              variant="outlined"
              size={window.innerWidth < 600 ? "small" : "medium"}
              onClick={handlePreviousPhase}
              disabled={currentPhaseIndex === 0}
              sx={{
                minWidth: { xs: 80, sm: 100 },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                borderRadius: 2,
                borderColor: '#e0e0e0',
                borderWidth: '2px',
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                mr: { xs: 0, sm: 2 },
                '&:hover': { borderColor: '#333F1F', borderWidth: '2px', bgcolor: 'rgba(51, 63, 31, 0.05)' },
                '&:disabled': { borderColor: '#e0e0e0', color: '#9e9e9e' }
              }}
            >
              {t('myProperty:previous', 'Previous')}
            </Button>

            <Box flex={1} textAlign="center" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: "#333F1F",
                  letterSpacing: "0.5px",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                  mb: 1,
                }}
              >
                {t('myProperty:phase', 'Phase')} {phases[currentPhaseIndex].phaseNumber}:{" "}
                {phases[currentPhaseIndex].title}
              </Typography>

              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" gap={{ xs: 1, sm: 1.5 }} justifyContent="center">
                <Chip
                  label={
                    phases[currentPhaseIndex].constructionPercentage === 100
                      ? t('myProperty:complete', 'Complete')
                      : `${phases[currentPhaseIndex].constructionPercentage}% ${t('myProperty:complete', 'Complete')}`
                  }
                  size="small"
                  sx={{
                    bgcolor: phases[currentPhaseIndex].constructionPercentage === 100 ? "#8CA551" : "#E5863C",
                    color: "white",
                    fontWeight: 700,
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    height: { xs: 24, sm: 28 },
                    fontFamily: '"Poppins", sans-serif',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#706f6f",
                    fontWeight: 500,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    display: { xs: "block", sm: "inline" },
                    textAlign: "center",
                  }}
                >
  {t(`myProperty:phaseDescription${phases[currentPhaseIndex].phaseNumber}`, PHASE_DESCRIPTIONS[phases[currentPhaseIndex].phaseNumber - 1])}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              size={window.innerWidth < 600 ? "small" : "medium"}
              onClick={handleNextPhase}
              disabled={
                currentPhaseIndex === phases.length - 1 ||
                phases[currentPhaseIndex]?.constructionPercentage < 100
              }
              sx={{
                minWidth: { xs: 80, sm: 100 },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                borderRadius: 2,
                borderColor: '#e0e0e0',
                borderWidth: '2px',
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                ml: { xs: 0, sm: 2 },
                '&:hover': { borderColor: '#333F1F', borderWidth: '2px', bgcolor: 'rgba(51, 63, 31, 0.05)' },
                '&:disabled': { borderColor: '#e0e0e0', color: '#9e9e9e' }
              }}
            >
              {t('myProperty:next', 'Next')}
            </Button>
          </Box>

          {/* Progress Bar */}
          <Box mb={{ xs: 2, md: 3 }} zIndex={2} position="relative">
            <LinearProgress
              variant="determinate"
              value={phases[currentPhaseIndex].constructionPercentage}
              sx={{
                height: { xs: 8, sm: 10, md: 12 },
                borderRadius: 2,
                bgcolor: "#e0e0e0",
                "& .MuiLinearProgress-bar": { bgcolor: "#8CA551", borderRadius: 2 },
              }}
            />
          </Box>

          {/* IMAGE GALLERY */}
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
                watermark="/images/logos/Logo_LakewoodOaks-08.png"
              />
            </Box>
          ) : (
            <Alert
              severity="info"
              icon={<ImageIcon />}
              sx={{
                borderRadius: 3,
                bgcolor: "rgba(140, 165, 81, 0.08)",
                border: "1px solid rgba(140, 165, 81, 0.3)",
                fontFamily: '"Poppins", sans-serif',
                "& .MuiAlert-icon": { color: "#8CA551" }
              }}
            >
              {t('myProperty:noPhaseImages', 'No images uploaded for this phase yet. Images will appear here once construction progresses.')}
            </Alert>
          )}
        </Paper>
      )}
    </Paper>
  )
}

export default ConstructionTab