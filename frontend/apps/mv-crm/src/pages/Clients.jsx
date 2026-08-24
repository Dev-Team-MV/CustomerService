import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, TextField, InputAdornment, Snackbar, Alert } from '@mui/material'
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

// ✅ Imports para los Tours
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getClientsTourSteps, clientsTourConfig } from '../tours/modules/clientsTour'
import { getResidentTourSteps, residentTourConfig } from '@shared/tours/modals/residentTour'
import { getBroadcastMessageTourSteps, broadcastMessageTourConfig } from '../tours/features/broadcastMessageTour'
import { getExportTourSteps, exportTourConfig } from '../tours/features/exportTour'

// ✅ Definición clara de índices ACTUALIZADA
const ADD_CLIENT_STEP_INDEX = 2
const RESUME_AFTER_ADD_CLIENT_STEP_INDEX = 3

const SEND_MESSAGE_STEP_INDEX = 3
const RESUME_AFTER_SEND_MESSAGE_STEP_INDEX = 4

const EXPORT_STEP_INDEX = 4
const RESUME_AFTER_EXPORT_STEP_INDEX = 5 // ✅ Ahora apunta a la Tabla de Datos (índice 5)

export default function Clients() {
  const { t } = useTranslation('residents')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects } = useProjects()

  const { startTour, hasCompletedTour, pauseTour, resumeTour, isPaused } = useTour()
  const tourSteps = getClientsTourSteps(tCommon)
  const residentSteps = getResidentTourSteps(tCommon)
  const broadcastMessageSteps = getBroadcastMessageTourSteps(tCommon)
  const exportTourSteps = getExportTourSteps(tCommon)
  
  const [isTourTransitioning, setIsTourTransitioning] = useState(false)
  const clientsTourOptionsRef = useRef(null)

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

  const columns = useClientColumns({
    t,
    sendingSMS,
    onEdit: handleOpenDialog,
    onDelete: handleDelete,
    onSendSMS: handleSendPasswordSMS,
  })

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)

  const handleSendBroadcast = async (data, onProgress) => {
    const { content, recipients, channels, sendToAll, hasTemplateVariables, projectId } = data
    if (!channels.sms) {
      alert(t('broadcast.emailNotImplemented'))
      return { success: [], failed: [] }
    }
    const targetUsers = sendToAll ? users : users.filter(u => recipients.includes(u._id))
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

  // ✅ Subtour: Agregar Cliente
  const triggerAddClientSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    handleOpenDialog()
    setTimeout(() => {
      startTour(residentTourConfig.id, residentSteps, {
        onCloseClick: () => {
          handleCloseDialog()
          resumeTour(RESUME_AFTER_ADD_CLIENT_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
          setIsTourTransitioning(false)
        },
        onDestroyStarted: () => {
          handleCloseDialog()
          resumeTour(RESUME_AFTER_ADD_CLIENT_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
          setIsTourTransitioning(false)
        }
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ Subtour: Enviar Mensaje Masivo
  const triggerSendMessageSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    setBroadcastModalOpen(true)
    setTimeout(() => {
      startTour(broadcastMessageTourConfig.id, broadcastMessageSteps, {
        onCloseClick: () => {
          setBroadcastModalOpen(false)
          resumeTour(RESUME_AFTER_SEND_MESSAGE_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
          setIsTourTransitioning(false)
        },
        onDestroyStarted: () => {
          setBroadcastModalOpen(false)
          resumeTour(RESUME_AFTER_SEND_MESSAGE_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
          setIsTourTransitioning(false)
        }
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ Subtour: Exportar Datos
  const triggerExportSubtour = () => {
    if (isTourTransitioning) return
    setIsTourTransitioning(true)
    pauseTour()
    
    const exportBtn = document.getElementById('clients-export-button')
    if (exportBtn) exportBtn.click()
    
    setTimeout(() => {
      startTour(exportTourConfig.id, exportTourSteps, {
        onCloseClick: () => {
          window.dispatchEvent(new CustomEvent('close-export-modal'))
          resumeTour(RESUME_AFTER_EXPORT_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
          setIsTourTransitioning(false)
        },
        onDestroyStarted: () => {
          window.dispatchEvent(new CustomEvent('close-export-modal'))
          resumeTour(RESUME_AFTER_EXPORT_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
          setIsTourTransitioning(false)
        }
      })
      setIsTourTransitioning(false)
    }, 400)
  }

  // ✅ Handler unificado ACTUALIZADO
  const handleClientsNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('[Clients] Next click - Current index:', currentIndex)
    
    if (currentIndex === ADD_CLIENT_STEP_INDEX) {
      triggerAddClientSubtour()
    } else if (currentIndex === SEND_MESSAGE_STEP_INDEX) {
      triggerSendMessageSubtour()
    } else if (currentIndex === EXPORT_STEP_INDEX) {
      triggerExportSubtour()
    } else if (currentIndex === 17) { // ✅ Índice del paso '#data-table-first-row'
      // Simular clic en la fila para navegar a los detalles del cliente
      const firstRow = document.getElementById('data-table-first-row')
      if (firstRow) {
        firstRow.click() // Esto dispara onRowClick -> navigate('/clients/:id')
      }
    } else {
      driverObj.moveNext()
    }
  }

  const clientsTourOptions = {
    onNextClick: handleClientsNextClick
  }
  clientsTourOptionsRef.current = clientsTourOptions

  const handleAddClientClick = () => {
    const tourActive = !hasCompletedTour(clientsTourConfig.id)
    if (tourActive) {
      triggerAddClientSubtour()
    } else {
      handleOpenDialog()
    }
  }

  const handleSendMessageClick = () => {
    const tourActive = !hasCompletedTour(clientsTourConfig.id)
    if (tourActive) {
      triggerSendMessageSubtour()
    } else {
      setBroadcastModalOpen(true)
    }
  }

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
      <Box id="clients-page-container" sx={{ p: { xs: 2, sm: 3 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={clientsTourConfig.id}
            steps={tourSteps}
            label={t('common:tour.clients.button', 'Ver guía de clientes')}
            options={clientsTourOptions}
          />
        </Box>

        <StatsStrip stats={[
          { label: t('clients.total'), value: users.length },
          { label: t('clients.active'), value: activeCount },
          { label: t('clients.admins'), value: adminCount },
          { label: t('clients.withLots'), value: withLotsCount },
        ]} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" id="clients-search-input">
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('clients.search') || 'Buscar'}:
            </Typography>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('clients.searchPlaceholder')}
              size="small"
              sx={{ width: 320, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
  slotProps={{
    input: {
      sx: {
        fontFamily: '"Courier New", monospace', // texto escrito
        '&::placeholder': {
          fontFamily: '"Courier New", monospace',
          opacity: 1,
        },
      },
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ fontSize: 18, color: '#bbb' }} />
        </InputAdornment>
      ),
    },
  }}
            />
            {search && (
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#888', letterSpacing: '1px' }}>
                {filtered.length} {t('clients.resultsFound') || 'resultados'}
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              id="clients-btn-add"
              variant="contained"
              onClick={handleAddClientClick}
              sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
            >
              + {t('clients.addClient')}
            </Button>

            <Button
              id="clients-btn-send-message"
              variant="outlined"
              startIcon={<Send />}
              onClick={handleSendMessageClick}
              sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', bgcolor: '#fff', color: '#000', border: '1px solid #000', '&:hover': { bgcolor: '#fff', borderColor: '#555', color: '#555', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
            >
              {t('clients.sendMessage')}
            </Button>

            <Box id="clients-btn-export">
              <ExportButton
                buttonId="clients-export-button"
                label={t('clients.exportClients')}
                exportFn={crmReportsService.exportClients}
                withModal={true}
                disabled={users.length === 0}
                filters={[
                  {
                    field: 'projectId',
                    label: t('clients.export.project'),
                    type: 'select',
                    placeholder: t('clients.export.allProjects'),
                    required: false,
                    options: projects.map(p => ({ value: p._id, label: p.name }))
                  }
                ]}
              />
            </Box>
          </Box>
        </Box>

        <ResidentDialog
          open={openDialog}
          onClose={() => {
            handleCloseDialog()
            if (isPaused()) {
              setTimeout(() => {
                resumeTour(RESUME_AFTER_ADD_CLIENT_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
                setIsTourTransitioning(false)
              }, 300)
            }
          }}
          onSubmit={() => {
            handleSubmit()
            if (isPaused()) {
              setTimeout(() => {
                resumeTour(RESUME_AFTER_ADD_CLIENT_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
                setIsTourTransitioning(false)
              }, 300)
            }
          }}
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

        {/* ✅ La DataTable ya tiene id="clients-data-table" y las columnas tienen sus tourId */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
          <DataTable
            id="clients-data-table"
            columns={columns}
            data={filtered}
            loading={loading}
            rowKey="_id"
            onRowClick={handleViewClient}
          />
        </motion.div>

        <BroadcastMessageModal
          open={broadcastModalOpen}
          onClose={() => {
            setBroadcastModalOpen(false)
            if (isPaused()) {
              setTimeout(() => {
                resumeTour(RESUME_AFTER_SEND_MESSAGE_STEP_INDEX, tourSteps, clientsTourOptionsRef.current)
                setIsTourTransitioning(false)
              }, 300)
            }
          }}
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
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', borderRadius: 0, border: '1px solid', bgcolor: snackbar.severity === 'success' ? '#e8f5e9' : snackbar.severity === 'error' ? '#ffebee' : '#fff3e0' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  )
}