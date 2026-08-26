// /Users/oficina/MV-CRM/CustomerService/frontend/apps/mv-crm/src/tours/features/broadcastMessageTour.js
export const getBroadcastMessageTourSteps = (t) => [
  {
    element: '#broadcast-modal-project',
    popover: {
      title: t('tour.broadcast.project.title', 'Vincular a Proyecto'),
      description: t('tour.broadcast.project.description', 'Selecciona un proyecto para filtrar los destinatarios y desbloquear variables específicas de ese proyecto (como nombre del lote o edificio).'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#broadcast-modal-channels',
    popover: {
      title: t('tour.broadcast.channels.title', 'Canales de Envío'),
      description: t('tour.broadcast.channels.description', 'Elige si deseas enviar el mensaje por SMS, Correo Electrónico o ambos. El sistema validará automáticamente qué usuarios tienen datos válidos para cada canal.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#broadcast-modal-recipients',
    popover: {
      title: t('tour.broadcast.recipients.title', 'Destinatarios'),
      description: t('tour.broadcast.recipients.description', 'Puedes enviar a todos los usuarios del proyecto o seleccionar destinatarios específicos usando el buscador.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#broadcast-modal-templates',
    popover: {
      title: t('tour.broadcast.templates.title', 'Plantillas Guardadas'),
      description: t('tour.broadcast.templates.description', 'Ahorra tiempo seleccionando una plantilla predefinida. Se filtrarán automáticamente según el proyecto seleccionado.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#broadcast-modal-content',
    popover: {
      title: t('tour.broadcast.content.title', 'Contenido y Variables'),
      description: t('tour.broadcast.content.description', 'Escribe tu mensaje. Usa los chips de arriba para insertar variables dinámicas (ej: {{firstName}}). La vista previa te mostrará cómo se verá el mensaje final.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#broadcast-modal-actions',
    popover: {
      title: t('tour.broadcast.actions.title', 'Enviar Mensaje'),
      description: t('tour.broadcast.actions.description', 'Revisa el resumen de destinatarios en la parte inferior. Cuando todo esté listo, haz clic en "Enviar Mensaje" para comenzar el proceso.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const broadcastMessageTourConfig = {
  id: 'broadcast-message-feature',
  autoStart: false
}