// apps/mv-crm/src/components/vendors/VendorModal.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  FormControl, InputLabel, Select, MenuItem, Grid,
  Chip, CircularProgress, Alert
} from '@mui/material'
import { Close, Save, Upload, Delete, LocationOn, Public, Add } from '@mui/icons-material'
import { useVendors } from '../../constants/hooks/useVendors'
import SharedPhoneInput from '@shared/constants/SharedPhoneInput'
import uploadService from '@shared/services/uploadService'

// ✅ Componentes compartidos
import ProjectSelector from '@shared/components/ProjectSelector'
import CountrySelector from '@shared/components/CountrySelector'

const VendorModal = ({ open, onClose, vendor = null, onSave, categories, isTourMode = false }) => {
  const { t, i18n } = useTranslation('vendors')
  const lang = i18n.language.startsWith('es') ? 'es' : 'en'
  const isEditing = Boolean(vendor?._id)
  
  const { createVendor, updateVendor } = useVendors()
  
  const [formData, setFormData] = useState({
    name: '', category: '', subcategory: '', contactPhones: [''],
    locations: [], projectId: '', photo: '', website: '', status: 'active'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    if (open) {
      if (vendor) {
        // ✅ Normalizar projectId por si viene como objeto
        const rawProjectId = vendor.projectId
        const normalizedProjectId = typeof rawProjectId === 'object' && rawProjectId !== null 
          ? rawProjectId._id 
          : (rawProjectId || '')

        setFormData({
          name: vendor.name || '',
          category: vendor.category || '',
          subcategory: vendor.subcategory || '',
          contactPhones: vendor.contactPhones?.length ? vendor.contactPhones : [''],
          locations: vendor.locations || [],
          projectId: normalizedProjectId,
          photo: vendor.photo || '',
          website: vendor.website || '',
          status: vendor.status || 'active'
        })
        if (vendor.photo) setPhotoPreview(vendor.photo)
      } else {
        setFormData({ name: '', category: '', subcategory: '', contactPhones: [''], locations: [], projectId: '', photo: '', website: '', status: 'active' })
      }
      setError('')
      setPhotoFile(null)
      setPhotoPreview('')
    }
  }, [open, vendor])

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.contactPhones]
    newPhones[index] = value
    setFormData(prev => ({ ...prev, contactPhones: newPhones }))
  }

  const addPhone = () => setFormData(prev => ({ ...prev, contactPhones: [...prev.contactPhones, ''] }))

  const removePhone = (index) => {
    if (formData.contactPhones.length > 1) {
      setFormData(prev => ({ ...prev, contactPhones: prev.contactPhones.filter((_, i) => i !== index) }))
    }
  }

  const handleLocationSelect = (newValue) => {
    if (newValue) {
      const location = {
        formattedAddress: newValue.label,
        placeId: newValue.value.place_id,
        lat: newValue.value.geometry?.location?.lat,
        lng: newValue.value.geometry?.location?.lng,
        label: newValue.label
      }
      setFormData(prev => ({ ...prev, locations: [...prev.locations, location] }))
    }
  }

  const removeLocation = (index) => {
    setFormData(prev => ({ ...prev, locations: prev.locations.filter((_, i) => i !== index) }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return setError(t('vendors.errorName', 'El nombre es requerido'))
    if (!formData.category) return setError(t('vendors.errorCategory', 'La categoría es requerida'))

    setLoading(true)
    setError('')

    try {
      let photoUrl = formData.photo
      if (photoFile) {
        photoUrl = await uploadService.uploadImage(photoFile, 'vendors')
      }

      const payload = {
        ...formData,
        photo: photoUrl,
        contactPhones: formData.contactPhones.filter(p => p.trim()),
        projectId: formData.projectId || null
      }

      if (isEditing) await updateVendor(vendor._id, payload)
      else await createVendor(payload)

      onSave()
    } catch (err) {
      console.error('Error saving vendor:', err)
      setError(err.response?.data?.message || t('vendors.saveError', 'Error al guardar'))
    } finally {
      setLoading(false)
    }
  }

  const getSubcategories = () => {
    if (!formData.category || !categories.length) return []
    const category = categories.find(c => c.slug === formData.category)
    return category?.subcategories || []
  }

  // ✅ Estilos unificados
  const unifiedButtonSx = {
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem', letterSpacing: '0.5px',
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
  }

  const inputSx = {
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 }
  }

  const menuItemSx = {
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' }
  }

  return (
    // ✅ ID 1: Modal completo
    <Dialog id="vendor-modal" open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #e0e0e0' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', p: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isEditing ? t('vendors.editVendor', 'Editar Proveedor') : t('vendors.addVendor', 'Agregar Proveedor')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0 }}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* ✅ ID 2: Información Básica */}
          <Box id="vendor-modal-basic-info">
            <TextField fullWidth required label={t('vendors.name', 'Nombre del Proveedor')} value={formData.name} onChange={(e) => handleChange('name', e.target.value)} sx={inputSx} />

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('vendors.category', 'Categoría')}</InputLabel>
                  <Select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} label={t('vendors.category', 'Categoría')} sx={inputSx}>
                    {categories.map((cat) => (
                      <MenuItem key={cat.slug} value={cat.slug} sx={menuItemSx}>{cat.label[lang]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('vendors.subcategory', 'Subcategoría')}</InputLabel>
                  <Select value={formData.subcategory} onChange={(e) => handleChange('subcategory', e.target.value)} label={t('vendors.subcategory', 'Subcategoría')} sx={inputSx}>
                    {getSubcategories().map((sub) => (
                      <MenuItem key={sub.slug} value={sub.slug} sx={menuItemSx}>{sub.label[lang]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* ✅ ID 3: Contacto y Ubicación */}
          <Box id="vendor-modal-contact">
            <Typography variant="subtitle2" mb={1} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('vendors.contactPhones', 'Teléfonos de Contacto')}
            </Typography>
            {formData.contactPhones.map((phone, index) => (
              <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
                <SharedPhoneInput value={phone} onChange={(value) => handlePhoneChange(index, value)} country="co" fullWidth sx={{ flex: 1 }} />
                {formData.contactPhones.length > 1 && (
                  <IconButton size="small" onClick={() => removePhone(index)} color="error" sx={{ borderRadius: 0, mt: 0 }}>
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button size="small" startIcon={<Add />} onClick={addPhone} variant="outlined" sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5' } }}>
              {t('vendors.addPhone', 'Agregar Teléfono')}
            </Button>

            <Typography variant="subtitle2" mb={1} mt={2} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('vendors.locations', 'Ubicaciones')}
            </Typography>
            <CountrySelector
              value={formData.locations.length > 0 ? formData.locations[0].formattedAddress : ''}
              onChange={(value) => {
                if (value) {
                  setFormData(prev => ({ 
                    ...prev, 
                    locations: [{ formattedAddress: value, placeId: '', lat: null, lng: null, label: value }] 
                  }))
                } else {
                  setFormData(prev => ({ ...prev, locations: [] }))
                }
              }}
              label={t('vendors.searchLocation', 'Buscar dirección')}
              placeholder="Ej: 123 Main St, Miami, FL"
              countryRestriction="us"
              types={['address']}
            />
            {formData.locations.length > 0 && (
              <Box mt={2} display="flex" flexDirection="column" gap={1}>
                {formData.locations.map((loc, index) => (
                  <Chip
                    key={index}
                    label={loc.formattedAddress}
                    onDelete={() => removeLocation(index)}
                    icon={<LocationOn sx={{ color: '#888' }} />}
                    sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', bgcolor: '#f5f5f5', justifyContent: 'flex-start' }}
                  />
                ))}
              </Box>
            )}

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <ProjectSelector
                  value={formData.projectId}
                  onChange={(value) => handleChange('projectId', value)}
                  label={t('vendors.project', 'Proyecto (Opcional)')}
                  includeGlobal={true}
                  globalLabel={t('vendors.general', 'General (Sin proyecto)')}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('vendors.website', 'Sitio Web')}
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://ejemplo.com"
                  InputProps={{ startAdornment: <Box component="span" sx={{ display: 'flex', alignItems: 'center', pl: 1 }}><Public sx={{ fontSize: 18, color: '#888', mr: 0.5 }} /></Box> }}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" mb={1} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('vendors.photo', 'Foto (Opcional)')}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Button variant="outlined" component="label" startIcon={<Upload />} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000' }}>
                {t('vendors.uploadPhoto', 'Subir Foto')}
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </Button>
              {photoPreview && (
                <Box position="relative">
                  <Box component="img" src={photoPreview} alt="Preview" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 0, border: '1px solid #e0e0e0' }} />
                  <IconButton size="small" onClick={() => { setPhotoPreview(''); setPhotoFile(null); handleChange('photo', '') }} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#f44336', color: '#fff', '&:hover': { bgcolor: '#d32f2f' }, borderRadius: 0 }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          <FormControl fullWidth>
            <InputLabel>{t('vendors.status', 'Estado')}</InputLabel>
            <Select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} label={t('vendors.status', 'Estado')} sx={inputSx}>
              <MenuItem value="active" sx={menuItemSx}>{t('vendors.active', 'Activo')}</MenuItem>
              <MenuItem value="inactive" sx={menuItemSx}>{t('vendors.inactive', 'Inactivo')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      {/* ✅ ID 4: Botones de Acción */}
      <DialogActions id="vendor-modal-actions" sx={{ p: 2, borderTop: '1px solid #e0e0e0', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.cancel', 'Cancelar')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <Save />} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {loading ? t('actions.saving', 'Guardando...') : isEditing ? t('actions.update', 'Actualizar') : t('actions.save', 'Guardar')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VendorModal