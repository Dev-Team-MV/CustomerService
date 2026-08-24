export const getVendorTourSteps = (t) => [
  {
    element: '#vendors-page-container',
    popover: {
      title: t('tour.vendors.overview.title', 'Módulo de Proveedores'),
      description: t('tour.vendors.overview.description', 'Desde aquí puedes gestionar el directorio completo de proveedores, filtrarlos por categoría, proyecto o alcance.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#vendors-filters',
    popover: {
      title: t('tour.vendors.filters.title', 'Filtros Avanzados'),
      description: t('tour.vendors.filters.description', 'Utiliza la búsqueda por nombre, categoría, subcategoría, proyecto o alcance para encontrar rápidamente al proveedor que necesitas.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#vendors-grid',
    popover: {
      title: t('tour.vendors.grid.title', 'Directorio de Proveedores'),
      description: t('tour.vendors.grid.description', 'Aquí se muestran todos los proveedores registrados. Te explicaré los detalles de la primera tarjeta.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#vendor-card-first',
    popover: {
      title: t('tour.vendors.card.title', 'Tarjeta de Proveedor'),
      description: t('tour.vendors.card.description', 'Cada tarjeta muestra la foto, nombre, proyecto asociado, categoría, teléfono, ubicación y sitio web de un vistazo.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#vendor-card-actions',
    popover: {
      title: t('tour.vendors.cardActions.title', 'Acciones Rápidas'),
      description: t('tour.vendors.cardActions.description', 'Usa estos iconos para editar la información del proveedor o eliminarlo del sistema.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#vendors-add-btn',
    popover: {
      title: t('tour.vendors.add.title', 'Agregar Proveedor'),
      description: t('tour.vendors.add.description', 'Haz clic aquí para abrir el formulario de registro. Te guiaré a través de sus campos.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#vendors-page-container',
    popover: {
      title: t('tour.vendors.finish.title', '¡Listo!'),
      description: t('tour.vendors.finish.description', 'Ya dominas la gestión de proveedores. ¡Mantén tu directorio actualizado para optimizar tus proyectos!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const vendorTourConfig = {
  id: 'vendors-onboarding',
  autoStart: false
}