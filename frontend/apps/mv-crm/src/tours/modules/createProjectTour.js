export const getCreateProjectTourSteps = (t) => [
  {
    element: '#create-project-dialog',
    popover: {
      title: t('project:tour.modals.createProject.welcome.title', 'Asistente de Creación de Proyecto'),
      description: t('project:tour.modals.createProject.welcome.description', 
        'Te guiaré por todas las secciones del formulario. Puedes pausar y retomar el tour en cualquier momento.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#create-project-tabs',
    popover: {
      title: t('project:tour.modals.createProject.tabs.title', 'Configuración Bilingüe'),
      description: t('project:tour.modals.createProject.tabs.description', 
        'Configura la información del proyecto en ambos idiomas. Al alternar entre tabs, los datos de cada idioma se conservan.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#create-project-general-info',
    popover: {
      title: t('project:tour.modals.createProject.generalInfo.title', 'Información General'),
      description: t('project:tour.modals.createProject.generalInfo.description', 
        'Define título, subtítulo, descripciones y características. Esta información aparece en el portal público del proyecto.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#create-project-name-slug',
    popover: {
      title: t('project:tour.modals.createProject.nameSlug.title', 'Nombre y Slug'),
      description: t('project:tour.modals.createProject.nameSlug.description', 
        'El nombre es el identificador interno del proyecto. El slug se usa en las URLs del portal y debe ser único en el sistema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#create-project-property-details',
    popover: {
      title: t('project:tour.modals.createProject.propertyDetails.title', 'Detalles de Propiedad'),
      description: t('project:tour.modals.createProject.propertyDetails.description', 
        'Define la fase de construcción, estado, tipo de proyecto, ubicación y área total del desarrollo.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#create-project-media-assets',
    popover: {
      title: t('project:tour.modals.createProject.media.title', 'Recursos Multimedia'),
      description: t('project:tour.modals.createProject.media.description', 
        'Sube imagen principal, logo, galería de fotos y videos. Estos se muestran en el portal público y documentos.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#create-project-brand-colors',
    popover: {
      title: t('project:tour.modals.createProject.brandColors.title', 'Colores de Marca'),
      description: t('project:tour.modals.createProject.brandColors.description', 
        'Define la paleta de colores del proyecto. Usa formato "primary:#333F1F" o simplemente "#333F1F". Se usan en el portal y documentos.'),
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#create-project-actions',
    popover: {
      title: t('project:tour.modals.createProject.actions.title', 'Guardar Proyecto'),
      description: t('project:tour.modals.createProject.actions.description', 
        'Cuando termines, guarda el proyecto. Una vez creado, podrás configurar las variables de mensajes en modo edición.'),
      side: 'top',
      align: 'center'
    }
  }
]

export const createProjectTourConfig = {
  id: 'create-project-modal',
  autoStart: false
}