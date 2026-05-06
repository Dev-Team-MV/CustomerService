import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Grid, TextField, MenuItem, Button, Box, Typography,
  ToggleButtonGroup, ToggleButton, CircularProgress, Alert
} from '@mui/material'
import { Landscape, Circle } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import projectService from '@shared/services/projectService'
import modelService from '@shared/services/modelService'

const LOT_COLORS = [
  { value: 'green', label: 'Available', hex: '#4caf50' },
  { value: 'yellow', label: 'Pending', hex: '#ffc107' },
  { value: 'red', label: 'Sold', hex: '#f44336' },
  { value: 'blue', label: 'Hold', hex: '#2196f3' },
  { value: 'pink', label: 'Pink', hex: '#f0467f' }
]

const LotDialog = ({ open, onClose, selectedLot, onSaved, projectId }) => {
  const { t } = useTranslation(['lots', 'common'])
  const theme = useTheme()

  const [formData, setFormData] = useState({
    number: '',
    price: 0,
    status: 'available',
    project: '',
    projectId: '',
    color: 'green',
    model: ''
  })

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [models, setModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)

  // Cargar proyectos cuando abre el dialog
  useEffect(() => {
    if (open) {
      fetchProjects()
    }
  }, [open])

  // Cargar modelos cuando cambia el proyecto
  useEffect(() => {
    if (formData.project) {
      fetchModels(formData.project)
    } else {
      setModels([])
    }
  }, [formData.project])

  // Inicializar datos cuando abre el dialog con un lote seleccionado
  useEffect(() => {
    if (!open) return

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
        model: modelId
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
  }, [open, selectedLot])

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

  const handleProjectChange = (e) => {
    const newProjectId = e.target.value
    setFormData(prev => ({
      ...prev,
      project: newProjectId,
      projectId: newProjectId,
      model: ''
    }))
  }

  const handleModelChange = (e) => {
    setFormData(prev => ({
      ...prev,
      model: e.target.value
    }))
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
    model: formData.model || null
  }

  // ✅ AGREGAR: Si estamos editando, incluir el _id
  if (selectedLot?._id) {
    payload._id = selectedLot._id
  }

  onSaved(payload)  // Ya no necesitas pasar selectedLot como segundo parámetro
}

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      bgcolor: 'white',
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px'
      },
      '&:hover fieldset': {
        borderColor: theme.palette.secondary.main
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
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Landscape}
      title={selectedLot ? t('lots:dialog.editTitle') : t('lots:dialog.addTitle')}
      subtitle={selectedLot ? t('lots:dialog.editSubtitle', { number: selectedLot.number }) : t('lots:dialog.subtitle')}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={loadingProjects || loadingModels}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: theme.palette.text.secondary,
              fontFamily: '"Poppins", sans-serif',
              border: `2px solid ${theme.palette.divider}`,
              '&:hover': { bgcolor: theme.palette.action.hover }
            }}
          >
            {t('lots:actions.cancel')}
          </Button>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={!formData.number || !formData.price || !formData.project || loadingProjects || loadingModels}
          >
            {selectedLot ? t('lots:actions.update') : t('lots:actions.create')}
          </PrimaryButton>
        </>
      }
    >
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('lots:form.project')}
            value={formData.project}
            onChange={handleProjectChange}
            disabled={loadingProjects}
            helperText={t('lots:form.projectHelp')}
            sx={fieldSx}
          >
            {loadingProjects ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {t('common:loading') || 'Cargando...'}
              </MenuItem>
            ) : projects.length === 0 ? (
              <MenuItem disabled>{t('lots:form.noProjects') || 'No hay proyectos disponibles'}</MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name} {project.slug ? `(${project.slug})` : ''}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('lots:form.model')}
            value={formData.model}
            onChange={handleModelChange}
            disabled={!formData.project || loadingModels}
            helperText={
              !formData.project
                ? t('lots:form.selectProject') || 'Selecciona un proyecto primero'
                : t('lots:form.modelHelper') || 'Selecciona el modelo para este lote (opcional)'
            }
            sx={fieldSx}
          >
            <MenuItem value="">
              <em>{t('lots:table.unassigned')}</em>
            </MenuItem>
            {loadingModels ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {t('common:loading') || 'Cargando...'}
              </MenuItem>
            ) : models.length === 0 ? (
              <MenuItem disabled>
                {formData.project ? t('lots:form.noModels') || 'No hay modelos disponibles' : ''}
              </MenuItem>
            ) : (
              models.map((model) => (
                <MenuItem key={model._id} value={model._id}>
                  {model.model} - {model.modelNumber} (${model.price?.toLocaleString()})
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label={t('lots:form.number')}
            value={formData.number}
            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
            placeholder={t('lots:form.numberPlaceholder')}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type="number"
            label={t('lots:form.price')}
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, fontSize: '0.875rem', color: 'primary.main', fontWeight: 600 }}>
                  $
                </Typography>
              )
            }}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('lots:form.status')}
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            sx={fieldSx}
          >
            <MenuItem value="available">{t('lots:status.available')}</MenuItem>
            <MenuItem value="pending">{t('lots:status.pending')}</MenuItem>
            <MenuItem value="sold">{t('lots:status.sold')}</MenuItem>
            <MenuItem value="reserved">{t('lots:status.reserved')}</MenuItem>
          </TextField>
        </Grid>

      </Grid>
    </ModalWrapper>
  )
}

export default LotDialog