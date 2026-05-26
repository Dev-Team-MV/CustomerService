// @shared/components/Resource/ResourceDetailHeader.jsx
import { useState } from 'react'
import { Box, Typography, Chip, Divider, IconButton } from '@mui/material'
import {
  HomeOutlined,
  StarBorderOutlined,
  WeekendOutlined,
  InventoryOutlined,
  TableRestaurantOutlined,
  Construction,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { MODEL_10_ID } from '../../config/resourceConfig'

// ── helpers ───────────────────────────────────────────────────────────────────
const extractUrl = (item) => {
  if (!item) return null
  if (typeof item === 'string') return item
  if (item.url) {
    if (Array.isArray(item.url) && item.url.length > 0)
      return typeof item.url[0] === 'string' ? item.url[0] : null
    if (typeof item.url === 'string') return item.url
  }
  return null
}

const FeatureChip = ({ label, icon, color = '#706f6f' }) => (
  <Chip
    label={label}
    icon={icon}
    size="small"
    sx={{
      bgcolor: 'transparent',
      border: `1.5px solid ${color}50`,
      color,
      fontWeight: 600,
      fontSize: '0.72rem',
      height: 28,
      fontFamily: '"DM Sans", sans-serif',
      '& .MuiChip-icon': { color, fontSize: 14 },
    }}
  />
)

// ── main ──────────────────────────────────────────────────────────────────────
const ResourceDetailHeader = ({ details, resourceType, config }) => {
  const { t } = useTranslation(config.i18n.namespace)
  const [imgIdx, setImgIdx] = useState(0)

  const resource  = details?.[resourceType] || details
  const model     = details?.model || resource?.model || resource?.apartmentModel
  const isProperty = resourceType === 'property'
  const isModel10  = model?._id === MODEL_10_ID

  // ── title ──
  const modelName  = model?.model || model?.name || '—'
  const nameParts  = modelName.split(' ')
  const nameLight  = nameParts.slice(0, -1).join(' ')
  const nameBold   = nameParts[nameParts.length - 1]

  const lotTitle = isProperty
    ? (resource?.lot?.number ? `Lot ${resource.lot.number}` : t('propertyLabel', 'Property'))
    : (resource?.apartmentNumber ? `Apt ${resource.apartmentNumber}` : t('apartment', 'Apartment'))

  const price    = resource?.price || 0
  const totalPct = resource?.totalConstructionPercentage ?? 0

  // ── specs ──
  const areaValue      = isProperty ? (details?.property?.sqft || model?.sqft || 0) : (model?.sqft || 0)
  const bedroomsValue  = isProperty ? (details?.property?.bedrooms  || model?.bedrooms  || 0) : (model?.bedrooms  || 0)
  const bathroomsValue = isProperty ? (details?.property?.bathrooms || model?.bathrooms || 0) : (model?.bathrooms || 0)
  const specs = [
    areaValue      && { label: 'Area',  value: `${areaValue}mt` },
    bedroomsValue  && { label: 'Beds',  value: bedroomsValue },
    bathroomsValue && { label: 'Baths', value: bathroomsValue },
  ].filter(Boolean)

  // ── gallery images (from DetailsTab logic) ──
  const galleryImages     = resource?.images || {}
  const blueprintImages   = resource?.blueprints || []
  const selectedRenders   = resource?.selectedRenders || []

  const allImages = [
    ...(Array.isArray(galleryImages.exterior)
      ? galleryImages.exterior.map(i => extractUrl(i)).filter(Boolean).map(url => ({ url, type: 'exterior' }))
      : []),
    ...(Array.isArray(galleryImages.interior)
      ? galleryImages.interior.map(i => extractUrl(i)).filter(Boolean).map(url => ({ url, type: 'interior' }))
      : []),
    ...(Array.isArray(blueprintImages)
      ? blueprintImages.map(i => extractUrl(i)).filter(Boolean).map(url => ({ url, type: 'blueprint' }))
      : []),
    ...(Array.isArray(selectedRenders)
      ? selectedRenders.map(i => extractUrl(i)).filter(Boolean).map(url => ({ url, type: 'render' }))
      : []),
  ]

  const handlePrev = () => setImgIdx(p => (p - 1 + allImages.length) % allImages.length)
  const handleNext = () => setImgIdx(p => (p + 1) % allImages.length)
  const nextIdx    = allImages.length > 1 ? (imgIdx + 1) % allImages.length : imgIdx

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          p: { xs: 3, md: 4 },
          mb: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        {/* ── Title + price row ── */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" gap={2}>
          <Box>
            <Typography
              sx={{
                fontWeight: 300,
                color: config.colors.primary,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: { xs: '2.2rem', md: '3rem' },
                lineHeight: 1,
                letterSpacing: '-1px',
              }}
            >
              {nameLight}{nameLight ? ' ' : ''}
              <Box component="span" sx={{ fontWeight: 800 }}>{nameBold}</Box>
            </Typography>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: '#706f6f',
                fontFamily: '"DM Sans", sans-serif',
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              Lot{' '}
              <Box component="span" sx={{ fontWeight: 700, color: config.colors.primary }}>
                {resource?.lot?.number || resource?.apartmentNumber || '—'}
              </Box>
            </Typography>
          </Box>

          <Box textAlign="right" flexShrink={0}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                color: '#9ca3af',
                fontFamily: '"DM Sans", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                mb: 0.3,
              }}
            >
              Property value
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                color: config.colors.primary,
                fontFamily: '"DM Sans", sans-serif',
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}
            >
              ${price.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#e5e7eb', my: 2 }} />

        {/* ── Chips row: left (progress/model) + right (features) ── */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <FeatureChip
              label={`${totalPct}% Complete`}
              icon={<Construction />}
              color={config.colors.primary}
            />
            {isModel10 && (
              <FeatureChip
                label="Model 10"
                icon={<StarBorderOutlined />}
                color="#E5863C"
              />
            )}
          </Box>

          {/* Feature tags (right side, text+icon minimal style) */}
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {isProperty && resource?.modelType === 'upgrade' && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>Upgrade</Typography>
                <StarBorderOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
              </Box>
            )}
            {isProperty && resource?.modelType && resource?.modelType !== 'upgrade' && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>Basic</Typography>
                <HomeOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
              </Box>
            )}
            {isProperty && isModel10 && resource?.hasBalcony && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>Studio</Typography>
                <WeekendOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
              </Box>
            )}
            {isProperty && isModel10 && !resource?.hasBalcony && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>Dining Room</Typography>
                <TableRestaurantOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
              </Box>
            )}
            {isProperty && resource?.hasStorage && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.75rem', color: '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>Storage</Typography>
                <InventoryOutlined sx={{ fontSize: 14, color: '#9ca3af' }} />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Specs inline row ── */}
        {specs.length > 0 && (
          <Box display="flex" gap={5} mt={2}>
            {specs.map((s, i) => (
              <Box key={i} display="flex" alignItems="baseline" gap={1}>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: '#9ca3af',
                    fontFamily: '"DM Sans", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {s.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: config.colors.primary,
                    fontFamily: '"DM Sans", sans-serif',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Image gallery (2-up with carousel) ── */}
        {allImages.length > 0 && (
          <Box mt={2.5}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 0.45fr',
                gap: '3px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Main image (left) with arrows */}
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={allImages[imgIdx].url}
                  alt="property"
                  sx={{
                    width: '100%',
                    height: { xs: 220, md: 320 },
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {allImages.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrev}
                      size="small"
                      sx={{
                        position: 'absolute', left: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.88)',
                        width: 36, height: 36,
                        '&:hover': { bgcolor: 'white' },
                      }}
                    >
                      <ChevronLeft sx={{ fontSize: 22 }} />
                    </IconButton>
                    <IconButton
                      onClick={handleNext}
                      size="small"
                      sx={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.88)',
                        width: 36, height: 36,
                        '&:hover': { bgcolor: 'white' },
                      }}
                    >
                      <ChevronRight sx={{ fontSize: 22 }} />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Second image (right) — slightly dimmed */}
              {allImages.length > 1 && (
                <Box
                  component="img"
                  src={allImages[nextIdx].url}
                  alt="property next"
                  onClick={handleNext}
                  sx={{
                    width: '100%',
                    height: { xs: 220, md: 320 },
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'brightness(0.75)',
                    cursor: 'pointer',
                    transition: 'filter 0.2s',
                    '&:hover': { filter: 'brightness(0.9)' },
                  }}
                />
              )}
            </Box>

            {/* Note */}
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: '"DM Sans", sans-serif',
                mt: 1.5,
                fontStyle: 'italic',
              }}
            >
              *Browse all the photos of this house model and learn all the construction details, including the floor plans.
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  )
}

ResourceDetailHeader.propTypes = {
  details:      PropTypes.object.isRequired,
  resourceType: PropTypes.string.isRequired,
  config:       PropTypes.object.isRequired,
}

export default ResourceDetailHeader
