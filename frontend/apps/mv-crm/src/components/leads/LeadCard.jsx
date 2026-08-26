import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Chip, Avatar, IconButton, Tooltip } from '@mui/material'
import { Phone, Email, MoreVert, CalendarToday, Event, Sms } from '@mui/icons-material'
import AppointmentModal from '../appointments/AppointmentModal'
import ScoreBadge from './ScoreBadge'
import { useAppointments } from '../../constants/hooks/useAppointments'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../../constants/hooks/useCrmAgents'
import leadService from '../../services/leadService'

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays <= 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const LeadCard = ({ lead, onClick, onMenuClick, isDragging, onScoreUpdate }) => {
  const { t } = useTranslation('leads')
  const { createAppointment } = useAppointments()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()
  
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)
  const [smsMarking, setSmsMarking] = useState(false)

  const projectName = lead.projectId?.name || lead.projectId?.title?.es || lead.projectId?.title?.en || null
  const assigneeName = lead.assignedTo ? `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim() : null

  const handleScheduleAppointment = (e) => {
    e.stopPropagation()
    setAppointmentModalOpen(true)
  }

  const handleSaveAppointment = async (id, data) => {
    await createAppointment(data)
    setAppointmentModalOpen(false)
  }

  const handleMarkSmsResponded = async (e) => {
    e.stopPropagation()
    if (lead.smsResponded) return 
    
    setSmsMarking(true)
    try {
      await leadService.markSmsResponded(lead._id)
      lead.smsResponded = true
      onScoreUpdate?.(lead._id)
    } catch (err) {
      console.error('Error marking SMS as responded:', err)
    } finally {
      setSmsMarking(false)
    }
  }

  return (
    <>
      {/* ✅ Atributo data-tour-lead-card para que el tour lo encuentre dinámicamente */}
      <Box
        data-tour-lead-card="true"
        onClick={() => onClick?.(lead)}
        sx={{
          bgcolor: 'white',
          borderRadius: 0,
          p: 2,
          cursor: 'pointer',
          border: '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: '4px 4px 0px rgba(0,0,0,0.08)',
            borderColor: '#000'
          },
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        {/* Header: Nombre + Score */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1} gap={1}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: '"Helvetica Neue", sans-serif' }}>
            {lead.name}
          </Typography>
          <ScoreBadge lead={lead} size="small" />
        </Box>

        {/* Proyecto */}
        {projectName && (
          <Box mb={1}>
            <Chip label={projectName} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500, borderRadius: 0, fontFamily: '"Courier New", monospace' }} />
          </Box>
        )}

        {/* Teléfono y Email */}
        <Box display="flex" flexDirection="column" gap={0.5} mb={1}>
          {lead.phone && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Phone sx={{ fontSize: 14, color: '#757575' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                {lead.phone}
              </Typography>
              {!lead.smsResponded ? (
                <Tooltip title="Marcar SMS respondido (+15 puntos)">
                  <IconButton size="small" onClick={handleMarkSmsResponded} disabled={smsMarking} sx={{ ml: 'auto', color: '#888', '&:hover': { color: '#00bcd4', bgcolor: '#e0f7fa', borderRadius: 0 } }}>
                    <Sms sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="SMS respondido ✓">
                  <Sms sx={{ fontSize: 14, color: '#00bcd4', ml: 'auto' }} />
                </Tooltip>
              )}
            </Box>
          )}
          {lead.email && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Email sx={{ fontSize: 14, color: '#757575' }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                {lead.email}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Asesor asignado */}
        {lead.assignedTo && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: '#000', borderRadius: 0, color: '#fff' }}>
              {lead.assignedTo.firstName?.charAt(0) || '?'}
            </Avatar>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>
              {assigneeName}
            </Typography>
          </Box>
        )}

        {/* Footer: Fecha + Acciones */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarToday sx={{ fontSize: 14, color: '#9e9e9e' }} />
            <Typography variant="caption" sx={{ color: '#9e9e9e', fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }}>
              {formatDate(lead.createdAt)}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={t('scheduleAppointment', 'Agendar cita')}>
              <IconButton size="small" onClick={handleScheduleAppointment} sx={{ color: '#888', '&:hover': { color: '#4caf50', bgcolor: '#e8f5e9', borderRadius: 0 } }}>
                <Event sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenuClick?.(e, lead) }} sx={{ borderRadius: 0 }}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
        prefillData={{
          leadId: lead._id,
          projectId: lead.projectId?._id || lead.projectId,
          assignedTo: lead.assignedTo?._id || lead.assignedTo
        }}
        projects={projects}
        agents={agents}
      />
    </>
  )
}

export default LeadCard