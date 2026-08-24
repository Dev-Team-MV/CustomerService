export const getProjectsTourSteps = (t) => [
  {
    element: '#projects-page-container',
    popover: { 
      title: t('tour.projects.overview.title', 'Módulo de Proyectos'), 
      description: t('tour.projects.overview.description', 'Aquí gestionas todos los desarrollos inmobiliarios. Podrás crear, editar, ver estadísticas y administrar la configuración de cada proyecto.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#projects-create-btn',
    popover: { 
      title: t('tour.projects.createBtn.title', 'Crear Nuevo Proyecto'), 
      description: t('tour.projects.createBtn.description', 'Al hacer clic en "Siguiente", iniciaremos un asistente paso a paso para configurar un nuevo proyecto desde cero.'), 
      side: 'bottom', 
      align: 'end' 
    }
  },
  {
    element: '#projects-stats-strip',
    popover: { 
      title: t('tour.projects.stats.title', 'Resumen Rápido'), 
      description: t('tour.projects.stats.description', 'Visualiza de un vistazo el total de proyectos, cuántos están activos y la variedad de tipos de desarrollo registrados.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#projects-search-bar',
    popover: { 
      title: t('tour.projects.search.title', 'Búsqueda'), 
      description: t('tour.projects.search.description', 'Filtra la tabla en tiempo real escribiendo el nombre o slug del proyecto.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#projects-data-table',
    popover: { 
      title: t('tour.projects.table.title', 'Tabla de Proyectos'), 
      description: t('tour.projects.table.description', 'Aquí se listan todos los proyectos. Te explicaré el significado de cada columna.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#projects-col-name',
    popover: { 
      title: t('tour.projects.colName.title', 'Nombre y Slug'), 
      description: t('tour.projects.colName.description', 'El nombre comercial del proyecto y su identificador único para URLs (slug).'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#projects-col-type',
    popover: { 
      title: t('tour.projects.colType.title', 'Tipo'), 
      description: t('tour.projects.colType.description', 'La categoría del desarrollo (ej: casas, apartamentos, mixto).'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#projects-col-status',
    popover: { 
      title: t('tour.projects.colStatus.title', 'Estado'), 
      description: t('tour.projects.colStatus.description', 'Indica si el proyecto está actualmente activo o inactivo en el sistema.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#projects-col-phase',
    popover: { 
      title: t('tour.projects.colPhase.title', 'Fase'), 
      description: t('tour.projects.colPhase.description', 'La etapa actual de construcción o comercialización del proyecto.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#projects-col-actions',
    popover: { 
      title: t('tour.projects.colActions.title', 'Acciones'), 
      description: t('tour.projects.colActions.description', 'Botones para ver estadísticas detalladas, visitar el portal, editar o eliminar el proyecto.'), 
      side: 'left', 
      align: 'start' 
    }
  },
  {
    element: '#projects-action-stats',
    popover: { 
      title: t('tour.projects.actionStats.title', 'Ver Estadísticas'), 
      description: t('tour.projects.actionStats.description', 'Al hacer clic en "Siguiente", abriremos el panel de estadísticas para analizar el balance y los clientes de este proyecto.'), 
      side: 'left', 
      align: 'start' 
    }
  },
    {
    element: '#project-action-view',
    popover: { 
      title: t('tour.projects.actionView.title', 'Ver Detalles'), 
      description: t('tour.projects.actionView.description', 'Al hacer clic en "Siguiente", navegaremos a la vista de detalles de este proyecto para continuar el tour.'), 
      side: 'left', 
      align: 'start' 
    }
  },
  {
    element: '#projects-finish',
    popover: { 
      title: t('tour.projects.finish.title', '¡Tour Completado!'), 
      description: t('tour.projects.finish.description', 'Ahora dominas la gestión de proyectos. ¡Comienza a crear y administrar tus desarrollos!'), 
      side: 'top', 
      align: 'center' 
    }
  }
]

export const projectsTourConfig = { id: 'projects-main-tour', autoStart: false }