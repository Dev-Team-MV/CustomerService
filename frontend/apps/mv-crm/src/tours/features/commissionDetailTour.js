export const getCommissionDetailTourSteps = (t) => [
  {
    element: '#commission-detail-modal',
    popover: {
      title: t('tour.commissionDetail.modal.title', 'Modal de Detalles'),
      description: t('tour.commissionDetail.modal.description', 'Este modal te permite ver toda la información de la comisión y realizar acciones sobre ella.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#commission-detail-overview',
    popover: {
      title: t('tour.commissionDetail.overview.title', 'Información General'),
      description: t('tour.commissionDetail.overview.description', 'Aquí ves el agente, proyecto, montos de venta y comisión, así como cualquier división de la comisión con otros agentes.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#commission-detail-actions',
    popover: {
      title: t('tour.commissionDetail.actions.title', 'Acciones del Modal'),
      description: t('tour.commissionDetail.actions.description', 'Desde aquí puedes Aprobar la comisión, Marcarla como Pagada o Cerrar el modal para volver al listado.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const commissionDetailTourConfig = {
  id: 'commission-detail-feature',
  autoStart: false
}