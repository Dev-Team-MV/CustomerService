export const getMessageTemplatesTourSteps = (t) => [
  { element: '#message-templates-page-container', popover: { title: t('tour.messageTemplates.overview.title', 'Plantillas de Mensajes'), description: t('tour.messageTemplates.overview.description', 'Gestiona las plantillas reutilizables para tus campañas de SMS y correos masivos.'), side: 'bottom', align: 'center' } },
  { element: '#message-templates-filters', popover: { title: t('tour.messageTemplates.filters.title', 'Búsqueda y Filtros'), description: t('tour.messageTemplates.filters.description', 'Busca plantillas por nombre o contenido, y filtra por proyecto específico o plantillas globales.'), side: 'bottom', align: 'start' } },
  { element: '#message-templates-new-btn', popover: { title: t('tour.messageTemplates.newBtn.title', 'Nueva Plantilla'), description: t('tour.messageTemplates.newBtn.description', 'Al hacer clic en "Siguiente", abriremos el formulario para crear una nueva plantilla.'), side: 'bottom', align: 'end' } },
  { element: '#message-templates-data-table', popover: { title: t('tour.messageTemplates.table.title', 'Tabla de Plantillas'), description: t('tour.messageTemplates.table.description', 'Aquí ves todas las plantillas creadas. Te explicaré cada columna.'), side: 'top', align: 'start' } },
  { element: '#message-templates-col-name', popover: { title: t('tour.messageTemplates.colName.title', 'Nombre y Categoría'), description: t('tour.messageTemplates.colName.description', 'El nombre de la plantilla y su categoría (ej: Bienvenida, Recordatorio, etc.).'), side: 'top', align: 'start' } },
  { element: '#message-templates-col-project', popover: { title: t('tour.messageTemplates.colProject.title', 'Proyecto'), description: t('tour.messageTemplates.colProject.description', 'Muestra si la plantilla es Global (para todos los proyectos) o específica de un proyecto.'), side: 'top', align: 'start' } },
  { element: '#message-templates-col-content', popover: { title: t('tour.messageTemplates.colContent.title', 'Contenido'), description: t('tour.messageTemplates.colContent.description', 'Vista previa del mensaje de la plantilla. Si es muy largo, se trunca con puntos suspensivos.'), side: 'top', align: 'start' } },
  { element: '#message-templates-col-variables', popover: { title: t('tour.messageTemplates.colVariables.title', 'Variables'), description: t('tour.messageTemplates.colVariables.description', 'Las variables dinámicas que usa la plantilla (ej: {{nombre}}, {{proyecto}}). Se reemplazan automáticamente al enviar.'), side: 'top', align: 'start' } },
  { element: '#message-templates-col-status', popover: { title: t('tour.messageTemplates.colStatus.title', 'Estado'), description: t('tour.messageTemplates.colStatus.description', 'Indica si la plantilla está Activa (disponible para usar) o Inactiva (archivada).'), side: 'top', align: 'start' } },
  { element: '#message-templates-col-actions', popover: { title: t('tour.messageTemplates.colActions.title', 'Acciones'), description: t('tour.messageTemplates.colActions.description', 'Botones para editar o eliminar la plantilla. Al hacer clic en "Siguiente", abriremos el editor.'), side: 'top', align: 'start' } },
  { element: '#message-templates-finish', popover: { title: t('tour.messageTemplates.finish.title', '¡Tour Completado!'), description: t('tour.messageTemplates.finish.description', 'Ahora puedes crear, editar y gestionar plantillas de mensajes de manera eficiente.'), side: 'top', align: 'center' } }
]

export const messageTemplatesTourConfig = { id: 'message-templates-onboarding', autoStart: false }

export const getMessageTemplateModalTourSteps = (t) => [
  {
    element: '#message-template-modal',
    popover: { 
      title: t('tour.messageTemplateModal.overview.title', 'Editor de Plantillas'), 
      description: t('tour.messageTemplateModal.overview.description', 'Formulario para definir el nombre, proyecto y contenido de tu plantilla de mensaje.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#message-template-modal-name',
    popover: { 
      title: t('tour.messageTemplateModal.name.title', 'Nombre de la Plantilla'), 
      description: t('tour.messageTemplateModal.name.description', 'Asigna un nombre claro y descriptivo para identificar fácilmente esta plantilla.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#message-template-modal-project',
    popover: { 
      title: t('tour.messageTemplateModal.project.title', 'Proyecto Asociado'), 
      description: t('tour.messageTemplateModal.project.description', 'Vincula la plantilla a un proyecto específico para usar sus variables, o déjala en "Global" para uso general.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#message-template-modal-content',
    popover: { 
      title: t('tour.messageTemplateModal.content.title', 'Contenido del Mensaje'), 
      description: t('tour.messageTemplateModal.content.description', 'Escribe el texto del mensaje. Aquí es donde insertarás las variables dinámicas.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#message-template-modal-variables',
    popover: { 
      title: t('tour.messageTemplateModal.variables.title', 'Variables Detectadas'), 
      description: t('tour.messageTemplateModal.variables.description', 'El sistema resalta automáticamente las variables (ej: {{nombre}}) que detecta en el texto para que verifiques que son válidas.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#message-template-modal-actions',
    popover: { 
      title: t('tour.messageTemplateModal.actions.title', 'Guardar Cambios'), 
      description: t('tour.messageTemplateModal.actions.description', 'Haz clic en "Cancelar" para cerrar el modal y finalizar el tour, o "Guardar" para crear la plantilla.'), 
      side: 'top', 
      align: 'end' 
    }
  }
]

export const messageTemplateModalTourConfig = { id: 'message-template-modal-tour', autoStart: false }