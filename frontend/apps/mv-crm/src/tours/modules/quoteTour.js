// apps/mv-crm/src/tours/modules/quoteTour.js
export const getQuoteTourSteps = (t) => [
  {
    element: '#quotes-page-container',
    popover: { title: t('tour.quotes.overview.title', 'Módulo de Cotizaciones'), description: t('tour.quotes.overview.description', 'Desde aquí puedes crear, enviar y convertir cotizaciones con tablas de amortización detalladas.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#quotes-stats',
    popover: { title: t('tour.quotes.stats.title', 'Estadísticas Rápidas'), description: t('tour.quotes.stats.description', 'Visualiza el total de cotizaciones y cuántas han sido enviadas o convertidas en ventas.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#quotes-create-btn',
    popover: { title: t('tour.quotes.create.title', 'Nueva Cotización'), description: t('tour.quotes.create.description', 'Haz clic aquí para iniciar el asistente de 3 pasos. Te guiaré a través del proceso.'), side: 'bottom', align: 'end' }
  },
  {
    element: '#quotes-data-table',
    popover: { title: t('tour.quotes.table.title', 'Listado de Cotizaciones'), description: t('tour.quotes.table.description', 'Aquí se listan todas las cotizaciones. Te explicaré cada columna y sus acciones.'), side: 'top', align: 'start' }
  },
  {
    element: '#quotes-col-date',
    popover: { title: t('tour.quotes.colDate.title', 'Fecha'), description: t('tour.quotes.colDate.description', 'La fecha en que se creó la cotización.'), side: 'top', align: 'start' }
  },
  {
    element: '#quotes-col-client',
    popover: { title: t('tour.quotes.colClient.title', 'Cliente o Lead'), description: t('tour.quotes.colClient.description', 'Muestra a quién va dirigida la cotización.'), side: 'top', align: 'start' }
  },
  {
    element: '#quotes-col-project',
    popover: { title: t('tour.quotes.colProject.title', 'Proyecto'), description: t('tour.quotes.colProject.description', 'El proyecto inmobiliario al que pertenece la cotización.'), side: 'top', align: 'start' }
  },
  {
    element: '#quotes-col-total',
    popover: { title: t('tour.quotes.colTotal.title', 'Precio Total'), description: t('tour.quotes.colTotal.description', 'El monto total de la propiedad con las opciones de personalización seleccionadas.'), side: 'top', align: 'start' }
  },
  {
    element: '#quotes-col-status',
    popover: { title: t('tour.quotes.colStatus.title', 'Estado'), description: t('tour.quotes.colStatus.description', 'Indica si es un borrador, fue enviada, aceptada, expirada o ya se convirtió en venta.'), side: 'top', align: 'start' }
  },
  {
    element: '#quotes-col-actions',
    popover: { title: t('tour.quotes.colActions.title', 'Columna de Acciones'), description: t('tour.quotes.colActions.description', 'Aquí tienes los botones para gestionar cada cotización. Te los explicaré uno por uno.'), side: 'left', align: 'start' }
  },
  {
    element: '#quotes-action-edit',
    popover: { title: t('tour.quotes.actionEdit.title', 'Editar'), description: t('tour.quotes.actionEdit.description', 'Abre el asistente de 3 pasos para modificar los detalles de la cotización.'), side: 'left', align: 'start' }
  },
  {
    element: '#quotes-action-send',
    popover: { title: t('tour.quotes.actionSend.title', 'Enviar Cotización'), description: t('tour.quotes.actionSend.description', 'Al hacer clic en "Siguiente", abriremos el modal para enviar la cotización por Email o SMS.'), side: 'left', align: 'start' }
  },
  {
    element: '#quotes-action-convert',
    popover: { title: t('tour.quotes.actionConvert.title', 'Convertir a Venta'), description: t('tour.quotes.actionConvert.description', 'Al hacer clic en "Siguiente", abriremos el modal para convertir esta cotización en una venta real.'), side: 'left', align: 'start' }
  },
  {
    element: '#quotes-action-pdf',
    popover: { title: t('tour.quotes.actionPdf.title', 'Descargar PDF'), description: t('tour.quotes.actionPdf.description', 'Descarga la cotización en formato PDF para compartirla o archivarla.'), side: 'left', align: 'start' }
  },
  {
    element: '#quotes-action-delete',
    popover: { title: t('tour.quotes.actionDelete.title', 'Eliminar'), description: t('tour.quotes.actionDelete.description', 'Elimina permanentemente la cotización del sistema.'), side: 'left', align: 'start' }
  },
  {
    element: '#quotes-page-container',
    popover: { title: t('tour.quotes.finish.title', '¡Listo!'), description: t('tour.quotes.finish.description', 'Ya dominas el módulo de cotizaciones. ¡Genera propuestas profesionales y cierra más ventas!'), side: 'top', align: 'center' }
  }
]

export const quoteTourConfig = { id: 'quotes-onboarding', autoStart: false }