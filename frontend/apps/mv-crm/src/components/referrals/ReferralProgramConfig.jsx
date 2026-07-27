import { useState, useEffect } from 'react'
import { 
  Box, Paper, Typography, Grid, TextField, FormControl, 
  InputLabel, Select, MenuItem, Button, Switch, FormControlLabel, 
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import DataTable from '@shared/components/table/DataTable'
import { useReferralPrograms } from '../../constants/hooks/useReferralPrograms'
import { useReferralProgramColumns } from '../../constants/Columns/useReferralProgramColumns'
import referralService from '../../../../../shared/services/referralService'

export default function ReferralProgramConfig({ projects }) {
  const { t } = useTranslation('referrals')
  const [selectedProject, setSelectedProject] = useState('')
  
  const { data: programs, loading: programsLoading, refresh } = useReferralPrograms(
    selectedProject ? { projectId: selectedProject } : {}
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '', 
    rewardPerReferral: 0, 
    discountPercent: 0, // ✅ Nuevo campo
    rewardType: 'cash', // ✅ 'cash' | 'property_discount'
    isActive: true, 
    maxReferralsPerUser: 0,
    termsAndConditions: { en: '', es: '' }
  })

  useEffect(() => {
    if (modalOpen) {
      if (editingProgram) {
        setFormData({
          name: editingProgram.name,
          rewardPerReferral: editingProgram.rewardPerReferral || 0,
          discountPercent: editingProgram.discountPercent || 0,
          rewardType: editingProgram.rewardType || 'cash',
          isActive: editingProgram.isActive,
          maxReferralsPerUser: editingProgram.maxReferralsPerUser,
          termsAndConditions: editingProgram.termsAndConditions || { en: '', es: '' }
        })
      } else {
        setFormData({
          name: 'Programa de Referidos', 
          rewardPerReferral: 0, 
          discountPercent: 0,
          rewardType: 'cash', 
          isActive: true, 
          maxReferralsPerUser: 0,
          termsAndConditions: { en: '', es: '' }
        })
      }
      setError('')
    }
  }, [modalOpen, editingProgram])

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleOpenModal = (program = null) => {
    setEditingProgram(program)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingProgram(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.projectId && !editingProgram) {
      return setError(t('program.selectProjectError', 'Debes seleccionar un proyecto'))
    }
    
    setSubmitting(true)
    setError('')
    try {
      const payload = { 
        ...formData, 
        projectId: editingProgram ? editingProgram.projectId._id : formData.projectId 
      }
      
      // Limpieza condicional según el tipo de recompensa
      if (payload.rewardType === 'cash') {
        delete payload.discountPercent
      } else {
        delete payload.rewardPerReferral
      }
      
      if (editingProgram) {
        await referralService.updateProgram(editingProgram._id, payload)
      } else {
        await referralService.createProgram(payload)
      }
      
      refresh()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.message || t('program.saveError', 'Error al guardar el programa'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (program) => {
    if (window.confirm(t('program.confirmDelete', '¿Estás seguro de eliminar este programa?'))) {
      try {
        await referralService.deleteProgram(program._id)
        refresh()
      } catch (err) {
        alert(err.response?.data?.message || t('program.deleteError', 'Error al eliminar'))
      }
    }
  }

  const columns = useReferralProgramColumns({ t, onEdit: handleOpenModal, onDelete: handleDelete })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>{t('filters.allProjects', 'Filtrar por Proyecto')}</InputLabel>
          <Select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} label={t('filters.allProjects', 'Filtrar por Proyecto')}>
            <MenuItem value="">{t('filters.allProjects', 'Todos los Proyectos')}</MenuItem>
            {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          {t('program.createNew', 'Crear Nuevo Programa')}
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataTable columns={columns} data={programs || []} loading={programsLoading} />
      </Paper>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProgram ? t('program.edit', 'Editar Programa') : t('program.create', 'Crear Programa de Referidos')}
        </DialogTitle>
        
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {!editingProgram && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('columns.project', 'Proyecto')}</InputLabel>
                    <Select value={formData.projectId || ''} onChange={(e) => handleChange('projectId', e.target.value)} label={t('columns.project', 'Proyecto')}>
                      <MenuItem value=""><em>Seleccionar Proyecto</em></MenuItem>
                      {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {editingProgram && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth disabled label={t('columns.project', 'Proyecto')} value={editingProgram.projectId?.name || 'N/A'} />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField fullWidth required label={t('program.name', 'Nombre del Programa')} value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('program.rewardType', 'Tipo de Recompensa')}</InputLabel>
                  <Select value={formData.rewardType} onChange={(e) => handleChange('rewardType', e.target.value)} label={t('program.rewardType', 'Tipo de Recompensa')}>
                    <MenuItem value="cash">{t('program.rewardTypes.cash', 'Efectivo (Cash)')}</MenuItem>
                    <MenuItem value="property_discount">{t('program.rewardTypes.property_discount', 'Descuento en Propiedad')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* ✅ Condicional: Monto fijo para Cash */}
              {formData.rewardType === 'cash' && (
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth required type="number" 
                    label={t('program.rewardPerReferral', 'Monto Fijo por Referido')} 
                    value={formData.rewardPerReferral} 
                    onChange={(e) => handleChange('rewardPerReferral', Number(e.target.value))} 
                  />
                </Grid>
              )}

              {/* ✅ Condicional: Porcentaje para Descuento */}
              {formData.rewardType === 'property_discount' && (
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth required type="number" 
                    label={t('program.discountPercent', 'Porcentaje de Descuento (%)')} 
                    value={formData.discountPercent} 
                    onChange={(e) => handleChange('discountPercent', Number(e.target.value))} 
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth required type="number" 
                  label={t('program.maxReferrals', 'Máx. Referidos por Usuario')} 
                  value={formData.maxReferralsPerUser} 
                  onChange={(e) => handleChange('maxReferralsPerUser', Number(e.target.value))} 
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel 
                  control={<Switch checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />} 
                  label={<Typography fontWeight={600}>{t('program.isActive', 'Programa Activo')}</Typography>} 
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth multiline rows={4} label={t('program.terms', 'Términos y Condiciones (ES)')} value={formData.termsAndConditions.es} onChange={(e) => handleChange('termsAndConditions.es', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth multiline rows={4} label={t('program.termsEn', 'Términos y Condiciones (EN)')} value={formData.termsAndConditions.en} onChange={(e) => handleChange('termsAndConditions.en', e.target.value)} />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button onClick={handleCloseModal} disabled={submitting}>{t('actions.cancel', 'Cancelar')}</Button>
          <Button type="submit" variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting && <CircularProgress size={20} />}>
            {submitting ? t('actions.saving', 'Guardando...') : (editingProgram ? t('actions.update', 'Actualizar') : t('actions.create', 'Crear'))}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}