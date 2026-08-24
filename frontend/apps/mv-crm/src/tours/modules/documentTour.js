export const getDocumentTourSteps = (t) => [
  {
    element: '#documents-page-container',
    popover: {
      title: t('tour.documents.overview.title', 'Módulo de Documentos'),
      description: t('tour.documents.overview.description', 'Centraliza y gestiona todos los archivos, contratos y planos de tus proyectos y clientes en un solo lugar seguro.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#documents-dropzone',
    popover: {
      title: t('tour.documents.dropzone.title', 'Zona de Carga Rápida'),
      description: t('tour.documents.dropzone.description', 'Arrastra y suelta archivos aquí directamente, o haz clic en cualquier parte de esta zona para abrir el asistente de subida.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#documents-search-filters',
    popover: {
      title: t('tour.documents.filters.title', 'Búsqueda y Filtros'),
      description: t('tour.documents.filters.description', 'Encuentra cualquier documento en segundos filtrando por categoría, proyecto, cliente o etiquetas, o usa el buscador de texto libre.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#documents-view-toggle',
    popover: {
      title: t('tour.documents.viewToggle.title', 'Modo de Visualización'),
      description: t('tour.documents.viewToggle.description', 'Alterna entre una vista de cuadrícula (ideal para ver detalles de un vistazo) o una vista de lista compacta para mayor densidad de información.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#documents-grid, #documents-list',
    popover: {
      title: t('tour.documents.list.title', 'Listado de Documentos'),
      description: t('tour.documents.list.description', 'Aquí se muestran todos los documentos que coinciden con tus filtros. Te explicaré la anatomía de la primera tarjeta.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#document-card-first',
    popover: {
      title: t('tour.documents.card.title', 'Anatomía de la Tarjeta'),
      description: t('tour.documents.card.description', 'Cada tarjeta muestra: el icono de categoría, el título con su versión, un chip de estado (Vigente, Por vencer, Expirado o Archivado) y sus relaciones directas con Proyectos, Clientes o Propiedades.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#doc-action-preview',
    popover: {
      title: t('tour.documents.actionPreview.title', '1. Previsualizar'),
      description: t('tour.documents.actionPreview.description', 'Al hacer clic en "Siguiente", abriremos el visor para que veas el documento sin necesidad de descargarlo.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#doc-action-history',
    popover: {
      title: t('tour.documents.actionHistory.title', '2. Historial de Versiones'),
      description: t('tour.documents.actionHistory.description', 'Ahora abriremos el panel lateral para ver cómo el sistema guarda el historial de cambios y actualizaciones de este archivo.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#documents-upload-btn',
    popover: {
      title: t('tour.documents.upload.title', '3. Subir Nuevo Documento'),
      description: t('tour.documents.upload.description', 'Finalmente, haz clic aquí para abrir el asistente de carga y vinculación de archivos. Te guiaré a través de sus campos.'),
      side: 'top',
      align: 'end'
    }
  },
  {
    element: '#documents-page-container',
    popover: {
      title: t('tour.documents.finish.title', '¡Listo!'),
      description: t('tour.documents.finish.description', 'Ya dominas la gestión documental. ¡Mantén tus archivos organizados, vinculados y siempre actualizados!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const documentTourConfig = {
  id: 'documents-onboarding',
  autoStart: false
}