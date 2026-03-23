import { useState } from 'react'
import {
  Box, Paper, Typography, Card, CardActionArea,
  Chip, Divider, Grid, useTheme, useMediaQuery
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

/**
 * ApartmentCustomizer — Step 4
 *
 * Shows the selected apartment info + a Basic/Upgrade type selector
 * with interior render previews. Price summary reflects financials from context.
 */
const ApartmentCustomizer = () => {
  const {
    selectedApartment,
    apartmentType,
    selectApartmentType,
    financials,
  } = usePropertyBuilding()

    console.log('[STEP 4] selectedApartment:', selectedApartment)
  console.log('[STEP 4] apartmentType:', apartmentType)
  console.log('[STEP 4] financials:', financials)

  const theme  = useTheme()
  const isMob  = useMediaQuery(theme.breakpoints.down('sm'))

  const [previewIdx, setPreviewIdx] = useState(0)

  if (!selectedApartment) return null

  const model     = selectedApartment.apartmentModel
  const renders   = apartmentType === 'upgrade'
    ? (selectedApartment.interiorRendersUpgrade || [])
    : (selectedApartment.interiorRendersBasic   || [])

  const hasBasic   = (selectedApartment.interiorRendersBasic   || []).length > 0
  const hasUpgrade = (selectedApartment.interiorRendersUpgrade || []).length > 0

  const handleTypeSelect = (type) => {
    setPreviewIdx(0)
    selectApartmentType(type)
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      {/* Header */}
      <Box sx={headerSx}>
        <Box display="flex" alignItems="center" gap={1}>
          <TuneIcon sx={{ color: '#8CA551', fontSize: 20 }} />
          <Typography sx={sectionLabelSx}>04 CUSTOMIZE YOUR APARTMENT</Typography>
        </Box>
        <Chip
          label={`Apt ${selectedApartment.apartmentNumber} · Floor ${selectedApartment.floorNumber}`}
          size="small"
          sx={aptChipSx}
        />
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* ── Apartment info card ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{
            p: 2, borderRadius: 3, bgcolor: 'rgba(51,63,31,0.04)',
            border: '1px solid rgba(140,165,81,0.25)',
            display: 'flex', flexWrap: 'wrap', gap: 2,
          }}>
            <InfoTile icon={<BedIcon sx={{ color: '#8CA551', fontSize: 18 }} />}
              label="Bedrooms" value={model?.bedrooms ?? '–'} />
            <InfoTile icon={<BathtubIcon sx={{ color: '#8CA551', fontSize: 18 }} />}
              label="Bathrooms" value={model?.bathrooms ?? '–'} />
            <InfoTile icon={<SquareFootIcon sx={{ color: '#8CA551', fontSize: 18 }} />}
              label="Sq Ft" value={model?.sqft ? `${model.sqft.toLocaleString()} ft²` : '–'} />
            {model?.name && (
              <InfoTile icon={null} label="Model" value={model.name} />
            )}
          </Box>
        </motion.div>

        {/* ── Type selector ── */}
        <Box>
          <Typography sx={sectionSubLabelSx} mb={1}>APARTMENT TYPE</Typography>
          <Grid container spacing={2}>
            {/* Basic */}
            <Grid item xs={12} sm={6}>
              <TypeCard
                type="basic"
                label="Basic"
                icon={<StarOutlineIcon />}
                selected={apartmentType === 'basic'}
                disabled={!hasBasic}
                onSelect={handleTypeSelect}
                description="Standard finishes and fittings"
                accentColor="#4caf50"
              />
            </Grid>
            {/* Upgrade */}
            <Grid item xs={12} sm={6}>
              <TypeCard
                type="upgrade"
                label="Upgrade"
                icon={<StarIcon />}
                selected={apartmentType === 'upgrade'}
                disabled={!hasUpgrade}
                onSelect={handleTypeSelect}
                description="Premium finishes, enhanced fixtures"
                accentColor="#E5863C"
              />
            </Grid>
          </Grid>
        </Box>

        {/* ── Interior render preview ── */}
        {apartmentType && renders.length > 0 && (
          <motion.div
            key={apartmentType}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Box>
              <Typography sx={sectionSubLabelSx} mb={1}>INTERIOR PREVIEW</Typography>
              <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', bgcolor: '#f0f0f0' }}>
                <Box
                  component="img"
                  src={renders[previewIdx]}
                  alt={`Interior ${previewIdx + 1}`}
                  sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
                />
                {renders.length > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, p: 1, bgcolor: 'rgba(0,0,0,0.35)', position: 'absolute', bottom: 0, width: '100%' }}>
                    {renders.map((_, i) => (
                      <Box
                        key={i}
                        onClick={() => setPreviewIdx(i)}
                        sx={{
                          width: i === previewIdx ? 20 : 8,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: i === previewIdx ? '#8CA551' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'width 0.2s',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>
        )}

        <Divider sx={{ borderColor: 'rgba(140,165,81,0.2)' }} />

        {/* ── Price summary ── */}
        <Box>
          <Typography sx={sectionSubLabelSx} mb={1.5}>PRICE SUMMARY</Typography>
          <Box sx={{ p: 2.5, bgcolor: 'rgba(140,165,81,0.06)', borderRadius: 3, border: '2px solid #8CA551', textAlign: 'center', mb: 2 }}>
            <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', fontWeight: 700, color: '#333F1F' }}>
              PRESALE PRICE
            </Typography>
            <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '2rem', fontWeight: 700, color: '#333F1F' }}>
              ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#706f6f', fontStyle: 'italic', fontFamily: '"Poppins", sans-serif' }}>
              includes {financials.discountPercent}% discount
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <SummaryRow label="List Price"          value={`$${financials.listPrice.toLocaleString()}`} />
            <SummaryRow label="Discount"            value={`-$${financials.discount.toLocaleString()}`} valueColor="#E5863C" />
            <SummaryRow label="Total Down Payment"  value={`$${financials.totalDownPayment.toLocaleString()}`} />
            <SummaryRow label="Initial Down Payment" value={`$${financials.initialDownPayment.toLocaleString()}`} bold />
            <SummaryRow label="Monthly Payment"     value={`$${financials.monthlyPayment.toLocaleString()}`} />
            <Divider sx={{ borderColor: 'rgba(140,165,81,0.2)' }} />
            <SummaryRow label="Mortgage to Finance" value={`$${financials.mortgage.toLocaleString()}`} bold valueColor="#8CA551" />
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TypeCard = ({ type, label, icon, selected, disabled, onSelect, description, accentColor }) => (
  <Card
    elevation={selected ? 4 : 0}
    sx={{
      border: selected ? `2px solid ${accentColor}` : '2px solid #e0e0e0',
      borderRadius: 3,
      bgcolor: selected ? `${accentColor}0D` : '#fff',
      opacity: disabled ? 0.45 : 1,
      transition: 'all 0.2s ease',
    }}
  >
    <CardActionArea onClick={() => !disabled && onSelect(type)} disabled={disabled}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box sx={{ color: selected ? accentColor : '#9e9e9e', mb: 0.5 }}>
          {icon}
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} mb={0.5}>
          <Typography sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: '#333F1F', fontSize: '0.9rem' }}>
            {label}
          </Typography>
          {selected && <CheckCircleIcon sx={{ color: accentColor, fontSize: 16 }} />}
        </Box>
        <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
          {disabled ? 'No renders available' : description}
        </Typography>
      </Box>
    </CardActionArea>
  </Card>
)

const InfoTile = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" gap={0.75}>
    {icon}
    <Box>
      <Typography sx={{ fontSize: '0.6rem', color: '#9e9e9e', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

const SummaryRow = ({ label, value, bold = false, valueColor = '#333F1F' }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography sx={{ fontSize: '0.8rem', color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>{label}:</Typography>
    <Typography sx={{ fontSize: '0.8rem', fontWeight: bold ? 700 : 500, color: valueColor, fontFamily: '"Poppins", sans-serif' }}>
      {value}
    </Typography>
  </Box>
)

const paperSx = {
  bgcolor: '#fff',
  borderRadius: 4,
  border: '1px solid #e0e0e0',
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
  borderBottom: '2px solid rgba(140,165,81,0.2)',
}

const sectionLabelSx = {
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  fontSize: '0.85rem',
  color: '#333F1F',
}

const sectionSubLabelSx = {
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontSize: '0.7rem',
  color: '#9e9e9e',
}

const aptChipSx = {
  bgcolor: 'rgba(140,165,81,0.12)',
  color: '#333F1F',
  fontWeight: 700,
  fontSize: '0.65rem',
  fontFamily: '"Poppins", sans-serif',
}

export default ApartmentCustomizer
