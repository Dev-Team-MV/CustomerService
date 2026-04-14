// @shared/components/Resource/ResourceCard.jsx
import React from 'react'
import { Card, CardContent, Box, Typography, Chip } from '@mui/material'
import { Home, Apartment, LocationOn, Bed, Bathtub, SquareFoot, Share, Layers, Star, AutoAwesome } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const ResourceCard = ({
  resource,
  config,
  hovered,
  onHoverStart,
  onHoverEnd,
  onClick
}) => {
  console.log(`🎴 [ResourceCard:${config.type}] Rendering card with resource:`, resource)
  console.log(`🎴 [ResourceCard:${config.type}] Config:`, config)
  
  const Icon = config.type === 'property' ? Home : Apartment
  const isProperty = config.type === 'property'
  const isApartment = config.type === 'apartment'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          minHeight: { xs: 420, sm: 440, md: 460 },
          borderRadius: 6,
          cursor: 'pointer',
          border: hovered
            ? `2px solid ${config.colors.primary}`
            : `1.5px solid ${config.colors.border}`,
          boxShadow: hovered
            ? `0 24px 60px ${config.colors.primary}40`
            : '0 12px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Chips Container - Top Right */}
        <Box sx={{ 
          position: 'absolute', 
          top: 12, 
          right: 12, 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5,
          alignItems: 'flex-end'
        }}>
          {/* Shared Badge */}
          {resource.isShared && (
            <Chip
              icon={<Share sx={{ fontSize: 14 }} />}
              label="Shared with you"
              size="small"
              sx={{
                bgcolor: '#e3f2fd',
                color: '#1565c0',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 26,
                border: '1px solid #90caf9'
              }}
            />
          )}

          {/* Model Type Chip - For Properties */}
          {isProperty && resource.modelType && (
            <Chip
              icon={<Star sx={{ fontSize: 14 }} />}
              label={resource.modelType === 'upgrade' ? 'Upgrade' : 'Basic'}
              size="small"
              sx={{
                bgcolor: resource.modelType === 'upgrade' ? '#fff3e0' : '#f5f5f5',
                color: resource.modelType === 'upgrade' ? '#e65100' : '#616161',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                border: resource.modelType === 'upgrade' ? '1px solid #ffb74d' : '1px solid #bdbdbd'
              }}
            />
          )}

          {/* Model Type Chip - For Apartments */}
          {isApartment && resource.modelType && (
            <Chip
              icon={<Star sx={{ fontSize: 14 }} />}
              label={resource.modelType === 'upgrade' ? 'Upgrade' : 'Basic'}
              size="small"
              sx={{
                bgcolor: resource.modelType === 'upgrade' ? '#fff3e0' : '#f5f5f5',
                color: resource.modelType === 'upgrade' ? '#e65100' : '#616161',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                border: resource.modelType === 'upgrade' ? '1px solid #ffb74d' : '1px solid #bdbdbd'
              }}
            />
          )}
          
          {/* Balcony/Studio Chip - For Properties */}
          {isProperty && resource.hasBalcony && (
            <Chip
              icon={<AutoAwesome sx={{ fontSize: 14 }} />}
              label={resource.isModel10 ? 'Studio' : 'Balcony'}
              size="small"
              sx={{
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                border: '1px solid #81c784'
              }}
            />
          )}
          
          {/* Comedor para Model 10 sin balcony - For Properties */}
          {isProperty && resource.isModel10 && !resource.hasBalcony && (
            <Chip
              icon={<Home sx={{ fontSize: 14 }} />}
              label="Comedor"
              size="small"
              sx={{
                bgcolor: '#fff3e0',
                color: '#e65100',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                border: '1px solid #ffb74d'
              }}
            />
          )}
          
          {/* Storage Chip - For Properties */}
          {isProperty && resource.hasStorage && (
            <Chip
              icon={<Layers sx={{ fontSize: 14 }} />}
              label="Storage"
              size="small"
              sx={{
                bgcolor: '#e3f2fd',
                color: '#1565c0',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                border: '1px solid #90caf9'
              }}
            />
          )}
        </Box>

        {/* Top Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: hovered ? config.colors.gradient : config.colors.secondary,
            transition: 'all 0.3s ease'
          }}
        />

        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            pt: 3.5,
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header with Icon and Model */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <motion.div
              animate={hovered ? { scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  borderRadius: 3,
                  background: config.colors.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${config.colors.primary}30`,
                  border: '2px solid white'
                }}
              >
                <Icon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'white' }} />
              </Box>
            </motion.div>

            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: config.colors.primary,
                  mb: 0.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                {resource.title}
              </Typography>
              {resource.model && (
                <Chip
                  label={resource.model}
                  size="small"
                  sx={{
                    bgcolor: `${config.colors.secondary}20`,
                    color: config.colors.primary,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Model Image */}
          {resource.modelImage && (
            <Box
              sx={{
                width: '100%',
                height: { xs: 180, sm: 200 },
                borderRadius: 3,
                overflow: 'hidden',
                mb: 2.5,
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: hovered
                    ? 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)'
                    : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <img
                src={resource.modelImage}
                alt={resource.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)'
                }}
              />
            </Box>
          )}

          {/* Location/Subtitle */}
          <Box display="flex" alignItems="center" gap={1} mb={2.5}>
            <LocationOn sx={{ fontSize: 18, color: config.colors.secondary }} />
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontWeight: 500,
                fontSize: { xs: '0.85rem', sm: '0.9rem' }
              }}
            >
              {resource.subtitle}
            </Typography>
          </Box>

          {/* Specs Grid */}
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap={1.5}
            mt="auto"
          >
            {/* Area */}
            {resource.specs.area > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${config.colors.secondary}10`,
                  border: `1px solid ${config.colors.secondary}30`
                }}
              >
                <SquareFoot sx={{ fontSize: 20, color: config.colors.secondary }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Area
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {resource.specs.area} m²
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Bedrooms */}
            {resource.specs.bedrooms > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${config.colors.secondary}10`,
                  border: `1px solid ${config.colors.secondary}30`
                }}
              >
                <Bed sx={{ fontSize: 20, color: config.colors.secondary }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Beds
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {resource.specs.bedrooms}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Bathrooms */}
            {resource.specs.bathrooms > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${config.colors.secondary}10`,
                  border: `1px solid ${config.colors.secondary}30`
                }}
              >
                <Bathtub sx={{ fontSize: 20, color: config.colors.secondary }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Baths
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {resource.specs.bathrooms}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Floor (for apartments) */}
            {resource.specs.floor > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${config.colors.secondary}10`,
                  border: `1px solid ${config.colors.secondary}30`
                }}
              >
                <Layers sx={{ fontSize: 20, color: config.colors.secondary }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Floor
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {resource.specs.floor}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

ResourceCard.propTypes = {
  resource: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  hovered: PropTypes.bool,
  onHoverStart: PropTypes.func,
  onHoverEnd: PropTypes.func,
  onClick: PropTypes.func
}

export default ResourceCard