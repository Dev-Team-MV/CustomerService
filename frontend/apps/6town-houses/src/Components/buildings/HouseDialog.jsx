// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/buildings/HouseDialog.jsx

import { useState, useEffect } from 'react'
import {
  Grid, TextField, MenuItem, Button, Box, Typography, IconButton, Alert
} from '@mui/material'
import { Home, AddPhotoAlternate, Delete, AttachMoney } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const DEFAULT_FORM = {
  name: '',
  status: 'active',
  quoteRef: {
    lot: '',
    model: '',
    facade: ''
  }
}

const ImagePreviewCard = ({ url, onRemove }) => {
  const theme = useTheme()
  return (
    <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: 2, overflow: 'hidden', border: `2px solid ${theme.palette.cardBorder}`, bgcolor: theme.palette.cardBg, mr: 1.5, mb: 1.5, display: 'inline-block' }}>
      <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {onRemove && (
        <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}>
          <Delete fontSize="small" sx={{ color: theme.palette.warning.main }} />
        </IconButton>
      )}
    </Box>
  )
}

const HouseDialog = ({ open, onClose, onSaved, selectedBuilding, projectId, lots = [], models = [], facades = [] }) => {
  const theme = useTheme()

  const [form, setForm] = useState(DEFAULT_FORM)
  const [exteriorRenders, setExteriorRenders] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (selectedBuilding) {
        setForm({
          name: selectedBuilding.name || '',
          status: selectedBuilding.status || 'active',
          quoteRef: {
            lot: selectedBuilding.quoteRef?.lot || '',
            model: selectedBuilding.quoteRef?.model || '',
            facade: selectedBuilding.quoteRef?.facade || ''
          }
        })
        
        // Manejar exteriorRenders: puede ser array o {urls: []}
        let renders = []
        if (Array.isArray(selectedBuilding.exteriorRenders)) {
          renders = selectedBuilding.exteriorRenders
        } else if (selectedBuilding.exteriorRenders?.urls) {
          renders = selectedBuilding.exteriorRenders.urls
        }
        setExteriorRenders(renders)
      } else {
        setForm(DEFAULT_FORM)
        setExteriorRenders([])
      }
    }
  }, [selectedBuilding, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleQuoteRefChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      quoteRef: { ...prev.quoteRef, [field]: value }
    }))
  }

  const isValid = form.name.trim().length > 0

  const handleSubmit = async () => {
    if (!isValid) return
    setSaving(true)
    try {
      await onSaved({
        ...selectedBuilding,
        ...form,
        project: projectId,
        floors: 1,
        totalApartments: 0,
        exteriorRenders,
        quoteRef: form.quoteRef
      })
    } catch (err) {
      console.error('Error saving house:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleExteriorUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setExteriorRenders(prev => [...prev, ...files])
    e.target.value = ''
  }

  const handleRemoveRender = (index) => {
    setExteriorRenders(prev => prev.filter((_, idx) => idx !== index))
  }

  // Calcular precio total estimado
  const calculateEstimatedPrice = () => {
    let total = 0
    const selectedLot = lots.find(l => l._id === form.quoteRef.lot)
    const selectedModel = models.find(m => m._id === form.quoteRef.model)
    const selectedFacade = facades.find(f => f._id === form.quoteRef.facade)
    
    if (selectedLot) total += selectedLot.price || 0
    if (selectedModel) total += selectedModel.price || 0
    if (selectedFacade) total += selectedFacade.price || 0
    
    return total
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 3, fontFamily: '"Poppins", sans-serif', bgcolor: 'white', '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' }, '&:hover fieldset': { borderColor: theme.palette.secondary.main } },
    '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif', '&.Mui-focused': { color: theme.palette.primary.main } }
  }

  const availableFacades = facades.filter(f => 
    f.model === form.quoteRef.model || f.model?._id === form.quoteRef.model
  )

  const estimatedPrice = calculateEstimatedPrice()
  const hasCompleteQuoteRef = form.quoteRef.lot && form.quoteRef.model && form.quoteRef.facade

  return (
    <ModalWrapper
      open={open} onClose={onClose} icon={Home}
      title={selectedBuilding ? 'Editar Casa' : 'Nueva Casa'}
      subtitle={selectedBuilding ? `Editando ${selectedBuilding.name}` : 'Crea una nueva casa para el proyecto'}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={saving} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3, py: 1.2, color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', border: `2px solid ${theme.palette.divider}`, '&:hover': { bgcolor: theme.palette.action.hover } }}>
            Cancelar
          </Button>
          <PrimaryButton onClick={handleSubmit} disabled={!isValid || saving} startIcon={<Home />}>
            {saving ? 'Guardando...' : selectedBuilding ? 'Actualizar Casa' : 'Crear Casa'}
          </PrimaryButton>
        </>
      }
    >
      <Alert severity="info" sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.secondary.main + '14', border: `1px solid ${theme.palette.secondary.main}4D`, fontFamily: '"Poppins", sans-serif' }}>
        Las casas no tienen apartamentos. La customización interna se define en el Catalog Config.
      </Alert>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        {/* Información básica */}
        <Grid item xs={12} sm={8}>
          <TextField 
            fullWidth 
            required 
            label="Nombre de la Casa" 
            value={form.name} 
            onChange={e => handleChange('name', e.target.value)} 
            placeholder="Casa #1"
            sx={fieldSx} 
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Estado"
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="active">Disponible</MenuItem>
            <MenuItem value="reserved">Reservada</MenuItem>
            <MenuItem value="sold">Vendida</MenuItem>
            <MenuItem value="inactive">Inactiva</MenuItem>
          </TextField>
        </Grid>

        {/* Configuración de Quote */}
        <Grid item xs={12}>
          <Alert severity="warning" icon={<AttachMoney />} sx={{ borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              Configuración de Cotización
            </Typography>
            <Typography variant="caption">
              Selecciona el lote, modelo y fachada que se usarán para calcular el precio de esta casa en el quote flow.
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Lote"
            value={form.quoteRef.lot}
            onChange={(e) => handleQuoteRefChange('lot', e.target.value)}
            sx={fieldSx}
            helperText={lots.length === 0 ? 'No hay lotes creados' : 'Lote asignado'}
          >
            <MenuItem value="">
              <em>Sin asignar</em>
            </MenuItem>
            {lots.map((lot) => (
              <MenuItem key={lot._id} value={lot._id}>
                {lot.number} - ${lot.price?.toLocaleString()}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Modelo"
            value={form.quoteRef.model}
            onChange={(e) => {
              handleQuoteRefChange('model', e.target.value)
              // Reset facade si cambia modelo
              if (form.quoteRef.facade) {
                handleQuoteRefChange('facade', '')
              }
            }}
            sx={fieldSx}
            helperText={models.length === 0 ? 'No hay modelos creados' : 'Modelo de casa'}
          >
            <MenuItem value="">
              <em>Sin asignar</em>
            </MenuItem>
            {models.map((model) => (
              <MenuItem key={model._id} value={model._id}>
                {model.model} - ${model.price?.toLocaleString()}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Fachada"
            value={form.quoteRef.facade}
            onChange={(e) => handleQuoteRefChange('facade', e.target.value)}
            sx={fieldSx}
            disabled={!form.quoteRef.model}
            helperText={
              !form.quoteRef.model 
                ? 'Selecciona un modelo primero' 
                : availableFacades.length === 0 
                  ? 'No hay fachadas para este modelo' 
                  : 'Fachada de la casa'
            }
          >
            <MenuItem value="">
              <em>Sin asignar</em>
            </MenuItem>
            {availableFacades.map((facade) => (
              <MenuItem key={facade._id} value={facade._id}>
                {facade.title} - ${facade.price?.toLocaleString()}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Precio estimado */}
        {hasCompleteQuoteRef && (
          <Grid item xs={12}>
            <Alert severity="success" sx={{ borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>
              <Typography variant="body2" fontWeight={600}>
                Precio Base Estimado: ${estimatedPrice.toLocaleString()}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Este es el precio base sin customizaciones del Catalog Config
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Renders exteriores */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 3, border: `1px solid ${theme.palette.cardBorder}` }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Renders Exteriores ({exteriorRenders.length}/10)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternate />}
                disabled={exteriorRenders.length >= 10}
                sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
              >
                Subir
                <input type="file" hidden multiple accept="image/*" onChange={handleExteriorUpload} />
              </Button>
            </Box>

            {exteriorRenders.length > 0 && (
              <Box>
                {exteriorRenders.map((render, idx) => (
                  <ImagePreviewCard
                    key={idx}
                    url={typeof render === 'string' ? render : URL.createObjectURL(render)}
                    onRemove={() => handleRemoveRender(idx)}
                  />
                ))}
              </Box>
            )}

            {exteriorRenders.length === 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                No hay renders cargados
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="warning" sx={{ borderRadius: 2, fontFamily: '"Poppins", sans-serif' }}>
            <strong>Nota:</strong> El polígono se define en el Master Plan después de crear la casa.
          </Alert>
        </Grid>
      </Grid>
    </ModalWrapper>
  )
}

export default HouseDialog