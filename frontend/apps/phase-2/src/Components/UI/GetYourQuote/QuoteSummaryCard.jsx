import { Box, Paper, Typography, Divider, Button, Chip } from '@mui/material'
import ApartmentIcon from '@mui/icons-material/Apartment'
import LayersIcon from '@mui/icons-material/Layers'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import TuneIcon from '@mui/icons-material/Tune'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'

/**
 * QuoteSummaryCard — always-visible sidebar / bottom card
 *
 * Shows what the user has selected at each step.
 * Mirrors Lakewood's PropertyStats role but for the quote flow.
 */
const QuoteSummaryCard = () => {
  const {
    selectedBuilding,
    selectedFloor,
    selectedApartment,
    apartmentType,
    financials,
    resetQuote,
    isQuoteComplete,
  } = usePropertyBuilding()

  const rows = [
    {
      icon: <ApartmentIcon sx={{ fontSize: 16 }} />,
      label: 'Building',
      value: selectedBuilding?.name,
      done: Boolean(selectedBuilding),
    },
    {
      icon: <LayersIcon sx={{ fontSize: 16 }} />,
      label: 'Floor',
      value: selectedFloor ? `Floor ${selectedFloor.floorNumber}` : null,
      done: Boolean(selectedFloor),
    },
    {
      icon: <MeetingRoomIcon sx={{ fontSize: 16 }} />,
      label: 'Apartment',
      value: selectedApartment
        ? `Apt ${selectedApartment.apartmentNumber}`
        : null,
      done: Boolean(selectedApartment),
    },
    {
      icon: <TuneIcon sx={{ fontSize: 16 }} />,
      label: 'Type',
      value: apartmentType
        ? apartmentType.charAt(0).toUpperCase() + apartmentType.slice(1)
        : null,
      done: Boolean(apartmentType),
    },
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#fff',
        borderRadius: 4,
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#333F1F',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            color: '#fff',
          }}
        >
          Your Quote Summary
        </Typography>
        {isQuoteComplete && (
          <Chip
            label="Complete"
            size="small"
            sx={{ bgcolor: '#8CA551', color: '#fff', fontWeight: 700, fontSize: '0.6rem', fontFamily: '"Poppins", sans-serif' }}
          />
        )}
      </Box>

      {/* Selection rows */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rows.map((row, i) => (
          <Box key={i} display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 32, height: 32,
                borderRadius: 2,
                bgcolor: row.done ? 'rgba(140,165,81,0.12)' : '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: row.done ? '#8CA551' : '#9e9e9e',
                flexShrink: 0,
              }}
            >
              {row.icon}
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography
                sx={{ fontSize: '0.65rem', color: '#9e9e9e', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1 }}
              >
                {row.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.825rem',
                  fontWeight: row.done ? 600 : 400,
                  color: row.done ? '#333F1F' : '#bdbdbd',
                  fontFamily: '"Poppins", sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.value ?? '— Select —'}
              </Typography>
            </Box>
            {row.done
              ? <CheckCircleIcon sx={{ color: '#8CA551', fontSize: 18, flexShrink: 0 }} />
              : <RadioButtonUncheckedIcon sx={{ color: '#e0e0e0', fontSize: 18, flexShrink: 0 }} />}
          </Box>
        ))}

        {/* Price preview (only when apartment selected) */}
        {selectedApartment && financials.listPrice > 0 && (
          <>
            <Divider sx={{ borderColor: 'rgba(140,165,81,0.2)', my: 0.5 }} />
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(140,165,81,0.08)',
                border: '1px solid rgba(140,165,81,0.25)',
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{ fontSize: '0.6rem', letterSpacing: '1px', fontFamily: '"Poppins", sans-serif', color: '#706f6f', fontWeight: 600, textTransform: 'uppercase' }}
              >
                Presale Price
              </Typography>
              <Typography
                sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}
              >
                ${financials.presalePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9e9e9e', fontStyle: 'italic', fontFamily: '"Poppins", sans-serif' }}>
                {financials.discountPercent}% presale discount applied
              </Typography>
            </Box>
          </>
        )}

        {/* Reset button */}
        {selectedBuilding && (
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<RefreshIcon />}
            onClick={resetQuote}
            sx={{
              mt: 0.5,
              borderColor: '#e0e0e0',
              borderWidth: '2px',
              color: '#706f6f',
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.75rem',
              '&:hover': {
                borderColor: '#333F1F',
                borderWidth: '2px',
                color: '#333F1F',
                bgcolor: 'rgba(51,63,31,0.04)',
              },
            }}
          >
            Reset Quote
          </Button>
        )}
      </Box>
    </Paper>
  )
}

export default QuoteSummaryCard
