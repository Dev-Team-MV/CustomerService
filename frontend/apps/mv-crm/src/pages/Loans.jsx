import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Tabs, Tab, Button, TextField, InputAdornment, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Add, Search, Business } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import { useLoanColumns } from '../constants/Columns/loanColumns'
import LoanKPIStrip from '../components/loans/LoanKPIStrip'
import LoanAlertsPanel from '../components/loans/LoanAlertsPanel'
import LoanFormDialog from '../components/loans/LoanFormDialog'
import { useLoans } from '../constants/hooks/useLoans'
import { useProjects } from '@shared/hooks/useProjects'

export default function Loans() {
  const { t } = useTranslation('loans')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { projects } = useProjects()
  
  const { 
    loans = [], loading = false, dashboardKPIs, alerts, 
    filters, setFilters,
    createLoan, deleteLoan 
  } = useLoans() || {}
  
  const [activeTab, setActiveTab] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const tabs = [
    { value: 'all', label: t('loans.tabs.all', 'All') },
    { value: 'active', label: t('loans.tabs.active', 'Active') },
    { value: 'processing', label: t('loans.tabs.processing', 'Processing') },
    { value: 'closing', label: t('loans.tabs.closing', 'Closing') },
    { value: 'issues', label: t('loans.tabs.issues', 'Issues') },
  ]

  const safeLoans = Array.isArray(loans) ? loans : []
  
  const filteredLoans = useMemo(() => {
    let result = safeLoans
    
    if (activeTab !== 'all') {
      result = result.filter(l => {
        if (activeTab === 'issues') return !!l.specialStatus
        if (activeTab === 'active') return !['Completed', 'Denied', 'Cancelled'].includes(l.phase)
        return l.phase?.toLowerCase() === activeTab
      })
    }
    
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase()
      result = result.filter(l => 
        l.borrower?.firstName?.toLowerCase().includes(q) ||
        l.borrower?.lastName?.toLowerCase().includes(q) ||
        l.borrower?.email?.toLowerCase().includes(q) ||
        l.loanAmount?.toString().includes(q) ||
        l.lender?.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [safeLoans, activeTab, searchValue])

  const columns = useLoanColumns({
    t,
    onViewDetails: (row) => navigate(`/loans/${row._id}`),
    onEdit: (row) => setDialogOpen(true),
    onDelete: async (row) => { 
      if(window.confirm(t('loans.confirmDelete', 'Delete this loan?'))) { 
        try {
          await deleteLoan(row._id)
          setSnackbar({ open: true, message: t('loans.snackbar.deleted'), severity: 'success' })
        } catch (err) {
          setSnackbar({ open: true, message: t('loans.snackbar.deleteError'), severity: 'error' })
        }
      } 
    }
  })

  // ✅ Estilos unificados
  const unifiedButtonSx = { 
    borderRadius: 0, 
    textTransform: 'none', 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    letterSpacing: '0.5px', 
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }, 
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiInputBase-input::placeholder': { fontFamily: '"Courier New", monospace', opacity: 1 }
  }

  const selectSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiSelect-select': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', py: 1 }
  }

  const menuItemSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '&:hover': { bgcolor: '#f5f5f5' }
  }

  // ✅ Handler de cambio de proyecto (actualiza filters y dispara refetch)
  const handleProjectChange = (e) => {
    const value = e.target.value || null
    setFilters(prev => ({
      ...prev,
      projectId: value || undefined
    }))
  }

  const handleCreateLoan = async (data) => {
    try {
      await createLoan(data)
      setDialogOpen(false)
      setSnackbar({ open: true, message: t('loans.snackbar.created'), severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('loans.snackbar.createError'), severity: 'error' })
    }
  }

  // Contar loans por proyecto para mostrarlo en el menú
  const getLoanCountByProject = (projectId) => {
    if (!projectId) return safeLoans.length
    return safeLoans.filter(l => (l.projectId?._id || l.projectId) === projectId).length
  }

  return (
    <PageLayout title={t('loans.title', 'Loan')} titleBold={t('loans.titleBold', 'Management')} subtitle={t('loans.subtitle', 'Manage the complete lifecycle of mortgage loans.')}>
      <Box id="loans-page-container" sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* ✅ FILTRO DE PROYECTO (antes de KPIs) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 320, ...selectSx }}>
            <InputLabel>
              <Business sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {t('loans.filters.project', 'Filter by Project')}
            </InputLabel>
            <Select
              value={filters?.projectId || ''}
              label={t('loans.filters.project', 'Filter by Project')}
              onChange={handleProjectChange}
              sx={selectSx}
            >
              <MenuItem value="" sx={menuItemSx}>
                <em>{t('loans.filters.allProjects', 'All Projects')} ({getLoanCountByProject()})</em>
              </MenuItem>
              {(projects || []).map(project => (
                <MenuItem key={project._id} value={project._id} sx={menuItemSx}>
                  {project.name} ({getLoanCountByProject(project._id)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {filters?.projectId && (
            <Button
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, projectId: undefined }))}
              sx={{ 
                ...unifiedButtonSx, 
                color: '#706f6f', 
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f5f5f5', borderColor: '#ccc' }
              }}
            >
              {t('loans.filters.clearFilter', 'Clear Filter')} ×
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {/* <TourButton tourId="loans-tour" steps={tourSteps} label={tCommon('tour.loans.button')} options={tourOptions} /> */}
        </Box>

        <LoanKPIStrip kpis={dashboardKPIs} />
        <LoanAlertsPanel alerts={alerts} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <TextField
              placeholder={t('loans.searchPlaceholder', 'Search by borrower, amount or lender...')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              sx={{ width: 320, ...inputSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#bbb' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ 
              minHeight: 40, 
              '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0 } 
            }}>
              {tabs.map(tab => <Tab key={tab.value} value={tab.value} label={tab.label} />)}
            </Tabs>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              id="loans-btn-add"
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#222' } }}
            >
              {t('loans.actions.newLoan', 'New Loan')}
            </Button>
          </Box>
        </Box>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
          <DataTable
            id="loans-data-table"
            columns={columns}
            data={filteredLoans}
            loading={loading}
            rowKey="_id"
            onRowClick={(row) => navigate(`/loans/${row._id}`)}
          />
        </motion.div>

        <LoanFormDialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          onSave={handleCreateLoan} 
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  )
}