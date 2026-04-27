import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import { Landscape, Circle } from '@mui/icons-material'
import projectService from '../../services/projectService'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import modelService from '@shared/services/modelService'

// 4 colores hardcodeados para inventario
const LOT_COLORS = [
  { value: 'green', label: 'Available', hex: '#4caf50' },
  { value: 'yellow', label: 'Model 10', hex: '#ffc107' },
  { value: 'red', label: 'Sold', hex: '#f44336' },
  { value: 'blue', label: 'Hold', hex: '#2196f3' },
  {value: 'pink', label: 'Pink', hex: '#f0467f'}
]

const LotDialog = ({ open, onClose, selectedLot, onSubmit }) => {
  const { t } = useTranslation(['lots', 'common'])
  
const [formData, setFormData] = useState({
  number: '',
  price: 0,
  status: 'available',
  project: '',
  projectId: '',
  color: 'green',
  model: '' // ✅ Agregar campo model
})

const [projects, setProjects] = useState([])
const [loadingProjects, setLoadingProjects] = useState(false)
const [models, setModels] = useState([])
const [loadingModels, setLoadingModels] = useState(false)

useEffect(() => {
  if (open) fetchProjects()
}, [open])

// ✅ NUEVO: Fetch modelos cuando cambia el proyecto
useEffect(() => {
  if (formData.project) {
    fetchModels(formData.project)
  } else {
    setModels([])
    setFormData(prev => ({ ...prev, model: '' }))
  }
}, [formData.project])

useEffect(() => {
  if (selectedLot) {
    const projectId = typeof selectedLot.project === 'object'
      ? selectedLot.project?._id
      : selectedLot.project || selectedLot.projectId || ''

    const modelId = typeof selectedLot.model === 'object'
      ? selectedLot.model?._id
      : selectedLot.model || ''

    setFormData({
      number: selectedLot.number,
      price: selectedLot.price,
      status: selectedLot.status,
      project: projectId,
      projectId: projectId,
      color: selectedLot.color || 'green',
      model: modelId // ✅ Incluir model
    })
  } else {
    setFormData({
      number: '',
      price: 0,
      status: 'available',
      project: '',
      projectId: '',
      color: 'green',
      model: ''
    })
  }
}, [selectedLot, open])

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
      
      if (data.length === 1 && !selectedLot) {
        setFormData(prev => ({
          ...prev,
          project: data[0]._id,
          projectId: data[0]._id
        }))
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const fetchModels = async (projectId) => {
  try {
    setLoadingModels(true)
    const data = await modelService.getAll({ projectId, status: 'active' })
    setModels(data)
  } catch (error) {
    console.error('Error fetching models:', error)
    setModels([])
  } finally {
    setLoadingModels(false)
  }
}

const handleSubmit = () => {
  if (!formData.number || !formData.price || !formData.project) {
    alert(t('lots:form.validation'))
    return
  }

  const payload = {
    number: formData.number,
    price: Number(formData.price),
    status: formData.status,
    project: String(formData.project),
    projectId: String(formData.projectId || formData.project),
    color: formData.color,
    model: formData.model || null // ✅ Incluir model (opcional)
  }

  onSubmit(payload, selectedLot)
}

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Landscape}
      title={selectedLot ? t('lots:dialog.editTitle') : t('lots:dialog.addTitle')}
      subtitle={t('lots:dialog.subtitle')}
      actions={
        <>
          <PrimaryButton
            variant="outlined"
            color="secondary"
            onClick={onClose}
          >
            {t('common:actions.cancel')}
          </PrimaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.number || !formData.price || !formData.project}
          >
            {selectedLot ? t('lots:dialog.update') : t('lots:dialog.create')}
          </PrimaryButton>
        </>
      }
      maxWidth="sm"
      fullWidth
    >
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        {/* SELECT PROJECT */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('lots:form.project') || 'Project *'}
            value={formData.project}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              project: e.target.value,
              projectId: e.target.value
            }))}
            disabled={loadingProjects}
            helperText={t('lots:form.projectHelp') || 'Select the project this lot belongs to'}
          >
            {loadingProjects ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading projects...
              </MenuItem>
            ) : projects.length === 0 ? (
              <MenuItem disabled>No projects available</MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem
                  key={project._id}
                  value={project._id}
                >
                  {project.name} {project.slug ? `(${project.slug})` : ''}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        {/* ✅ NUEVO: SELECT MODEL */}
<Grid item xs={12}>
  <TextField
    fullWidth
    select
    label="Model"
    value={formData.model}
    onChange={(e) => setFormData(prev => ({
      ...prev,
      model: e.target.value
    }))}
    disabled={!formData.project || loadingModels}
    helperText={
      !formData.project 
        ? 'Select a project first' 
        : 'Select the model for this lot (optional)'
    }
  >
    {loadingModels ? (
      <MenuItem disabled>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        Loading models...
      </MenuItem>
    ) : models.length === 0 ? (
      <MenuItem disabled>
        {formData.project ? 'No models available for this project' : 'Select a project first'}
      </MenuItem>
    ) : (
      <>
        <MenuItem value="">
          <em>No model assigned</em>
        </MenuItem>
        {models.map((model) => (
          <MenuItem
            key={model._id}
            value={model._id}
          >
            {model.model} - {model.modelNumber} (${model.price?.toLocaleString()})
          </MenuItem>
        ))}
      </>
    )}
  </TextField>
</Grid>

        {/* LOT NUMBER */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('lots:form.number')}
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            required
          />
        </Grid>

        {/* PRICE */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label={t('lots:form.price')}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, fontSize: '0.875rem', color: 'primary.main', fontWeight: 600 }}>
                  $
                </Typography>
              )
            }}
          />
        </Grid>

        {/* STATUS */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('lots:form.status')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="available">
              {t('lots:status.available')}
            </MenuItem>
            <MenuItem value="pending">
              {t('lots:status.pending')}
            </MenuItem>
            <MenuItem value="sold">
              {t('lots:status.sold')}
            </MenuItem>
          </TextField>
        </Grid>

        {/* COLOR SELECTOR */}
        <Grid item xs={12}>
          <Box>
<Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#706f6f' }}>
  {t('lots:form.inventoryColor')}
</Typography>
            <ToggleButtonGroup
              value={formData.color}
              exclusive
              onChange={(e, newColor) => {
                if (newColor !== null) {
                  setFormData({ ...formData, color: newColor })
                }
              }}
              fullWidth
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1,
                '& .MuiToggleButton-root': {
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    borderWidth: '3px',
                    fontWeight: 700
                  }
                }
              }}
            >
              {LOT_COLORS.map((color) => (
                <ToggleButton
                  key={color.value}
                  value={color.value}
                  sx={{
                    borderColor: `${color.hex} !important`,
                    bgcolor: formData.color === color.value ? `${color.hex}20` : 'transparent',
                    '&:hover': {
                      bgcolor: `${color.hex}30`
                    },
                    '&.Mui-selected': {
                      bgcolor: `${color.hex}40`,
                      color: color.hex
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Circle sx={{ fontSize: 24, color: color.hex }} />
                    <Typography variant="caption" sx={{ fontWeight: 'inherit', fontSize: '0.7rem' }}>
                      {color.label}
                    </Typography>
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Grid>
      </Grid>
    </ModalWrapper>
  )
}
export default LotDialog