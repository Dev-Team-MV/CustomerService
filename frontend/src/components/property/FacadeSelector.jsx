import React, { useRef, useEffect, useState } from 'react'
import { Box, Paper, Typography, Card, CardContent, CardMedia, IconButton } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useProperty } from '../../context/PropertyContext'

const SCROLL_GAP_PX = 16

function useScrollControls(itemsCount = 0) {
  const containerRef = useRef(null)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const tolerance = 2
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance)
      setCanScrollPrev(el.scrollLeft > tolerance)
    }

    const t = setTimeout(update, 50)
    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [itemsCount])

  const handleNext = () => {
    const el = containerRef.current
    if (!el) return
    const card = el.querySelector('.facade-card')
    const cardWidth = card?.offsetWidth || 200
    el.scrollBy({ left: cardWidth + SCROLL_GAP_PX, behavior: 'smooth' })
  }

  const handlePrev = () => {
    const el = containerRef.current
    if (!el) return
    const card = el.querySelector('.facade-card')
    const cardWidth = card?.offsetWidth || 200
    el.scrollBy({ left: -(cardWidth + SCROLL_GAP_PX), behavior: 'smooth' })
  }

  return { containerRef, canScrollNext, canScrollPrev, handleNext, handlePrev }
}

const FacadeSelector = () => {
  const { facades, selectedFacade, selectFacade, selectedModel } = useProperty()
  const { containerRef, canScrollNext, canScrollPrev, handleNext, handlePrev } = useScrollControls(facades.length)

  if (!selectedModel) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
          SELECT A MODEL TO VIEW FACADES
        </Typography>
      </Paper>
    )
  }

  if (facades.length === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            03 FACADE SELECTION
          </Typography>
          <Typography variant="caption" color="success.main" fontWeight="bold">
            FOR {selectedModel.model}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
          No facades available for this model
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="subtitle1" fontWeight="bold">
          03 FACADE SELECTION
        </Typography>
        <Typography variant="caption" color="success.main" fontWeight="bold">
          FOR {selectedModel.model}
        </Typography>
      </Box>

      {/* Scroll Container */}
      <Box sx={{ position: 'relative', mx: -1 }}>
        <Box 
          ref={containerRef}
          sx={{ 
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            px: 1,
            pb: 2,
            pt: 2,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {facades.map((facade) => (
            <Card
              key={facade._id}
              onClick={() => selectFacade(facade)}
              className="facade-card"
              sx={{
                minWidth: 200,
                maxWidth: 200,
                flexShrink: 0,
                cursor: 'pointer',
                bgcolor: selectedFacade?._id === facade._id ? '#e8f5e9' : '#fff',
                border: selectedFacade?._id === facade._id ? '2px solid #4a7c59' : '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 2
                }
              }}
            >
              {selectedFacade?._id === facade._id && (
                <CheckCircleIcon 
                  color="success" 
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: '#fff',
                    borderRadius: '50%',
                    zIndex: 1
                  }} 
                />
              )}

              <CardMedia
                component="img"
                height="120"
                image={facade.url || `https://via.placeholder.com/200x120?text=${facade.title}`}
                alt={facade.title}
                sx={{ 
                  objectFit: 'cover',
                  filter: selectedFacade?._id === facade._id ? 'none' : 'grayscale(0.3)'
                }}
              />
              
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {facade.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={facade.price > 0 ? 'success.main' : 'text.secondary'}
                  fontWeight="500"
                >
                  {facade.price > 0 ? `+ $${facade.price.toLocaleString()}` : 'INCLUDED'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Navigation Arrows */}
        {canScrollPrev && (
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: '#fff',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        {canScrollNext && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: '#fff',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  )
}

export default FacadeSelector