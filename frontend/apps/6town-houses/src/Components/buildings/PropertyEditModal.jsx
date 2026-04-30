import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Box, Typography,
  Grid, Alert, Autocomplete, CircularProgress, IconButton
} from '@mui/material'
import { Close, Home, Save } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import buildingService from '@shared/services/buildingService'
import userService from '@shared/services/userService'
import propertyService from '@shared/services/propertyService'

const PropertyEditModal = ({ open, onClose, property, projectId, onSaved }) => {
  const theme = useTheme()
  const { t } = useTranslation(['property', 'common'])
  
  const [formData, setFormData] = useState({
    buildingId: '',
    users: [],
    status: 'pending',
    price: 0,
    initialPayment: 0,
    pending: 0,
    saleDate: ''
  })
  
  const [buildings, setBuildings] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)

  // Cargar buildings y users al abrir el modal
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return
      
      setLoadingData(true)
      setError(null)
      try {
        const [buildingsData, usersData] = await Promise.all([
          buildingService.getAll({ projectId }),
          userService.getAll()
        ])
        
        setBuildings(buildingsData || [])
        setUsers(usersData || [])
      } catch (error) {
        console.error('Error loading data:', error)
        setError(error.message)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [open, projectId])

  // Inicializar form con datos de la propiedad
  useEffect(() => {
    if (property && open) {
      const building = buildings.find(b => 
        b._id === property.buildingId || 
        b._id === property.building?._id
      )
      
      const propertyUsers = Array.isArray(property.users) 
        ? property.users.map(u => typeof u === 'string' ? u : u._id)
        : []
      
      setFormData({
        buildingId: building?._id || '',
        users: propertyUsers,
        status: property.status || 'pending',
        price: property.price || 0,
        initialPayment: property.initialPayment || 0,
        pending: property.pending || 0,
        saleDate: property.saleDate ? property.saleDate.split('T')[0] : ''
      })
      
      const selectedUserObjects = users.filter(u => propertyUsers.includes(u._id))
      setSelectedUsers(selectedUserObjects)
    }
  }, [property, open, buildings, users])

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Recalcular pending cuando cambia price o initialPayment
      if (field === 'price' || field === 'initialPayment') {
        const newPrice = field === 'price' ? Number(value) : Number(prev.price)
        const newInitial = field === 'initialPayment' ? Number(value) : Number(prev.initialPayment)
        updated.pending = Math.max(0, newPrice - newInitial)
      }
      
      return updated
    })
  }

  const handleUsersChange = (event, newValue) => {
    setSelectedUsers(newValue)
    setFormData(prev => ({
      ...prev,
      users: newValue.map(u => u._id)
    }))
  }

  const handleSubmit = async () => {
    if (!property?._id) return
    
    setSaving(true)
    setError(null)
    try {
      const payload = {
        status: formData.status,
        price: Number(formData.price),
        initialPayment: Number(formData.initialPayment),
        pending: Number(formData.pending),
        users: formData.users,
        saleDate: formData.saleDate || null
      }
      
      const updated = await propertyService.updateProperty(property._id, payload)
      
      if (onSaved) {
        onSaved(updated)
      }
      
      onClose()
    } catch (error) {
      console.error('Error updating property:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedBuilding = buildings.find(b => b._id === formData.buildingId)

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: 'white',
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px'
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused': {
        color: theme.palette.primary.main
      }
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Home color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {t('property:actions.edit')} {t('property:form.assignedHouse')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {property?.lot?.number || 'N/A'} - {property?.model?.model || 'N/A'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loadingData ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                {t('property:messages.error', { message: error })}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {/* Building Info (Read-only) */}
              <Grid item xs={12}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: theme.palette.info.main + '14',
                    border: `1px solid ${theme.palette.info.main}40`,
                    '& .MuiAlert-message': {
                      fontFamily: '"Poppins", sans-serif'
                    }
                  }}
                >
                  <Typography 
                    variant="body2" 
                    fontWeight={700} 
                    mb={0.5}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('property:form.assignedHouse')}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {selectedBuilding?.name || t('property:form.unassigned')} 
                    {selectedBuilding?.quoteRef && (
                      <span style={{ marginLeft: 8, color: theme.palette.text.secondary }}>
                        ({t('property:table.lot')}: {property?.lot?.number}, {t('property:table.model')}: {property?.model?.model})
                      </span>
                    )}
                  </Typography>
                </Alert>
              </Grid>

              {/* Usuarios/Residentes */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={users}
                  value={selectedUsers}
                  onChange={handleUsersChange}
                  getOptionLabel={(option) => 
                    `${option.firstName || ''} ${option.lastName || ''} (${option.email || ''})`
                  }
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('property:form.residents')}
                      placeholder={t('property:form.selectResidents')}
                      sx={fieldSx}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-tag': {
                      borderRadius: 2,
                      bgcolor: theme.palette.primary.main + '20',
                      color: theme.palette.primary.main,
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600
                    }
                  }}
                />
              </Grid>

              {/* Estado */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t('property:table.status')}
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  sx={fieldSx}
                >
                  <MenuItem value="active">{t('property:status.active')}</MenuItem>
                  <MenuItem value="pending">{t('property:status.pending')}</MenuItem>
                  <MenuItem value="sold">{t('property:status.sold')}</MenuItem>
                  <MenuItem value="cancelled">{t('property:status.cancelled')}</MenuItem>
                </TextField>
              </Grid>

              {/* Fecha de Venta */}
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  fullWidth
                  label={t('property:form.saleDate')}
                  value={formData.saleDate}
                  onChange={(e) => handleChange('saleDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Precio */}
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  fullWidth
                  label={t('property:form.totalPrice')}
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Typography 
                        sx={{ 
                          mr: 1, 
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        $
                      </Typography>
                    )
                  }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Pago Inicial */}
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  fullWidth
                  label={t('property:form.initialPayment')}
                  value={formData.initialPayment}
                  onChange={(e) => handleChange('initialPayment', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Typography 
                        sx={{ 
                          mr: 1, 
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        $
                      </Typography>
                    )
                  }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Pendiente (Read-only calculado) */}
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  fullWidth
                  label={t('property:form.pending')}
                  value={formData.pending}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <Typography 
                        sx={{ 
                          mr: 1, 
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        $
                      </Typography>
                    )
                  }}
                  sx={{
                    ...fieldSx,
                    '& .MuiOutlinedInput-root': {
                      ...fieldSx['& .MuiOutlinedInput-root'],
                      bgcolor: theme.palette.action.hover,
                      cursor: 'not-allowed'
                    }
                  }}
                  helperText={t('property:form.autoCalculated')}
                />
              </Grid>

              {/* Resumen Financiero */}
              <Grid item xs={12}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: theme.palette.success.main + '14',
                    border: `1px solid ${theme.palette.success.main}40`,
                    '& .MuiAlert-message': {
                      fontFamily: '"Poppins", sans-serif'
                    }
                  }}
                >
                  <Typography 
                    variant="body2" 
                    fontWeight={700}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('property:form.financialSummary')}
                  </Typography>
                  <Box display="flex" gap={3} mt={1.5} flexWrap="wrap">
                    <Box>
                      <Typography 
                        variant="caption"
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {t('property:form.price')}:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={700}
                        sx={{ 
                          color: theme.palette.primary.main,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        ${Number(formData.price).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography 
                        variant="caption"
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {t('property:form.initialPayment')}:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={700}
                        sx={{ 
                          color: theme.palette.success.main,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        ${Number(formData.initialPayment).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography 
                        variant="caption"
                        sx={{ 
                          color: 'text.secondary',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {t('property:form.pending')}:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={700}
                        sx={{ 
                          color: formData.pending > 0 ? theme.palette.warning.main : theme.palette.success.main,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        ${Number(formData.pending).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 1
      }}>
        <Button 
          onClick={onClose}
          disabled={saving}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {t('property:actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || loadingData || formData.users.length === 0}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            },
            '&:disabled': {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled
            }
          }}
        >
          {saving ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              {t('property:form.saving')}
            </>
          ) : (
            t('property:form.saveChanges')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PropertyEditModal