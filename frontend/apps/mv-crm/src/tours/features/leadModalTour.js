export const getLeadModalTourSteps = (t) => [
  {
    element: '#lead-modal-dialog',
    popover: { 
      title: t('tour.leadModal.overview.title', 'Registro de Lead'), 
      description: t('tour.leadModal.overview.description', 'Formulario completo para capturar la información inicial del contacto y asignarlo correctamente en el embudo.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#lead-modal-name',
    popover: { 
      title: t('tour.leadModal.name.title', 'Nombre'), 
      description: t('tour.leadModal.name.description', 'El nombre completo del contacto. Este es el único campo estrictamente obligatorio.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-email',
    popover: { 
      title: t('tour.leadModal.email.title', 'Correo Electrónico'), 
      description: t('tour.leadModal.email.description', 'Ingresa el email del contacto para mantener una comunicación formal y enviar documentos.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-phone',
    popover: { 
      title: t('tour.leadModal.phone.title', 'Teléfono'), 
      description: t('tour.leadModal.phone.description', 'Número de contacto con código de país. Fundamental para llamadas o envío de SMS automatizados.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-country',
    popover: { 
      title: t('tour.leadModal.country.title', 'País'), 
      description: t('tour.leadModal.country.description', 'Selecciona el país de residencia del contacto para ajustar formatos y zonas horarias.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-project',
    popover: { 
      title: t('tour.leadModal.project.title', 'Proyecto de Interés'), 
      description: t('tour.leadModal.project.description', 'Asocia el lead a un proyecto específico de tu portafolio inmobiliario.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-assigned',
    popover: { 
      title: t('tour.leadModal.assigned.title', 'Asignado a'), 
      description: t('tour.leadModal.assigned.description', 'Selecciona el asesor o agente responsable de dar seguimiento a este contacto.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-stage',
    popover: { 
      title: t('tour.leadModal.stage.title', 'Etapa del Embudo'), 
      description: t('tour.leadModal.stage.description', 'Define en qué parte del proceso de venta se encuentra (por defecto: "Nuevo").'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-source',
    popover: { 
      title: t('tour.leadModal.source.title', 'Fuente del Lead'), 
      description: t('tour.leadModal.source.description', 'Indica cómo conociste a este contacto (Web, Referido, Visita, Llamada, etc.) para medir el ROI de tus canales.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-notes',
    popover: { 
      title: t('tour.leadModal.notes.title', 'Notas Adicionales'), 
      description: t('tour.leadModal.notes.description', 'Agrega cualquier observación, requerimiento especial o contexto relevante sobre el contacto.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#lead-modal-actions',
    popover: { 
      title: t('tour.leadModal.actions.title', 'Acciones'), 
      description: t('tour.leadModal.actions.description', 'Haz clic en "Cancelar" para cerrar este modal y continuar con el tour principal, o "Guardar" si deseas crear el registro.'), 
      side: 'top', 
      align: 'end' 
    }
  }
]

export const leadModalTourConfig = { id: 'lead-modal-tour', autoStart: false }