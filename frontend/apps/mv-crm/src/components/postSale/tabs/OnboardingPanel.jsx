// apps/mv-crm/src/components/postSale/tabs/OnboardingPanel.jsx
import { useState, useMemo } from 'react'
import { 
  Box, Button, Grid, FormControl, InputLabel, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography
} from '@mui/material'
import { Add, Close, Warning as WarningIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import DataTable from '@shared/components/table/DataTable'
import { useOnboarding } from '../../../constants/hooks/useOnboarding'
import { useResolvedProperties } from '../../../constants/hooks/useResolvedProperties'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useOnboardingColumns } from '../../../constants/Columns/onboardingColumns'
import api from '@shared/services/api'

import OnboardingForm from '../OnboardingForm'
import OnboardingDetailDialog from '../OnboardingDetailDialog'

export default function OnboardingPanel({ onNotify }) {
  const { t } = useTranslation('postSale')
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)

  const [filters, setFilters] = useState({ projectId: '', clientId: '', status: '' })
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOnboarding, setSelectedOnboarding] = useState(null)

  const { data: onboardings, loading: onboardingLoading, refresh: refreshOnboarding } = useOnboarding(filters)
  const { propertiesMap, loading: resolvingProperties } = useResolvedProperties(onboardings)

  const filteredResidents = useMemo(() => {
    if (!filters.projectId) return residents.filter(r => r.role === 'user')
    return residents.filter(r => 
      r.role === 'user' && 
      (r.projects?.some(p => p._id === filters.projectId) || 
       r.projectMemberships?.some(m => m.project?._id === filters.projectId || m.project === filters.projectId))
    )
  }, [residents, filters.projectId])

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }))
  const clearFilters = () => setFilters({ projectId: '', clientId: '', status: '' })

  const handleView = (row) => { setSelectedOnboarding(row); setDetailModalOpen(true) }
  const handleEdit = (row) => { setSelectedOnboarding(row); setCreateFormOpen(true) }
  const promptDelete = (row) => { setSelectedOnboarding(row); setDeleteDialogOpen(true) }

  const confirmDelete = async () => {
    if (!selectedOnboarding) return
    try {
      await api.delete(`/onboarding/${selectedOnboarding._id}`)
      onNotify(t('actions.deletedMsg'), 'success')
      refreshOnboarding()
    } catch (error) {
      onNotify(t('actions.deleteErrorMsg'), 'error')
    } finally {
      setDeleteDialogOpen(false)
      setSelectedOnboarding(null)
    }
  }

  const handleFormSuccess = () => {
    setCreateFormOpen(false)
    setSelectedOnboarding(null)
    refreshOnboarding()
    onNotify(t('onboarding.saveSuccess'), 'success')
  }

  const columns = useOnboardingColumns({ t, propertiesMap, onView: handleView, onEdit: handleEdit, onDelete: promptDelete })
  const isLoading = onboardingLoading || resolvingProperties

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.project')}</InputLabel>
              <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project')} sx={inputSx}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={!filters.projectId}>
              <InputLabel>{t('filters.client')}</InputLabel>
              <Select value={filters.clientId} onChange={(e) => handleFilterChange('clientId', e.target.value)} label={t('filters.client')} sx={inputSx}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {filteredResidents.map(client => <MenuItem key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.status')}</InputLabel>
              <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label={t('filters.status')} sx={inputSx}>
                <MenuItem value="">{t('filters.all')}</MenuItem>
                {['not_started', 'in_progress', 'completed'].map(s => (
                  <MenuItem key={s} value={s}>{t(`onboarding.statuses.${s}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ ...unifiedButtonSx, height: 40, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              {t('filters.clear')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setSelectedOnboarding(null); setCreateFormOpen(true); }} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {t('onboarding.newOnboarding')}
        </Button>
      </Box>

      <DataTable columns={columns} data={onboardings || []} loading={isLoading} />

      <OnboardingForm open={createFormOpen} onClose={() => { setCreateFormOpen(false); setSelectedOnboarding(null); }} initialData={selectedOnboarding} onSuccess={handleFormSuccess} />
      <OnboardingDetailDialog open={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedOnboarding(null); }} onboarding={selectedOnboarding} onRefresh={refreshOnboarding} onNotify={onNotify} />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('actions.confirmDelete')}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{t('actions.deleteWarning')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ ...unifiedButtonSx, bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f', boxShadow: '6px 6px 0px rgba(244,67,54,0.12)' } }}>{t('actions.yesDelete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}