// apps/mv-crm/src/pages/Clients.jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, TextField, InputAdornment, Snackbar, Alert
} from '@mui/material'
import { Search, Send } from '@mui/icons-material'
import { motion } from 'framer-motion'
import DataTable from '@shared/components/table/DataTable'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useTranslation } from 'react-i18next'
import { useResidents } from '@shared/hooks/useResidents'
import { useClientColumns } from '../constants/Columns/resident'
import { useProjects } from '@shared/hooks/useProjects'
import BroadcastMessageModal from '../components/BroadcastMessageModal'
import smsService from '../services/smsService'
import ExportButton from '../components/ExportButton'
import crmReportsService from '../services/crmReportsService'
import { useAuth } from '@shared/context/AuthContext'

export default function Clients() {
  const { t } = useTranslation('residents')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects } = useProjects()

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

  // Handler para envío masivo
  const handleSendBroadcast = async (data, onProgress) => {
    const { content, recipients, channels, sendToAll, hasTemplateVariables, projectId } = data

    if (!channels.sms) {
      alert(t('broadcast.emailNotImplemented'))
      return { success: [], failed: [] }
    }

    const targetUsers = sendToAll
      ? users
      : users.filter(u => recipients.includes(u._id))

    const usersWithPhone = targetUsers.filter(u => u.phoneNumber?.startsWith('+'))

    if (usersWithPhone.length === 0) {
      alert(t('broadcast.noValidPhone'))
      return { success: [], failed: [] }
    }

    try {
      let results
      if (hasTemplateVariables) {
        results = await smsService.sendBulkTemplate(
          usersWithPhone, content,
          (user) => projectId ? {} : {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || ''
          },
          onProgress, { projectId }
        )
      } else {
        results = await smsService.sendBulk(usersWithPhone, content, onProgress, { projectId })
      }
      return results
    } catch (err) {
      console.error(t('broadcast.error'), err)
      throw err
    }
  }

  const handleViewClient = (client) => {
    navigate(`/clients/${client._id}`)
  }

  // Stats
  const activeCount = users.filter(c => c.isActive).length
  const adminCount = users.filter(c => ['admin', 'superadmin'].includes(c.role)).length
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

      {/* ✅ BARRA DE HERRAMIENTAS: Filtros a la izquierda, Acciones a la derecha */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        
        {/* Izquierda: Buscador */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t('clients.search') || 'Buscar'}:
          </Typography>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('clients.searchPlaceholder')}
            size="small"
            sx={{ 
              width: 320,
              '& .MuiOutlinedInput-root': { borderRadius: 0 } // ✅ Forzar bordes afilados
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#888' }} />
                </InputAdornment>
              )
            }}
          />
          {search && (
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#888', letterSpacing: '1px' }}>
              {filtered.length} {t('clients.resultsFound') || 'resultados'}
            </Typography>
          )}
        </Box>

        {/* Derecha: Botones de Acción */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } // ✅ Hover unificado
            }}
          >
            + {t('clients.addClient')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => setBroadcastModalOpen(true)}
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              bgcolor: '#fff',
              color: '#000',
              border: '1px solid #000',
              '&:hover': { bgcolor: '#fff', borderColor: '#555', color: '#555', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } // ✅ Hover unificado
            }}
          >
            {t('clients.sendMessage')}
          </Button>

          <ExportButton
            label={t('clients.exportClients')}
            exportFn={crmReportsService.exportClients}
            withModal={true}
            disabled={users.length === 0}
            filters={[
              {
                field: 'projectId',
                label: t('export.project'),
                type: 'select',
                placeholder: t('export.allProjects'),
                required: false,
                options: projects.map(p => ({ value: p._id, label: p.name }))
              }
            ]}
          />
        </Box>
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
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey="_id"
          onRowClick={handleViewClient}
        />
      </motion.div>

      <BroadcastMessageModal
        open={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        users={users}
        projects={projects}
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
          sx={{ 
            fontFamily: '"Courier New", monospace', // ✅ Tipografía unificada
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            borderRadius: 0, // ✅ Bordes afilados
            border: '1px solid',
            bgcolor: snackbar.severity === 'success' ? '#e8f5e9' : snackbar.severity === 'error' ? '#ffebee' : '#fff3e0'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}