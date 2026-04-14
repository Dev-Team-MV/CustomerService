import { useState, useRef } from 'react'
import {
  Box, Paper, Typography, Chip, Select, MenuItem, useTheme, useMediaQuery
} from '@mui/material'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import HomeIcon from '@mui/icons-material/Home'
import BedIcon from '@mui/icons-material/Bed'
import BathtubIcon from '@mui/icons-material/Bathtub'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import { usePropertyBuilding } from '../../context/ProperyQuoteContext'   // ← cambio
import PolygonImagePreview from '@shared/components/PolygonImagePreview'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const APT_COLOR = {
  available: '#4caf50',
  pending:   '#2196f3',
  sold:      '#f44336',
  cancelled: '#9e9e9e',
}

const ApartmentSelector = () => {
  const {
    selectedFloor,
    selectedApartment,
    selectApartment,
    resolveApartmentForPolygon,
    getApartmentsForFloor,
  } = usePropertyBuilding()

  const theme = useTheme()
  const isMob = useMediaQuery(theme.breakpoints.down('sm'))
  const { t } = useTranslation(['quote', 'common'])

  const containerRef = useRef(null)
  const [hoveredPoly, setHoveredPoly] = useState(null)
  const [popupPosition, setPopupPosition] = useState(null)

  if (!selectedFloor) return null

  const polygons = selectedFloor.polygons || []
  const floorApts = getApartmentsForFloor(selectedFloor.floorNumber)
  const hasImage = Boolean(selectedFloor.url)

  const getAptForPoly = (poly) => resolveApartmentForPolygon(poly, selectedFloor.floorNumber)
  const getStatusColor = (poly, apt) => poly.color || APT_COLOR[apt?.status] || theme.palette.primary.main
  const isPolySelected = (poly) => {
    const apt = getAptForPoly(poly)
    return apt?._id === selectedApartment?._id
  }

  const hoveredApartment = hoveredPoly 
    ? getAptForPoly(polygons.find(p => p.id === hoveredPoly))
    : null

  const previewPolygons = polygons.map(poly => {
    const apt = getAptForPoly(poly)
    const isSel = isPolySelected(poly)
    const isHovered = hoveredPoly === poly.id
    const color = getStatusColor(poly, apt)
    return {
      ...poly,
      points: poly.points,
      color,
      id: poly.id,
      fill:
        isSel
          ? color + 'BB'
          : isHovered && apt?.status === 'available'
            ? color + '77'
            : color + '33',
      stroke: isSel ? theme.palette.primary.main : color,
      strokeWidth: isSel ? 2 : 1,
      isAvailable: apt?.status === 'available',
      isSel,
      isHovered,
      apt,
    }
  })

  const handleDropdownSelect = (e) => {
    const aptId = e.target.value
    const apt = floorApts.find(a => a._id === aptId)
    if (apt) selectApartment(apt)
  }

  // Handler para actualizar posición del popup relativo al contenedor
  const handlePolygonHover = (polyId, pos) => {
    setHoveredPoly(polyId)
    if (polyId && pos && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPopupPosition({
        x: pos.x + rect.left,
        y: pos.y + rect.top - 120
      })
    } else {
      setPopupPosition(null)
    }
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      <Box sx={headerSx}>
        <Box display="flex" alignItems="center" gap={1}>
          <MeetingRoomIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography sx={sectionLabelSx}>
            {t('quote:selectApartmentStep', '03 SELECT AN APARTMENT')}
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <LegendDot color={APT_COLOR.available} label={t('quote:available', 'Available')} />
          <LegendDot color={APT_COLOR.pending} label={t('quote:hold', 'Hold')} />
          <LegendDot color={APT_COLOR.sold} label={t('quote:sold', 'Sold')} />
          <Chip
            label={`${t('quote:floor', 'Floor')} ${selectedFloor.floorNumber}`}
            size="small"
            sx={{
              bgcolor: theme.palette.secondary.light + '18',
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: '0.65rem',
              fontFamily: '"Poppins", sans-serif'
            }}
          />
        </Box>
      </Box>

      {hasImage ? (
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            mx: 'auto',
            position: 'relative',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
            overflow: 'hidden',
            minHeight: 200,
          }}
        >
          <PolygonImagePreview
            imageUrl={selectedFloor.url}
            polygons={previewPolygons}
            maxWidth={1000}
            maxHeight={700}
            highlightPolygonId={hoveredPoly}
            showLabels={false}
            onPolygonClick={poly => {
              if (poly.isAvailable) selectApartment(poly.apt)
            }}
            onPolygonHover={(polyId, pos) => handlePolygonHover(polyId, pos)}
          />

          {/* Popup relativo al polígono hovereado */}
          <AnimatePresence>
            {hoveredApartment && popupPosition && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  left: popupPosition.x,
                  top: popupPosition.y,
                  zIndex: 9999,
                  pointerEvents: 'none',
                  transform: 'translateX(-50%)'
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#fff',
                    border: `2px solid ${APT_COLOR[hoveredApartment.status] || theme.palette.primary.main}`,
                    minWidth: 240,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                >
                  {/* Apartment Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <HomeIcon sx={{ color: APT_COLOR[hoveredApartment.status] || theme.palette.primary.main, fontSize: 24 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem', fontFamily: '"Poppins", sans-serif', color: theme.palette.text.primary }}>
                        {t('quote:apartment', 'Apartment')} {hoveredApartment.apartmentNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                        ${hoveredApartment.price?.toLocaleString() || t('common:notAvailable', 'N/A')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Model Specs */}
                  {hoveredApartment.apartmentModel && (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', color: theme.palette.text.secondary }}>
                            {hoveredApartment.apartmentModel.bedrooms || 0} {t('quote:bedrooms', 'Bedrooms')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BathtubIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', color: theme.palette.text.secondary }}>
                            {hoveredApartment.apartmentModel.bathrooms || 0} {t('quote:bathrooms', 'Bathrooms')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SquareFootIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', color: theme.palette.text.secondary }}>
                            {hoveredApartment.apartmentModel.sqft || 0} {t('quote:sqft', 'sq ft')}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ 
                        display: 'block',
                        color: theme.palette.text.secondary, 
                        fontFamily: '"Poppins", sans-serif', 
                        fontSize: '0.65rem',
                        fontStyle: 'italic',
                        mb: 1
                      }}>
                        {t('quote:model', 'Model')}: {hoveredApartment.apartmentModel.name}
                      </Typography>
                    </>
                  )}

                  {/* Status Chip */}
                  <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                    <Chip
                      label={t(`quote:status.${hoveredApartment.status}`, hoveredApartment.status)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        bgcolor: `${APT_COLOR[hoveredApartment.status] || theme.palette.primary.main}15`,
                        color: APT_COLOR[hoveredApartment.status] || theme.palette.primary.main,
                        fontWeight: 700,
                        fontFamily: '"Poppins", sans-serif',
                        textTransform: 'uppercase',
                      }}
                    />
                  </Box>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center', color: theme.palette.text.disabled }}>
          <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.875rem' }}>
            {t('quote:noFloorPlan', 'No floor plan image uploaded yet.')}
          </Typography>
        </Box>
      )}

      <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee' }}>
        <Select
          fullWidth
          displayEmpty
          size="small"
          value={selectedApartment?._id || ''}
          onChange={handleDropdownSelect}
          sx={{ bgcolor: '#fff', borderRadius: 2, fontFamily: '"Poppins", sans-serif' }}
        >
          <MenuItem value="" disabled>
            {t('quote:selectApartmentDropdown', 'Select an apartment from Floor {{floor}}…', { floor: selectedFloor.floorNumber })}
          </MenuItem>
          {floorApts
            .slice()
            .sort((a, b) => a.apartmentNumber.localeCompare(b.apartmentNumber, undefined, { numeric: true }))
            .map(apt => (
              <MenuItem
                key={apt._id}
                value={apt._id}
                disabled={apt.status !== 'available'}
                sx={{ opacity: apt.status === 'available' ? 1 : 0.5 }}
              >
                {t('quote:apartmentShort', 'Apt')} {apt.apartmentNumber} — ${apt.price?.toLocaleString()} — {t(`quote:status.${apt.status}`, apt.status.toUpperCase())}
                {apt.status !== 'available' && ' 🔒'}
              </MenuItem>
            ))}
        </Select>
      </Box>
    </Paper>
  )
}

const LegendDot = ({ color, label }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
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

export default ApartmentSelector