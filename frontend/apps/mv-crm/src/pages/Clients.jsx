import { useState, useMemo } from 'react'
import {
  Box, Button, Typography, TextField, InputAdornment, Snackbar, Alert
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { motion } from 'framer-motion'
import DataTable from '@shared/components/table/DataTable'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useTranslation } from 'react-i18next'
import { useResidents } from '@shared/hooks/useResidents'
import { useClientColumns } from '../constants/Columns/resident'
import BroadcastMessageModal from '../components/BroadcastMessageModal'
import { Send } from '@mui/icons-material'

export default function Clients() {
  const { t } = useTranslation('residents')

  // Lista global de usuarios; SMS/registro llevan el proyecto CRM si está en VITE_PROJECT_ID
  const {
    users, loading, stats,
    openDialog, selectedUser, setSelectedUser, formData, setFormData,
    handleOpenDialog, handleCloseDialog, handleSubmit,
    handleDelete, handleSendPasswordSMS, sendingSMS,
    snackbar, handleCloseSnackbar,
    handleFieldChange,
    handlePhoneChange,
    isFormValid,
    e164Value,
    displayVal,
    isPhoneValid,
  } = useResidents(null, { smsProjectId: import.meta.env.VITE_PROJECT_ID })

  // Buscador
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phoneNumber?.includes(q) ||
      c.role?.toLowerCase().includes(q)
    )
  }, [search, users])

  // Columnas
  const columns = useClientColumns({
    t,
    sendingSMS,
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
    onSendSMS: handleSendPasswordSMS,
  })
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)

   
// Handler mock para envío
const handleSendBroadcast = async (data) => {
  console.log('📤 Enviando mensaje:', data)
  // Mock: simular envío
  await new Promise(resolve => setTimeout(resolve, 1500))
  alert(`Mensaje enviado a ${data.recipients.length} destinatarios`)
}

  // Stats
  const activeCount   = users.filter(c => c.isActive).length
  const adminCount    = users.filter(c => ['admin', 'superadmin'].includes(c.role)).length
  const withLotsCount = users.filter(c => c.lots?.length > 0).length

  return (
    <PageLayout
      title={t('clients.title')}
      titleBold={t('clients.titleBold')}
      topbarLabel={t('clients.topbarLabel')}
      subtitle={t('clients.subtitle')}
    >
      <StatsStrip stats={[
        { label: t('clients.total'), value: users.length },
        { label: t('clients.active'), value: activeCount },
        { label: t('clients.admins'), value: adminCount },
        { label: t('clients.withLots'), value: withLotsCount },
      ]} />

<Box display="flex" gap={2} mb={2}>
  <Button
    variant="contained"
    color="primary"
    onClick={() => handleOpenDialog()}
  >
    + {t('clients.addClient')}
  </Button>
  <Button
    variant="outlined"
    startIcon={<Send />}
    onClick={() => setBroadcastModalOpen(true)}
  >
    Enviar mensaje
  </Button>
</Box>

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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('clients.searchPlaceholder')}
            size="small"
            sx={{ width: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#bbb' }} />
                </InputAdornment>
              )
            }}
          />
          {search && (
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1.5px' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey="_id"
          onRowClick={(row) => handleOpenDialog(row)}
        />
      </motion.div>

<BroadcastMessageModal
  open={broadcastModalOpen}
  onClose={() => setBroadcastModalOpen(false)}
  users={users}
  onSend={handleSendBroadcast}
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
          sx={{ fontFamily: '"Helvetica Neue", sans-serif', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}