// apps/mv-crm/src/pages/Commissions.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, Paper, Tabs, Tab, Typography, CircularProgress } from '@mui/material'
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

export default function Commissions() {
  const { t } = useTranslation('commissions')
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

  const columns = useCommissionColumns({
    t,
    onView: (row) => { setSelectedCommission(row); setModalAction('view'); setModalOpen(true) },
    onApprove: (row) => { setSelectedCommission(row); setModalAction('approve'); setModalOpen(true) },
    onDispute: (row) => { setSelectedCommission(row); setModalAction('dispute'); setModalOpen(true) },
    onMarkPaid: (row) => { setSelectedCommission(row); setModalAction('markPaid'); setModalOpen(true) }
  })

  const realStats = [
    { label: t('stats.totalPending'), value: `$${stats.totalPending.toLocaleString()}`, icon: <AccountBalanceWallet sx={{ color: '#ff9800' }} /> },
    { label: t('stats.paidThisMonth'), value: `$${stats.paidThisMonth.toLocaleString()}`, icon: <Payment sx={{ color: '#4caf50' }} /> },
    { label: t('stats.avgRate'), value: `${stats.avgRate}%`, icon: <TrendingUp sx={{ color: '#2196f3' }} /> },
    { label: t('stats.topEarner'), value: stats.topEarnerName !== 'N/A' ? `${stats.topEarnerName} ($${stats.topEarnerAmount.toLocaleString()})` : 'N/A', icon: <EmojiEvents sx={{ color: '#ff9800' }} /> }
  ]

  const loadStructures = async () => {
    if (!filters.projectId) {
      setStructures([])
      return
    }
    setStructureLoading(true)
    try {
      const data = await commissionService.getStructures({ projectId: filters.projectId })
      setStructures(data.structures || [])
    } catch (err) {
      console.error('Error loading structures:', err)
      setStructures([])
    } finally {
      setStructureLoading(false)
    }
  }

  useEffect(() => {
    if (tabValue === 1 && filters.projectId) {
      loadStructures()
    }
  }, [tabValue, filters.projectId])

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue)
  }

  const handleProjectChange = (e) => {
    const projectId = e.target.value
    updateFilter('projectId', projectId)
    if (tabValue === 1 && projectId) {
      setTimeout(() => loadStructures(), 100)
    }
  }

  const handleOpenStructureEditor = (structure = null) => {
    setSelectedStructure(structure)
    setStructureEditorOpen(true)
  }

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('subtitle')}>
      <StatsStrip stats={realStats} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
        <Paper sx={{ mb: 3, border: '1px solid #ececec', borderRadius: 2, overflow: 'hidden' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid #ececec', px: 2 }}>
            <Tab icon={<Payment sx={{ mr: 1 }} />} iconPosition="start" label={t('tabs.commissions')} />
            <Tab icon={<Settings sx={{ mr: 1 }} />} iconPosition="start" label={t('tabs.structures')} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 ? (
              <>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <TextField size="small" fullWidth placeholder={t('filters.search')} InputProps={{ startAdornment: <Search sx={{ fontSize: 18, color: '#bbb', mr: 1 }} /> }} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>{t('filters.project')}</InputLabel>
                      <Select value={filters.projectId || ''} onChange={(e) => updateFilter('projectId', e.target.value)} label={t('filters.project')}>
                        <MenuItem value="">{t('filters.allProjects')}</MenuItem>
                        {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>{t('filters.agent')}</InputLabel>
                      <Select value={filters.agentId || ''} onChange={(e) => updateFilter('agentId', e.target.value)} label={t('filters.agent')}>
                        <MenuItem value="">{t('filters.allAgents')}</MenuItem>
                        {agents.map(a => <MenuItem key={a._id} value={a._id}>{a.firstName} {a.lastName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>{t('filters.status')}</InputLabel>
                      <Select value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value)} label={t('filters.status')}>
                        <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
                        <MenuItem value="pending">{t('status.pending')}</MenuItem>
                        <MenuItem value="approved">{t('status.approved')}</MenuItem>
                        <MenuItem value="paid">{t('status.paid')}</MenuItem>
                        <MenuItem value="disputed">{t('status.disputed')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                    <Button variant="outlined" startIcon={<FilterList />} onClick={() => refresh(1)}>{t('actions.refresh')}</Button>
                  </Grid>
                </Grid>

                <DataTable columns={columns} data={commissions} loading={loading} rowKey="_id" emptyMessage={t('empty')} />
              </>
            ) : (
              <>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth required>
                      <InputLabel>{t('filters.project')} *</InputLabel>
                      <Select 
                        value={filters.projectId || ''} 
                        onChange={handleProjectChange} 
                        label={t('filters.project')}
                      >
                        <MenuItem value="">
                          <em>{t('structures.selectProject')}</em>
                        </MenuItem>
                        {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" color="text.secondary">
                      {filters.projectId 
                        ? `${t('structures.viewingFor')}: ${projects.find(p => p._id === filters.projectId)?.name}`
                        : t('structures.selectToView')}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {t('structures.listTitle')}
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />} 
                      onClick={() => handleOpenStructureEditor()} 
                      disabled={!filters.projectId}
                      sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                    >
                      {t('structures.create')}
                    </Button>
                  </Box>

                  {!filters.projectId ? (
                    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#fafafa', border: '2px dashed #e0e0e0' }}>
                      <Settings sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" mb={1} fontWeight={600}>
                        {t('structures.selectProjectFirst')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('structures.selectProjectToManage')}
                      </Typography>
                    </Paper>
                  ) : structureLoading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                      <CircularProgress />
                    </Box>
                  ) : structures.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f5f5f5', border: '2px dashed #e0e0e0' }}>
                      <Typography variant="h6" color="text.secondary" mb={1} fontWeight={600}>
                        {t('structures.noStructures')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        {t('structures.createFirst')}
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={() => handleOpenStructureEditor()}
                        sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                      >
                        {t('structures.create')}
                      </Button>
                    </Paper>
                  ) : (
                    <DataTable 
                      columns={[
                        { 
                          field: 'name', 
                          headerName: t('structures.name'), 
                          minWidth: 250, 
                          renderCell: ({row}) => <Typography fontWeight={600}>{row.name}</Typography> 
                        },
                        { 
                          field: 'type', 
                          headerName: t('structures.type'), 
                          minWidth: 150, 
                          renderCell: ({row}) => (
                            <Typography>{t(`structures.types.${row.type}`)}</Typography>
                          ) 
                        },
                        { 
                          field: 'isDefault', 
                          headerName: t('structures.isDefault'), 
                          minWidth: 120, 
                          renderCell: ({row}) => row.isDefault ? (
                            <Typography sx={{ color: '#4caf50', fontWeight: 600 }}>✓ {t('structures.yes')}</Typography>
                          ) : (
                            <Typography color="text.secondary">-</Typography>
                          ) 
                        },
                        { 
                          field: 'actions', 
                          headerName: t('table.actions'), 
                          minWidth: 120, 
                          align: 'center', 
                          renderCell: ({row}) => (
                            <Button 
                              size="small" 
                              variant="outlined"
                              startIcon={<Edit fontSize="small" />}
                              onClick={() => handleOpenStructureEditor(row)}
                              sx={{ textTransform: 'none' }}
                            >
                              {t('actions.edit')}
                            </Button>
                          ) 
                        }
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

      <CommissionDetailModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCommission(null) }}
        commission={selectedCommission}
        onRefresh={() => refresh(pagination.page)}
        actionType={modalAction}
      />

      <CommissionStructureEditor
        open={structureEditorOpen}
        onClose={() => { setStructureEditorOpen(false); setSelectedStructure(null) }}
        structure={selectedStructure}
        projectId={filters.projectId}
        onRefresh={loadStructures}
      />
    </PageLayout>
  )
}