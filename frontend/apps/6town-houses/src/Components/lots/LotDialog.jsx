// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/lots/LotDialog.jsx

import { useState, useEffect } from 'react'
import { 
  TextField, MenuItem, Alert, Box 
} from '@mui/material'
import { Landscape } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import lotService from '@shared/services/lotService'

const DEFAULT_FORM = {
  number: '',
  price: '',
  status: 'available'
}

const LotDialog = ({ open, onClose, onSaved, selectedLot, projectId }) => {
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (selectedLot) {
        setForm({
          number: selectedLot.number || '',
          price: selectedLot.price || '',
          status: selectedLot.status || 'available'
        })
      } else {
        setForm(DEFAULT_FORM)
      }
    }
  }, [selectedLot, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid = form.number.trim().length > 0 && form.price > 0
  
const handleSave = async () => {
  if (!isValid) return

  try {
    setSaving(true)
    const lotData = {
      projectId,
      number: form.number,
      price: Number(form.price),
      status: form.status
    }

    let savedLot
    if (selectedLot) {
      savedLot = await lotService.update(selectedLot._id, lotData)
    } else {
      savedLot = await lotService.create(lotData)
    }

    // ✅ Llamar onSaved DESPUÉS de que termine el guardado
    onSaved(savedLot)
  } catch (err) {
    console.error('Error saving lot:', err)
    alert(`Error: ${err.message}`)
  } finally {
    setSaving(false)
  }
}

  const fieldSx = {
    '& .MuiOutlinedInput-root': { 
      borderRadius: 3, 
      fontFamily: '"Poppins", sans-serif', 
      bgcolor: 'white',
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main }
    },
    '& .MuiInputLabel-root': { 
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused': { color: theme.palette.primary.main }
    }
  }

  return (
    <ModalWrapper
      open={open} 
      onClose={onClose} 
      icon={Landscape}
      title={selectedLot ? 'Editar Lote' : 'Nuevo Lote'}
      subtitle={selectedLot ? `Editando ${selectedLot.number}` : 'Crea un nuevo lote para el proyecto'}
      maxWidth="sm"
      actions={
        <>
          <button onClick={onClose} disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Los lotes representan el inventario comercial del proyecto
        </Alert>

        <TextField
          label="Número de Lote"
          value={form.number}
          onChange={(e) => handleChange('number', e.target.value)}
          placeholder="Ej: PX-1, Lote 1, Casa 1"
          fullWidth
          required
          sx={fieldSx}
        />

        <TextField
          label="Precio"
          type="number"
          value={form.price}
          onChange={(e) => handleChange('price', e.target.value)}
          placeholder="120000"
          fullWidth
          required
          sx={fieldSx}
          InputProps={{
            startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>$</Box>
          }}
        />

        <TextField
          label="Estado"
          select
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          fullWidth
          sx={fieldSx}
        >
          <MenuItem value="available">Disponible</MenuItem>
          <MenuItem value="reserved">Reservado</MenuItem>
          <MenuItem value="sold">Vendido</MenuItem>
          <MenuItem value="inactive">Inactivo</MenuItem>
        </TextField>
      </Box>
    </ModalWrapper>
  )
}

export default LotDialog