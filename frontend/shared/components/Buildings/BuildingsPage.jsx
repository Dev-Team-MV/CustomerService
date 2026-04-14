// @shared/components/Buildings/BuildingsPage.jsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Snackbar, Alert } from '@mui/material'
import { Business, Add, Apartment, CheckCircle, Layers } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '@shared/components/statscard'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { useBuildings } from '@shared/hooks/useBuildings'
import { getBuildingConfig } from '@shared/config/buildingConfig'
import BuildingDialog from '@shared/components/Buildings/BuildingDialog'

const BuildingsPage = ({
  projectSlug,
  getColumns,
  detailRoute = '/buildings'
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation(['buildings', 'common'])
  const config = getBuildingConfig(projectSlug)

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    filtered: data,
    loading,
    error,
    handleBuildingCreated,
    handleDelete: deleteBuildingAPI,
  } = useBuildings(config.projectId)

  const handleOpenDialog = (building = null) => {
    setSelectedBuilding(building)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedBuilding(null)
  }

  const handleSaved = async (buildingData) => {
    try {
      await handleBuildingCreated(buildingData)
      setSnackbar({
        open: true,
        message: selectedBuilding
          ? t('buildings:updateSuccess', 'Building updated')
          : t('buildings:createSuccess', 'Building created'),
        severity: 'success'
      })
      handleCloseDialog()
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const handleDelete = async (building) => {
    try {
      await deleteBuildingAPI(building._id)
      setSnackbar({ open: true, message: t('buildings:deleteSuccess', 'Building deleted'), severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
    }
  }

  const columns = useMemo(() => {
    if (typeof getColumns === 'function') {
      return getColumns({
        onViewDetail: (row) => navigate(`${detailRoute}/${row._id}`),
        onEdit: handleOpenDialog,
        onDelete: handleDelete,
        theme,
      })
    }
    return []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getColumns, navigate, detailRoute, theme])

  const stats = useMemo(() => [
    { title: t('buildings:total', 'Total'), value: data.length, icon: Business, gradient: theme.palette.gradient, color: config.colors.primary, delay: 0 },
    { title: t('buildings:apartments', 'Apartments'), value: data.reduce((s, b) => s + (b.totalApartments || 0), 0), icon: Apartment, gradient: theme.palette.gradientSecondary, color: config.colors.secondary, delay: 0.1 },
    { title: t('buildings:active', 'Active'), value: data.filter(b => b.status === 'active').length, icon: CheckCircle, gradient: theme.palette.gradientInfo, color: theme.palette.info?.main || config.colors.accent, delay: 0.2 },
    { title: t('buildings:floors', 'Total Floors'), value: data.reduce((s, b) => s + (b.floors || 0), 0), icon: Layers, gradient: theme.palette.gradientAccent, color: config.colors.accent, delay: 0.3 },
  ], [data, theme, config, t])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Business}
          title={t('buildings:title', 'Buildings')}
          subtitle={t('buildings:subtitle', 'Manage your buildings')}
          actionButton={{
            label: t('buildings:add', 'Add Building'),
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: t('buildings:add', 'Add Building')
          }}
        />

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <StatsCards stats={stats} loading={loading} />

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Business}
              title={t('buildings:noBuildings', 'No buildings yet')}
              description={t('buildings:startByCreating', 'Start by creating a building')}
              actionLabel={t('buildings:add', 'Add Building')}
              onAction={() => handleOpenDialog()}
            />
          }
          stickyHeader
          maxHeight={600}
        />

        <BuildingDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSaved={handleSaved}
          selectedBuilding={selectedBuilding}
          projectSlug={projectSlug}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar(p => ({ ...p, open: false }))}
            severity={snackbar.severity}
            sx={{ fontFamily: '"Poppins", sans-serif', borderRadius: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default BuildingsPage