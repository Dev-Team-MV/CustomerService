import React from 'react'
import { Grid, Box, Typography, Chip, Paper } from '@mui/material'
import { Home, Apartment, Construction, Layers, Star, AutoAwesome } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { MODEL_10_ID } from '../../config/resourceConfig'

const OutlineChip = ({ label, icon, borderColor, color, hoverBg }) => (
  <Chip
    label={label}
    size="small"
    icon={icon}
    sx={{
      bgcolor: 'transparent',
      border: `1.5px solid ${borderColor}`,
      color,
      fontWeight: 700,
      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
      height: { xs: 28, sm: 30, md: 32 },
      px: { xs: 1.5, sm: 2 },
      fontFamily: '"Poppins", sans-serif',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      transition: 'all 0.3s ease',
      '&:hover': { bgcolor: hoverBg, borderColor },
      '& .MuiChip-icon': { color: borderColor }
    }}
  />
)

const ResourceDetailHeader = ({ details, resourceType, config }) => {
  const { t } = useTranslation(config.i18n.namespace)
  
  const resource = details?.[resourceType] || details
  const model = details?.model || resource?.model || resource?.apartmentModel
  const construction = details?.construction
  
  const isProperty = resourceType === 'property'
  const Icon = isProperty ? Home : Apartment
  const isModel10 = model?._id === MODEL_10_ID
  
  const title = isProperty 
    ? (resource?.lot?.number ? t('lotLabel', { number: resource.lot.number }, 'Lot {{number}}') : t('propertyLabel', 'Property'))
    : (resource?.apartmentNumber ? t('apartmentLabel', { number: resource.apartmentNumber }, 'Apt {{number}}') : t('apartment', 'Apartment'))
  
  const modelName = model?.model || model?.name || t('noModel', 'N/A')
  const price = resource?.price || 0
  const totalConstructionPercentage = resource?.totalConstructionPercentage || 0

  const paperSx = {
    p: { xs: 3, sm: 3.5, md: 4 },
    mb: 3,
    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    borderRadius: { xs: 4, md: 6 },
    border: `1.5px solid ${config.colors.border}`,
    boxShadow: `0 12px 32px ${config.colors.primary}1A`,
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: `0 24px 48px ${config.colors.primary}26`,
      border: `2px solid ${config.colors.secondary}4D`
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: config.colors.gradient,
      opacity: 0.9
    }
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box
            display="flex"
            alignItems="center"
            gap={{ xs: 2, md: 3 }}
            flexDirection={{ xs: 'column', sm: 'row' }}
            textAlign={{ xs: 'center', sm: 'left' }}
          >
            <Box
              sx={{
                width: { xs: 80, sm: 90, md: 100 },
                height: { xs: 80, sm: 90, md: 100 },
                borderRadius: '50%',
                background: config.colors.gradient,
                boxShadow: `0 8px 24px ${config.colors.primary}30`,
                border: '3px solid white',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon sx={{ fontSize: { xs: 40, md: 50 }, color: 'white' }} />
            </Box>

            <Box flex={1}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: '#1a1a1a',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  textTransform: 'uppercase'
                }}
              >
                {modelName}
              </Typography>

              <Box
                sx={{
                  width: { xs: 40, sm: 50, md: 60 },
                  height: 2,
                  bgcolor: config.colors.secondary,
                  mb: 1.5,
                  opacity: 0.8,
                  mx: { xs: 'auto', sm: 0 }
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  color: '#706f6f',
                  fontWeight: 500,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' },
                  letterSpacing: '0.5px',
                  mb: 2
                }}
              >
                {title}
              </Typography>

              <Box
                display="flex"
                gap={1.5}
                flexWrap="wrap"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                mb={2}
              >
                {construction?.currentPhase && (
                  <OutlineChip
                    label={t('phaseLabel', {
                      number: construction.currentPhase.phaseNumber,
                      title: construction.currentPhase.title
                    }, 'Phase {{number}}: {{title}}')}
                    icon={<Layers sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                    borderColor={config.colors.primary}
                    color={config.colors.primary}
                    hoverBg={`${config.colors.primary}14`}
                  />
                )}

                <OutlineChip
                  label={
                    typeof totalConstructionPercentage === 'number'
                      ? t('constructionComplete', { percent: totalConstructionPercentage }, '{{percent}}% Complete')
                      : '—'
                  }
                  icon={<Construction sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  borderColor={config.colors.secondary}
                  color={config.colors.secondary}
                  hoverBg={`${config.colors.secondary}14`}
                />

                {isProperty && resource?.hasBalcony && (
                  <OutlineChip
                    label={isModel10 ? t('studio', 'Studio') : t('balcony', 'Balcony')}
                    icon={<AutoAwesome sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor={config.colors.secondary}
                    color={config.colors.secondary}
                    hoverBg={`${config.colors.secondary}14`}
                  />
                )}

                {isProperty && resource?.modelType === 'upgrade' && (
                  <OutlineChip
                    label={t('upgrade', 'Upgrade')}
                    icon={<Star sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor={config.colors.primary}
                    color={config.colors.primary}
                    hoverBg={`${config.colors.primary}14`}
                  />
                )}

                {isProperty && resource?.hasStorage && (
                  <OutlineChip
                    label={t('storage', 'Storage')}
                    icon={<Layers sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor="#706f6f"
                    color="#5a5a5a"
                    hoverBg="rgba(112,111,111,0.08)"
                  />
                )}

                {isModel10 && (
                  <OutlineChip
                    label={t('model10', 'Model 10')}
                    icon={<Star sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor="#E5863C"
                    color="#8b6f47"
                    hoverBg="rgba(229,134,60,0.08)"
                  />
                )}

                {!isProperty && resource?.floorNumber && (
                  <OutlineChip
                    label={t('floorLabel', { number: resource.floorNumber }, 'Floor {{number}}')}
                    icon={<Layers sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor={config.colors.accent}
                    color={config.colors.accent}
                    hoverBg={`${config.colors.accent}14`}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${config.colors.secondary}14 0%, ${config.colors.primary}14 100%)`,
                border: `1px solid ${config.colors.secondary}33`,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${config.colors.secondary}26`,
                  borderColor: config.colors.secondary
                }
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#706f6f',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px'
                }}
              >
                {t('propertyValue', 'Property Value')}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: config.colors.primary,
                  fontWeight: 800,
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: '-1px',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                ${price?.toLocaleString()}
              </Typography>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Paper>
  )
}

ResourceDetailHeader.propTypes = {
  details: PropTypes.object.isRequired,
  resourceType: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired
}

export default ResourceDetailHeader