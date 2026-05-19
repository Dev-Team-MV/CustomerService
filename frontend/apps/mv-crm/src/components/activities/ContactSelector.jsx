// frontend/apps/mv-crm/src/components/activities/ContactSelector.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  RadioGroup,
  Radio,
  FormControlLabel,
  Avatar,
  Chip,
  Paper,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import { Person, PersonAdd, Email, Phone, Business } from '@mui/icons-material'
import { useResidents } from '@shared/hooks/useResidents'

const ContactSelector = ({ 
  value = { type: 'none', relatedUser: null, externalContact: null },
  onChange 
}) => {
  const [contactType, setContactType] = useState(value.type || 'none')
  const [searchInput, setSearchInput] = useState('')
  const [externalData, setExternalData] = useState(value.externalContact || {
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  })

  // Usar el hook useResidents para obtener usuarios reales
  const { users, loading } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  // Filtrar usuarios basado en búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchInput.trim()) return users
    const q = searchInput.toLowerCase()
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    )
  }, [users, searchInput])

  // Transformar usuarios al formato esperado
  const userOptions = useMemo(() => {
    return filteredUsers.map(u => ({
      _id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      phone: u.phoneNumber || ''
    }))
  }, [filteredUsers])

  const handleTypeChange = (e) => {
    const newType = e.target.value
    setContactType(newType)
    onChange?.({
      type: newType,
      relatedUser: null,
      externalContact: null
    })
  }

  const handleUserSelect = (user) => {
    onChange?.({
      type: 'registered',
      relatedUser: user,
      externalContact: null
    })
  }

  const handleExternalChange = (field, val) => {
    const updated = { ...externalData, [field]: val }
    setExternalData(updated)
    onChange?.({
      type: 'external',
      relatedUser: null,
      externalContact: updated
    })
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        Contacto relacionado
      </Typography>
      
      <RadioGroup value={contactType} onChange={handleTypeChange} row>
        <FormControlLabel 
          value="none" 
          control={<Radio size="small" />} 
          label="Sin contacto" 
        />
        <FormControlLabel 
          value="registered" 
          control={<Radio size="small" />} 
          label="Usuario registrado" 
        />
        <FormControlLabel 
          value="external" 
          control={<Radio size="small" />} 
          label="Contacto externo" 
        />
      </RadioGroup>

      {/* Usuario registrado */}
      {contactType === 'registered' && (
        <Box mt={2}>
          <Autocomplete
            options={userOptions}
            loading={loading}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, val) => option._id === val?._id}
            value={value.relatedUser}
            onChange={(_, newValue) => handleUserSelect(newValue)}
            onInputChange={(_, newInput) => setSearchInput(newInput)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar usuario"
                placeholder="Nombre o email..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
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
              <Box component="li" {...props} key={option._id} display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3' }}>
                  {option.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                </Box>
              </Box>
            )}
          />
          
          {/* Preview del usuario seleccionado */}
          {value.relatedUser && (
            <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#2196f3' }}>
                  {value.relatedUser.name?.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography fontWeight={600}>{value.relatedUser.name}</Typography>
                  <Box display="flex" gap={2} mt={0.5} flexWrap="wrap">
                    <Chip 
                      icon={<Email sx={{ fontSize: 14 }} />} 
                      label={value.relatedUser.email} 
                      size="small" 
                      variant="outlined"
                    />
                    {value.relatedUser.phone && (
                      <Chip 
                        icon={<Phone sx={{ fontSize: 14 }} />} 
                        label={value.relatedUser.phone} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Contacto externo */}
      {contactType === 'external' && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonAdd color="warning" />
            <Typography variant="subtitle2" color="warning.main">
              Contacto externo (no registrado)
            </Typography>
          </Box>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nombre"
              value={externalData.name}
              onChange={(e) => handleExternalChange('name', e.target.value)}
              size="small"
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment>
              }}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Email"
                value={externalData.email}
                onChange={(e) => handleExternalChange('email', e.target.value)}
                size="small"
                fullWidth
                type="email"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>
                }}
              />
              <TextField
                label="Teléfono"
                value={externalData.phone}
                onChange={(e) => handleExternalChange('phone', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment>
                }}
              />
            </Box>
            <TextField
              label="Empresa"
              value={externalData.company}
              onChange={(e) => handleExternalChange('company', e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><Business fontSize="small" /></InputAdornment>
              }}
            />
            <TextField
              label="Notas"
              value={externalData.notes}
              onChange={(e) => handleExternalChange('notes', e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
              placeholder="Información adicional sobre el contacto..."
            />
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default ContactSelector