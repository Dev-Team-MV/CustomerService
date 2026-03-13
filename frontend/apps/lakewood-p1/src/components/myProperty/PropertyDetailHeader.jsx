import React                from 'react'
import { Grid, Box, Typography, Chip, Paper } from '@mui/material'
import { Home, Construction, Layers, Star, AutoAwesome } from '@mui/icons-material'
import { motion }           from 'framer-motion'
import PropTypes            from 'prop-types'

// Chip reutilizable con estilo outline del proyecto
const OutlineChip = ({ label, icon, borderColor = '#8CA551', color = '#3d5a4d', hoverBg = 'rgba(140,165,81,0.08)' }) => (
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

const paperSx = {
  p: { xs: 3, sm: 3.5, md: 4 }, mb: 3,
  background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
  borderRadius: { xs: 4, md: 6 },
  border: '1.5px solid #e8f5ee',
  boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
  overflow: 'hidden', position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
    border: '2px solid rgba(140,165,81,0.3)'
  },
  '&::before': {
    content: '""', position: 'absolute',
    top: 0, left: 0, right: 0, height: 4,
    background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)',
    opacity: 0.9
  }
}

const PropertyDetailHeader = ({ propertyDetails, isModel10, balconyLabels }) => {
  const { property, model, construction } = propertyDetails

  return (
    <Paper elevation={0} sx={paperSx}>
      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">

        {/* LEFT — model info + chips */}
        <Grid item xs={12} md={8}>
          <Box display="flex" alignItems="center"
            gap={{ xs: 2, md: 3 }}
            flexDirection={{ xs: 'column', sm: 'row' }}
            textAlign={{ xs: 'center', sm: 'left' }}
          >
            {/* Avatar */}
            <Box sx={{
              width: { xs: 80, sm: 90, md: 100 }, height: { xs: 80, sm: 90, md: 100 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
              boxShadow: '0 8px 24px rgba(51,63,31,0.3)',
              border: '3px solid white', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Home sx={{ fontSize: { xs: 40, md: 50 }, color: 'white' }} />
            </Box>

            <Box flex={1}>
              {/* Model name */}
              <Typography variant="h3" sx={{
                fontFamily: '"Poppins", sans-serif', color: '#1a1a1a',
                fontWeight: 700, letterSpacing: '0.5px', mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                textTransform: 'uppercase'
              }}>
                {model?.model || 'Model N/A'}
              </Typography>

              <Box sx={{ width: { xs: 40, sm: 50, md: 60 }, height: 2, bgcolor: '#8CA551', mb: 1.5, opacity: 0.8, mx: { xs: 'auto', sm: 0 } }} />

              {/* Lot */}
              <Typography variant="h6" sx={{
                color: '#706f6f', fontWeight: 500,
                fontFamily: '"Poppins", sans-serif',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' },
                letterSpacing: '0.5px', mb: 2
              }}>
                Lot #{property.lot?.number}
              </Typography>

              {/* Chips */}
              <Box display="flex" gap={1.5} flexWrap="wrap"
                justifyContent={{ xs: 'center', sm: 'flex-start' }} mb={2}
              >
                {construction?.currentPhase && (
                  <OutlineChip
                    label={`Phase ${construction.currentPhase.phaseNumber}: ${construction.currentPhase.title}`}
                    icon={<Layers sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                    borderColor="#333F1F"
                    color="#2c5530"
                    hoverBg="rgba(51,63,31,0.08)"
                  />
                )}

                <OutlineChip
                  label={
                    typeof property.totalConstructionPercentage === 'number'
                      ? `${property.totalConstructionPercentage}% Complete`
                      : '—'
                  }
                  icon={<Construction sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                />

                {property?.hasBalcony && (
                  <OutlineChip
                    label={balconyLabels.chipLabel}
                    icon={React.createElement(balconyLabels.icon, { sx: { fontSize: { xs: 16, sm: 18 } } })}
                  />
                )}

                {property.modelType === 'upgrade' && (
                  <OutlineChip
                    label="Upgrade"
                    icon={<Star sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor="#333F1F"
                    color="#2c5530"
                    hoverBg="rgba(51,63,31,0.08)"
                  />
                )}

                {property?.hasStorage && (
                  <OutlineChip
                    label="Storage"
                    icon={<Layers sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    borderColor="#706f6f"
                    color="#5a5a5a"
                    hoverBg="rgba(112,111,111,0.08)"
                  />
                )}

                {isModel10 && (
                  <OutlineChip
                    label="Model 10"
                    borderColor="#E5863C"
                    color="#8b6f47"
                    hoverBg="rgba(229,134,60,0.08)"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT — price */}
        <Grid item xs={12} md={4}>
          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Box sx={{
              p: 3, borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(140,165,81,0.08) 0%, rgba(51,63,31,0.08) 100%)',
              border: '1px solid rgba(140,165,81,0.2)',
              textAlign: 'center', transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 24px rgba(140,165,81,0.15)', borderColor: '#8CA551' }
            }}>
              <Typography variant="caption" sx={{
                color: '#706f6f', fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                display: 'block', mb: 0.5,
                fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px'
              }}>
                Property Value
              </Typography>
              <Typography variant="h2" sx={{
                color: '#333F1F', fontWeight: 800,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-1px',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                ${property.price?.toLocaleString()}
              </Typography>
            </Box>
          </motion.div>
        </Grid>

      </Grid>
    </Paper>
  )
}

PropertyDetailHeader.propTypes = {
  propertyDetails: PropTypes.object.isRequired,
  isModel10:       PropTypes.bool.isRequired,
  balconyLabels:   PropTypes.shape({
    chipLabel: PropTypes.string.isRequired,
    icon:      PropTypes.elementType.isRequired,
    color:     PropTypes.string.isRequired,
  }).isRequired,
}

export default PropertyDetailHeader