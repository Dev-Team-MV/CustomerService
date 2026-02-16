import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogContent
} from '@mui/material'
import {
  Construction,
  CheckCircle,
  LockOpen,
  Lock,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Cancel,
  Image as ImageIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

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

const ConstructionTab = ({ phases, loadingPhases }) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [phaseCarouselIndex, setPhaseCarouselIndex] = useState(0)
  const [phaseLightboxOpen, setPhaseLightboxOpen] = useState(false)

  // ✅ Auto-select first incomplete phase
  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(
        (p) => p.constructionPercentage < 100
      )
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  // ✅ Reset carousel when phase changes
  useEffect(() => {
    const items = phases[currentPhaseIndex]?.mediaItems || []
    setPhaseCarouselIndex(items.length > 0 ? 0 : 0)
  }, [currentPhaseIndex, phases])

  // ✅ Carousel navigation
  const handlePhaseCarouselPrev = () => {
    if (!phases[currentPhaseIndex]?.mediaItems?.length) return
    setPhaseCarouselIndex(
      (i) =>
        (i - 1 + phases[currentPhaseIndex].mediaItems.length) %
        phases[currentPhaseIndex].mediaItems.length
    )
  }

  const handlePhaseCarouselNext = () => {
    if (!phases[currentPhaseIndex]?.mediaItems?.length) return
    setPhaseCarouselIndex(
      (i) => (i + 1) % phases[currentPhaseIndex].mediaItems.length
    )
  }

  // ✅ Phase navigation
  const handlePreviousPhase = () => {
    setCurrentPhaseIndex((i) => {
      const newIndex = Math.max(i - 1, 0)
      setPhaseCarouselIndex(0)
      return newIndex
    })
  }

  const handleNextPhase = () => {
    setCurrentPhaseIndex((i) => {
      const newIndex = Math.min(i + 1, phases.length - 1)
      setPhaseCarouselIndex(0)
      return newIndex
    })
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
      {/* ✅ HEADER - Brandbook */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={4}
        pb={3}
        sx={{
          borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
        }}
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
          <Construction
            sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: "white" }}
          />
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
            Construction Progress
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: "0.75rem", sm: "0.85rem" }
            }}
          >
            Track each phase of your property construction
          </Typography>
        </Box>
      </Box>

      {/* ✅ PHASE NAVIGATION - Brandbook */}
      {/* <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="center"
        mb={3}
        gap={{ xs: 1.5, sm: 2 }}
      >
        <Button
          variant="outlined"
          size={window.innerWidth < 600 ? "small" : "medium"}
          onClick={handlePreviousPhase}
          disabled={currentPhaseIndex === 0}
          sx={{
            minWidth: { xs: 100, sm: 120 },
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            borderRadius: 2,
            borderColor: '#e0e0e0',
            borderWidth: '2px',
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#333F1F',
              borderWidth: '2px',
              bgcolor: 'rgba(51, 63, 31, 0.05)'
            },
            '&:disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          Previous
        </Button>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            textAlign: "center",
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          Phase {phases[currentPhaseIndex]?.phaseNumber} of {phases.length}
        </Typography>
        <Button
          variant="outlined"
          size={window.innerWidth < 600 ? "small" : "medium"}
          onClick={handleNextPhase}
          disabled={
            currentPhaseIndex === phases.length - 1 ||
            phases[currentPhaseIndex]?.constructionPercentage < 100
          }
          sx={{
            minWidth: { xs: 100, sm: 120 },
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            borderRadius: 2,
            borderColor: '#e0e0e0',
            borderWidth: '2px',
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#333F1F',
              borderWidth: '2px',
              bgcolor: 'rgba(51, 63, 31, 0.05)'
            },
            '&:disabled': {
              borderColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
        >
          Next
        </Button>
      </Box> */}

      {/* ✅ PHASE CONTENT - Brandbook */}
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
            overflow: "hidden",
            transition: "box-shadow 0.3s",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(51, 63, 31, 0.1)",
            },
          }}
        >
          {/* ✅ Decorative bar */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: { xs: 3, md: 4 },
              bgcolor: "#8CA551",
              opacity: 0.8,
              zIndex: 1,
            }}
          />


        

        
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems="center"
          gap={{ xs: 2, sm: 2, md: 3 }}
          mb={{ xs: 2, md: 3 }}
          zIndex={2}
          position="relative"
        >
          {/* Botón Previous */}
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
              '&:hover': {
                borderColor: '#333F1F',
                borderWidth: '2px',
                bgcolor: 'rgba(51, 63, 31, 0.05)'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            Previous
          </Button>
        
          {/* Información de la fase - centrado */}
          <Box
            flex={1}
            textAlign="center"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
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
              Phase {phases[currentPhaseIndex].phaseNumber}:{" "}
              {phases[currentPhaseIndex].title}
            </Typography>
        
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems="center"
              gap={{ xs: 1, sm: 1.5 }}
              justifyContent="center"
            >
              <Chip
                label={
                  phases[currentPhaseIndex].constructionPercentage === 100
                    ? "100% Complete"
                    : `${phases[currentPhaseIndex].constructionPercentage}% Complete`
                }
                size="small"
                sx={{
                  bgcolor: phases[currentPhaseIndex].constructionPercentage === 100
                    ? "#8CA551"
                    : "#E5863C",
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
                {PHASE_DESCRIPTIONS[phases[currentPhaseIndex].phaseNumber - 1]}
              </Typography>
            </Box>
          </Box>
        
          {/* Botón Next */}
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
              '&:hover': {
                borderColor: '#333F1F',
                borderWidth: '2px',
                bgcolor: 'rgba(51, 63, 31, 0.05)'
              },
              '&:disabled': {
                borderColor: '#e0e0e0',
                color: '#9e9e9e'
              }
            }}
          >
            Next
          </Button>
        </Box>
        



          {/* ✅ PROGRESS BAR - Brandbook */}
          <Box mb={{ xs: 2, md: 3 }} zIndex={2} position="relative">
            <LinearProgress
              variant="determinate"
              value={phases[currentPhaseIndex].constructionPercentage}
              sx={{
                height: { xs: 8, sm: 10, md: 12 },
                borderRadius: 2,
                bgcolor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#8CA551",
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* ✅ IMAGE GALLERY - Brandbook */}
          {phases[currentPhaseIndex].mediaItems &&
          phases[currentPhaseIndex].mediaItems.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              {/* Main Carousel */}
              <Box
                sx={{
                  bgcolor: "#000",
                  borderRadius: 2,
                  p: 2,
                  minHeight: 280,
                  height: { xs: 300, sm: 340, md: 380 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <AnimatePresence mode="wait">
                  {(() => {
                    const items = phases[currentPhaseIndex].mediaItems
                    const safeIndex = Math.min(phaseCarouselIndex, items.length - 1)
                    const currentImage = items[safeIndex]
                    return currentImage ? (
                      <motion.img
                        key={`phase-carousel-${currentPhaseIndex}-${safeIndex}`}
                        src={currentImage.url}
                        alt={currentImage.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          maxWidth: "90%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                        onClick={() => setPhaseLightboxOpen(true)}
                      />
                    ) : (
                      <Typography
                        sx={{
                          color: "white",
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        No images available for this phase
                      </Typography>
                    )
                  })()}
                </AnimatePresence>

                {phases[currentPhaseIndex].mediaItems.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePhaseCarouselPrev}
                      sx={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.95)",
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'white',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <KeyboardArrowLeft sx={{ color: '#333F1F' }} />
                    </IconButton>
                    <IconButton
                      onClick={handlePhaseCarouselNext}
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.95)",
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'white',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <KeyboardArrowRight sx={{ color: '#333F1F' }} />
                    </IconButton>
                  </>
                )}

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    bgcolor: "rgba(51, 63, 31, 0.9)",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {Math.min(
                      phaseCarouselIndex + 1,
                      phases[currentPhaseIndex].mediaItems.length
                    )}{" "}
                    / {phases[currentPhaseIndex].mediaItems.length}
                  </Typography>
                </Box>
              </Box>

              {/* Thumbnails */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 1,
                  overflowX: "auto",
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    height: 6
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(51, 63, 31, 0.2)',
                    borderRadius: 3
                  }
                }}
              >
                {phases[currentPhaseIndex].mediaItems.map((media, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setPhaseCarouselIndex(idx)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: idx === phaseCarouselIndex
                        ? "2px solid #8CA551"
                        : "1px solid #e0e0e0",
                      boxShadow: idx === phaseCarouselIndex
                        ? "0 4px 12px rgba(140, 165, 81, 0.2)"
                        : "none",
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#8CA551'
                      }
                    }}
                  >
                    <img
                      src={media.url}
                      alt={media.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Lightbox */}
              <Dialog
                open={phaseLightboxOpen}
                onClose={() => setPhaseLightboxOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                  sx: {
                    bgcolor: "transparent",
                    boxShadow: "none"
                  }
                }}
              >
                <DialogContent
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "transparent",
                    p: 0
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <IconButton
                      onClick={() => setPhaseLightboxOpen(false)}
                      sx={{
                        position: "absolute",
                        top: -50,
                        right: 0,
                        color: "white",
                        bgcolor: "rgba(51, 63, 31, 0.8)",
                        zIndex: 10,
                        "&:hover": {
                          bgcolor: "rgba(51, 63, 31, 0.95)",
                          transform: "scale(1.1)"
                        },
                      }}
                    >
                      <Cancel />
                    </IconButton>
                    {(() => {
                      const items = phases[currentPhaseIndex].mediaItems
                      const safeIndex = Math.min(phaseCarouselIndex, items.length - 1)
                      const currentImage = items[safeIndex]
                      return (
                        currentImage && (
                          <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={currentImage.url}
                            alt="phase-lightbox"
                            style={{
                              width: "100%",
                              maxHeight: "85vh",
                              objectFit: "contain",
                              borderRadius: 12,
                              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
                            }}
                          />
                        )
                      )
                    })()}
                  </Box>
                </DialogContent>
              </Dialog>
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
                "& .MuiAlert-icon": {
                  color: "#8CA551"
                }
              }}
            >
              No images uploaded for this phase yet. Images will appear here once construction progresses.
            </Alert>
          )}
        </Paper>
      )}
    </Paper>
  )
}

export default ConstructionTab