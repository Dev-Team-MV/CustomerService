import { useState } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight, PlayCircle } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const PhaseMediaGallery = ({ mediaItems, onMediaClick }) => {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!mediaItems || mediaItems.length === 0) {
    return null
  }

  const currentItem = mediaItems[currentIndex]
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < mediaItems.length - 1

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  return (
    <Box>
      {/* Main Image/Video Display */}
      <Box
        sx={{
          bgcolor: '#000',
          borderRadius: 3,
          p: 2,
          minHeight: 280,
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentItem.mediaType === 'video' ? (
              <Box
                onClick={() => onMediaClick?.(currentItem)}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <video
                  src={currentItem.url}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
                <PlayCircle
                  sx={{
                    position: 'absolute',
                    fontSize: 64,
                    color: 'white',
                    opacity: 0.8,
                    pointerEvents: 'none'
                  }}
                />
              </Box>
            ) : (
              <img
                src={currentItem.url}
                alt={currentItem.title || 'Phase media'}
                onClick={() => onMediaClick?.(currentItem)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  borderRadius: 8
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              disabled={!canGoPrev}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(0,0,0,0.3)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={handleNext}
              disabled={!canGoNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(0,0,0,0.3)'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {/* Counter */}
        {mediaItems.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {currentIndex + 1} / {mediaItems.length}
          </Box>
        )}

        {/* Title */}
        {currentItem.title && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.85rem',
              fontWeight: 600,
              maxWidth: '60%'
            }}
          >
            {currentItem.title}
          </Box>
        )}
      </Box>

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.primary.main + '33',
              borderRadius: 3
            }
          }}
        >
          {mediaItems.map((item, index) => (
            <Box
              key={item._id}
              onClick={() => setCurrentIndex(index)}
              sx={{
                minWidth: 80,
                width: 80,
                height: 60,
                borderRadius: 1.5,
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === currentIndex
                  ? `2.5px solid ${theme.palette.primary.main}`
                  : `1.5px solid ${theme.palette.cardBorder}`,
                boxShadow: index === currentIndex
                  ? `0 4px 12px ${theme.palette.primary.main}4D`
                  : 'none',
                transition: 'all 0.25s ease',
                position: 'relative',
                bgcolor: '#000',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderColor: index === currentIndex 
                    ? theme.palette.primary.main 
                    : theme.palette.secondary.main
                }
              }}
            >
              {item.mediaType === 'video' ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#000'
                  }}
                >
                  <PlayCircle sx={{ fontSize: 24, color: 'white', opacity: 0.8 }} />
                </Box>
              ) : (
                <img
                  src={item.url}
                  alt={item.title || `Media ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default PhaseMediaGallery