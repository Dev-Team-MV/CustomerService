export const getVendorModalTourSteps = (t) => [
  {
    element: '#vendor-modal',
    popover: {
      title: t('tour.vendorModal.overview.title', 'Formulario de Proveedor'),
      description: t('tour.vendorModal.overview.description', 'Este modal te permite registrar o editar toda la información relevante de un proveedor.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#vendor-modal-basic-info',
    popover: {
      title: t('tour.vendorModal.basic.title', 'Información Básica'),
      description: t('tour.vendorModal.basic.description', 'Define el nombre del proveedor y selecciona su categoría y subcategoría principal para una correcta clasificación.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#vendor-modal-contact',
    popover: {
      title: t('tour.vendorModal.contact.title', 'Contacto y Ubicación'),
      description: t('tour.vendorModal.contact.description', 'Agrega uno o más teléfonos, busca su dirección en el mapa, asígnalo a un proyecto específico y añade su sitio web.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#vendor-modal-actions',
    popover: {
      title: t('tour.vendorModal.actions.title', 'Guardar Cambios'),
      description: t('tour.vendorModal.actions.description', 'Revisa que toda la información sea correcta y haz clic en "Guardar" o "Actualizar" para registrar al proveedor.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const vendorModalTourConfig = {
  id: 'vendor-modal-feature',
  autoStart: false
}