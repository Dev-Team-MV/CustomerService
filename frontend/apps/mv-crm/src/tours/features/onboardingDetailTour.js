export const getOnboardingDetailTourSteps = (t) => [
  {
    element: '#onboarding-detail-modal',
    popover: { 
      title: t('tour.onboardingDetail.modal.title', 'Detalles del Onboarding'), 
      description: t('tour.onboardingDetail.modal.description', 'Este modal te permite gestionar el checklist de entrega. Comenzaremos revisando el resumen superior.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#onboarding-detail-summary',
    popover: { 
      title: t('tour.onboardingDetail.summary.title', 'Resumen Superior'), 
      description: t('tour.onboardingDetail.summary.description', 'Este panel muestra de un vistazo la información clave de la propiedad, el cliente y una barra de progreso general.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-detail-items',
    popover: { 
      title: t('tour.onboardingDetail.items.title', 'Lista de Ítems'), 
      description: t('tour.onboardingDetail.items.description', 'Aquí se desglosan todas las tareas requeridas. Te explicaré cómo interactuar con el primer ítem de la lista.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-item-checkbox',
    popover: { 
      title: t('tour.onboardingDetail.checkbox.title', 'Marcar como Completado'), 
      description: t('tour.onboardingDetail.checkbox.description', 'Haz clic en este checkbox para marcar la tarea como realizada. El sistema registrará automáticamente la fecha y el usuario.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-item-notes',
    popover: { 
      title: t('tour.onboardingDetail.notes.title', 'Notas del Ítem'), 
      description: t('tour.onboardingDetail.notes.description', 'Usa este campo de texto para agregar observaciones específicas, instrucciones o comentarios sobre esta tarea en particular.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-item-upload',
    popover: { 
      title: t('tour.onboardingDetail.upload.title', 'Adjuntar Archivos'), 
      description: t('tour.onboardingDetail.upload.description', 'Haz clic aquí para subir o reemplazar el documento obligatorio asociado a este ítem del checklist.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-detail-close',
    popover: { 
      title: t('tour.onboardingDetail.close.title', 'Cerrar Modal'), 
      description: t('tour.onboardingDetail.close.description', 'Cuando termines de revisar o editar, haz clic aquí para volver a la tabla principal. Los cambios se guardan automáticamente.'),
      side: 'top',
      align: 'end'
    }
  }
]
export const onboardingDetailTourConfig = { id: 'onboarding-detail-feature', autoStart: false }