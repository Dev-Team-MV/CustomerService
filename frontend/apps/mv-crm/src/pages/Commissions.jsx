import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, InputAdornment,TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, Paper, Tabs, Tab, Typography, CircularProgress } from '@mui/material'
import { Search, FilterList, TrendingUp, Payment, AccountBalanceWallet, EmojiEvents, Settings, Add, Edit } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import DataTable from '@shared/components/table/DataTable'
import { useCommissions } from '../constants/hooks/useCommissions'
import { useCommissionColumns } from '../constants/Columns/commissions'
import CommissionDetailModal from '../components/comissions/CommissionDetailModal'
import CommissionStructureEditor from '../components/comissions/CommissionStructureEditor'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'
import commissionService from '../services/commissionService'

// ✅ IMPORTS DEL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getCommissionTourSteps, commissionTourConfig } from '../tours/modules/commissionTour'
import { getCommissionStructureTourSteps, commissionStructureTourConfig } from '../tours/features/commissionStructureTour'
import { getCommissionDetailTourSteps, commissionDetailTourConfig } from '../tours/features/commissionDetailTour'

export default function Commissions() {
  const { t } = useTranslation('commissions')
  const { t: tCommon } = useTranslation('common')
  const { projects } = useProjects()
  const { agents } = useCrmAgents()
  
  const { commissions, loading, pagination, filters, updateFilter, refresh, stats } = useCommissions()
  
  const [selectedCommission, setSelectedCommission] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('view')
  
  const [tabValue, setTabValue] = useState(0)
  const [structures, setStructures] = useState([])
  const [structureLoading, setStructureLoading] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState(null)
  const [structureEditorOpen, setStructureEditorOpen] = useState(false)
  
  // ✅ ESTADOS DEL TOUR
  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getCommissionTourSteps(tCommon)
  const structureSteps = getCommissionStructureTourSteps(tCommon)
  const detailSteps = getCommissionDetailTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  // ✅ REANUDACIÓN DESDE SUBTOUR DE DETALLES
  useEffect(() => {
    const handleResume = () => {
      resumeTour(14, tourSteps, tourOptionsRef.current) // Reanuda en la pestaña de estructuras
    }
    window.addEventListener('tour-resume-commission-detail', handleResume)
    return () => window.removeEventListener('tour-resume-commission-detail', handleResume)
  }, [resumeTour, tourSteps])

  // ✅ REANUDACIÓN DESDE SUBTOUR DE ESTRUCTURAS
  useEffect(() => {
    const handleResume = () => {
      resumeTour(22, tourSteps, tourOptionsRef.current) // Reanuda en el paso final
    }
    window.addEventListener('tour-resume-structure-editor', handleResume)
    return () => window.removeEventListener('tour-resume-structure-editor', handleResume)
  }, [resumeTour, tourSteps])

  const columns = useCommissionColumns({
    t,
    onView: (row) => { setSelectedCommission(row); setModalAction('view'); setModalOpen(true) },
    onApprove: (row) => { setSelectedCommission(row); setModalAction('approve'); setModalOpen(true) },
    onDelete: async (row) => {
      if (window.confirm(t('actions.confirmDelete', '¿Estás seguro de que deseas eliminar esta comisión?'))) {
        try {
          await commissionService.deleteCommission(row._id)
          refresh(pagination.page)
        } catch (err) { console.error('Error deleting commission:', err) }
      }
    },
    onMarkPaid: (row) => { setSelectedCommission(row); setModalAction('markPaid'); setModalOpen(true) }
  })

  const realStats = [
    { label: t('stats.totalPending'), value: `$${stats.totalPending.toLocaleString()}`, icon: <AccountBalanceWallet sx={{ color: '#ff9800' }} /> },
    { label: t('stats.paidThisMonth'), value: `$${stats.paidThisMonth.toLocaleString()}`, icon: <Payment sx={{ color: '#4caf50' }} /> },
    { label: t('stats.avgRate'), value: `${stats.avgRate}%`, icon: <TrendingUp sx={{ color: '#2196f3' }} /> },
    { label: t('stats.topEarner'), value: stats.topEarnerName !== 'N/A' ? `${stats.topEarnerName} ($${stats.topEarnerAmount.toLocaleString()})` : 'N/A', icon: <EmojiEvents sx={{ color: '#ff9800' }} /> }
  ]

  const loadStructures = async () => {
    if (!filters.projectId) { setStructures([]); return }
    setStructureLoading(true)
    try {
      const data = await commissionService.getStructures({ projectId: filters.projectId })
      setStructures(data.structures || [])
    } catch (err) { setStructures([]) }
    finally { setStructureLoading(false) }
  }

  useEffect(() => {
    if (tabValue === 1 && filters.projectId) loadStructures()
  }, [tabValue, filters.projectId])

  const handleTabChange = (e, newValue) => setTabValue(newValue)

  const handleProjectChange = (e) => {
    const projectId = e.target.value
    updateFilter('projectId', projectId)
    if (tabValue === 1 && projectId) setTimeout(() => loadStructures(), 100)
  }

  const handleOpenStructureEditor = (structure = null) => {
    setSelectedStructure(structure)
    setStructureEditorOpen(true)
  }

  const handleOpenStructureForTour = () => {
    if (!filters.projectId && projects.length > 0) {
      updateFilter('projectId', projects[0]._id)
      setTimeout(() => {
        setSelectedStructure(null)
        setIsTourMode(true)
        setStructureEditorOpen(true)
      }, 100)
    } else {
      setSelectedStructure(null)
      setIsTourMode(true)
      setStructureEditorOpen(true)
    }
  }

  const unifiedButtonSx = {
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
  }

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR (SINCRONIZADA)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next Click - Índice actual:', currentIndex)
    
    // 13: Abrir modal de detalles de comisión
    if (currentIndex === 13) {
      const viewBtn = document.querySelector('button[aria-label="Ver"], button[title="Ver"]') || 
                      document.querySelector('.MuiIconButton-root:has(svg[data-testid="VisibilityIcon"])')
      if (viewBtn) {
        viewBtn.click()
        pauseTour()
        setTimeout(() => {
          startTour(commissionDetailTourConfig.id, detailSteps, {
            onNextClick: (driver) => driver.moveNext(),
            onCloseClick: () => {
              setModalOpen(false); setSelectedCommission(null)
              window.dispatchEvent(new CustomEvent('tour-resume-commission-detail'))
            },
            onDestroyStarted: () => {
              setModalOpen(false); setSelectedCommission(null)
              window.dispatchEvent(new CustomEvent('tour-resume-commission-detail'))
            }
          })
        }, 400)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // 14: Hacer clic en la pestaña de Estructuras
    if (currentIndex === 14) {
      const structuresTab = document.getElementById('commissions-tab-structures')
      if (structuresTab) {
        structuresTab.click()
        setTimeout(() => driverObj.moveNext(), 500)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // 15: Seleccionar automáticamente el primer proyecto
    if (currentIndex === 15) {
      if (!filters.projectId && projects.length > 0) {
        updateFilter('projectId', projects[0]._id)
        setTimeout(() => driverObj.moveNext(), 800) // Espera a que cargue la tabla
      } else {
        driverObj.moveNext()
      }
      return
    }

    // 21: Abrir modal de creación de estructura
    if (currentIndex === 21) {
      handleOpenStructureForTour()
      pauseTour()
      setTimeout(() => {
        startTour(commissionStructureTourConfig.id, structureSteps, {
          onNextClick: (driver) => driver.moveNext(),
          onCloseClick: () => {
            setIsTourMode(false); setStructureEditorOpen(false)
            window.dispatchEvent(new CustomEvent('tour-resume-structure-editor'))
          },
          onDestroyStarted: () => {
            setIsTourMode(false); setStructureEditorOpen(false)
            window.dispatchEvent(new CustomEvent('tour-resume-structure-editor'))
          }
        })
      }, 400)
      return
    }
    
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious()
  }
  tourOptionsRef.current = tourOptions

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      <Box id="commissions-page-container">
        <StatsStrip stats={realStats} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
          <Paper sx={{ mb: 3, border: '1px solid #ececec', borderRadius: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pb: 0 }}>
              <TourButton 
                tourId={commissionTourConfig.id}
                steps={tourSteps}
                label={tCommon('tour.commissions.button', 'Ver guía de comisiones')}
                options={tourOptions}
              />
            </Box>

            <Tabs 
              id="commissions-tabs"
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ borderBottom: '1px solid #ececec', px: 2, '& .MuiTab-root': { fontFamily: '"Courier New", monospace', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, minHeight: 48 } }}
            >
              <Tab id="commissions-tab-commissions" icon={<Payment sx={{ mr: 1 }} />} iconPosition="start" label={t('tabs.commissions')} />
              <Tab id="commissions-tab-structures" icon={<Settings sx={{ mr: 1 }} />} iconPosition="start" label={t('tabs.structures')} />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 ? (
                <>
                  <Grid id="commissions-filters" container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <TextField 
                      size="small" 
                      fullWidth 
                      placeholder={t('filters.search')} 
                        slotProps={{
    input: {
      sx: {
        fontFamily: '"Courier New", monospace', // texto escrito
        '&::placeholder': {
          fontFamily: '"Courier New", monospace',
          opacity: 1,
        },
      },
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ fontSize: 18, color: '#bbb' }} />
        </InputAdornment>
      ),
    },
  }} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl id="commissions-filter-project" size="small" fullWidth>
                        <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('filters.project')}</InputLabel>
                        <Select value={filters.projectId || ''} onChange={(e) => updateFilter('projectId', e.target.value)} label={t('filters.project')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}>
                          <MenuItem value="">{t('filters.allProjects')}</MenuItem>
                          {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl id="commissions-filter-agent" size="small" fullWidth>
                        <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('filters.agent')}</InputLabel>
                        <Select value={filters.agentId || ''} onChange={(e) => updateFilter('agentId', e.target.value)} label={t('filters.agent')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}>
                          <MenuItem value="">{t('filters.allAgents')}</MenuItem>
                          {agents.map(a => <MenuItem key={a._id} value={a._id}>{a.firstName} {a.lastName}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl id="commissions-filter-status" size="small" fullWidth>
                        <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('filters.status')}</InputLabel>
                        <Select value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value)} label={t('filters.status')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}>
                          <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
                          <MenuItem value="pending">{t('status.pending')}</MenuItem>
                          <MenuItem value="approved">{t('status.approved')}</MenuItem>
                          <MenuItem value="paid">{t('status.paid')}</MenuItem>
                          <MenuItem value="disputed">{t('status.disputed')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                      <Button variant="outlined" startIcon={<FilterList />} onClick={() => refresh(1)} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
                        {t('actions.refresh')}
                      </Button>
                    </Grid>
                  </Grid>

                  <DataTable id="commissions-data-table" columns={columns} data={commissions} loading={loading} rowKey="_id" emptyMessage={t('empty')} />
                </>
              ) : (
                <>
                  <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4} id="structures-filter-project">
                      <FormControl fullWidth required>
                        <InputLabel  sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>{t('filters.project')} *</InputLabel>
                        <Select value={filters.projectId || ''} onChange={handleProjectChange} label={t('filters.project')} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 }}>
                          <MenuItem value=""><em>{t('structures.selectProject')}</em></MenuItem>
                          {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                        {filters.projectId ? `${t('structures.viewingFor')}: ${projects.find(p => p._id === filters.projectId)?.name}` : t('structures.selectToView')}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{t('structures.listTitle')}</Typography>
                      <Button id="commissions-create-structure-btn" variant="contained" startIcon={<Add />} onClick={() => handleOpenStructureEditor()} disabled={!filters.projectId} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
                        {t('structures.create')}
                      </Button>
                    </Box>

                    {!filters.projectId ? (
                      <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 0 }}>
                        <Settings sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" mb={1} fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{t('structures.selectProjectFirst')}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.selectProjectToManage')}</Typography>
                      </Paper>
                    ) : structureLoading ? (
                      <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
                    ) : structures.length === 0 ? (
                      <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 0 }}>
                        <Typography variant="h6" color="text.secondary" mb={1} fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{t('structures.noStructures')}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontFamily: '"Courier New", monospace' }}>{t('structures.createFirst')}</Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenStructureEditor()} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
                          {t('structures.create')}
                        </Button>
                      </Paper>
                    ) : (
                      <DataTable 
                        id="structures-data-table"
                        columns={[
                          { field: 'name', headerName: t('structures.name'), minWidth: 250, tourId: 'structures-col-name', renderCell: ({row}) => <Typography fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{row.name}</Typography> },
                          { field: 'type', headerName: t('structures.type'), minWidth: 150, tourId: 'structures-col-type', renderCell: ({row}) => <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>{t(`structures.types.${row.type}`)}</Typography> },
                          { field: 'isDefault', headerName: t('structures.isDefault'), minWidth: 120, tourId: 'structures-col-default', renderCell: ({row}) => row.isDefault ? <Typography sx={{ color: '#4caf50', fontWeight: 600, fontFamily: '"Courier New", monospace' }}>✓ {t('structures.yes')}</Typography> : <Typography color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>-</Typography> },
                          { field: 'actions', headerName: t('table.actions'), minWidth: 120, align: 'center', tourId: 'structures-col-actions', renderCell: ({row}) => <Button size="small" variant="outlined" startIcon={<Edit fontSize="small" />} onClick={() => handleOpenStructureEditor(row)} sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>{t('actions.edit')}</Button> }
                        ]}
                        data={structures}
                        loading={structureLoading}
                        rowKey="_id"
                        emptyMessage={t('structures.empty')}
                      />
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </motion.div>

        <Box id="commissions-finish" sx={{ height: 1 }} />

        <CommissionDetailModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedCommission(null) }}
          commission={selectedCommission}
          onRefresh={() => refresh(pagination.page)}
          actionType={modalAction}
        />

        <CommissionStructureEditor
          open={structureEditorOpen}
          isTourMode={isTourMode}
          onClose={() => { setStructureEditorOpen(false); setSelectedStructure(null); setIsTourMode(false); }}
          structure={selectedStructure}
          projectId={filters.projectId}
          onRefresh={loadStructures}
        />
      </Box>
    </PageLayout>
  )
}