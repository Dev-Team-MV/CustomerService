import { useState, useMemo } from 'react'
import { Box, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography } from '@mui/material'
import { Add, Close, Warning as WarningIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import DataTable from '@shared/components/table/DataTable'
import { useWarranties } from '@shared/hooks/useWarranties'
import { useResolvedProperties } from '../../../constants/hooks/useResolvedProperties'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'
import { useWarrantyColumns } from '../../../constants/Columns/warrantyColumns'
import warrantyService from '@shared/services/warrantyService'

import WarrantyClaimForm from '../WarrantyClaimForm'
import WarrantyDetailDialog from '../WarrantyDetailDialog'

import { useTour } from '@shared/tours/useTour'
import { getWarrantyDetailTourSteps, warrantyDetailTourConfig } from '../../../tours/features/warrantyDetailTour'

export default function WarrantiesPanel({ onNotify, isTourMode = false }) {
  // ✅ 1. Extraemos 'ready' e 'i18n'
  const { t, i18n, ready } = useTranslation('postSale')
  
  // ✅ 2. Si las traducciones no están listas, no renderizamos nada (evita el parpadeo en inglés)
  if (!ready) return null

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

  const handleViewBase = (row) => { setSelectedWarranty(row); setDetailModalOpen(true) }
  const handleEditBase = (row) => { setEditingWarranty(row); setClaimModalOpen(true) }
  const promptDeleteBase = (row) => { setItemToDelete(row); setDeleteDialogOpen(true) }

  const { startTour, pauseTour } = useTour()
  
  // ✅ 3. Memoizamos los pasos del tour dependiendo del idioma actual
  const detailSteps = useMemo(() => getWarrantyDetailTourSteps(t), [t, i18n.language])

  const handleViewForTour = (row) => {
    setSelectedWarranty(row)
    setDetailModalOpen(true)
    pauseTour()
    setTimeout(() => {
      startTour(warrantyDetailTourConfig.id, detailSteps, {
        onNextClick: (driver) => {
          // ✅ Si es el último paso, cerramos el modal y reanudamos
          if (driver.getActiveIndex() === detailSteps.length - 1) {
            setDetailModalOpen(false)
            setSelectedWarranty(null)
            window.dispatchEvent(new CustomEvent('tour-resume-warranty-detail'))
          }
          driver.moveNext()
        },
        onCloseClick: () => {
          setDetailModalOpen(false)
          setSelectedWarranty(null)
          window.dispatchEvent(new CustomEvent('tour-resume-warranty-detail'))
        },
        onDestroyStarted: () => {
          setDetailModalOpen(false)
          setSelectedWarranty(null)
          window.dispatchEvent(new CustomEvent('tour-resume-warranty-detail'))
        }
      })
    }, 800)
  }

  const onView = isTourMode ? handleViewForTour : handleViewBase
  const onEdit = handleEditBase
  const onDelete = promptDeleteBase
  const onResolve = onView

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

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await warrantyService.delete(itemToDelete._id)
      onNotify(t('actions.deletedMsg'), 'success')
      refreshWarranties()
    } catch (error) {
      onNotify(t('actions.deleteErrorMsg'), 'error')
    } finally { setDeleteDialogOpen(false); setItemToDelete(null) }
  }

  const handleClaimSuccess = () => {
    setClaimModalOpen(false)
    setEditingWarranty(null)
    refreshWarranties()
    onNotify(t('warranty.saveSuccess'), 'success')
  }

  const columns = useWarrantyColumns({ t, propertiesMap, onView, onEdit, onResolve, onDelete })
  const isLoading = warrantiesLoading || resolvingProperties

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Box>
      <Box id="warranties-filters" sx={{ mb: 3, p: 2.5, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.project')}</InputLabel>
              <Select value={filters.projectId} onChange={(e) => handleFilterChange('projectId', e.target.value)} label={t('filters.project')} sx={inputSx}>
                <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('filters.all')}</MenuItem>
                {projects.map(p => <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.client')}</InputLabel>
              <Select value={filters.clientId} onChange={(e) => handleFilterChange('clientId', e.target.value)} label={t('filters.client')} sx={inputSx}>
                <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                {filteredResidents.map(client => <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={client._id} value={client._id}>{client.firstName} {client.lastName}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.status')}</InputLabel>
              <Select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} label={t('filters.status')} sx={inputSx}>
                <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                {['submitted', 'under_review', 'approved', 'in_progress', 'resolved', 'rejected'].map(s => (
                  <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={s} value={s}>{t(`warranty.statuses.${s}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.category')}</InputLabel>
              <Select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} label={t('filters.category')} sx={inputSx}>
                <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                {['structural', 'plumbing', 'electrical', 'finish', 'appliance', 'landscaping', 'other'].map(c => (
                  <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} key={c} value={c}>{t(`warranty.categories.${c}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{fontFamily: '"Courier New", monospace'}}>{t('filters.priority')}</InputLabel>
              <Select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} label={t('filters.priority')} sx={inputSx}>
                <MenuItem sx={{ fontFamily: '"Courier New", monospace' }} value="">{t('filters.all')}</MenuItem>
                {['low', 'medium', 'high', 'emergency'].map(p => (
                  <MenuItem key={p} sx={{ fontFamily: '"Courier New", monospace' }} value={p}>{t(`warranty.priorities.${p}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button variant="outlined" fullWidth startIcon={<Close />} onClick={clearFilters} sx={{ ...unifiedButtonSx, height: 40, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              {t('filters.clear')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button id="warranties-create-btn" variant="contained" startIcon={<Add />} onClick={() => { setEditingWarranty(null); setClaimModalOpen(true); }} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
          {t('warranty.createNew')}
        </Button>
      </Box>

      <Box id="warranties-data-table">
        <DataTable columns={columns} data={warranties || []} loading={isLoading} />
      </Box>

      <WarrantyClaimForm open={claimModalOpen} onClose={() => { setClaimModalOpen(false); setEditingWarranty(null); }} initialData={editingWarranty} onSuccess={handleClaimSuccess} isTourMode={isTourMode} />
      <WarrantyDetailDialog open={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedWarranty(null); }} warranty={selectedWarranty} onResolve={handleResolve} resolving={resolving} propertiesMap={propertiesMap} />

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