// apps/mv-crm/src/components/AuditLogTab.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  TextField,
  Grid
} from '@mui/material'
import { History, Refresh, FilterList } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import DataTable from '@shared/components/table/DataTable'
import auditService from '../../services/auditService'
import { useAuditLogColumns, ACTION_CONFIG, AuditLogDetailDrawer } from '../../constants/Columns/AuditLogColumns'

const AuditLogTab = ({ 
  entity, 
  entityId,
  entityName 
}) => {
  const { t } = useTranslation('residents') // ✅ Cambiado de 'crm' a 'residents'
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  const [selectedLog, setSelectedLog] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  const fetchLogs = async (page = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        entity,
        entityId,
        page,
        limit: pagination.limit
      }
      
      if (actionFilter) params.action = actionFilter
      if (dateFrom) params.dateFrom = new Date(dateFrom).toISOString()
      if (dateTo) params.dateTo = new Date(dateTo).toISOString()
      
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
      setError(err.response?.data?.message || 'Error al cargar el historial')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (entity && entityId) {
      fetchLogs(1)
    }
  }, [entity, entityId])
  
  const handleApplyFilters = () => {
    fetchLogs(1)
  }
  
  const handleClearFilters = () => {
    setActionFilter('')
    setDateFrom('')
    setDateTo('')
    setTimeout(() => fetchLogs(1), 100)
  }
  
  const handlePageChange = (event, value) => {
    fetchLogs(value)
  }
  
  const handleRefresh = () => {
    fetchLogs(pagination.page)
  }
  
  const handleRowClick = (log) => {
    setSelectedLog(log)
    setDrawerOpen(true)
  }
  
  const handleCloseDetail = () => {
    setDrawerOpen(false)
    setSelectedLog(null)
  }
  
  const activeFiltersCount = [actionFilter, dateFrom, dateTo].filter(v => v).length
  
  const columns = useAuditLogColumns({ 
    t, 
    showEntity: false,
    showUser: true,
    onRowClick: handleRowClick
  })

  // ✅ Traducir labels de ACTION_CONFIG
  const translatedActionConfig = useMemo(() => {
    return Object.entries(ACTION_CONFIG).reduce((acc, [key, config]) => {
      acc[key] = {
        ...config,
        label: t(`audit.actions.${key}`, config.label)
      }
      return acc
    }, {})
  }, [t])
  
  return (
    <Box>
      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <History sx={{ fontSize: 20, color: '#666' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            {t('audit.historyTitle')}
          </Typography>
          {pagination.total > 0 && (
            <Chip 
              label={pagination.total} 
              size="small" 
              sx={{ 
                bgcolor: '#000', 
                color: '#fff',
                fontSize: '0.65rem',
                height: 20
              }} 
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
      
      {/* Panel de filtros */}
      <Box 
        sx={{ 
          p: 2, 
          mb: 2, 
          bgcolor: '#fafafa',
          border: '1px solid #e0e0e0',
          borderRadius: 1
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterList sx={{ fontSize: 18, color: '#666' }} />
          <Typography variant="caption" fontWeight={600}>
            {t('audit.filters')}
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          )}
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t('audit.filterAction')}</InputLabel>
              <Select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label={t('audit.filterAction')}
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
          
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label={t('audit.dateFrom')}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label={t('audit.dateTo')}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        
        <Box display="flex" gap={1} justifyContent="flex-end" mt={2}>
          <Button
            size="small"
            onClick={handleClearFilters}
            disabled={activeFiltersCount === 0}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            {t('audit.clearFilters')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApplyFilters}
            disabled={loading}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            {t('audit.applyFilters')}
          </Button>
        </Box>
      </Box>
      
      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabla */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        rowKey="_id"
        emptyMessage={t('audit.noLogs')}
        onRowClick={handleRowClick}
      />
      
      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      {/* Info footer */}
      {pagination.total > 0 && (
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          mt={2}
          pt={2}
          borderTop="1px solid #f0f0f0"
        >
          <Typography variant="caption" color="text.secondary">
            {t('audit.showing')} {logs.length} {t('audit.of')} {pagination.total} {t('audit.entries')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('audit.entityLabel')}: <strong>{entityName || entity}</strong>
          </Typography>
        </Box>
      )}
      
      {/* Drawer de detalles */}
      <AuditLogDetailDrawer 
        log={selectedLog}
        open={drawerOpen}
        onClose={handleCloseDetail}
        t={t}
      />
    </Box>
  )
}

export default AuditLogTab