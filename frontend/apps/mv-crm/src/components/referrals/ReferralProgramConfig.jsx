// apps/mv-crm/src/components/referrals/ReferralProgramConfig.jsx
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
    discountPercent: 0,
    rewardType: 'cash',
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
      return setError(t('program.selectProjectError'))
    }
    
    setSubmitting(true)
    setError('')
    try {
      const payload = { 
        ...formData, 
        projectId: editingProgram ? editingProgram.projectId._id : formData.projectId 
      }
      
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
      setError(err.response?.data?.message || t('program.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (program) => {
    if (window.confirm(t('program.confirmDelete'))) {
      try {
        await referralService.deleteProgram(program._id)
        refresh()
      } catch (err) {
        alert(err.response?.data?.message || t('program.deleteError'))
      }
    }
  }

  const columns = useReferralProgramColumns({ t, onEdit: handleOpenModal, onDelete: handleDelete })

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>{t('filters.allProjects')}</InputLabel>
          <Select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} label={t('filters.allProjects')} sx={inputSx}>
            <MenuItem value="">{t('filters.allProjects')}</MenuItem>
            {projects.map(p => <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {t('program.createNew')}
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 0, overflow: 'hidden', border: '1px solid #ececec' }}>
        <DataTable columns={columns} data={programs || []} loading={programsLoading} />
      </Paper>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #ececec', fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {editingProgram ? t('program.edit') : t('program.create')}
        </DialogTitle>
        
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {!editingProgram && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('columns.project')}</InputLabel>
                    <Select value={formData.projectId || ''} onChange={(e) => handleChange('projectId', e.target.value)} label={t('columns.project')} sx={inputSx}>
                      <MenuItem value=""><em>{t('common.select')}</em></MenuItem>
                      {projects.map(p => <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>{p.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {editingProgram && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth disabled label={t('columns.project')} value={editingProgram.projectId?.name || t('common.na')} sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif', WebkitTextFillColor: 'rgba(0,0,0,0.6)' } }} />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField fullWidth required label={t('program.name')} value={formData.name} onChange={(e) => handleChange('name', e.target.value)} sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('program.rewardType')}</InputLabel>
                  <Select value={formData.rewardType} onChange={(e) => handleChange('rewardType', e.target.value)} label={t('program.rewardType')} sx={inputSx}>
                    <MenuItem value="cash" sx={{ fontFamily: '"Courier New", monospace' }}>{t('program.rewardTypes.cash')}</MenuItem>
                    <MenuItem value="property_discount" sx={{ fontFamily: '"Courier New", monospace' }}>{t('program.rewardTypes.property_discount')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.rewardType === 'cash' && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required type="number" label={t('program.rewardPerReferral')} value={formData.rewardPerReferral} onChange={(e) => handleChange('rewardPerReferral', Number(e.target.value))} sx={inputSx} />
                </Grid>
              )}

              {formData.rewardType === 'property_discount' && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth required type="number" label={t('program.discountPercent')} value={formData.discountPercent} onChange={(e) => handleChange('discountPercent', Number(e.target.value))} sx={inputSx} />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField fullWidth required type="number" label={t('program.maxReferrals')} value={formData.maxReferralsPerUser} onChange={(e) => handleChange('maxReferralsPerUser', Number(e.target.value))} sx={inputSx} />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel 
                  control={<Switch checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />} 
                  label={<Typography fontWeight={600} sx={{ fontFamily: '"Courier New", monospace' }}>{t('program.isActive')}</Typography>} 
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth multiline rows={4} label={t('program.terms')} value={formData.termsAndConditions.es} onChange={(e) => handleChange('termsAndConditions.es', e.target.value)} sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth multiline rows={4} label={t('program.termsEn')} value={formData.termsAndConditions.en} onChange={(e) => handleChange('termsAndConditions.en', e.target.value)} sx={{ ...inputSx, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' } }} />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #ececec' }}>
          <Button onClick={handleCloseModal} disabled={submitting} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.cancel')}</Button>
          <Button type="submit" variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting && <CircularProgress size={16} />} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
            {submitting ? t('actions.saving') : (editingProgram ? t('actions.update') : t('actions.create'))}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}