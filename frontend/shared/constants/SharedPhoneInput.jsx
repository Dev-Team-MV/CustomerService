import { Box, Typography, FormControl, FormHelperText } from '@mui/material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useTheme } from '@mui/material/styles'

export default function SharedPhoneInput({
  value,
  onChange,
//   label = 'Teléfono',
  required = false,
  error = false,
  helperText = '',
  country = 'co', // Cambiado a Colombia por defecto según tus datos
  disabled = false,
  fullWidth = true,
  sx = {}
}) {
  const theme = useTheme()

  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={error} 
      disabled={disabled}
      sx={{
        ...sx,
        // Sobrescritura precisa de los estilos internos de react-phone-input-2
        '& .react-tel-input': {
          fontFamily: '"DM Sans", sans-serif',
          width: '100%',
          
          // El input principal
          '& .form-control': {
            width: '100%',
            height: '56px', // Altura estándar de MUI TextField
            borderRadius: '12px',
            border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
            backgroundColor: disabled ? theme.palette.action.disabledBackground : theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontSize: '16px',
            paddingLeft: '52px', // Espacio para la bandera
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: error ? theme.palette.error.main : theme.palette.text.primary,
            },
            // Efecto de foco idéntico al TextField de MUI
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              borderWidth: '2px',
              paddingLeft: '51px', // Ajuste fino para compensar el borde de 2px
              outline: 'none',
            },
            '&::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 0.7,
            }
          },
          
          // El botón de la bandera
          '& .flag-dropdown': {
            border: 'none',
            backgroundColor: 'transparent',
            borderRadius: '12px 0 0 12px',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.open': {
              backgroundColor: theme.palette.action.hover,
              borderRadius: '12px 0 0 0',
            }
          },
          
          // La bandera seleccionada
          '& .selected-flag': {
            width: '48px',
            padding: '0 0 0 12px',
            '&:hover, &:focus': {
              backgroundColor: 'transparent',
            }
          },
          
          // La lista desplegable de países
          '& .country-list': {
            borderRadius: '12px',
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            marginTop: '10px',
            maxHeight: '250px',
            fontFamily: '"DM Sans", sans-serif',
            '& .country': {
              padding: '10px 16px',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.highlight': {
                backgroundColor: theme.palette.action.selected,
              }
            },
            // Campo de búsqueda dentro del dropdown
            '& .search': {
              padding: '12px',
              marginBottom: '15px',
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& input': {
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                backgroundColor: theme.palette.background.default,
                '&:focus': {
                  outline: 'none',
                  borderColor: theme.palette.primary.main,
                }
              }
            }
          }
        }
      }}
    >
      {/* {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 0.5,
            display: 'block',
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            ml: '14px' // Alineación con el borde del input
          }}
        >
          {label} {required && '*'}
        </Typography>
      )} */}
      
      <PhoneInput
        country={country}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputProps={{
          name: 'phone',
          required: required,
        }}
        containerClass="react-tel-input"
        inputClass="form-control"
        buttonClass="flag-dropdown"
        dropdownClass="country-list"
        placeholder='Phone'
      />
      
      {helperText && (
        <FormHelperText sx={{ ml: '14px', fontFamily: '"DM Sans", sans-serif' }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}