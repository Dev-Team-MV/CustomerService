export const getBroadcastMessageTourSteps = (t) => [
  {
    element: '#notif-creator-mode',
    popover: {
      title: t('tour.notifCreator.mode.title', 'Modo de Destinatarios'),
      description: t('tour.notifCreator.mode.description', 'Elige si enviarás a todos (General), a un rol específico, a un usuario o a múltiples usuarios.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#notif-creator-title',
    popover: {
      title: t('tour.notifCreator.title.title', 'Título de la Notificación'),
      description: t('tour.notifCreator.title.description', 'Escribe un asunto claro y conciso. Este será lo primero que vea el usuario.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#notif-creator-body',
    popover: {
      title: t('tour.notifCreator.body.title', 'Cuerpo del Mensaje'),
      description: t('tour.notifCreator.body.description', 'Detalla la información importante. Puedes usar múltiples líneas para mayor claridad.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#notif-creator-type',
    popover: {
      title: t('tour.notifCreator.type.title', 'Tipo de Notificación'),
      description: t('tour.notifCreator.type.description', 'Selecciona la urgencia: Información (Azul), Advertencia (Naranja), Error (Rojo) o Personalizado (Morado).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#notif-creator-audience',
    popover: {
      title: t('tour.notifCreator.audience.title', 'Filtro de Audiencia'),
      description: t('tour.notifCreator.audience.description', 'Este campo cambia según el modo elegido. Selecciona los roles o usuarios específicos que recibirán el mensaje.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#notif-creator-preview',
    popover: {
      title: t('tour.notifCreator.preview.title', 'Vista Previa'),
      description: t('tour.notifCreator.preview.description', 'Así es como se verá la notificación en el dispositivo del usuario, con su respectivo color de tipo.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#notif-creator-actions',
    popover: {
      title: t('tour.notifCreator.actions.title', 'Enviar Notificación'),
      description: t('tour.notifCreator.actions.description', 'Revisa que todo esté correcto y haz clic en "Enviar". Los destinatarios la recibirán al instante.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const broadcastMessageTourConfig = {
  id: 'broadcast-message-feature',
  autoStart: false
}