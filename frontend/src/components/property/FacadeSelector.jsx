import React, { useRef, useEffect, useState } from 'react'
import { Box, Paper, Typography, Card, CardContent, CardMedia, IconButton } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useProperty } from '../../context/PropertyContext'
import { motion, AnimatePresence } from 'framer-motion' // ✅ Import framer-motion

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
  const { 
    facades, 
    selectedFacade, 
    selectFacade, 
    selectedModel,
    selectedDeck,
    selectDeck
  } = useProperty()
  
  const { containerRef, canScrollNext, canScrollPrev, handleNext, handlePrev } = useScrollControls(facades.length)

  // Deselect facade handler if needed (though clicking another switches)
  const handleDeselectFacade = (e) => {
    e.stopPropagation()
    selectFacade(null)
  }

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
        <Box display="flex" alignItems="center" gap={2}>
           {selectedFacade && (
             <IconButton 
               size="small"
               onClick={handleDeselectFacade}
               sx={{ 
                 border: '1px solid #e0e0e0',
                 borderRadius: 1,
                 p: 0.5
               }}
             >
               <Typography variant="caption" fontWeight="bold">CHANGE FACADE</Typography>
             </IconButton>
           )}
           <Typography variant="caption" color="success.main" fontWeight="bold">
            FOR {selectedModel.model}
          </Typography>
        </Box>
      </Box>

      {/* Main Container with Sliding Effect */}
      <Box sx={{ 
        position: 'relative', 
        height: 380, // Fixed height for consistent layout
        overflow: 'hidden'
      }}>
        
        {/* DECK PANEL (Left Side - slides in) */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '40%',
            maxWidth: 400,
            transform: selectedFacade ? 'translateX(0)' : 'translateX(-110%)',
            opacity: selectedFacade ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {selectedFacade && (
            <Paper 
              elevation={0}
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: 'grey.50',
                overflow: 'hidden'
              }}
            >
              <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="white">
                <Typography variant="subtitle2" fontWeight="bold">
                  Available Decks
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  For {selectedFacade.title}
                </Typography>
              </Box>

              <Box sx={{ overflowY: 'auto', p: 2, flex: 1 }}>
                {selectedFacade.decks && selectedFacade.decks.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {selectedFacade.decks.map((deck, index) => {
                      const isDeckSelected = selectedDeck?.name === deck.name 
                      
                      return (
                        <Card 
                          key={index}
                          elevation={isDeckSelected ? 2 : 0}
                          variant={isDeckSelected ? 'elevation' : 'outlined'}
                          onClick={() => selectDeck(deck)}
                          sx={{ 
                            cursor: 'pointer',
                            borderColor: isDeckSelected ? 'success.main' : 'divider',
                            bgcolor: isDeckSelected ? 'success.50' : 'white',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'success.light',
                              bgcolor: isDeckSelected ? 'success.50' : 'grey.50'
                            }
                          }}
                        >
                          <Box display="flex" p={1.5} gap={2} alignItems="center">
                             <Box 
                               sx={{ 
                                 width: 60, 
                                 height: 60, 
                                 borderRadius: 1, 
                                 bgcolor: 'grey.200',
                                 backgroundImage: deck.images && deck.images.length > 0 ? `url(${deck.images[0]})` : 'none',
                                 backgroundSize: 'cover',
                                 backgroundPosition: 'center',
                                 flexShrink: 0
                               }}
                             />
                             
                             <Box flex={1}>
                               <Typography variant="subtitle2" fontWeight="bold">
                                 {deck.name}
                               </Typography>
                               <Typography variant="body2" color="success.main" fontWeight="bold">
                                 ${deck.price.toLocaleString()}
                               </Typography>
                             </Box>

                             {isDeckSelected && (
                               <CheckCircleIcon color="success" />
                             )}
                          </Box>
                        </Card>
                      )
                    })}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4} color="text.secondary">
                    <Typography variant="body2">
                      No decks available for this facade.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Box>


        {/* FACADES CAROUSEL (Right Side - slides over) */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            left: selectedFacade ? '42%' : 0, // Slide to right
            transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            pl: selectedFacade ? 2 : 0
          }}
        >
          <Box 
            ref={containerRef}
            sx={{ 
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              px: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {facades.map((facade) => {
              const basePrice = facade.price 
              const isSelected = selectedFacade?._id === facade._id
              
              // ✅ Hide others when one is selected (Per user request)
              if (selectedFacade && !isSelected) return null

              // ✅ Determine image to display: Facade default OR Selected Deck image
              let displayImage = facade.url || `https://via.placeholder.com/200x120?text=${facade.title}`
              
              if (isSelected && selectedDeck && selectedDeck.images && selectedDeck.images.length > 0) {
                 displayImage = selectedDeck.images[0]
              }

              return (
                <Card
                  key={facade._id}
                  onClick={() => selectFacade(facade)}
                  className="facade-card"
                  sx={{
                    minWidth: isSelected ? 300 : 220,
                    maxWidth: isSelected ? 300 : 220,
                    flexShrink: 0,
                    cursor: isSelected ? 'default' : 'pointer', // No pointer if already selected (or maybe yes to deselect if logic supported, but usually change button does that)
                    bgcolor: isSelected ? '#e8f5e9' : '#fff',
                    border: isSelected ? '2px solid #4a7c59' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    position: 'relative',
                    height: isSelected ? 320 : 280,
                    display: 'flex',
                    flexDirection: 'column',
                    // opacity removed since others are hidden
                    '&:hover': !isSelected ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 2
                    } : {}
                  }}
                >
                  {isSelected && (
                    <CheckCircleIcon 
                      color="success" 
                      sx={{ 
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: '#fff',
                        borderRadius: '50%',
                        zIndex: 2,
                        fontSize: 28
                      }} 
                    />
                  )}

                  <Box 
                    sx={{ 
                      height: isSelected ? 200 : 150, 
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'height 0.3s'
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={displayImage} // ✅ Triggers animation on change
                        src={displayImage}
                        alt={facade.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: isSelected ? 'none' : 'grayscale(0.1)',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    </AnimatePresence>
                  </Box>
                  
                  <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant={isSelected ? "h6" : "subtitle1"} fontWeight="bold" gutterBottom>
                      {facade.title}
                    </Typography>
                    
                    {facade.price > 0 && (
                      <Typography 
                        variant="caption" 
                        color="success.main"
                        fontWeight="500"
                      >
                        + ${facade.price.toLocaleString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )
            })}
             
             {/* Arrows visible if scrolling needed */}
          </Box>
           
            {/* Overlay Arrows */}
              <>
                {canScrollPrev && (
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: 'absolute',
                      left: selectedFacade ? '42%' : 0, 
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: '#fff',
                      boxShadow: 1,
                      zIndex: 5,
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
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: '#fff',
                      boxShadow: 1,
                      zIndex: 5,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                )}
              </>

        </Box>
      </Box>
    </Paper>
  )
}

export default FacadeSelector