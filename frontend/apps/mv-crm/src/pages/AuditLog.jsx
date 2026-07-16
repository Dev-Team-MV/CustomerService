// apps/mv-crm/src/pages/AuditLog.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  Pagination
} from '@mui/material'
import { 
  History, Refresh, FilterList, CalendarToday, 
  Search, Clear, Lock 
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import auditService, { AUDIT_ENTITIES, AUDIT_ACTIONS } from '../services/auditService'
import { useAuditLogColumns, ACTION_CONFIG, AuditLogDetailDrawer } from '../constants/Columns/AuditLogColumns'
import { useAuth } from '@shared/context/AuthContext'
import { useProjects } from '@shared/hooks/useProjects' // ✅ AGREGADO

const AuditLog = () => {
  const { t } = useTranslation('residents')
  const { user } = useAuth()
  
  // ✅ AGREGADO: Obtener lista de proyectos
  const { projects, loading: loadingProjects } = useProjects()
  
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  const [filters, setFilters] = useState({
    entity: '',
    entityId: '', // Ahora almacenará el _id del proyecto seleccionado
    userId: '',
    action: '',
    dateFrom: '',
    dateTo: ''
  })
  
  const [selectedLog, setSelectedLog] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  const isSuperAdmin = user?.role === 'superadmin'
  
  const fetchLogs = async (page = 1) => {
    if (!isSuperAdmin) {
      setError(t('audit.accessDeniedMessage'))
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      }
      
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
      setError(err.response?.data?.message || t('audit.errorLoading'))
      setLogs([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs(1)
    }
  }, [isSuperAdmin])
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }
  
  const handleApplyFilters = () => {
    fetchLogs(1)
  }
  
  const handleClearFilters = () => {
    setFilters({
      entity: '',
      entityId: '',
      userId: '',
      action: '',
      dateFrom: '',
      dateTo: ''
    })
    setTimeout(() => fetchLogs(1), 100)
  }
  
  const handlePageChange = (event, value) => {
    fetchLogs(value)
  }
  
  const handleRefresh = () => {
    fetchLogs(pagination.page)
  }
  
  const handleOpenDetail = (log) => {
    setSelectedLog(log)
    setDrawerOpen(true)
  }
  
  const handleCloseDetail = () => {
    setDrawerOpen(false)
    setSelectedLog(null)
  }
  
  const translatedActionConfig = useMemo(() => {
    return Object.entries(ACTION_CONFIG).reduce((acc, [key, config]) => {
      acc[key] = {
        ...config,
        label: t(`audit.actions.${key}`, config.label)
      }
      return acc
    }, {})
  }, [t])
  
  const columns = useAuditLogColumns({ 
    t, 
    showEntity: true,
    showUser: true,
    onRowClick: handleOpenDetail
  })
  
  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length
  
  if (!isSuperAdmin) {
    return (
      <PageLayout
        title={t('audit.title')}
        titleBold={t('audit.titleBold')}
        topbarLabel={t('audit.topbarLabel')}
        subtitle={t('audit.subtitle')}
      >
        <Box
          sx={{
            mt: 4,
            p: 4,
            bgcolor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Lock sx={{ fontSize: 48, color: '#d32f2f', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="#d32f2f" gutterBottom>
            {t('audit.accessDeniedTitle')}
          </Typography>
          <Typography color="#c62828">
            {t('audit.accessDeniedMessage')}
          </Typography>
        </Box>
      </PageLayout>
    )
  }
  
  return (
    <PageLayout
      title={t('audit.title')}
      titleBold={t('audit.titleBold')}
      topbarLabel={t('audit.topbarLabel')}
      subtitle={t('audit.subtitle')}
    >
      {/* Panel de filtros */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          bgcolor: '#fafafa'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList sx={{ fontSize: 20, color: '#666' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              {t('audit.filters')}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={activeFiltersCount} 
                size="small" 
                color="primary"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
          
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {t('audit.refresh')}
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {/* Entidad */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('audit.entity')}</InputLabel>
              <Select
                value={filters.entity}
                onChange={(e) => handleFilterChange('entity', e.target.value)}
                label={t('audit.entity')}
              >
                <MenuItem value="">
                  <em>{t('audit.allEntities')}</em>
                </MenuItem>
                {AUDIT_ENTITIES.map(entity => (
                  <MenuItem key={entity} value={entity}>
                    {t(`audit.entities.${entity}`, entity)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* ✅ CAMBIADO: Proyecto (antes Entity ID) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('audit.project', 'Proyecto')}</InputLabel>
              <Select
                value={filters.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                label={t('audit.project', 'Proyecto')}
                disabled={loadingProjects}
              >
                <MenuItem value="">
                  <em>{t('audit.allProjects', 'Todos los proyectos')}</em>
                </MenuItem>
                {projects.map(project => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Acción */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('audit.action')}</InputLabel>
              <Select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                label={t('audit.action')}
              >
                <MenuItem value="">
                  <em>{t('audit.allActions')}</em>
                </MenuItem>
                {Object.entries(translatedActionConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: config.color 
                        }} 
                      />
                      {config.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* User ID */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              label={t('audit.userId')}
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder={t('audit.userIdPlaceholder')}
            />
          </Grid>
          
          {/* Fecha desde */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label={t('audit.dateFrom')}
              value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value ? `${e.target.value}T00:00:00.000Z` : '')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* Fecha hasta */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label={t('audit.dateTo')}
              value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value ? `${e.target.value}T23:59:59.999Z` : '')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* Botones */}
          <Grid item xs={12} sm={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
                sx={{ textTransform: 'none' }}
              >
                {t('audit.clearFilters')}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Search />}
                onClick={handleApplyFilters}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                {t('audit.applyFilters')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Estadísticas rápidas */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip
          icon={<History sx={{ fontSize: 16 }} />}
          label={`${pagination.total} ${t('audit.totalRecords')}`}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          icon={<CalendarToday sx={{ fontSize: 16 }} />}
          label={`${pagination.totalPages} ${t('audit.pages')}`}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        {activeFiltersCount > 0 && (
          <Chip
            icon={<FilterList sx={{ fontSize: 16 }} />}
            label={`${activeFiltersCount} ${t('audit.activeFilters')}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>
      
      {/* Tabla */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        rowKey="_id"
        emptyMessage={t('audit.noLogs')}
        onRowClick={handleOpenDetail}
      />
      
      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      {/* Info footer */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        mt={2}
        pt={2}
      >
        <Typography variant="caption" color="text.secondary">
          {t('audit.showing')} {logs.length} {t('audit.of')} {pagination.total} {t('audit.entries')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('audit.page')} {pagination.page} {t('audit.of')} {pagination.totalPages}
        </Typography>
      </Box>
      
      {/* Drawer de detalles */}
      <AuditLogDetailDrawer 
        log={selectedLog}
        open={drawerOpen}
        onClose={handleCloseDetail}
        t={t}
      />
    </PageLayout>
  )
}

export default AuditLog