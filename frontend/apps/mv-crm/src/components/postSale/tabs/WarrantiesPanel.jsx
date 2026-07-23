import { useState, useMemo } from 'react'
import { Box, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { Add, Close, Warning as WarningIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import DataTable from '@shared/components/table/DataTable'
import { useWarranties } from '../../../../../../shared/hooks/useWarranties'
import { useResolvedProperties } from '../../../constants/hooks/useResolvedProperties'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useWarrantyColumns } from '../../../constants/Columns/warrantyColumns'
import warrantyService from '../../../../../../shared/services/warrantyService'

import WarrantyClaimForm from '../WarrantyClaimForm'
import WarrantyDetailDialog from '../WarrantyDetailDialog'

export default function WarrantiesPanel({ onNotify }) {
  const { t } = useTranslation('postSale') // ✅ Cambiado a 'warranties'
  const { projects } = useProjects()
  const { users: residents } = useResidents(null)

  const [filters, setFilters] = useState({ projectId: '', clientId: '', status: '', category: '', priority: '' })
  
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState(null)
  
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [resolving, setResolving] = useState(false)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const { data: warranties, loading: warrantiesLoading, refresh: refreshWarranties } = useWarranties(filters)
  const { propertiesMap, loading: resolvingProperties } = useResolvedProperties(warranties)

  const filteredResidents = useMemo(() => residents.filter(r => r.role === 'user'), [residents])

  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }))
  const clearFilters = () => setFilters({ projectId: '', clientId: '', status: '', category: '', priority: '' })

  const handleView = (row) => { setSelectedWarranty(row); setDetailModalOpen(true) }
  const handleEdit = (row) => { setEditingWarranty(row); setClaimModalOpen(true) }

  const handleResolve = async (id, payload) => {
    setResolving(true)
    try {
      await warrantyService.resolve(id, payload)
      onNotify(t('warranty.resolveSuccessMsg'), 'success')
      setDetailModalOpen(false); setSelectedWarranty(null); refreshWarranties()
    } catch (error) {
      onNotify(t('warranty.resolveErrorMsg'), 'error')
    } finally { setResolving(false) }
  }

  const promptDelete = (row) => { setItemToDelete(row); setDeleteDialogOpen(true) }
  
  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await warrantyService.delete(itemToDelete._id)
      onNotify(t('actions.confirmDelete'), 'success') // Reutilizando clave genérica o crear una específica
      refreshWarranties()
    } catch (error) {
      onNotify(t('actions.deleteWarning'), 'error')
    } finally { setDeleteDialogOpen(false); setItemToDelete(null) }
  }

  const handleClaimSuccess = () => {
    setClaimModalOpen(false)
    setEditingWarranty(null)
    refreshWarranties()
    onNotify(t('warranty.saveSuccess'), 'success')
  }

  const columns = useWarrantyColumns({ 
    t, propertiesMap, onView: handleView, onEdit: handleEdit, onResolve: handleView, onDelete: promptDelete  
  })

  const isLoading = warrantiesLoading || resolvingProperties

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.project')}</InputLabel>
              <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project')}>
                <MenuItem value="">{t('select')}</MenuItem>
                {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.client')}</InputLabel>
              <Select value={filters.clientId} onChange={(e) => handleFilterChange('clientId', e.target.value)} label={t('filters.client')}>
                <MenuItem value="">{t('select')}</MenuItem>
                {filteredResidents.map(client => <MenuItem key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('warranty.statuses.submitted').split(' ')[0]}</InputLabel> {/* Hack simple para "Estado" o agrega "status" al JSON */}
              <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label="Estado">
                <MenuItem value="">{t('form.select')}</MenuItem>
                {['submitted', 'under_review', 'approved', 'in_progress', 'resolved', 'rejected'].map(s => (
                  <MenuItem key={s} value={s}>{t(`warranty.statuses.${s}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.category')}</InputLabel>
              <Select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} label={t('category')}>
                <MenuItem value="">{t('form.select')}</MenuItem>
                {['structural', 'plumbing', 'electrical', 'finish', 'appliance', 'landscaping', 'other'].map(c => (
                  <MenuItem key={c} value={c}>{t(`warranty.categories.${c}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('warranty.priority')}</InputLabel>
              <Select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} label={t('priority')}>
                <MenuItem value="">{t('form.select')}</MenuItem>
                {['low', 'medium', 'high', 'emergency'].map(p => (
                  <MenuItem key={p} value={p}>{t(`warranty.priorities.${p}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ height: 40 }}>
              {t('form.cancel')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingWarranty(null); setClaimModalOpen(true); }}>
          {t('warranty.newClaim')}
        </Button>
      </Box>

      <DataTable columns={columns} data={warranties || []} loading={isLoading} />

      <WarrantyClaimForm 
        open={claimModalOpen}
        onClose={() => { setClaimModalOpen(false); setEditingWarranty(null); }}
        initialData={editingWarranty}
        onSuccess={handleClaimSuccess}
      />

      <WarrantyDetailDialog 
        open={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedWarranty(null); }}
        warranty={selectedWarranty}
        onResolve={handleResolve}
        resolving={resolving}
        propertiesMap={propertiesMap}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />{t('actions.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{t('actions.deleteWarning')}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('form.cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">{t('actions.yesDelete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}