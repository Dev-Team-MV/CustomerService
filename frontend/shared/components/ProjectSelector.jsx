// frontend/shared/components/ProjectSelector.jsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Autocomplete, TextField, Box, Typography, Avatar, Chip, CircularProgress } from '@mui/material'
import { Business } from '@mui/icons-material'
import { useProjects } from '@shared/hooks/useProjects'

export default function ProjectSelector({ 
  value, 
  onChange, 
  label = ' ', 
  placeholder = '...',
  includeGlobal = true,
  globalLabel = '',
  fullWidth = true,
  size = 'small',
  disabled = false,
  sx = {}
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'es' : 'en'
  
  // Obtenemos los proyectos y nos aseguramos de que sea un array
  const { projects: rawProjects, loading } = useProjects()
  const projectsList = Array.isArray(rawProjects) ? rawProjects : []

  // Preparamos las opciones de forma segura
  const options = useMemo(() => {
    const formattedProjects = projectsList.map(p => ({
      _id: p._id,
      name: p.name || p.title?.[lang] || p.title?.en || p.slug || 'Sin nombre',
      slug: p.slug,
      status: p.status,
      isGlobal: false
    }))

    if (includeGlobal) {
      return [{ _id: '', name: globalLabel, isGlobal: true }, ...formattedProjects]
    }
    return formattedProjects
  }, [projectsList, includeGlobal, globalLabel, lang])

  // ✅ FIX: Normalizamos el valor para la búsqueda (maneja tanto string como objeto)
  const currentId = typeof value === 'object' && value !== null ? value._id : value
  const selectedOption = options.find(o => o._id === currentId) || null

  // Estilos unificados y estrictos
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      fontFamily: '"Courier New", monospace',
      fontSize: '0.75rem',
      '& fieldset': { borderColor: '#e0e0e0' },
      '&:hover fieldset': { borderColor: '#000' },
      '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: 1 },
      '& .MuiInputBase-input': { 
        fontFamily: '"Helvetica Neue", sans-serif', 
        padding: size === 'small' ? '8px 14px' : '16px 14px' 
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Courier New", monospace',
      fontSize: '0.7rem',
      '&.Mui-focused': { color: '#000' }
    },
    ...sx
  }

  return (
    <Autocomplete
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => option.name || ''}
      // ✅ FIX: Comparación robusta que funciona con strings y objetos
      isOptionEqualToValue={(option, val) => {
        const valId = typeof val === 'object' && val !== null ? val._id : val
        return option._id === valId
      }}
      value={selectedOption}
      onChange={(_, newValue) => onChange(newValue?._id || '')}
      fullWidth={fullWidth}
      size={size}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label={label} 
          placeholder={placeholder}
          sx={inputSx}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box 
          component="li" 
          {...props} 
          sx={{ 
            borderRadius: 0, 
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            '&:hover': { bgcolor: '#f5f5f5' },
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1
          }}
        >
          <Avatar sx={{ width: 28, height: 28, bgcolor: option.isGlobal ? '#f5f5f5' : '#000', borderRadius: 0 }}>
            <Business sx={{ fontSize: 16, color: option.isGlobal ? '#888' : '#fff' }} />
          </Avatar>
          <Box flex={1}>
            <Typography variant="body2" fontWeight={500} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
              {option.name}
            </Typography>
            {!option.isGlobal && option.slug && (
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
                {option.slug}
              </Typography>
            )}
          </Box>
          {!option.isGlobal && option.status && (
            <Chip 
              label={option.status} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.6rem', 
                borderRadius: 0, 
                fontFamily: '"Courier New", monospace', 
                bgcolor: '#f5f5f5',
                color: '#666'
              }} 
            />
          )}
        </Box>
      )}
      // ✅ FIX CRÍTICO: Fondo sólido blanco y zIndex alto para el menú desplegable
      slotProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-paper': {
              borderRadius: 0,
              backgroundColor: '#ffffff', // Fondo sólido, nada de transparencia
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
              zIndex: 9999
            }
          }
        }
      }}
    />
  )
}