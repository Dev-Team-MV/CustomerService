export const getWarrantyDetailTourSteps = (t) => [
  {
    element: '#warranty-detail-modal',
    popover: {
      title: t('tour.warrantyDetail.modal.title', 'Detalles del Reclamo'),
      description: t('tour.warrantyDetail.modal.description', 'Aquí puedes revisar toda la información del reclamo, su historial y tomar acciones de resolución.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#warranty-detail-info',
    popover: {
      title: t('tour.warrantyDetail.info.title', 'Información General'),
      description: t('tour.warrantyDetail.info.description', 'Muestra el cliente, propiedad, categoría, prioridad, descripción del problema y la evidencia fotográfica adjunta.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-detail-timeline',
    popover: {
      title: t('tour.warrantyDetail.timeline.title', 'Línea de Tiempo'),
      description: t('tour.warrantyDetail.timeline.description', 'Registro cronológico de todos los cambios de estado y notas añadidas al reclamo desde su creación.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-detail-actions',
    popover: {
      title: t('tour.warrantyDetail.actions.title', 'Acciones de Resolución'),
      description: t('tour.warrantyDetail.actions.description', 'Desde aquí puedes aprobar, rechazar o marcar el reclamo como resuelto, agregando las notas finales correspondientes.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const warrantyDetailTourConfig = { id: 'warranty-detail-feature', autoStart: false }