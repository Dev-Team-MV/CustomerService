// @shared/components/Resource/ResourceCard.jsx
import { useState } from 'react'
import { Box, Typography, Divider, IconButton } from '@mui/material'
import {
  HomeOutlined,
  StarBorderOutlined,
  ChevronLeft,
  ChevronRight,
  WeekendOutlined,
  InventoryOutlined,
  TableRestaurantOutlined,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

// ── Feature label + icon ──────────────────────────────────────────────────────
const FeatureTag = ({ label, icon }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Typography
      sx={{
        fontSize: '0.68rem',
        color: '#706f6f',
        fontFamily: '"Poppins", sans-serif',
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
    <Box sx={{ color: '#9ca3af', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
      {icon}
    </Box>
  </Box>
)

// ── Spec row with divider ─────────────────────────────────────────────────────
const SpecRow = ({ label, value, isLast }) => (
  <>
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1.1}>
      <Typography
        sx={{
          fontSize: '0.78rem',
          color: '#9ca3af',
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#1a2e0f',
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {value}
      </Typography>
    </Box>
    {!isLast && <Divider sx={{ borderColor: '#f3f4f6' }} />}
  </>
)

// ── Main card ─────────────────────────────────────────────────────────────────
const ResourceCard = ({
  resource,
  config,
  hovered,
  onHoverStart,
  onHoverEnd,
  onClick,
}) => {
  const images = (resource.images?.length > 0
    ? resource.images
    : [resource.modelImage]
  ).filter(Boolean)

  const [imgIdx, setImgIdx] = useState(0)

  const titleParts = resource.title?.split(' ') || ['', '']
  const lotLabel   = titleParts[0]
  const lotNumber  = titleParts.slice(1).join(' ')

  const handlePrev = (e) => {
    e.stopPropagation()
    setImgIdx((p) => (p - 1 + images.length) % images.length)
  }
  const handleNext = (e) => {
    e.stopPropagation()
    setImgIdx((p) => (p + 1) % images.length)
  }

  // Feature tags
  const features = []
  if (resource.modelType === 'upgrade') {
    features.push({ label: 'Upgrade',     icon: <StarBorderOutlined sx={{ fontSize: 13 }} /> })
  } else if (resource.modelType) {
    features.push({ label: 'Basic',       icon: <HomeOutlined sx={{ fontSize: 13 }} /> })
  }
  if (resource.isModel10 && resource.hasBalcony) {
    features.push({ label: 'Studio',      icon: <WeekendOutlined sx={{ fontSize: 13 }} /> })
  } else if (resource.isModel10 && !resource.hasBalcony) {
    features.push({ label: 'Dining Room', icon: <TableRestaurantOutlined sx={{ fontSize: 13 }} /> })
  }
  if (resource.hasStorage) {
    features.push({ label: 'Storage',     icon: <InventoryOutlined sx={{ fontSize: 13 }} /> })
  }

  // Specs
  const specs = [
    resource.specs?.area      > 0 && { label: 'Area',  value: `${resource.specs.area}mt` },
    resource.specs?.bedrooms  > 0 && { label: 'Beds',  value: resource.specs.bedrooms },
    resource.specs?.bathrooms > 0 && { label: 'Baths', value: resource.specs.bathrooms },
    resource.specs?.floor     > 0 && { label: 'Floor', value: resource.specs.floor },
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <Box
        onClick={onClick}
        sx={{
          bgcolor: 'white',
          borderRadius: '16px',
          border: `1px solid ${hovered ? config.colors.secondary : '#e5e7eb'}`,
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          boxShadow: hovered
            ? `0 8px 28px ${config.colors.primary}15`
            : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* ── Header: lot number + features ── */}
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            {/* Lot label + large number */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: '#9ca3af',
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  mb: 0,
                }}
              >
                {lotLabel}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '3rem', md: '3.8rem' },
                  fontWeight: 700,
                  color: config.colors.primary,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 0.88,
                  letterSpacing: '-2px',
                }}
              >
                {lotNumber}
              </Typography>
            </Box>

            {/* Feature tags stacked */}
            {features.length > 0 && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-end"
                gap={0.6}
                pt={0.5}
              >
                {features.map((f, i) => (
                  <FeatureTag key={i} label={f.label} icon={f.icon} />
                ))}
              </Box>
            )}
          </Box>

          {/* Model name */}
          {resource.model && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: config.colors.primary,
                fontFamily: '"Poppins", sans-serif',
                mt: 0.8,
              }}
            >
              {resource.model}
            </Typography>
          )}
        </Box>

        {/* ── Image carousel ── */}
        {images.length > 0 && (
          <Box
            sx={{
              position: 'relative',
              mx: 2.5,
              mb: 0,
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={images[imgIdx]}
              alt={resource.title}
              sx={{
                width: '100%',
                height: { xs: 160, md: 185 },
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.35s ease',
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
              }}
            />

            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrev}
                  size="small"
                  sx={{
                    position: 'absolute', left: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.88)',
                    width: 28, height: 28,
                    '&:hover': { bgcolor: 'white' },
                  }}
                >
                  <ChevronLeft sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  size="small"
                  sx={{
                    position: 'absolute', right: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.88)',
                    width: 28, height: 28,
                    '&:hover': { bgcolor: 'white' },
                  }}
                >
                  <ChevronRight sx={{ fontSize: 18 }} />
                </IconButton>
              </>
            )}
          </Box>
        )}

        {/* ── Specs rows ── */}
        {specs.length > 0 && (
          <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
            {specs.map((spec, i) => (
              <SpecRow
                key={i}
                label={spec.label}
                value={spec.value}
                isLast={i === specs.length - 1}
              />
            ))}
          </Box>
        )}
      </Box>
    </motion.div>
  )
}

ResourceCard.propTypes = {
  resource:     PropTypes.object.isRequired,
  config:       PropTypes.object.isRequired,
  hovered:      PropTypes.bool,
  onHoverStart: PropTypes.func,
  onHoverEnd:   PropTypes.func,
  onClick:      PropTypes.func,
}

export default ResourceCard
