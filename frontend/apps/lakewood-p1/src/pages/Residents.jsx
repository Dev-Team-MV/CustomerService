// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/lakewood-p1/src/pages/Residents.jsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Snackbar, Alert } from '@mui/material'
import { People, Add, AdminPanelSettings, VerifiedUser, Home, PersonAdd } from '@mui/icons-material'

import PageHeader from '@shared/components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import ResidentDialog from '../../../../shared/components/Modals/ResidentDialog'

import { useResidents } from '@shared/hooks/useResidents'
import { useResidentColumns } from '../constants/Columns/residents'

const Residents = () => {
  const { t } = useTranslation(['residents', 'common'])

  // ✅ Pasar PROJECT_ID desde .env para filtrar residentes de lakewood-p1
  const projectId = import.meta.env.VITE_PROJECT_ID

  const {
    users, loading, stats,
    openDialog, selectedUser, formData, setFormData,
    handleOpenDialog, handleCloseDialog, handleSubmit,
    handleDelete, handleSendPasswordSMS, sendingSMS,
    snackbar, handleCloseSnackbar,
    handleFieldChange,
    handlePhoneChange,
    isFormValid,
    e164Value,
    displayVal,
    isPhoneValid,
  } = useResidents(projectId) // ✅ Pasar projectId al hook

  const columns = useResidentColumns({
    t,
    sendingSMS,
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
    onSendSMS: handleSendPasswordSMS,
  })

  const residentsStats = useMemo(() => [
    { title: t('residents:stats.total'), value: stats.total, icon: People, gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)', color: '#333F1F', delay: 0 },
    { title: t('residents:stats.superadmins'), value: stats.superadmins, icon: AdminPanelSettings, gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)', color: '#E5863C', delay: 0.1 },
    { title: t('residents:stats.admins'), value: stats.admins, icon: VerifiedUser, gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)', color: '#8CA551', delay: 0.2 },
    { title: t('residents:stats.residents'), value: stats.residents, icon: Home, gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: '#1976d2', delay: 0.3 },
  ], [stats, t])

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={People}
          title={t('residents:title')}
          subtitle={t('residents:subtitle')}
          actionButton={{
            label: t('residents:actions.add'),
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: t('residents:actions.add')
          }}
        />

        <StatsCards stats={residentsStats} loading={loading} />

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyState={
            <EmptyState
              icon={PersonAdd}
              title={t('residents:empty.title')}
              description={t('residents:empty.description')}
              actionLabel={t('residents:empty.action')}
              onAction={() => handleOpenDialog()}
            />
          }
          onRowClick={(row) => handleOpenDialog(row)}
        />

        <ResidentDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          selectedUser={selectedUser}
          handleFieldChange={handleFieldChange}
          handlePhoneChange={handlePhoneChange}
          isFormValid={isFormValid}
          e164Value={e164Value}
          displayVal={displayVal}
          isPhoneValid={isPhoneValid}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%', fontFamily: '"Poppins", sans-serif', borderRadius: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Residents