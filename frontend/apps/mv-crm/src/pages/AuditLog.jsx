import { useState, useEffect, useMemo } from 'react'
import {
  Box, Typography, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Chip, Alert, Pagination
} from '@mui/material'
import { History, Refresh, FilterList, CalendarToday, Search, Clear, Lock } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import auditService, { AUDIT_ENTITIES, AUDIT_ACTIONS } from '../services/auditService'
import { useAuditLogColumns, ACTION_CONFIG, AuditLogDetailDrawer } from '../constants/Columns/AuditLogColumns'
import { useAuth } from '@shared/context/AuthContext'
import { useProjects } from '@shared/hooks/useProjects'
import { useResidents } from '@shared/hooks/useResidents'

const AuditLog = () => {
  const { t } = useTranslation('audit') 
  const { user } = useAuth()
  
  const { projects, loading: loadingProjects } = useProjects()
  const { users: allUsers, loading: loadingUsers } = useResidents(null)
  
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({ entity: '', entityId: '', userId: '', action: '', dateFrom: '', dateTo: '' })
  const [selectedLog, setSelectedLog] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  const isSuperAdmin = user?.role === 'superadmin'
  
  const fetchLogs = async (page = 1) => {
    if (!isSuperAdmin) {
      setError(t('accessDeniedMessage', 'Acceso denegado'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: pagination.limit, ...filters }
      const data = await auditService.getLogs(params)
      setLogs(data.logs || [])
      setPagination(prev => ({
        ...prev,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }))
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError(err.response?.data?.message || t('errorLoading', 'Error al cargar los registros'))
      setLogs([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (isSuperAdmin) fetchLogs(1)
  }, [isSuperAdmin])
  
  const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }))
  const handleApplyFilters = () => fetchLogs(1)
  const handleClearFilters = () => {
    setFilters({ entity: '', entityId: '', userId: '', action: '', dateFrom: '', dateTo: '' })
    setTimeout(() => fetchLogs(1), 100)
  }
  const handlePageChange = (event, value) => fetchLogs(value)
  const handleRefresh = () => fetchLogs(pagination.page)
  const handleOpenDetail = (log) => { setSelectedLog(log); setDrawerOpen(true) }
  const handleCloseDetail = () => { setDrawerOpen(false); setSelectedLog(null) }
  
  const translatedActionConfig = useMemo(() => {
    return Object.entries(ACTION_CONFIG).reduce((acc, [key, config]) => {
      acc[key] = { ...config, label: t(`actions.${key}`, config.label) }
      return acc
    }, {})
  }, [t])
  
  const columns = useAuditLogColumns({ t, showEntity: true, showUser: true, onRowClick: handleOpenDetail })
  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length
  
  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }, '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }
  const menuItemSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' } }
  const chipSx = { borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }
  
  if (!isSuperAdmin) {
    return (
      <PageLayout title={t('title', 'Audit Log')} titleBold={t('titleBold', 'CRM')} topbarLabel={t('topbarLabel', 'Audit')} subtitle={t('subtitle', 'System activity records')}>
        <Box sx={{ mt: 4, p: 4, bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 0, textAlign: 'center' }}>
          <Lock sx={{ fontSize: 48, color: '#d32f2f', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="#d32f2f" gutterBottom sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t('accessDeniedTitle', 'Access Denied')}
          </Typography>
          <Typography color="#c62828" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
            {t('accessDeniedMessage', 'You do not have permission to view this section.')}
          </Typography>
        </Box>
      </PageLayout>
    )
  }
  
  return (
    <PageLayout title={t('title', 'Audit Log')} titleBold={t('titleBold', 'CRM')} topbarLabel={t('topbarLabel', 'Audit')} subtitle={t('subtitle', 'System activity records')}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 0, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList sx={{ fontSize: 20, color: '#666' }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>
              {t('filters.title', 'Filters')}
            </Typography>
            {activeFiltersCount > 0 && <Chip label={activeFiltersCount} size="small" color="primary" sx={{ ...chipSx, height: 20 }} />}
          </Box>
          <Button size="small" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading} sx={{ ...unifiedButtonSx, color: '#000', border: '1px solid #000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#333', color: '#333', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
            {t('refresh', 'Refresh')}
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('filters.entity', 'Entity')}</InputLabel>
              <Select value={filters.entity} onChange={(e) => handleFilterChange('entity', e.target.value)} label={t('filters.entity', 'Entity')} sx={inputSx}>
                <MenuItem value="" sx={menuItemSx}><em>{t('allEntities', 'All entities')}</em></MenuItem>
                {AUDIT_ENTITIES.map(entity => <MenuItem key={entity} value={entity} sx={menuItemSx}>{t(`entities.${entity}`, entity)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('filters.project', 'Project')}</InputLabel>
              <Select value={filters.entityId} onChange={(e) => handleFilterChange('entityId', e.target.value)} label={t('filters.project', 'Project')} disabled={loadingProjects} sx={inputSx}>
                <MenuItem value="" sx={menuItemSx}><em>{t('allProjects', 'All projects')}</em></MenuItem>
                {projects.map(project => <MenuItem key={project._id} value={project._id} sx={menuItemSx}>{project.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('filters.action', 'Action')}</InputLabel>
              <Select value={filters.action} onChange={(e) => handleFilterChange('action', e.target.value)} label={t('filters.action', 'Action')} sx={inputSx}>
                <MenuItem value="" sx={menuItemSx}><em>{t('allActions', 'All actions')}</em></MenuItem>
                {Object.entries(translatedActionConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key} sx={menuItemSx}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: 0, bgcolor: config.color }} />
                      {config.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('filters.user', 'User')}</InputLabel>
              <Select value={filters.userId} onChange={(e) => handleFilterChange('userId', e.target.value)} label={t('filters.user', 'User')} sx={inputSx} disabled={loadingUsers}>
                <MenuItem value="" sx={menuItemSx}><em>{t('allUsers', 'All users')}</em></MenuItem>
                {allUsers.map(u => <MenuItem key={u._id} value={u._id} sx={menuItemSx}>{u.firstName} {u.lastName} {u.email ? `(${u.email})` : ''}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small" fullWidth type="date" label={t('filters.fromDate', 'From Date')} value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''} onChange={(e) => handleFilterChange('dateFrom', e.target.value ? `${e.target.value}T00:00:00.000Z` : '')} InputLabelProps={{ shrink: true }} sx={inputSx} />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField size="small" fullWidth type="date" label={t('filters.toDate', 'To Date')} value={filters.dateTo ? filters.dateTo.split('T')[0] : ''} onChange={(e) => handleFilterChange('dateTo', e.target.value ? `${e.target.value}T23:59:59.999Z` : '')} InputLabelProps={{ shrink: true }} sx={inputSx} />
          </Grid>
          
          <Grid item xs={12} sm={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button variant="outlined" size="small" startIcon={<Clear />} onClick={handleClearFilters} disabled={activeFiltersCount === 0} sx={{ ...unifiedButtonSx, color: '#888', border: '1px solid #888', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#000', color: '#000', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
                {t('clearFilters', 'Clear')}
              </Button>
              <Button variant="contained" size="small" startIcon={<Search />} onClick={handleApplyFilters} disabled={loading} sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}>
                {t('applyFilters', 'Apply')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }} onClose={() => setError(null)}>{error}</Alert>}
      
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip icon={<History sx={{ fontSize: 16 }} />} label={`${pagination.total} ${t('totalRecords', 'records')}`} variant="outlined" sx={chipSx} />
        <Chip icon={<CalendarToday sx={{ fontSize: 16 }} />} label={`${pagination.totalPages} ${t('pages', 'pages')}`} variant="outlined" sx={chipSx} />
        {activeFiltersCount > 0 && <Chip icon={<FilterList sx={{ fontSize: 16 }} />} label={`${activeFiltersCount} ${t('activeFilters', 'active filters')}`} color="primary" sx={chipSx} />}
      </Box>
      
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        rowKey="_id"
        emptyMessage={t('noLogs', 'No logs found')}
        onRowClick={handleOpenDetail}
        sx={{ borderRadius: 0, '& .MuiTablePagination-root': { borderRadius: 0 }, '& .MuiTablePagination-actions .MuiIconButton-root': { borderRadius: 0 } }}
      />
      
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={pagination.totalPages} page={pagination.page} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton sx={{ '& .MuiPaginationItem-root': { borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }, '& .MuiPaginationItem-ellipsis': { borderRadius: 0 } }} />
        </Box>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={2}>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
          {t('showing', 'Showing')} {logs.length} {t('of', 'of')} {pagination.total} {t('entries', 'entries')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
          {t('page', 'Page')} {pagination.page} {t('of', 'of')} {pagination.totalPages}
        </Typography>
      </Box>
      
      <AuditLogDetailDrawer log={selectedLog} open={drawerOpen} onClose={handleCloseDetail} t={t} />
    </PageLayout>
  )
}

export default AuditLog