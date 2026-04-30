import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Snackbar, Alert } from '@mui/material'
import { Landscape } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import DataTable from '@shared/components/table/DataTable'
import { useLots } from '@shared/hooks/useLots'
import { getLotColumns } from '../Constants/Columns/lots'
import LotDialog from '../Components/lots/LotDialog'

const Lots = () => {
  const { t } = useTranslation(['lots', 'common'])
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    filtered: data,
    loading,
    handleLotCreated,
    handleDelete: deleteLotAPI,
    refetch
  } = useLots(projectId)

  const handleOpenDialog = (lot = null) => {
    setSelectedLot(lot)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedLot(null)
  }

  const handleSaved = async (lotData) => {
    try {
      await handleLotCreated(lotData)
      await refetch()
      handleCloseDialog()
      setSnackbar({ 
        open: true, 
        message: selectedLot ? t('lots:messages.updateSuccess') : t('lots:messages.createSuccess'), 
        severity: 'success' 
      })
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: t('lots:messages.error', { message: err.message }), 
        severity: 'error' 
      })
    }
  }

  const handleDelete = async (lot) => {
    if (!window.confirm(t('lots:messages.deleteConfirm', { number: lot.number }))) return
    try {
      await deleteLotAPI(lot._id)
      await refetch()
      setSnackbar({ 
        open: true, 
        message: t('lots:messages.deleteSuccess'), 
        severity: 'success' 
      })
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: t('lots:messages.error', { message: err.message }), 
        severity: 'error' 
      })
    }
  }

  const columns = getLotColumns({
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
    theme,
    t
  })

  const stats = [
    { 
      title: t('lots:stats.total'), 
      value: data.length, 
      icon: Landscape, 
      gradient: theme.palette.gradient, 
      color: '#1a237e', 
      delay: 0 
    },
    { 
      title: t('lots:stats.available'), 
      value: data.filter(l => l.status === 'available').length, 
      icon: Landscape, 
      gradient: theme.palette.gradientSecondary, 
      color: '#4caf50', 
      delay: 0.1 
    },
    { 
      title: t('lots:stats.sold'), 
      value: data.filter(l => l.status === 'sold').length, 
      icon: Landscape, 
      gradient: theme.palette.gradientInfo, 
      color: '#f44336', 
      delay: 0.2 
    },
    { 
      title: t('lots:stats.reserved'), 
      value: data.filter(l => l.status === 'reserved').length, 
      icon: Landscape, 
      gradient: theme.palette.gradientAccent, 
      color: '#ff9800', 
      delay: 0.3 
    },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Landscape}
          title={t('lots:title')}
          subtitle={t('lots:subtitle')}
          actionButton={{
            label: t('lots:actions.add'),
            onClick: () => handleOpenDialog(),
            icon: <Landscape />,
            tooltip: t('lots:actions.add'),
            disabled: loading
          }}
        />

        <StatsCards stats={stats} />

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyState={
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Alert severity="info">{t('lots:messages.noLots')}</Alert>
            </Box>
          }
        />

        <LotDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSaved={handleSaved}
          selectedLot={selectedLot}
          projectId={projectId}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Lots