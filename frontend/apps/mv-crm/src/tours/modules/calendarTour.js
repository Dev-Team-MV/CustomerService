export const getCalendarTourSteps = (t) => [
  {
    element: '#calendar-page-container',
    popover: {
      title: t('tour.calendar.overview.title', 'Calendario de Citas'),
      description: t('tour.calendar.overview.description', 'Aquí tienes una vista centralizada de todas tus citas, reuniones y llamadas programadas.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#calendar-view-toggles',
    popover: {
      title: t('tour.calendar.views.title', 'Vistas del Calendario'),
      description: t('tour.calendar.views.description', 'Cambia fácilmente entre la vista de Mes, Semana o Día para organizar tu agenda según tus necesidades.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#calendar-navigation',
    popover: {
      title: t('tour.calendar.navigation.title', 'Navegación de Fechas'),
      description: t('tour.calendar.navigation.description', 'Navega hacia adelante o atrás en el tiempo, o vuelve al día de hoy con un solo clic.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#calendar-create-btn',
    popover: {
      title: t('tour.calendar.create.title', 'Crear Nueva Cita'),
      description: t('tour.calendar.create.description', 'Haz clic aquí para agendar una nueva cita. Te guiaré a través del formulario de creación.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#calendar-grid',
    popover: {
      title: t('tour.calendar.grid.title', 'Cuadrícula de Eventos'),
      description: t('tour.calendar.grid.description', 'Haz clic en cualquier día/hora vacío para crear una cita rápida, o haz clic en una cita existente para ver sus detalles o cambiar su estado.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#calendar-page-container',
    popover: {
      title: t('tour.calendar.finish.title', '¡Listo!'),
      description: t('tour.calendar.finish.description', 'Ya dominas el calendario. ¡Gestiona tu tiempo y tus citas de manera eficiente!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const calendarTourConfig = {
  id: 'calendar-onboarding',
  autoStart: false
}