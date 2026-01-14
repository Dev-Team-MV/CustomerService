import React, { useRef, useEffect, useState } from 'react'
import { Box, Paper, Typography, Card, CardContent, CardMedia, Chip, IconButton } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useProperty } from '../../context/PropertyContext'

// Scroll control hooks & logic
const SCROLL_GAP_PX = 16 // matches theme gap: 2 -> 16px

function useScrollControls(itemsCount = 0) {
  const containerRef = useRef(null)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      // small epsilon to avoid floating rounding issues
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
      setCanScrollPrev(el.scrollLeft > 1)
    }

    // run a first time (delay slightly to let layout settle)
    const t = setTimeout(update, 50)

    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
    // re-run when number of items changes so we recalc overflow
  }, [containerRef, itemsCount])

  const handleNext = () => {
    const el = containerRef.current
    if (!el) return
    const card = el.querySelector('.facade-card')
    const cardWidth = (card && card.offsetWidth) ? card.offsetWidth : 180
    const amount = cardWidth + SCROLL_GAP_PX
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handlePrev = () => {
    const el = containerRef.current
    if (!el) return
    const card = el.querySelector('.facade-card')
    const cardWidth = (card && card.offsetWidth) ? card.offsetWidth : 180
    const amount = cardWidth + SCROLL_GAP_PX
    el.scrollBy({ left: -amount, behavior: 'smooth' })
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
          color: '#000',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          textAlign: 'center',
          opacity: 0.7
        }}
      >
        <Typography variant="subtitle1" sx={{ color: '#999', py: 2 }}>
          SELECCIONE UN MODELO PARA VER FACHADAS
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
        color: '#000',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
          03 SELECCIÓN DE FACHADA
        </Typography>
        <Typography variant="caption" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>
          FOR {selectedModel.modelNumber}
        </Typography>
      </Box>

      {/* Scroll container wrapper - reserve side padding so arrows don't overlap content */}
      <Box sx={{ position: 'relative', px: '56px' }}>
        <Box 
          ref={containerRef}
          sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto', 
            pb: 2,
            // Hide native scrollbar across browsers but keep scroll functionality
            scrollbarWidth: 'none', // Firefox
            '-ms-overflow-style': 'none', // IE 10+
            '&::-webkit-scrollbar': { display: 'none', height: 0 } // WebKit
          }}
        >
          {facades.map((facade) => (
            <Card
            key={facade.id}
            onClick={() => selectFacade(facade)}
            sx={{
              minWidth: 180,
              flexShrink: 0,
              cursor: 'pointer',
              bgcolor: selectedFacade?.id === facade.id ? '#e8f5e9' : '#fff',
              border: selectedFacade?.id === facade.id ? '2px solid #4a7c59' : '1px solid #e0e0e0',
              borderRadius: 2,
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            className="facade-card"
          >
            {selectedFacade?.id === facade.id && (
              <CheckCircleIcon 
                color="success" 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  zIndex: 2,
                  bgcolor: '#fff',
                  borderRadius: '50%'
                }} 
              />
            )}

            <CardMedia
              component="img"
              height="100"
              image={facade.image || `https://via.placeholder.com/200x120?text=${facade.name}`}
              alt={facade.name}
              sx={{ filter: selectedFacade?.id === facade.id ? 'none' : 'grayscale(0.5)' }}
            />
            
            <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                {facade.name}
              </Typography>
              <Typography variant="caption" sx={{ color: facade.priceModifier > 0 ? '#4caf50' : '#666' }}>
                {facade.priceModifier > 0 ? `+ $${facade.priceModifier.toLocaleString()}` : 'INCLUDED'}
              </Typography>
            </CardContent>
          </Card>
          ))}
        </Box>

        {/* Left arrow */}
        <IconButton
          onClick={handlePrev}
          aria-label="previous facade"
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            bgcolor: '#fff',
            boxShadow: 1,
            width: 44,
            height: 44,
            display: canScrollPrev ? 'flex' : 'none'
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Right arrow */}
        <IconButton
          onClick={handleNext}
          aria-label="next facade"
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            bgcolor: '#fff',
            boxShadow: 1,
            width: 44,
            height: 44,
            display: canScrollNext ? 'flex' : 'none'
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default FacadeSelector
