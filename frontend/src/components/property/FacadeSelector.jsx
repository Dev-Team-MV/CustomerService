import React, { useRef, useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CloseIcon from '@mui/icons-material/Close'
import { useProperty } from '../../context/PropertyContext'
import { motion, AnimatePresence } from 'framer-motion'
import FacadeCard from './facadeComponent/facadeCard';


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

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleDeselectFacade = (e) => {
    e.stopPropagation()
    selectFacade(null)
  }

  const handleCloseDrawer = () => setDrawerOpen(false)

  useEffect(() => {
    if (isMobile && selectedFacade) setDrawerOpen(true)
    if (!selectedFacade) setDrawerOpen(false)
  }, [isMobile, selectedFacade])

  // ✅ PANEL DE DECKS - Estilo brandbook
  const DeckPanel = () => (
    <Paper 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#fafafa',
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
      }}
    >
      {/* Header */}
      <Box 
        p={2.5} 
        sx={{
          bgcolor: 'white',
          borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
        }}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight={700}
          sx={{
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            mb: 0.5
          }}
        >
          Available Decks
        </Typography>
        <Typography 
          variant="caption" 
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.75rem'
          }}
        >
          For {selectedFacade.title}
        </Typography>
      </Box>

      {/* Decks List */}
      <Box 
        sx={{ 
          overflowY: 'auto', 
          p: 2, 
          flex: 1,
          '&::-webkit-scrollbar': {
            width: 6
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(51, 63, 31, 0.2)',
            borderRadius: 3
          }
        }}
      >
        {selectedFacade.decks && selectedFacade.decks.length > 0 ? (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {selectedFacade.decks.map((deck, index) => {
              const isDeckSelected = selectedDeck?.name === deck.name 
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    elevation={0}
                    onClick={() => selectDeck(deck)}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: isDeckSelected ? '2px solid #8CA551' : '1px solid #e0e0e0',
                      bgcolor: isDeckSelected ? 'rgba(140, 165, 81, 0.08)' : 'white',
                      transition: 'all 0.3s',
                      boxShadow: isDeckSelected ? '0 4px 12px rgba(140, 165, 81, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                      '&:hover': {
                        borderColor: '#8CA551',
                        boxShadow: '0 8px 20px rgba(140, 165, 81, 0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box display="flex" p={1.5} gap={2} alignItems="center">
                      {/* Thumbnail */}
                      <Box 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          borderRadius: 2, 
                          bgcolor: '#f5f5f5',
                          backgroundImage: deck.images && deck.images.length > 0 ? `url(${deck.images[0]})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          flexShrink: 0,
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      
                      {/* Info */}
                      <Box flex={1}>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={700}
                          sx={{
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            mb: 0.5
                          }}
                        >
                          {deck.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: '#8CA551',
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: '0.9rem'
                          }}
                        >
                          ${deck.price.toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Check Icon */}
                      {isDeckSelected && (
                        <CheckCircleIcon sx={{ color: '#8CA551', fontSize: 28 }} />
                      )}
                    </Box>
                  </Card>
                </motion.div>
              )
            })}
          </Box>
        ) : (
          <Box 
            textAlign="center" 
            py={6}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px dashed #e0e0e0'
            }}
          >
            <Typography 
              variant="body2"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              No decks available for this facade
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )

  if (!selectedModel) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Typography 
          variant="subtitle1" 
          textAlign="center" 
          sx={{ 
            py: 2,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#706f6f'
          }}
        >
          SELECT A MODEL TO VIEW FACADES
        </Typography>
      </Paper>
    )
  }

  if (facades.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
          pb={2}
          sx={{
            borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
          }}
        >
          <Typography 
            variant="subtitle1" 
            fontWeight={700}
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontSize: '0.95rem'
            }}
          >
            03 Facade Selection
          </Typography>
          <Typography 
            variant="caption" 
            sx={{
              color: '#8CA551',
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            FOR {selectedModel.model}
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          textAlign="center" 
          sx={{ 
            py: 2,
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          No facades available for this model
        </Typography>
      </Paper>
    )
  }

  // ========== MOBILE VIEW ==========
  if (isMobile) {
    return (
      <>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: '#fff', 
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          {/* Header */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            pb={2}
            sx={{
              borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
            }}
          >
            <Typography 
              variant="subtitle1" 
              fontWeight={700}
              sx={{
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontSize: '0.85rem'
              }}
            >
              03 Facade Selection
            </Typography>
            <Chip
              label={`FOR ${selectedModel.model}`}
              size="small"
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.12)',
                color: '#8CA551',
                fontWeight: 700,
                fontSize: '0.65rem',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1px',
                height: 26,
                px: 1
              }}
            />
          </Box>

          {/* Carousel */}
          <Box
            ref={containerRef}
            sx={{ 
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              width: '100%',
              alignItems: 'center',
              px: 1,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                display: 'block',
                height: 6
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(51, 63, 31, 0.2)',
                borderRadius: 3
              }
            }}
          >
          {facades.map((facade) => {
            const isSelected = selectedFacade?._id === facade._id;
            let displayImage = facade.url || `https://via.placeholder.com/200x120?text=${facade.title}`;
            
            if (isSelected && selectedDeck && selectedDeck.images && selectedDeck.images.length > 0) {
              displayImage = selectedDeck.images[0];
            }
            
            return (
              <FacadeCard
                key={facade._id}
                facade={facade}
                isSelected={isSelected}
                isMobile={true}
                displayImage={displayImage}
                onSelect={selectFacade}
              />
            );
          })}
          </Box>
        </Paper>

        {/* Mobile Drawer */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '80vh'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            {/* Drawer Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Facade Details
              </Typography>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon sx={{ color: '#706f6f' }} />
              </IconButton>
            </Box>
            
            {selectedFacade && <DeckPanel />}
          </Box>
        </Drawer>
      </>
    )
  }

  // ========== DESKTOP VIEW ==========
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        bgcolor: '#fff', 
        borderRadius: 4,
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}
    >
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        pb={2}
        sx={{
          borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={700}
          sx={{
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontSize: '0.95rem'
          }}
        >
          03 Facade Selection
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          {selectedFacade && (
            <IconButton 
              size="small"
              onClick={handleDeselectFacade}
              sx={{ 
                borderRadius: 2,
                border: '2px solid #e0e0e0',
                px: 2,
                py: 0.8,
                '&:hover': {
                  borderColor: '#333F1F',
                  bgcolor: 'rgba(51, 63, 31, 0.05)'
                }
              }}
            >
              <Typography 
                variant="caption" 
                fontWeight={700}
                sx={{
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem'
                }}
              >
                Change Facade
              </Typography>
            </IconButton>
          )}
          <Chip
            label={`FOR ${selectedModel.model}`}
            size="small"
            sx={{
              bgcolor: 'rgba(140, 165, 81, 0.12)',
              color: '#8CA551',
              fontWeight: 700,
              fontSize: '0.65rem',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1px',
              height: 26,
              px: 1
            }}
          />
        </Box>
      </Box>

      {/* Main Container */}
      <Box sx={{ 
        position: 'relative', 
        height: 400,
        overflow: 'hidden'
      }}>
        {/* Deck Panel (Left) */}
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
            zIndex: 10
          }}
        >
          {selectedFacade && <DeckPanel />}
        </Box>

        {/* Facades Carousel (Right) */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            left: selectedFacade ? '42%' : 0,
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
            const isSelected = selectedFacade?._id === facade._id;
            if (selectedFacade && !isSelected) return null;
            
            let displayImage = facade.url || `https://via.placeholder.com/200x120?text=${facade.title}`;
            if (isSelected && selectedDeck && selectedDeck.images && selectedDeck.images.length > 0) {
              displayImage = selectedDeck.images[0];
            }

            return (
              <FacadeCard
                key={facade._id}
                facade={facade}
                isSelected={isSelected}
                isMobile={false}
                displayImage={displayImage}
                onSelect={selectFacade}
              />
            );
          })}
          </Box>

          {/* Scroll Arrows */}
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 5,
                  width: 40,
                  height: 40,
                  '&:hover': { 
                    bgcolor: '#f5f5f5',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    '& .MuiSvgIcon-root': {
                      color: '#333F1F'
                    }
                  }
                }}
              >
                <ChevronLeftIcon sx={{ color: '#706f6f' }} />
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 5,
                  width: 40,
                  height: 40,
                  '&:hover': { 
                    bgcolor: '#f5f5f5',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    '& .MuiSvgIcon-root': {
                      color: '#333F1F'
                    }
                  }
                }}
              >
                <ChevronRightIcon sx={{ color: '#706f6f' }} />
              </IconButton>
            )}
          </>
        </Box>
      </Box>
    </Paper>
  )
}

export default FacadeSelector