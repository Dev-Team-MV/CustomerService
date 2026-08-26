export const getProjectDetailsTourSteps = (t) => [
  {
    element: '#project-details-page-container',
    popover: { 
      title: t('tour.projectDetails.overview.title', 'Detalle del Proyecto'), 
      description: t('tour.projectDetails.overview.description', 'Esta es la vista completa del proyecto. Aquí puedes gestionar toda la información, documentos e inventario.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#project-details-hero',
    popover: { 
      title: t('tour.projectDetails.hero.title', 'Imagen Principal'), 
      description: t('tour.projectDetails.hero.description', 'La imagen de portada y el logo del proyecto, junto con su estado actual.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#project-details-main-tabs',
    popover: { 
      title: t('tour.projectDetails.tabs.title', 'Pestañas Principales'), 
      description: t('tour.projectDetails.tabs.description', 'Navega entre la Información general, los Documentos adjuntos y el Inventario de propiedades.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#project-details-info-section',
    popover: { 
      title: t('tour.projectDetails.info.title', 'Información General'), 
      description: t('tour.projectDetails.info.description', 'Aquí se muestran las estadísticas rápidas, el branding, la descripción y las características del proyecto.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#project-details-gallery',
    popover: { 
      title: t('tour.projectDetails.gallery.title', 'Galería Multimedia'), 
      description: t('tour.projectDetails.gallery.description', 'Visualiza y gestiona las imágenes y videos asociados al proyecto.'), 
      side: 'left', 
      align: 'start' 
    }
  },
  {
    element: '#project-documents-tab',
    popover: { 
      title: t('tour.projectDetails.documentsTab.title', 'Ir a Documentos'), 
      description: t('tour.projectDetails.documentsTab.description', 'Al hacer clic en "Siguiente", navegaremos a la pestaña de Documentos para ver los archivos del proyecto.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#project-documents-container',
    popover: { 
      title: t('tour.projectDetails.documents.title', 'Gestión de Documentos'), 
      description: t('tour.projectDetails.documents.description', 'Aquí puedes subir, visualizar y gestionar todos los documentos del proyecto: contratos, escrituras, permisos, etc.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#project-documents-upload-btn',
    popover: { 
      title: t('tour.projectDetails.documentsUpload.title', 'Subir Documento'), 
      description: t('tour.projectDetails.documentsUpload.description', 'Haz clic aquí para subir un nuevo documento al proyecto. Puedes categorizarlo y asignarlo a un cliente específico.'), 
      side: 'left', 
      align: 'start' 
    }
  },
  {
    element: '#project-inventory-tab',
    popover: { 
      title: t('tour.projectDetails.inventoryTab.title', 'Ir a Inventario'), 
      description: t('tour.projectDetails.inventoryTab.description', 'Al hacer clic en "Siguiente", iremos a la pestaña de Inventario para ver el estado de las propiedades.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#project-inventory-container',
    popover: { 
      title: t('tour.projectDetails.inventory.title', 'Inventario de Propiedades'), 
      description: t('tour.projectDetails.inventory.description', 'Visualiza el Master Plan del proyecto con las estadísticas de unidades disponibles, pendientes y vendidas.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#project-inventory-stats',
    popover: { 
      title: t('tour.projectDetails.inventoryStats.title', 'Estadísticas Rápidas'), 
      description: t('tour.projectDetails.inventoryStats.description', 'Tarjetas con el resumen del inventario: total de edificios/unidades, disponibles, pendientes y vendidas.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#project-inventory-masterplan',
    popover: { 
      title: t('tour.projectDetails.inventoryMasterplan.title', 'Master Plan Interactivo'), 
      description: t('tour.projectDetails.inventoryMasterplan.description', 'Mapa del proyecto con polígonos que representan cada edificio. Haz clic para ver detalles específicos.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#project-details-page-container',
    popover: { 
      title: t('tour.projectDetails.finish.title', '¡Tour Completado!'), 
      description: t('tour.projectDetails.finish.description', 'Has completado el recorrido del módulo de Proyectos. ¡Ahora puedes gestionar tus desarrollos de principio a fin!'), 
      side: 'top', 
      align: 'center' 
    }
  }
]

export const projectDetailsTourConfig = { id: 'project-details-tour', autoStart: false }