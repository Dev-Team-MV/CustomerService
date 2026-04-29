// @shared/components/Resource/DetailsTab.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import {
  Home,
  Apartment,
  Bed,
  Bathtub,
  SquareFoot,
  LocationOn,
  CheckCircle,
  Layers,
  AutoAwesome
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import GalleryCarrousel from '../../../../apps/lakewood-p1/src/components/GalleryCarrousel'
import { MODEL_10_ID } from '../../../config/resourceConfig'
import PropertyDetailsTab from '../../propertyDetails/PropertyDetailsTab'  // ✅ AGREGAR ESTE IMPORT
 
const extractUrl = (item) => {
  if (!item) return null
  if (typeof item === 'string') return item
  if (item.url) {
    if (Array.isArray(item.url) && item.url.length > 0) {
      return typeof item.url[0] === 'string' ? item.url[0] : null
    }
    if (typeof item.url === 'string') return item.url
  }
  return null
}

const DetailsTab = ({ details, config, resourceType }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])

    // ✅ AGREGAR: Detectar si tiene mediaByFloor (6town-houses properties)
  const mediaByFloor = details?.mediaByFloor || []
  const hasFloorMedia = mediaByFloor.length > 0
  
  // ✅ AGREGAR: Si es una property con mediaByFloor, usar PropertyDetailsTab
  if (hasFloorMedia && resourceType === 'property') {
    return <PropertyDetailsTab propertyDetails={details} />
  }
  
  
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [galleryFilter, setGalleryFilter] = useState('all')

  const resource = details?.[resourceType] || details
  const model = details?.model || resource?.model || resource?.apartmentModel

  // Gallery images
  const galleryImages = resource?.images || { exterior: [], interior: [] }
  const blueprintImages = resource?.blueprints || []
  const selectedRenders = resource?.selectedRenders || []

  const allImages = [
    ...(Array.isArray(galleryImages.exterior)
      ? galleryImages.exterior
          .map((item) => ({ url: extractUrl(item), type: 'exterior' }))
          .filter((img) => img.url)
      : []),
    ...(Array.isArray(galleryImages.interior)
      ? galleryImages.interior
          .map((item) => ({ url: extractUrl(item), type: 'interior' }))
          .filter((img) => img.url)
      : []),
    ...(Array.isArray(blueprintImages)
      ? blueprintImages
          .map((item) => ({ url: extractUrl(item), type: 'blueprint' }))
          .filter((img) => img.url)
      : []),
    ...(Array.isArray(selectedRenders)
      ? selectedRenders
          .map((item) => ({ url: extractUrl(item), type: 'render' }))
          .filter((img) => img.url)
      : [])
  ]

  const filterImages = (images) => {
    if (galleryFilter === 'exterior') return images.filter((img) => img.type === 'exterior')
    if (galleryFilter === 'interior') return images.filter((img) => img.type === 'interior')
    if (galleryFilter === 'blueprint') return images.filter((img) => img.type === 'blueprint')
    if (galleryFilter === 'render') return images.filter((img) => img.type === 'render')
    return images
  }

  const carouselImages = filterImages(allImages)

  useEffect(() => {
    setCarouselIndex(0)
  }, [galleryFilter])

  const Icon = resourceType === 'property' ? Home : Apartment

  // Detect Model 10
  const isModel10 = model?._id === MODEL_10_ID

  // ✅ CORRECCIÓN: Acceder correctamente a los datos según el tipo de recurso
  let areaValue, bedroomsValue, bathroomsValue
  
  if (resourceType === 'property') {
    // Para properties: sqft está en details.property o details.model
    areaValue = details?.property?.sqft || model?.sqft || 0
    bedroomsValue = details?.property?.bedrooms || model?.bedrooms || 0
    bathroomsValue = details?.property?.bathrooms || model?.bathrooms || 0
  } else {
    // Para apartments: sqft está en apartmentModel
    areaValue = model?.sqft || 0
    bedroomsValue = model?.bedrooms || 0
    bathroomsValue = model?.bathrooms || 0
  }

  // Specs data
  const specs = [
    {
      icon: <SquareFoot />,
      label: t(`${config.i18n.namespace}:area`, 'Area'),
      value: areaValue ? `${areaValue} m²` : 'N/A',
      color: config.colors.primary
    },
    {
      icon: <Bed />,
      label: t(`${config.i18n.namespace}:bedrooms`, 'Bedrooms'),
      value: bedroomsValue || 'N/A',
      color: config.colors.secondary
    },
    {
      icon: <Bathtub />,
      label: t(`${config.i18n.namespace}:bathrooms`, 'Bathrooms'),
      value: bathroomsValue || 'N/A',
      color: config.colors.accent
    }
  ]

  // Add floor for apartments
  if (resourceType === 'apartment' && resource?.floorNumber) {
    specs.push({
      icon: <Layers />,
      label: t(`${config.i18n.namespace}:floor`, 'Floor'),
      value: resource.floorNumber,
      color: config.colors.primary
    })
  }

  // Add balcony/studio/comedor for properties
  if (resourceType === 'property') {
    // ✅ CORRECCIÓN: Acceder a hasBalcony desde details.property
    const hasBalcony = details?.property?.hasBalcony || false
    
    let balconyLabel = 'Balcony'
    if (isModel10) {
      balconyLabel = hasBalcony ? 'Studio' : 'Comedor'
    }
    
    specs.push({
      icon: <AutoAwesome />,
      label: balconyLabel,
      value: hasBalcony ? t('common:yes', 'Yes') : t('common:no', 'No'),
      color: hasBalcony ? config.colors.secondary : '#9e9e9e'
    })
    
    // Add storage if exists
    if (details?.property?.hasStorage) {
      specs.push({
        icon: <Layers />,
        label: 'Storage',
        value: t('common:yes', 'Yes'),
        color: config.colors.secondary
      })
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mt: 3,
        borderRadius: 3,
        bgcolor: 'white',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: 3,
              bgcolor: config.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${config.colors.primary}33`
            }}
          >
            <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                color: config.colors.primary,
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                mb: 0.5
              }}
            >
              {resource?.name || `${resourceType === 'apartment' ? 'Apt' : 'Property'} ${resource?.number || resource?.apartmentNumber || ''}`}
            </Typography>
            {resource?.address && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn sx={{ fontSize: 16, color: config.colors.secondary }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#706f6f',
                    fontSize: '0.9rem'
                  }}
                >
                  {resource.address}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {model && (
          <Chip
            icon={<CheckCircle sx={{ fontSize: 18 }} />}
            label={model.model || model.name || 'Model'}
            sx={{
              height: 36,
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              bgcolor: `${config.colors.secondary}1A`,
              color: config.colors.primary,
              border: `2px solid ${config.colors.secondary}`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Specs Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {specs.map((spec, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${spec.color}33`,
                  bgcolor: `${spec.color}0A`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: spec.color,
                    boxShadow: `0 4px 12px ${spec.color}33`,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: `${spec.color}1A`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 1.5
                    }}
                  >
                    {React.cloneElement(spec.icon, {
                      sx: { fontSize: 24, color: spec.color }
                    })}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#999',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 0.5
                    }}
                  >
                    {spec.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: spec.color,
                      fontWeight: 700,
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    {spec.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Gallery Filters */}
      {allImages.length > 0 && (
        <>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {['all', 'exterior', 'interior', 'blueprint', 'render'].map((filter) => {
              const count = filter === 'all' ? allImages.length : allImages.filter((img) => img.type === filter).length
              if (count === 0 && filter !== 'all') return null

              return (
                <Chip
                  key={filter}
                  label={`${t(`${config.i18n.namespace}:${filter}`, filter)} (${count})`}
                  onClick={() => setGalleryFilter(filter)}
                  sx={{
                    bgcolor: galleryFilter === filter ? config.colors.primary : '#f5f5f5',
                    color: galleryFilter === filter ? 'white' : '#706f6f',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    fontFamily: '"Poppins", sans-serif',
                    textTransform: 'capitalize',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: galleryFilter === filter ? config.colors.secondary : '#e0e0e0'
                    }
                  }}
                />
              )
            })}
          </Box>

          {/* Gallery Carousel */}
          {carouselImages.length > 0 ? (
            <Box
              sx={{
                width: '100%',
                height: { xs: 300, sm: 400, md: 500 },
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#000',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
            >
              <GalleryCarrousel
                images={carouselImages.map(img => img.url)}
                showPagination={true}
                showArrows={true}
                autoPlay={false}
                borderRadius={12}
                objectFit="contain"
                startIndex={carouselIndex}
                onIndexChange={(idx) => setCarouselIndex(idx)}
              />
            </Box>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: '#f5f5f5',
                borderRadius: 3,
                border: '1px dashed #ccc'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t(`${config.i18n.namespace}:noImages`, 'No images available for this filter')}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  )
}

DetailsTab.propTypes = {
  details: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  resourceType: PropTypes.string.isRequired
}

export default DetailsTab