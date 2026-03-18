import { useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Container, Button, FormControl,
  InputLabel, Select, MenuItem, Tooltip
} from '@mui/material'
import { Add, SortByAlpha, FilterList, Home } from '@mui/icons-material'
import api from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'
import ConstructionPhasesModal from '../components/ConstructionPhasesModal'
import ContractsModal from '../components/ContractsModal'
import EditPropertyModal from '../components/property/EditPriceModal'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '../components/statscard'
// import DataTable from '../components/table/DataTable'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '../components/table/EmptyState'
import PropertyDetailsModal from '../components/myProperty/PropertyDetailsModal'
import propertyService from '../services/propertyService'
import useFetch from '../hooks/useFetch'
import usePropertyFilters from '../hooks/usePropertyFilters'
import usePropertyModals from '../hooks/usePropertyModals'
import { usePropertyColumns } from '../constants/Columns/properties'

const Properties = () => {
  const { t }        = useTranslation(['property', 'common'])
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const isAdmin      = user?.role === 'admin' || user?.role === 'superadmin'

  // ── Data fetching ─────────────────────────────────────────
  const { data: properties, loading, refetch } = useFetch(
    useCallback(() => api.get('/properties').then(r => r.data), [])
  )
  const { data: lotsArray }  = useFetch(useCallback(() => api.get('/lots').then(r => r.data), []))
  const { data: modelsArray } = useFetch(useCallback(() => api.get('/models').then(r => r.data), []))
  const { data: usersArray }  = useFetch(useCallback(() => api.get('/users').then(r => r.data), []))

  // ── Filters ───────────────────────────────────────────────
  const {
    modelFilter, setModelFilter,
    residentSortOrder, toggleResidentSort,
    modelOptions, processedData
  } = usePropertyFilters(properties)

  // ── Modals ────────────────────────────────────────────────
  const {
    phases, contracts, details,
    editModal, editValues, setEditValues,
    savingEdit, setSavingEdit,
    openEdit, closeEdit
  } = usePropertyModals()

  // Facades dependientes del modelo seleccionado en edición
  const { data: facades } = useFetch(
    useCallback(() => {
      if (!editValues.model) return Promise.resolve([])
      return propertyService.getFacades(editValues.model)
    }, [editValues.model])
  )

  // ── Handlers ──────────────────────────────────────────────
  const handleSaveEdit = useCallback(async () => {
    if (!editModal.property) return
    setSavingEdit(true)
    try {
      await api.put(`/properties/${editModal.property._id}`, editValues)
      closeEdit()
      refetch()
    } catch {
      alert(t('common:errors.updateFailed'))
    } finally {
      setSavingEdit(false)
    }
  }, [editModal.property, editValues, closeEdit, refetch, t])

  const handleDeleteProperty = useCallback(async (property) => {
    if (!window.confirm(t('property:actions.confirmDelete'))) return
    try {
      await propertyService.deleteProperty(property._id)
      refetch()
    } catch {
      alert(t('property:actions.deleteFailed'))
    }
  }, [refetch, t])

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   properties.length,
    sold:    properties.filter(p => p.status === 'sold').length,
    active:  properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length
  }), [properties])

  const propertiesStats = useMemo(() => [
    { title: t('property:stats.totalProperties'), value: stats.total,   icon: Home,         gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',   color: '#333F1F', delay: 0   },
    { title: t('property:stats.sold'),            value: stats.sold,    icon: Home,         gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',   color: '#8CA551', delay: 0.1 },
    { title: t('property:stats.active'),          value: stats.active,  icon: Home,         gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',   color: '#1976d2', delay: 0.2 },
    { title: t('property:stats.pending'),         value: stats.pending, icon: Home,         gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',   color: '#E5863C', delay: 0.3 },
  ], [stats, t])

  // ── Columns (extraídas a su propio archivo) ───────────────
  const columns = usePropertyColumns({
    isAdmin,
    t,
    onViewDetails:    details.openModal,
    onEdit:           openEdit,
    onDelete:         handleDeleteProperty,
    onOpenPhases:     phases.openModal,
    onOpenContracts:  contracts.openModal,
  })

  // ── Render ────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title={t('property:title')}
          subtitle={t('property:subtitle')}
          actionButton={{
            label:   t('property:actions.addProperty'),
            onClick: () => navigate('/properties/select'),
            icon:    <Add />,
            tooltip: t('property:actions.addProperty')
          }}
        />

        <StatsCards stats={propertiesStats} loading={loading} />

        {/* FILTERS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.85rem', '&.Mui-focused': { color: '#333F1F' } }}>
              {t('property:filters.filterByModel')}
            </InputLabel>
            <Select
              value={modelFilter}
              label={t('property:filters.filterByModel')}
              onChange={(e) => setModelFilter(e.target.value)}
              startAdornment={<FilterList sx={{ fontSize: 18, color: '#8CA551', mr: 0.5 }} />}
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.85rem',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(140, 165, 81, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8CA551' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#333F1F' }
              }}
            >
              <MenuItem value=""><em>{t('property:filters.allModels')}</em></MenuItem>
              {modelOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>

          <Tooltip
            title={
              residentSortOrder === 'none' ? t('property:filters.sortResidentAZ')
              : residentSortOrder === 'asc' ? t('property:filters.sortResidentZA')
              : t('property:filters.removeResidentSort')
            }
          >
            <Button
              variant={residentSortOrder !== 'none' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<SortByAlpha />}
              onClick={toggleResidentSort}
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                height: 40,
                ...(residentSortOrder !== 'none'
                  ? { bgcolor: '#333F1F', color: 'white', '&:hover': { bgcolor: '#4a5d3a' } }
                  : { color: '#333F1F', borderColor: 'rgba(140, 165, 81, 0.3)', '&:hover': { borderColor: '#333F1F', bgcolor: 'rgba(51, 63, 31, 0.04)' } }
                )
              }}
            >
              {t('property:filters.resident')} {residentSortOrder === 'asc' ? 'A → Z' : residentSortOrder === 'desc' ? 'Z → A' : 'A-Z'}
            </Button>
          </Tooltip>
        </Box>

        <DataTable
          columns={columns}
          data={processedData}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Home}
              title={t('property:empty.title')}
              description={t('property:empty.description')}
              actionLabel={t('property:empty.action')}
              onAction={() => navigate('/properties/select')}
            />
          }
          stickyHeader
          maxHeight={600}
        />

        {/* MODALS */}
        <PropertyDetailsModal
          open={details.open}
          onClose={() => { details.closeModal(); refetch() }}
          property={details.data}
          isAdmin={isAdmin}
        />

        <ConstructionPhasesModal
          open={phases.open}
          property={phases.data}
          onClose={() => { phases.closeModal(); refetch() }}
          isAdmin={isAdmin}
        />

        <ContractsModal
          open={contracts.open}
          onClose={contracts.closeModal}
          property={contracts.data}
        />

        <EditPropertyModal
          open={editModal.open}
          onClose={closeEdit}
          property={editModal.property}
          values={editValues}
          onChange={setEditValues}
          onSave={handleSaveEdit}
          saving={savingEdit}
          lots={lotsArray}
          models={modelsArray}
          facades={facades}
          users={usersArray}
        />
      </Container>
    </Box>
  )
}

export default Properties