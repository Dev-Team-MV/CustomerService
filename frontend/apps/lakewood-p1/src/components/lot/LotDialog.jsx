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
  CircularProgress
} from '@mui/material'
import { Landscape } from '@mui/icons-material'
import projectService from '../../services/projectService'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'

const LotDialog = ({ open, onClose, selectedLot, onSubmit }) => {
  const { t } = useTranslation(['lots', 'common'])
  
  const [formData, setFormData] = useState({
    number: '',
    price: 0,
    status: 'available',
    project: '',
    projectId: ''
  })

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Cargar proyectos al abrir
  useEffect(() => {
    if (open) fetchProjects()
  }, [open])

  // Cargar datos del lote seleccionado
  useEffect(() => {
    if (selectedLot) {
      const projectId = typeof selectedLot.project === 'object'
        ? selectedLot.project?._id
        : selectedLot.project || selectedLot.projectId || ''

      setFormData({
        number: selectedLot.number,
        price: selectedLot.price,
        status: selectedLot.status,
        project: projectId,
        projectId: projectId
      })
    } else {
      setFormData({
        number: '',
        price: 0,
        status: 'available',
        project: '',
        projectId: ''
      })
    }
  }, [selectedLot, open])

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
      
      // Auto-seleccionar si solo hay uno y no estamos editando
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
      projectId: String(formData.projectId || formData.project)
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
      </Grid>
    </ModalWrapper>
  )
}
export default LotDialog