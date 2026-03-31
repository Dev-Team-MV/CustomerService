// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/GetYourQuote/ApartmentCustomizer.jsx

import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Card, CardActionArea,
  Chip, Divider, Grid, useTheme, useMediaQuery, Alert
} from '@mui/material'
import BedIcon from '@mui/icons-material/Bed'
import BathtubIcon from '@mui/icons-material/Bathtub'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TuneIcon from '@mui/icons-material/Tune'
import { motion } from 'framer-motion'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'

const ApartmentCustomizer = () => {
  const {
    selectedApartment,
    apartmentType,
    selectApartmentType,
    financials,
    selectedRenderType,
    setSelectedRenderType,
  } = usePropertyBuilding()

  const theme  = useTheme()
  const isMob  = useMediaQuery(theme.breakpoints.down('sm'))
  const [previewIdx, setPreviewIdx] = useState(0)

  useEffect(() => {
    if (!apartmentType && selectedApartment && (selectedApartment.interiorRendersBasic || []).length > 0) {
      selectApartmentType('basic')
    }
    // eslint-disable-next-line
  }, [selectedApartment, apartmentType, selectApartmentType])

  // ✅ Early return si no hay apartamento seleccionado
  if (!selectedApartment) {
    return (
      <Paper elevation={0} sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 4,
        border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        p: 3
      }}>
        <Alert severity="info" sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Please select an apartment to customize
        </Alert>
      </Paper>
    )
  }

  // ✅ Validación segura de apartmentModel
  const model     = selectedApartment?.apartmentModel || null
  const renders   = apartmentType === 'upgrade'
    ? (selectedApartment?.interiorRendersUpgrade || [])
    : (selectedApartment?.interiorRendersBasic   || [])

  const hasBasic   = (selectedApartment?.interiorRendersBasic   || []).length > 0
  const hasUpgrade = (selectedApartment?.interiorRendersUpgrade || []).length > 0

  const handleTypeSelect = (type) => {
    setPreviewIdx(0)
    selectApartmentType(type)
    setSelectedRenderType(type)
  }

  // --- SX CONSTANTES USANDO THEME ---
  const paperSx = {
    bgcolor: theme.palette.background.paper,
    borderRadius: 4,
    border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  }

  const headerSx = {
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    borderBottom: `2px solid ${theme.palette.secondary.main}33`,
  }

  const sectionLabelSx = {
    fontWeight: 700,
    fontFamily: '"Poppins", sans-serif',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    color: theme.palette.primary.main,
  }

  const sectionSubLabelSx = {
    fontWeight: 700,
    fontFamily: '"Poppins", sans-serif',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  }

  const aptChipSx = {
    bgcolor: theme.palette.secondary.light + '14',
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: '0.65rem',
    fontFamily: '"Poppins", sans-serif',
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      {/* Header */}
      <Box sx={headerSx}>
        <Box display="flex" alignItems="center" gap={1}>
          <TuneIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
          <Typography sx={sectionLabelSx}>04 CUSTOMIZE YOUR APARTMENT</Typography>
        </Box>
        <Chip
          label={`Apt ${selectedApartment?.apartmentNumber || 'N/A'}`}
          size="small"
          sx={aptChipSx}
        />
      </Box>

      {/* Model Info */}
      {model && (
        <Box sx={{ p: 2, bgcolor: theme.palette.cardBg || '#fafafa' }}>
          <Typography sx={sectionSubLabelSx} mb={1}>Apartment Model</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <Box display="flex" alignItems="center" gap={0.5}>
              <BedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                {model.bedrooms || 0} Beds
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <BathtubIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                {model.bathrooms || 0} Baths
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <SquareFootIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                {model.sqft || 0} sq ft
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Package Selection */}
      <Box sx={{ p: 2 }}>
        <Typography sx={sectionSubLabelSx} mb={2}>Select Interior Package</Typography>
        
        {!hasBasic && !hasUpgrade ? (
          <Alert severity="warning" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            No interior render packages available for this apartment
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {/* Basic Package */}
            {hasBasic && (
              <Grid item xs={12} sm={6}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    elevation={apartmentType === 'basic' ? 4 : 0}
                    sx={{
                      border: apartmentType === 'basic'
                        ? `2px solid ${theme.palette.success.main}`
                        : `2px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
                      borderRadius: 3,
                      transition: 'all 0.2s ease',
                      bgcolor: apartmentType === 'basic' ? theme.palette.success.main + '08' : '#fff',
                    }}
                  >
                    <CardActionArea onClick={() => handleTypeSelect('basic')}>
                      <Box sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <StarOutlineIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ fontFamily: '"Poppins", sans-serif', color: theme.palette.primary.main }}>
                              Basic Package
                            </Typography>
                          </Box>
                          {apartmentType === 'basic' && (
                            <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', display: 'block' }}>
                          {(selectedApartment?.interiorRendersBasic || []).length} render{(selectedApartment?.interiorRendersBasic || []).length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            )}

            {/* Upgrade Package */}
            {hasUpgrade && (
              <Grid item xs={12} sm={6}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    elevation={apartmentType === 'upgrade' ? 4 : 0}
                    sx={{
                      border: apartmentType === 'upgrade'
                        ? `2px solid ${theme.palette.warning.main}`
                        : `2px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
                      borderRadius: 3,
                      transition: 'all 0.2s ease',
                      bgcolor: apartmentType === 'upgrade' ? theme.palette.warning.main + '08' : '#fff',
                    }}
                  >
                    <CardActionArea onClick={() => handleTypeSelect('upgrade')}>
                      <Box sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                            <Typography fontWeight={700} fontSize="0.9rem" sx={{ fontFamily: '"Poppins", sans-serif', color: theme.palette.primary.main }}>
                              Upgrade Package
                            </Typography>
                          </Box>
                          {apartmentType === 'upgrade' && (
                            <CheckCircleIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', display: 'block' }}>
                          {(selectedApartment?.interiorRendersUpgrade || []).length} render{(selectedApartment?.interiorRendersUpgrade || []).length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {/* Preview Gallery */}
      {renders.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography sx={sectionSubLabelSx} mb={2}>Preview</Typography>
            <Box
              sx={{
                width: '100%',
                height: isMob ? 200 : 300,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={renders[previewIdx]}
                alt={`Preview ${previewIdx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
            {renders.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto' }}>
                {renders.map((url, i) => (
                  <Box
                    key={i}
                    onClick={() => setPreviewIdx(i)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: i === previewIdx ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                      opacity: i === previewIdx ? 1 : 0.6,
                      transition: 'all 0.2s',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <img src={url} alt={`Thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}

export default ApartmentCustomizer