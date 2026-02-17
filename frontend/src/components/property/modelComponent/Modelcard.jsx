import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import { Home, Bed, Bathtub, SquareFoot, ChevronLeft, ChevronRight, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ModelCard = ({
  model,
  isSelected,
  isMobile,
  isLarge,
  currentImageIndex,
  modelImages,
  onSelect,
  onPrevImage,
  onNextImage
}) => {
  const currentImage = modelImages[currentImageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={!isSelected || isMobile ? { scale: 1.02 } : {}}
    >
      <Card
        onClick={() => !isSelected && onSelect(model)}
        sx={{
          minWidth: { xs: 260, md: 300, lg: 400 },
          maxWidth: isSelected && !isMobile 
            ? (isLarge ? 420 : 350)
            : isMobile ? 260 : 300,
          flexShrink: 0,
          cursor: isSelected && !isMobile ? 'default' : 'pointer',
          bgcolor: isSelected ? 'rgba(140, 165, 81, 0.08)' : '#fff',
          border: isSelected ? '2px solid #8CA551' : '1px solid #e0e0e0',
          borderRadius: 3,
          position: 'relative',
          boxShadow: isSelected ? '0 8px 24px rgba(140, 165, 81, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          '&:hover': !isSelected || isMobile ? {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            borderColor: '#8CA551'
          } : {}
        }}
      >
        {/* Selected Icon */}
        {isSelected && (
          <CheckCircle 
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'white',
              borderRadius: '50%',
              zIndex: 2,
              fontSize: isMobile ? 24 : 32,
              color: '#8CA551'
            }} 
          />
        )}

        {/* Image Container */}
        <Box
          sx={{
            width: '100%',
            height: { xs: 160, md: 240, lg: 250 },
            bgcolor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: currentImage ? `url(${currentImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            transition: 'height 0.3s ease'
          }}
        >
          {!currentImage && <Home sx={{ fontSize: isMobile ? 40 : 60, color: '#e0e0e0' }} />}
          
          {/* Navigation Arrows */}
          {modelImages.length > 1 && (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevImage(model._id, modelImages.length);
                }}
                sx={{
                  position: 'absolute',
                  left: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  width: isMobile ? 28 : 36,
                  height: isMobile ? 28 : 36,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <ChevronLeft fontSize={isMobile ? "small" : "medium"} sx={{ color: '#333F1F' }} />
              </IconButton>
              
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onNextImage(model._id, modelImages.length);
                }}
                sx={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  width: isMobile ? 28 : 36,
                  height: isMobile ? 28 : 36,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <ChevronRight fontSize={isMobile ? "small" : "medium"} sx={{ color: '#333F1F' }} />
              </IconButton>
              
              <Chip
                label={`${currentImageIndex + 1}/${modelImages.length}`}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  bgcolor: 'rgba(51, 63, 31, 0.9)',
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 20,
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600
                }}
              />
            </>
          )}
        </Box>

        {/* Card Content */}
        <CardContent sx={{ p: isMobile ? 1.5 : 2.5 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              fontWeight={700}
              sx={{ 
                flex: 1, 
                minWidth: 0,
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              {model.model}
            </Typography>
            <Typography 
              variant={isSelected && !isMobile ? "h5" : isMobile ? "body1" : "h6"} 
              sx={{ 
                color: '#8CA551',
                fontWeight: 700,
                ml: 1,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              ${(model.price / 1000).toFixed(0)}K
            </Typography>
          </Box>

          <Typography 
            variant="caption" 
            display="block" 
            mb={isMobile ? 1 : 2}
            sx={{
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.75rem'
            }}
          >
            Model #{model.modelNumber}
          </Typography>

          {/* Specs Grid */}
          <Box 
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={0}
            mb={isMobile ? 1 : 2}
            sx={{
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}
          >
            <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
              <Bed fontSize="small" sx={{ color: '#999', mb: 0.3 }} />
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                fontWeight={600}
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {model.bedrooms}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
              <Bathtub fontSize="small" sx={{ color: '#999', mb: 0.3 }} />
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                fontWeight={600}
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {model.bathrooms}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <SquareFoot fontSize="small" sx={{ color: '#999', mb: 0.3 }} />
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                fontWeight={600}
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {model.sqft?.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Description */}
          {model.description && !isMobile && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: '-webkit-box',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.5,
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.75rem'
              }}
            >
              {model.description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModelCard;