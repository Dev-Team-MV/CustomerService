export const getReportsTourSteps = (t) => [
  {
    element: '#reports-page-container',
    popover: { 
      title: t('tour.reports.overview.title', 'Módulo de Reportes'), 
      description: t('tour.reports.overview.description', 'Centro centralizado para exportar y analizar los datos de Clientes, Pagos y Leads de tu CRM.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#reports-clients-section',
    popover: { 
      title: t('tour.reports.clientsSection.title', 'Reporte de Clientes'), 
      description: t('tour.reports.clientsSection.description', 'Exporta la base de datos completa de tus clientes. Puedes filtrar por proyecto específico.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#clients-report-project',
    popover: { 
      title: t('tour.reports.clientsProject.title', 'Filtro de Proyecto'), 
      description: t('tour.reports.clientsProject.description', 'Selecciona un proyecto para descargar solo los clientes asociados a él, o déjalo vacío para todos.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#clients-report-export',
    popover: { 
      title: t('tour.reports.clientsExport.title', 'Exportar Clientes'), 
      description: t('tour.reports.clientsExport.description', 'Elige el formato (CSV o Excel) y haz clic para descargar el reporte inmediatamente.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#reports-payments-section',
    popover: { 
      title: t('tour.reports.paymentsSection.title', 'Reporte de Pagos'), 
      description: t('tour.reports.paymentsSection.description', 'Obtén un historial detallado de los pagos realizados en un rango de fechas específico.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#payments-report-date-from',
    popover: { 
      title: t('tour.reports.paymentsDates.title', 'Rango de Fechas'), 
      description: t('tour.reports.paymentsDates.description', 'Es obligatorio definir una fecha de inicio y una de fin para generar este reporte.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#payments-report-project',
    popover: { 
      title: t('tour.reports.paymentsProject.title', 'Filtro de Proyecto'), 
      description: t('tour.reports.paymentsProject.description', 'Filtra los pagos para ver el flujo de caja de un proyecto en particular.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#payments-report-export',
    popover: { 
      title: t('tour.reports.paymentsExport.title', 'Exportar Pagos'), 
      description: t('tour.reports.paymentsExport.description', 'El botón se habilitará solo cuando las fechas sean válidas. Descarga el reporte en el formato elegido.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#reports-leads-section',
    popover: { 
      title: t('tour.reports.leadsSection.title', 'Reporte de Leads'), 
      description: t('tour.reports.leadsSection.description', 'Exporta tu embudo de ventas. Este reporte incluye filtros avanzados en un modal.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#leads-report-export-btn',
    popover: { 
      title: t('tour.reports.leadsExport.title', 'Abrir Filtros Avanzados'), 
      description: t('tour.reports.leadsExport.description', 'Al hacer clic en "Siguiente", abriremos el modal para filtrar leads por etapa, agente o proyecto antes de exportar.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#leads-export-modal',
    popover: { 
      title: t('tour.reports.leadsModal.title', 'Filtros de Exportación'), 
      description: t('tour.reports.leadsModal.description', 'Aquí puedes refinar tu búsqueda por fechas, proyecto, etapa del embudo o agente asignado antes de descargar.'), 
      side: 'left', 
      align: 'start' 
    }
  },
  {
    element: '#leads-export-modal-close',
    popover: { 
      title: t('tour.reports.leadsModalClose.title', 'Cerrar Modal'), 
      description: t('tour.reports.leadsModalClose.description', 'Haz clic aquí para cerrar el modal y finalizar el tour del módulo de Reportes.'), 
      side: 'top', 
      align: 'end' 
    }
  },
  {
    element: '#reports-finish',
    popover: { 
      title: t('tour.reports.finish.title', '¡Tour Completado!'), 
      description: t('tour.reports.finish.description', 'Ahora sabes cómo generar y descargar todos los reportes clave de tu operación.'), 
      side: 'top', 
      align: 'center' 
    }
  }
]

export const reportsTourConfig = { id: 'reports-onboarding', autoStart: false }