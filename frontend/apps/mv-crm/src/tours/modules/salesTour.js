export const getSalesTourSteps = (t) => [
  {
    element: '#sales-page-container',
    popover: { title: t('tour.sales.overview.title', 'Módulo de Ventas'), description: t('tour.sales.overview.description', 'Gestiona todo el embudo de ventas. Aquí puedes crear, mover, convertir y dar seguimiento a tus leads.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#sales-new-lead-btn',
    popover: { title: t('tour.sales.newLeadBtn.title', 'Nuevo Lead'), description: t('tour.sales.newLeadBtn.description', 'Al hacer clic en "Siguiente", abriremos el formulario para registrar un nuevo contacto en el embudo.'), side: 'bottom', align: 'end' }
  },
  {
    element: '#sales-search-filter',
    popover: { title: t('tour.sales.search.title', 'Búsqueda y Orden'), description: t('tour.sales.search.description', 'Filtra leads por nombre, email o teléfono. También puedes ordenar por fecha de creación o por Score (prioridad).'), side: 'bottom', align: 'start' }
  },
  {
    element: '#sales-export-btn',
    popover: { title: t('tour.sales.export.title', 'Exportar Datos'), description: t('tour.sales.export.description', 'Descarga la información de tus leads en Excel o CSV. Puedes aplicar filtros de fecha, proyecto, etapa o asesor antes de exportar.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#sales-kanban-board',
    popover: { title: t('tour.sales.kanban.title', 'Tablero Kanban'), description: t('tour.sales.kanban.description', 'Visualiza el flujo de trabajo. Arrastra las tarjetas entre columnas para cambiar la etapa del lead.'), side: 'top', align: 'start' }
  },
  {
    element: '[data-tour-lead-card="true"]',
    popover: { title: t('tour.sales.leadCard.title', 'Tarjeta de Lead'), description: t('tour.sales.leadCard.description', 'Al hacer clic en "Siguiente", abriremos los detalles de este lead para ver su información completa.'), side: 'top', align: 'start' }
  },
  {
    element: '#sales-page-container',
    popover: { title: t('tour.sales.finish.title', '¡Tour Completado!'), description: t('tour.sales.finish.description', 'Ahora dominas el módulo de Ventas. ¡Comienza a cerrar tratos!'), side: 'top', align: 'center' }
  }
]

export const salesTourConfig = { id: 'sales-main-tour', autoStart: false }