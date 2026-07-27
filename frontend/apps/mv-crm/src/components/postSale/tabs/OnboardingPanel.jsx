import { useState, useMemo } from 'react'
import { 
  Box, Button, Grid, FormControl, InputLabel, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
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

  // Estados de Filtros
  const [filters, setFilters] = useState({ projectId: '', clientId: '', status: '' })
  
  // Estados de Modales
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOnboarding, setSelectedOnboarding] = useState(null)

  // Hooks de Datos
  const { data: onboardings, loading: onboardingLoading, refresh: refreshOnboarding } = useOnboarding(filters)
  const { propertiesMap, loading: resolvingProperties } = useResolvedProperties(onboardings)

  // Filtro dinámico de clientes
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

  // Handlers de Acciones
  const handleView = (row) => {
    setSelectedOnboarding(row)
    setDetailModalOpen(true)
  }

  const handleEdit = (row) => {
    setSelectedOnboarding(row)
    setCreateFormOpen(true)
  }

  const promptDelete = (row) => {
    setSelectedOnboarding(row)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedOnboarding) return
    try {
      await api.delete(`/onboarding/${selectedOnboarding._id}`)
      onNotify(t('actions.deletedMsg', 'El onboarding ha sido eliminado correctamente.'), 'success')
      refreshOnboarding()
    } catch (error) {
      onNotify(t('actions.deleteErrorMsg', 'No se pudo eliminar el onboarding.'), 'error')
    } finally {
      setDeleteDialogOpen(false)
      setSelectedOnboarding(null)
    }
  }

  const handleFormSuccess = () => {
    setCreateFormOpen(false)
    setSelectedOnboarding(null)
    refreshOnboarding()
    onNotify(t('onboarding.saveSuccess', 'Onboarding guardado correctamente.'), 'success')
  }

  // Columnas
  const columns = useOnboardingColumns({ 
    t, 
    propertiesMap, 
    onView: handleView, 
    onEdit: handleEdit, 
    onDelete: promptDelete 
  })

  const isLoading = onboardingLoading || resolvingProperties

  return (
    <Box>
      {/* UI DE FILTROS */}
      <Box sx={{ mb: 3, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.project', 'Proyecto')}</InputLabel>
              <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project', 'Proyecto')}>
                <MenuItem value="">{t('filters.all', 'Todos')}</MenuItem>
                {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={!filters.projectId}>
              <InputLabel>{t('filters.client', 'Cliente')}</InputLabel>
              <Select value={filters.clientId} onChange={(e) => handleFilterChange('clientId', e.target.value)} label={t('filters.client', 'Cliente')}>
                <MenuItem value="">{t('filters.all', 'Todos')}</MenuItem>
                {filteredResidents.map(client => <MenuItem key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.status', 'Estado')}</InputLabel>
              <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label={t('filters.status', 'Estado')}>
                <MenuItem value="">{t('filters.all', 'Todos')}</MenuItem>
                {['not_started', 'in_progress', 'completed'].map(s => (
                  <MenuItem key={s} value={s}>{t(`onboarding.statuses.${s}`, s)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ height: 40 }}>
              {t('filters.clear', 'Limpiar')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* BOTÓN DE ACCIÓN */}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setSelectedOnboarding(null); setCreateFormOpen(true); }}>
          {t('onboarding.newOnboarding', 'Nuevo Onboarding')}
        </Button>
      </Box>

      {/* TABLA DE DATOS */}
      <DataTable columns={columns} data={onboardings || []} loading={isLoading} />

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      <OnboardingForm 
        open={createFormOpen} 
        onClose={() => { setCreateFormOpen(false); setSelectedOnboarding(null); }} 
        initialData={selectedOnboarding}
        onSuccess={handleFormSuccess} 
      />

      {/* MODAL DE DETALLES Y CHECKLIST */}
      <OnboardingDetailDialog 
        open={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedOnboarding(null); }}
        onboarding={selectedOnboarding}
        onRefresh={refreshOnboarding}
        onNotify={onNotify}
      />

      {/* DIÁLOGO DE ELIMINACIÓN */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />{t('actions.confirmDelete', '¿Estás seguro?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{t('actions.deleteWarning', 'Esta acción eliminará el onboarding de forma permanente.')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('actions.cancel', 'Cancelar')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">{t('actions.yesDelete', 'Sí, eliminar')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}