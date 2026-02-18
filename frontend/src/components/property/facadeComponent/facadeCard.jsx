import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const FacadeCard = ({
  facade,
  isSelected,
  isMobile,
  displayImage,
  onSelect
}) => {
  const cardWidth = {
    mobile: { min: 220, max: 220 },
    desktop: {
      min: isSelected ? 320 : 240,
      max: isSelected ? 320 : 240
    }
  };

  const cardHeight = {
    mobile: 280,
    desktop: isSelected ? 340 : 300
  };

  const imageHeight = {
    mobile: 150,
    desktop: isSelected ? 210 : 170
  };

  const width = isMobile ? cardWidth.mobile : cardWidth.desktop;
  const height = isMobile ? cardHeight.mobile : cardHeight.desktop;
  const imgHeight = isMobile ? imageHeight.mobile : imageHeight.desktop;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={!isSelected || isMobile ? { scale: 1.02 } : {}}
    >
      <Card
        onClick={() => onSelect(facade)}
        className="facade-card"
        sx={{
          minWidth: width.min,
          maxWidth: width.max,
          flexShrink: 0,
          cursor: isSelected && !isMobile ? 'default' : 'pointer',
          bgcolor: isSelected ? 'rgba(140, 165, 81, 0.08)' : '#fff',
          border: isSelected ? '2px solid #8CA551' : '1px solid #e0e0e0',
          borderRadius: 3,
          transition: 'all 0.3s',
          position: 'relative',
          height,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isSelected 
            ? '0 8px 24px rgba(140, 165, 81, 0.15)' 
            : '0 4px 12px rgba(0,0,0,0.04)',
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
              top: 12,
              right: 12,
              bgcolor: 'white',
              borderRadius: '50%',
              zIndex: 2,
              fontSize: isMobile ? 28 : 32,
              color: '#8CA551'
            }} 
          />
        )}
        
        {/* Image Container */}
        <Box 
          sx={{ 
            height: imgHeight, 
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#f5f5f5',
            transition: 'height 0.3s'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={displayImage}
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
        
        {/* Card Content */}
        <CardContent 
          sx={{ 
            p: isSelected && !isMobile ? 3 : 2, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            bgcolor: isSelected ? 'rgba(140, 165, 81, 0.05)' : 'white',
            transition: 'all 0.3s'
          }}
        >
          <Typography 
            variant={isSelected && !isMobile ? "h6" : "subtitle1"} 
            fontWeight={700} 
            gutterBottom
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '0.5px'
            }}
          >
            {facade.title}
          </Typography>
          
          {facade.price > 0 && (
            <Typography 
              variant="caption" 
              sx={{
                color: '#8CA551',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                fontSize: isSelected && !isMobile ? '1rem' : '0.85rem'
              }}
            >
              + ${facade.price.toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FacadeCard;