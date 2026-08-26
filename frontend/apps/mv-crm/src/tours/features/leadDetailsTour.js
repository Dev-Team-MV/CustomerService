export const getLeadDetailsTourSteps = (t) => [
  {
    element: '#lead-details-drawer',
    popover: { title: t('tour.leadDetails.overview.title', 'Detalle del Lead'), description: t('tour.leadDetails.overview.description', 'Vista completa de la información del contacto, historial y acciones rápidas.'), side: 'left', align: 'start' }
  },
  {
    element: '#lead-details-contact',
    popover: { title: t('tour.leadDetails.contact.title', 'Información de Contacto'), description: t('tour.leadDetails.contact.description', 'Aquí ves el email, teléfono y país registrados. Haz clic en ellos para copiar o llamar.'), side: 'left', align: 'start' }
  },
  {
    element: '#lead-details-convert-btn',
    popover: { title: t('tour.leadDetails.convert.title', 'Convertir a Cliente'), description: t('tour.leadDetails.convert.description', 'Cuando el lead esté listo para comprar, usa este botón para transformarlo en un cliente formal.'), side: 'top', align: 'end' }
  },
  {
    element: '#lead-details-close-btn',
    popover: { title: t('tour.leadDetails.close.title', 'Cerrar'), description: t('tour.leadDetails.close.description', 'Cierra este panel para finalizar el tour del módulo de Ventas.'), side: 'top', align: 'end' }
  }
]

export const leadDetailsTourConfig = { id: 'lead-details-tour', autoStart: false }