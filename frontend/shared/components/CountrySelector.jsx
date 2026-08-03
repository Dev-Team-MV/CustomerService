// frontend/shared/components/CountrySelector.jsx
import { useTranslation } from 'react-i18next'
import { Typography, Box } from '@mui/material'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

export default function CountrySelector({ 
  value, 
  onChange, 
  label = 'Location',
  placeholder = 'Select a location...',
  fullWidth = true,
  required = false,
  countryRestriction = 'us', // ✅ Por defecto restringido a EE. UU.
  types = ['address']        // ✅ Por defecto busca direcciones (no solo países)
}) {
  const { t } = useTranslation()

  const handlePlaceChange = (newValue) => {
    const placeName = newValue ? newValue.label : ''
    onChange(placeName)
  }

  const googlePlacesSx = {
    control: (provided) => ({
      ...provided,
      borderRadius: 0,
      border: '1px solid #e0e0e0',
      fontFamily: '"Courier New", monospace',
      minHeight: 40,
      boxShadow: 'none',
      '&:hover': { borderColor: '#000' },
      padding: '0 8px',
      '& .MuiInputBase-input': { 
        fontFamily: '"Helvetica Neue", sans-serif', 
        fontSize: '0.875rem', 
        padding: '8px 6px' 
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#ffffff',
      fontFamily: '"Courier New", monospace',
      borderRadius: 0,
      marginTop: 4,
      zIndex: 9999,
      boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
    }),
    option: (provided, state) => ({
      ...provided,
      fontFamily: '"Courier New", monospace',
      backgroundColor: state.isSelected ? '#000000' : state.isFocused ? '#f5f5f5' : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#000000',
      cursor: 'pointer'
    })
  }

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Typography 
        variant="caption" 
        sx={{ 
          mb: 0.5, 
          display: 'block', 
          color: 'text.secondary', 
          fontFamily: '"Courier New", monospace', 
          fontSize: '0.7rem',
          letterSpacing: '0.5px'
        }}
      >
        {label} {required && '*'}
      </Typography>
      
      <GooglePlacesAutocomplete
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        selectProps={{
          value: value ? { label: value, value: value } : null,
          onChange: handlePlaceChange,
          placeholder: placeholder,
          styles: googlePlacesSx
        }}
        autocompletionRequest={{ 
          types: types, 
          // ✅ Restricción de componente a un país específico (ISO 3166-1 Alpha-2)
          ...(countryRestriction && { componentRestrictions: { country: countryRestriction } })
        }}
      />
    </Box>
  )
}