export const getAppointmentTourSteps = (t) => [
  {
    element: '#appointment-modal-title',
    popover: {
      title: t('tour.appointment.title.title', 'Título y Estado'),
      description: t('tour.appointment.title.description', 'Define un nombre claro para la cita y su estado actual (Pendiente, Confirmada, Completada o Cancelada).'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#appointment-modal-contact',
    popover: {
      title: t('tour.appointment.contact.title', 'Seleccionar Contacto'),
      description: t('tour.appointment.contact.description', 'Elige si la cita es con un Lead (prospecto) o con un Cliente (residente) ya registrado en el sistema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#appointment-modal-project',
    popover: {
      title: t('tour.appointment.project.title', 'Proyecto Asociado'),
      description: t('tour.appointment.project.description', 'Vincula la cita a un proyecto inmobiliario específico para mantener el contexto de la reunión.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#appointment-modal-datetime',
    popover: {
      title: t('tour.appointment.datetime.title', 'Fecha y Hora'),
      description: t('tour.appointment.datetime.description', 'Establece la fecha y hora de inicio. Opcionalmente, define la hora de fin para calcular la duración automática.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#appointment-modal-actions',
    popover: {
      title: t('tour.appointment.actions.title', 'Guardar Cita'),
      description: t('tour.appointment.actions.description', 'Revisa que todos los campos obligatorios estén completos y haz clic en "Crear" o "Actualizar" para guardar.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const appointmentTourConfig = {
  id: 'appointment-feature',
  autoStart: false
}