import { useState } from 'react'
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Autocomplete,
  Paper,
  Avatar,
  Typography,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import { useResidents } from '@shared/hooks/useResidents'
import { Person, Phone, Email } from '@mui/icons-material'

const ContactSelector = ({
  contactType,
  contact,
  externalContact,
  onContactTypeChange,
  onContactChange,
  onExternalContactChange
}) => {
  const { users, loading } = useResidents()
  const [searchInput, setSearchInput] = useState('')

  const handleContactTypeChange = (type) => {
    onContactTypeChange(type)
    onContactChange(null)
    onExternalContactChange({ name: '', phone: '', email: '' })
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RadioGroup
        value={contactType}
        onChange={(e) => handleContactTypeChange(e.target.value)}
      >
        <FormControlLabel
          value="none"
          control={<Radio />}
          label="Sin contacto"
        />
        <FormControlLabel
          value="registered"
          control={<Radio />}
          label="Seleccionar usuario registrado"
        />
        <FormControlLabel
          value="external"
          control={<Radio />}
          label="Contacto externo"
        />
      </RadioGroup>

      {/* Usuario registrado */}
      {contactType === 'registered' && (
        <Box>
          <Autocomplete
            options={users || []}
            loading={loading}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option
              return `${option.firstName || ''} ${option.lastName || ''} - ${option.email}`
            }}
            value={contact}
            onChange={(_, newValue) => onContactChange(newValue)}
            onInputChange={(_, newInput) => setSearchInput(newInput)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar usuario"
                placeholder="Por nombre o email..."
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
              <Box component="li" {...props} display="flex" alignItems="center" gap={1.5} py={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#2196f3', fontSize: 12 }}>
                  {option.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="body2">
                    {option.firstName} {option.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option._id === value?._id}
          />

          {contact && (
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, mt: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                  {contact.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {contact.firstName} {contact.lastName}
                  </Typography>
                  {contact.email && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Email sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {contact.email}
                      </Typography>
                    </Box>
                  )}
                  {contact.phoneNumber && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Phone sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {contact.phoneNumber}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Contacto externo */}
      {contactType === 'external' && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff3e0' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Person color="warning" fontSize="small" />
            <Typography variant="body2" color="warning.main" fontWeight={500}>
              Contacto no registrado
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={1.5}>
            <TextField
              label="Nombre"
              value={externalContact.name}
              onChange={(e) =>
                onExternalContactChange({ ...externalContact, name: e.target.value })
              }
              fullWidth
              required
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Email"
              type="email"
              value={externalContact.email}
              onChange={(e) =>
                onExternalContactChange({ ...externalContact, email: e.target.value })
              }
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Teléfono"
              value={externalContact.phone}
              onChange={(e) =>
                onExternalContactChange({ ...externalContact, phone: e.target.value })
              }
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Paper>
      )}

      {externalContact.name && contactType === 'external' && (
        <Paper sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: '#ff9800', width: 40, height: 40 }}>
              {externalContact.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={600}>
                {externalContact.name}
              </Typography>
              {externalContact.phone && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Phone sx={{ fontSize: 14 }} />
                  <Typography variant="caption">
                    {externalContact.phone}
                  </Typography>
                </Box>
              )}
              {externalContact.email && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Email sx={{ fontSize: 14 }} />
                  <Typography variant="caption">
                    {externalContact.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default ContactSelector