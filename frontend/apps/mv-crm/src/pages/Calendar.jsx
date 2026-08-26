// apps/mv-crm/src/pages/Calendar.jsx
import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Add,
  CalendarMonth,
  ViewWeek,
  ViewDay,
  ChevronLeft,
  ChevronRight,
  Today,
  MoreVert,
  CheckCircle,
  PendingActions,
  EventBusy,
  DoneAll,
  Person,
  PersonOutline
} from '@mui/icons-material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import enLocale from '@fullcalendar/core/locales/en-gb'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import AppointmentModal from '../components/appointments/AppointmentModal'
import { useAppointments } from '../constants/hooks/useAppointments'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'

// ✅ NUEVOS IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getCalendarTourSteps, calendarTourConfig } from '../tours/modules/calendarTour'
import { getAppointmentTourSteps, appointmentTourConfig } from '../tours/features/appointmentTour'

const APPOINTMENT_TYPES = {
  visita: { labelKey: 'types.visita', color: '#4caf50', icon: '' },
  llamada: { labelKey: 'types.llamada', color: '#2196f3', icon: '📞' },
  reunion: { labelKey: 'types.reunion', color: '#ff9800', icon: '🤝' }
}

const APPOINTMENT_STATUSES = {
  pendiente: { labelKey: 'statuses.pendiente', color: '#ff9800', bgColor: '#fff3e0' },
  confirmada: { labelKey: 'statuses.confirmada', color: '#2196f3', bgColor: '#e3f2fd' },
  completada: { labelKey: 'statuses.completada', color: '#4caf50', bgColor: '#e8f5e9' },
  cancelada: { labelKey: 'statuses.cancelada', color: '#f44336', bgColor: '#ffebee' }
}

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', icon: PendingActions, color: '#ff9800' },
  { value: 'confirmada', label: 'Confirmada', icon: CheckCircle, color: '#2196f3' },
  { value: 'completada', label: 'Completada', icon: DoneAll, color: '#4caf50' },
  { value: 'cancelada', label: 'Cancelada', icon: EventBusy, color: '#f44336' }
]

// ✅ Componente QuickStatusButton optimizado
const QuickStatusButton = ({ appointment, onUpdateStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleStatusChange = async (newStatus) => {
    if (newStatus === appointment.status) {
      handleClose()
      return
    }
    await onUpdateStatus(appointment._id, newStatus)
    handleClose()
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: 'rgba(255,255,255,0.9)',
          bgcolor: 'rgba(255,255,255,0.2)',
          padding: '2px',
          borderRadius: 0,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
        }}
      >
        <MoreVert sx={{ fontSize: 14 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '1px solid #ececec',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f0f0f0' }}>
          <Typography sx={{ 
            fontFamily: '"Courier New", monospace',
            fontSize: '0.65rem',
            color: '#888',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Cambiar estado
          </Typography>
        </Box>
        
        {STATUS_OPTIONS.map((status) => {
          const Icon = status.icon
          const isCurrent = status.value === appointment.status
          
          return (
            <MenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={isCurrent}
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                py: 1,
                opacity: isCurrent ? 0.6 : 1,
                bgcolor: isCurrent ? `${status.color}10` : 'transparent',
                '&:hover': { bgcolor: `${status.color}15` }
              }}
            >
              <ListItemIcon sx={{ color: status.color, minWidth: 36 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={status.label}
                primaryTypographyProps={{
                  sx: {
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : 500
                  }
                }}
              />
              {isCurrent && (
                <Box sx={{ ml: 1, width: 8, height: 8, borderRadius: 0, bgcolor: status.color }} />
              )}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}

// ✅ Componente ContactInfo optimizado
const ContactInfo = ({ appointment }) => {
  const client = appointment.clientId
  const lead = appointment.leadId
  
  if (client && typeof client === 'object') {
    const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim()
    const clientEmail = client.email || ''
    
    return (
      <Tooltip 
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, fontFamily: '"Helvetica Neue", sans-serif' }}>Cliente</Typography>
            {clientName && <Typography variant="caption" sx={{ display: 'block', fontFamily: '"Helvetica Neue", sans-serif' }}>{clientName}</Typography>}
            {clientEmail && <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', fontFamily: '"Helvetica Neue", sans-serif' }}>{clientEmail}</Typography>}
          </Box>
        }
        placement="top"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            px: 0.75,
            py: 0.25,
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 0,
            cursor: 'default'
          }}
        >
          <Person sx={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.95)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {clientName || 'Cliente'}
          </Typography>
        </Box>
      </Tooltip>
    )
  }
  
  if (lead && typeof lead === 'object') {
    const leadName = lead.name || 'Lead'
    const leadPhone = lead.phone || ''
    
    return (
      <Tooltip 
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, fontFamily: '"Helvetica Neue", sans-serif' }}>Lead</Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: '"Helvetica Neue", sans-serif' }}>{leadName}</Typography>
            {leadPhone && <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', fontFamily: '"Helvetica Neue", sans-serif' }}>{leadPhone}</Typography>}
          </Box>
        }
        placement="top"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            px: 0.75,
            py: 0.25,
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 0,
            cursor: 'default'
          }}
        >
          <PersonOutline sx={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }} />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.95)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}
          >
            {leadName}
          </Typography>
        </Box>
      </Tooltip>
    )
  }
  
  return null
}

export default function Calendar() {
 const { t, i18n } = useTranslation('appointments')
  const { t: tCommon } = useTranslation('common') // ✅ Para las claves del tour
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  
  const { appointments, loading, error, createAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment } = useAppointments()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()
  
  const calendarRef = useRef(null)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarView, setCalendarView] = useState('dayGridMonth')
  const [currentTitle, setCurrentTitle] = useState('')

  // ✅ HOOKS DEL TOUR
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getCalendarTourSteps(tCommon)
  const appointmentSteps = getAppointmentTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  const calendarEvents = useMemo(() => {
    return appointments.map(appointment => {
      const statusConfig = APPOINTMENT_STATUSES[appointment.status] || APPOINTMENT_STATUSES.pendiente
      const typeConfig = APPOINTMENT_TYPES[appointment.type] || APPOINTMENT_TYPES.visita
      
      return {
        id: appointment._id,
        title: appointment.title,
        start: appointment.startDate,
        end: appointment.endDate,
        backgroundColor: statusConfig.color,
        borderColor: statusConfig.color,
        textColor: '#fff',
        extendedProps: { ...appointment, statusConfig, typeConfig }
      }
    })
  }, [appointments])

    // ✅ ESCUCHAR REANUDACIÓN DESDE EL SUBTOUR DE CITAS
  useEffect(() => {
    const handleResume = () => {
      // Reanuda en el índice 4 (#calendar-grid) después de cerrar el modal
      resumeTour(4, tourSteps, tourOptionsRef.current)
    }
    window.addEventListener('tour-resume-appointment', handleResume)
    return () => window.removeEventListener('tour-resume-appointment', handleResume)
  }, [resumeTour, tourSteps])

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      if (calendarApi.view.type !== calendarView) {
        calendarApi.changeView(calendarView)
      }
    }
  }, [calendarView])

  useEffect(() => {
    if (calendarRef.current) {
      setCurrentTitle(calendarRef.current.getApi().view.title)
    }
  }, [calendarView, appointments])

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev()
      setCurrentTitle(calendarRef.current.getApi().view.title)
    }
  }

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next()
      setCurrentTitle(calendarRef.current.getApi().view.title)
    }
  }

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today()
      setCurrentTitle(calendarRef.current.getApi().view.title)
    }
  }

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr)
    setSelectedAppointment(null)
    setModalOpen(true)
  }

  const handleEventClick = (info) => {
    setSelectedAppointment(info.event.extendedProps)
    setSelectedDate(null)
    setModalOpen(true)
  }

  const handleDatesSet = (info) => {
    setCurrentTitle(info.view.title)
    if (info.view.type !== calendarView) {
      setCalendarView(info.view.type)
    }
  }

  const handleSaveAppointment = async (id, data) => {
    if (id) await updateAppointment(id, data)
    else await createAppointment(data)
  }

  const handleDeleteAppointment = async (id) => {
    await deleteAppointment(id)
  }

  const handleViewChange = (event, newView) => {
    if (newView !== null && calendarRef.current) {
      calendarRef.current.getApi().changeView(newView)
      setCalendarView(newView)
      setTimeout(() => setCurrentTitle(calendarRef.current.getApi().view.title), 100)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    await updateAppointmentStatus(id, status)
  }

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    
    // Índice 3 es el botón de Crear Cita
    if (currentIndex === 3) {
      setSelectedAppointment(null)
      setSelectedDate(null)
      setModalOpen(true)
      pauseTour()
      
      setTimeout(() => {
        startTour(appointmentTourConfig.id, appointmentSteps, {
          onCloseClick: () => window.dispatchEvent(new CustomEvent('tour-resume-appointment')),
          onDestroyStarted: () => window.dispatchEvent(new CustomEvent('tour-resume-appointment'))
        })
      }, 400)
      return
    }
    
    driverObj.moveNext()
  }

  const handleTourPrevClick = (driverObj) => {
    driverObj.movePrevious()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: handleTourPrevClick
  }
  tourOptionsRef.current = tourOptions


  // ✅ Renderizar contenido del evento optimizado para responsive
  const renderEventContent = (eventInfo) => {
    const appointment = eventInfo.event.extendedProps
    const statusConfig = appointment.statusConfig || APPOINTMENT_STATUSES[appointment.status] || APPOINTMENT_STATUSES.pendiente
    const typeConfig = appointment.typeConfig || APPOINTMENT_TYPES[appointment.type] || APPOINTMENT_TYPES.visita
    
    const isTimeGrid = eventInfo.view.type.includes('timeGrid')
    const isDayGrid = eventInfo.view.type === 'dayGridMonth'
    const startTime = new Date(eventInfo.event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    // Vista de Mes - Cards compactas
    if (isDayGrid) {
      return (
        <Box sx={{ 
          p: 0.5, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          bgcolor: statusConfig.color, 
          borderRadius: 0,
          minHeight: isMobile ? '40px' : 'auto'
        }}>
          <Typography sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: isMobile ? '0.6rem' : '0.65rem', 
            fontWeight: 600, 
            color: 'white', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            lineHeight: 1.2
          }}>
            {typeConfig.icon} {eventInfo.event.title || 'Sin título'}
          </Typography>
          {!isMobile && (
            <Typography sx={{ 
              fontFamily: '"Courier New", monospace', 
              fontSize: '0.55rem', 
              color: 'rgba(255,255,255,0.9)', 
              mt: 0.25 
            }}>
              {startTime}
            </Typography>
          )}
        </Box>
      )
    }

    // Vista de Semana/Día - Cards detalladas
    return (
      <Box sx={{ 
        p: 0.75, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        position: 'relative', 
        bgcolor: statusConfig.color, 
        borderRadius: 0, 
        overflow: 'hidden',
        minHeight: '60px'
      }}>
        <Box>
          <Typography sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: isMobile ? '0.65rem' : '0.7rem', 
            fontWeight: 600, 
            color: 'white', 
            mb: 0.5, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            pr: 3,
            lineHeight: 1.2
          }}>
            {typeConfig.icon} {eventInfo.event.title || 'Sin título'}
          </Typography>
          {!isMobile && <ContactInfo appointment={appointment} />}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, mt: 0.5 }}>
          <Box sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.6rem', 
            color: 'rgba(255,255,255,0.9)', 
            background: 'rgba(0,0,0,0.2)', 
            padding: '2px 6px', 
            borderRadius: 0 
          }}>
            {startTime}
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ 
                fontFamily: '"Courier New", monospace', 
                fontSize: '0.55rem', 
                color: 'white', 
                background: 'rgba(255,255,255,0.25)', 
                padding: '2px 6px', 
                borderRadius: 0, 
                textTransform: 'uppercase', 
                fontWeight: 600 
              }}>
                {statusConfig.label}
              </Typography>
              <QuickStatusButton appointment={appointment} onUpdateStatus={handleUpdateStatus} />
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: calendarView,
    locale: i18n.language === 'es' ? esLocale : enLocale,
    headerToolbar: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: isMobile ? 2 : true,
    weekends: true,
    height: isMobile ? 'auto' : 'auto',
    contentHeight: isMobile ? 400 : 600,
    slotEventOverlap: false,
    eventOverlap: false,
    dayMaxEventRows: isMobile ? 2 : 3,
    slotDuration: '00:30:00',
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    allDaySlot: true,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    dateClick: handleDateClick,
    eventClick: handleEventClick,
    datesSet: handleDatesSet,
    eventContent: renderEventContent,
    eventDisplay: 'block',
    stickyHeaderDates: true,
    eventOrder: 'start,-duration,title',
    nextDayThreshold: '00:00:00',
    // ✅ Responsive: Ajustar columnas en móvil
    fixedWeekCount: false,
    showNonCurrentDates: !isMobile,
    // ✅ Mejorar layout en semana
    weekNumbers: !isMobile,
    // ✅ Scroll horizontal en móvil para vista semana
    scrollTime: '08:00:00'
  }

  return (
    <PageLayout
      title={t('title')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle')}
    >
      {/* ✅ ID: Contenedor principal de la página */}
      <Box id="calendar-page-container" sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* ✅ Botón del Tour en la esquina superior derecha */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton 
            tourId={calendarTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.calendar.button', 'Ver guía del calendario')}
            options={tourOptions}
          />
        </Box>

        {/* ✅ Leyenda Responsive */}
{/* ✅ Leyenda Responsive con traducciones */}
<Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3} flexWrap="wrap" gap={2}>
  <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '1px', textTransform: 'uppercase', mr: 1 }}>
      {t('legend.statuses', 'Estados')}:
    </Typography>
    {Object.entries(APPOINTMENT_STATUSES).map(([key, status]) => (
      <Chip
        key={key}
        label={t(status.labelKey)}
        size="small"
        sx={{
          borderRadius: 0,
          bgcolor: status.color,
          color: '#fff',
          fontFamily: '"Courier New", monospace',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}
      />
    ))}
  </Box>

  <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '1px', textTransform: 'uppercase', mr: 1 }}>
      {t('legend.types', 'Tipos')}:
    </Typography>
    {Object.entries(APPOINTMENT_TYPES).map(([key, type]) => (
      <Chip
        key={key}
        label={`${type.icon} ${t(type.labelKey)}`}
        size="small"
        variant="outlined"
        sx={{
          borderRadius: 0,
          borderColor: type.color,
          color: type.color,
          fontFamily: '"Courier New", monospace',
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}
      />
    ))}
  </Box>
</Box>

        {/* ✅ Controles Responsive */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={3} gap={2}>
          <ToggleButtonGroup
            id="calendar-view-toggles" // ✅ ID para el tour
            value={calendarView}
            exclusive
            onChange={handleViewChange}
            size="small"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '& .MuiToggleButton-root': {
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                textTransform: 'none',
                letterSpacing: '0.5px',
                borderRadius: 0,
                border: '1px solid #000',
                color: '#000',
                flex: { xs: 1, sm: 'none' },
                '&.Mui-selected': {
                  bgcolor: '#000',
                  color: '#fff',
                  '&:hover': { bgcolor: '#222' }
                },
                '&:hover': { bgcolor: '#f5f5f5' }
              }
            }}
          >
            <ToggleButton value="dayGridMonth">
              <CalendarMonth sx={{ fontSize: 16, mr: 0.5 }} /> {isMobile ? 'Mes' : t('calendar.month')}
            </ToggleButton>
            <ToggleButton value="timeGridWeek">
              <ViewWeek sx={{ fontSize: 16, mr: 0.5 }} /> {isMobile ? 'Semana' : t('calendar.week')}
            </ToggleButton>
            <ToggleButton value="timeGridDay">
              <ViewDay sx={{ fontSize: 16, mr: 0.5 }} /> {isMobile ? 'Día' : t('calendar.day')}
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            id="calendar-create-btn" // ✅ ID para el tour (paso 3)
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedAppointment(null)
              setSelectedDate(null)
              setModalOpen(true)
            }}
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              bgcolor: '#000',
              color: '#fff',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
            }}
          >
            {t('createAppointment')}
          </Button>
        </Box>

        {/* ✅ Navegación Responsive */}
        <Box 
          id="calendar-navigation" // ✅ ID para el tour
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          justifyContent="space-between" 
          mb={2} 
          p={1.5} 
          bgcolor="#fff" 
          border="1px solid #ececec" 
          borderRadius={0} 
          gap={2}
        >
          <Box display="flex" gap={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
            <Button size="small" onClick={handlePrev} sx={{ minWidth: 'auto', borderRadius: 0, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              <ChevronLeft />
            </Button>
            <Button size="small" onClick={handleToday} sx={{ borderRadius: 0, bgcolor: '#000', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '0.5px', '&:hover': { bgcolor: '#222', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              <Today sx={{ fontSize: 14, mr: 0.5 }} /> {t('calendar.today')}
            </Button>
            <Button size="small" onClick={handleNext} sx={{ minWidth: 'auto', borderRadius: 0, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}>
              <ChevronRight />
            </Button>
          </Box>

          <Typography sx={{ 
            fontFamily: '"Helvetica Neue", sans-serif', 
            fontSize: { xs: '1rem', sm: '1.1rem' }, 
            fontWeight: 600, 
            color: '#000', 
            textTransform: 'capitalize',
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            {currentTitle}
          </Typography>

          <Box sx={{ width: { xs: '100%', sm: 120 } }} />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid' }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper
            id="calendar-grid" // ✅ ID para el tour (paso 4)
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              border: '1px solid #ececec',
              borderRadius: 0,
              bgcolor: '#fff',
              overflowX: 'auto',
              '& .fc': { 
                fontFamily: '"Courier New", monospace', 
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                minWidth: isMobile ? '600px' : 'auto'
              },
              '& .fc-header-toolbar': { display: 'none' },
              '& .fc-event': {
                borderRadius: 0,
                border: 'none',
                padding: 0,
                fontSize: isMobile ? '0.65rem' : '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '2px',
                '&:hover': { transform: 'scale(1.01)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10 }
              },
              '& .fc-timegrid-event': { 
                marginBottom: '4px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: isMobile ? '0.65rem' : '0.7rem'
              },
              '& .fc-daygrid-day-number': { padding: '4px 8px', fontSize: isMobile ? '0.7rem' : '0.75rem' },
              '& .fc-col-header-cell-cushion': { padding: '8px', fontSize: isMobile ? '0.65rem' : '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' },
              '& .fc-today': { backgroundColor: '#f5f5f5 !important' },
              '& .fc-daygrid-more-link': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', fontWeight: 600 },
              '& .fc-timegrid-slot-label': { fontSize: isMobile ? '0.65rem' : '0.7rem', fontFamily: '"Courier New", monospace' },
              '& .fc-timegrid-col-header': { fontSize: isMobile ? '0.65rem' : '0.7rem' }
            }}
          >
            <FullCalendar ref={calendarRef} {...calendarOptions} events={calendarEvents} />
          </Paper>
        )}

        {/* ✅ Elemento invisible para el paso final del tour (paso 5) */}
        <Box id="calendar-finish" sx={{ height: 1 }} />

        <AppointmentModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedAppointment(null); setSelectedDate(null); }}
          appointment={selectedAppointment}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
          prefillData={selectedDate ? { date: selectedDate } : {}}
          projects={projects}
          agents={agents}
        />
      </Box>
    </PageLayout>
  )
}