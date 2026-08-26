export const getPostSaleTourSteps = (t) => [
  // ==========================================
  // 1. SECCIÓN ONBOARDING
  // ==========================================
  {
    element: '#post-sale-page-container',
    popover: { title: t('tour.postSale.overview.title', 'Módulo de Post-Venta'), description: t('tour.postSale.overview.description', 'Gestiona todas las actividades después de la venta: Onboarding, Garantías y Encuestas.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#post-sale-tabs',
    popover: { title: t('tour.postSale.tabs.title', 'Pestañas de Gestión'), description: t('tour.postSale.tabs.description', 'Navega entre las diferentes áreas. Comenzaremos por Onboarding.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#post-sale-tab-onboarding',
    popover: { title: t('tour.postSale.tabOnboarding.title', 'Pestaña: Onboarding'), description: t('tour.postSale.tabOnboarding.description', 'Gestiona el checklist de entrega y el progreso de incorporación de cada cliente.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#onboarding-filters',
    popover: { title: t('tour.postSale.onboardingFilters.title', 'Filtros'), description: t('tour.postSale.onboardingFilters.description', 'Filtra por proyecto, cliente o estado de completitud.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#onboarding-data-table',
    popover: { title: t('tour.postSale.onboardingTable.title', 'Tabla'), description: t('tour.postSale.onboardingTable.description', 'Aquí se listan los onboardings. Te explicaré sus columnas.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-project',
    popover: { title: t('tour.postSale.colProject.title', 'Proyecto'), description: t('tour.postSale.colProject.description', 'El proyecto inmobiliario de la entrega.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-property',
    popover: { title: t('tour.postSale.colProperty.title', 'Propiedad'), description: t('tour.postSale.colProperty.description', 'El lote o apartamento específico.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-client',
    popover: { title: t('tour.postSale.colClient.title', 'Cliente'), description: t('tour.postSale.colClient.description', 'El residente que recibe la propiedad.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-status',
    popover: { title: t('tour.postSale.colStatus.title', 'Estado'), description: t('tour.postSale.colStatus.description', 'Indica si no ha comenzado, está en progreso o completado.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-progress',
    popover: { title: t('tour.postSale.colProgress.title', 'Progreso'), description: t('tour.postSale.colProgress.description', 'Porcentaje de ítems del checklist completados.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-createdAt',
    popover: { title: t('tour.postSale.colCreatedAt.title', 'Fecha'), description: t('tour.postSale.colCreatedAt.description', 'Fecha de generación del registro.'), side: 'top', align: 'start' }
  },
  {
    element: '#onboarding-col-actions',
    popover: { title: t('tour.postSale.colActions.title', 'Acciones'), description: t('tour.postSale.colActions.description', 'Herramientas para gestionar cada onboarding.'), side: 'left', align: 'start' }
  },
  {
    element: '#onboarding-action-view',
    popover: { title: t('tour.postSale.actionView.title', '1. Ver Detalles'), description: t('tour.postSale.actionView.description', 'Abre el modal para revisar el checklist, notas y documentos.'), side: 'left', align: 'start' }
  },
  {
    element: '#onboarding-action-edit',
    popover: { title: t('tour.postSale.actionEdit.title', '2. Editar'), description: t('tour.postSale.actionEdit.description', 'Modifica los datos básicos del onboarding.'), side: 'left', align: 'start' }
  },
  {
    element: '#onboarding-action-delete',
    popover: { title: t('tour.postSale.actionDelete.title', '3. Eliminar'), description: t('tour.postSale.actionDelete.description', 'Elimina el registro (requiere confirmación).'), side: 'left', align: 'start' }
  },
  {
    element: '#onboarding-new-btn',
    popover: { title: t('tour.postSale.onboardingNew.title', '4. Nuevo Onboarding'), description: t('tour.postSale.onboardingNew.description', 'Abre el formulario para crear uno desde cero.'), side: 'bottom', align: 'end' }
  },

  // ==========================================
  // 2. TRANSICIÓN A GARANTÍAS
  // ==========================================
  {
    element: '#post-sale-tab-warranties',
    popover: { title: t('tour.postSale.tabWarranties.title', 'Pestaña: Garantías'), description: t('tour.postSale.tabWarranties.description', 'Pasemos a gestionar los reclamos post-venta.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#warranties-filters',
    popover: { title: t('tour.postSale.warrantiesFilters.title', 'Filtros'), description: t('tour.postSale.warrantiesFilters.description', 'Filtra reclamos por proyecto, cliente, estado, categoría o prioridad.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#warranties-create-btn',
    popover: { title: t('tour.postSale.warrantiesCreate.title', 'Crear Reclamo'), description: t('tour.postSale.warrantiesCreate.description', 'Abre el formulario para registrar un nuevo reclamo.'), side: 'bottom', align: 'end' }
  },
  {
    element: '#warranties-data-table',
    popover: { title: t('tour.postSale.warrantiesTable.title', 'Tabla de Reclamos'), description: t('tour.postSale.warrantiesTable.description', 'Listado de todos los reclamos de garantía.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-client',
    popover: { title: t('tour.postSale.warrantyColClient.title', 'Cliente'), description: t('tour.postSale.warrantyColClient.description', 'Quien reporta el problema.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-project',
    popover: { title: t('tour.postSale.warrantyColProject.title', 'Proyecto'), description: t('tour.postSale.warrantyColProject.description', 'Ubicación de la propiedad con garantía.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-property',
    popover: { title: t('tour.postSale.warrantyColProperty.title', 'Unidad'), description: t('tour.postSale.warrantyColProperty.description', 'Lote o apartamento afectado.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-category',
    popover: { title: t('tour.postSale.warrantyColCategory.title', 'Categoría'), description: t('tour.postSale.warrantyColCategory.description', 'Tipo de problema (ej: plomería, eléctrico).'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-priority',
    popover: { title: t('tour.postSale.warrantyColPriority.title', 'Prioridad'), description: t('tour.postSale.warrantyColPriority.description', 'Nivel de urgencia del reclamo.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-status',
    popover: { title: t('tour.postSale.warrantyColStatus.title', 'Estado'), description: t('tour.postSale.warrantyColStatus.description', 'Estado actual de la resolución.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-date',
    popover: { title: t('tour.postSale.warrantyColDate.title', 'Fecha'), description: t('tour.postSale.warrantyColDate.description', 'Fecha de registro del reclamo.'), side: 'top', align: 'start' }
  },
  {
    element: '#warranty-col-actions',
    popover: { title: t('tour.postSale.warrantyColActions.title', 'Acciones'), description: t('tour.postSale.warrantyColActions.description', 'Opciones para ver detalles, resolver o eliminar.'), side: 'left', align: 'start' }
  },
  {
    element: '#warranty-action-view',
    popover: { title: t('tour.postSale.warrantyActionView.title', 'Ver Detalles'), description: t('tour.postSale.warrantyActionView.description', 'Abre el modal para revisar la información completa y acciones de resolución.'), side: 'left', align: 'start' }
  },

  // ==========================================
  // 3. TRANSICIÓN A ENCUESTAS (FINAL DEL TOUR)
  // ==========================================
  {
    element: '#post-sale-tab-surveys',
    popover: { title: t('tour.postSale.tabSurveys.title', 'Pestaña: Encuestas'), description: t('tour.postSale.tabSurveys.description', 'Midamos la satisfacción del cliente.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#surveys-summary',
    popover: { title: t('tour.postSale.surveysSummary.title', 'Resumen de Métricas'), description: t('tour.postSale.surveysSummary.description', 'NPS promedio, calificación general y total de encuestas.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#surveys-filters',
    popover: { title: t('tour.postSale.surveysFilters.title', 'Filtros'), description: t('tour.postSale.surveysFilters.description', 'Filtra por proyecto, cliente, tipo o plantilla.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#surveys-data-table',
    popover: { title: t('tour.postSale.surveysTable.title', 'Tabla de Encuestas'), description: t('tour.postSale.surveysTable.description', 'Listado de encuestas realizadas.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-client',
    popover: { title: t('tour.postSale.surveyColClient.title', 'Cliente'), description: t('tour.postSale.surveyColClient.description', 'Residente que completó la encuesta.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-project',
    popover: { title: t('tour.postSale.surveyColProject.title', 'Proyecto'), description: t('tour.postSale.surveyColProject.description', 'Proyecto asociado.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-property',
    popover: { title: t('tour.postSale.surveyColProperty.title', 'Unidad'), description: t('tour.postSale.surveyColProperty.description', 'Apartamento o lote evaluado.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-type',
    popover: { title: t('tour.postSale.surveyColType.title', 'Tipo'), description: t('tour.postSale.surveyColType.description', 'Categoría de la encuesta.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-nps',
    popover: { title: t('tour.postSale.surveyColNps.title', 'NPS'), description: t('tour.postSale.surveyColNps.description', 'Net Promoter Score (Promotor, Neutro o Detractor).'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-rating',
    popover: { title: t('tour.postSale.surveyColRating.title', 'Calificación'), description: t('tour.postSale.surveyColRating.description', 'Calificación promedio en estrellas.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-date',
    popover: { title: t('tour.postSale.surveyColDate.title', 'Fecha'), description: t('tour.postSale.surveyColDate.description', 'Fecha de registro.'), side: 'top', align: 'start' }
  },
  {
    element: '#survey-col-actions',
    popover: { title: t('tour.postSale.surveyColActions.title', 'Acciones'), description: t('tour.postSale.surveyColActions.description', 'Ver detalles, editar o eliminar.'), side: 'left', align: 'start' }
  },
  {
    element: '#survey-action-view',
    popover: { title: t('tour.postSale.surveyActionView.title', 'Ver Detalles'), description: t('tour.postSale.surveyActionView.description', 'Al hacer clic en "Siguiente", abriremos el modal para ver las respuestas individuales y comentarios.'), side: 'left', align: 'start' }
  },
  // ✅ NUEVOS PASOS: Desglose del modal de detalles
  {
    element: '#survey-detail-client',
    popover: { title: t('tour.postSale.surveyDetailClient.title', 'Información del Cliente'), description: t('tour.postSale.surveyDetailClient.description', 'Muestra el nombre del residente que completó la evaluación.'), side: 'right', align: 'start' }
  },
  {
    element: '#survey-detail-project',
    popover: { title: t('tour.postSale.surveyDetailProject.title', 'Proyecto Asociado'), description: t('tour.postSale.surveyDetailProject.description', 'El proyecto inmobiliario al que pertenece la propiedad evaluada.'), side: 'right', align: 'start' }
  },
  {
    element: '#survey-detail-property',
    popover: { title: t('tour.postSale.surveyDetailProperty.title', 'Unidad Evaluada'), description: t('tour.postSale.surveyDetailProperty.description', 'Detalla si la encuesta corresponde a un apartamento o un lote específico.'), side: 'right', align: 'start' }
  },
  {
    element: '#survey-detail-rating',
    popover: { title: t('tour.postSale.surveyDetailRating.title', 'Calificación General'), description: t('tour.postSale.surveyDetailRating.description', 'La puntuación promedio en estrellas que el cliente otorgó a su experiencia.'), side: 'right', align: 'start' }
  },
  {
    element: '#survey-detail-responses',
    popover: { title: t('tour.postSale.surveyDetailResponses.title', 'Respuestas Detalladas'), description: t('tour.postSale.surveyDetailResponses.description', 'Aquí puedes revisar cada pregunta individual, su calificación y los comentarios textuales del cliente.'), side: 'right', align: 'start' }
  },
   // ... (todos los pasos anteriores se mantienen iguales hasta el paso 47: #survey-detail-close-btn) ...
  {
    element: '#survey-detail-close-btn',
    popover: { title: t('tour.postSale.surveyDetailClose.title', 'Cerrar Modal'), description: t('tour.postSale.surveyDetailClose.description', 'Haz clic aquí para cerrar la vista de detalles y continuar con las Plantillas.'), side: 'top', align: 'end' }
  },

  // ==========================================
  // 4. TRANSICIÓN A PLANTILLAS Y SU MODAL
  // ==========================================
  {
    element: '#surveys-tab-templates',
    popover: { title: t('tour.postSale.tabTemplates.title', 'Pestaña: Plantillas'), description: t('tour.postSale.tabTemplates.description', 'Finalmente, exploremos la pestaña de Plantillas para gestionar los modelos de encuestas reutilizables.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#templates-filters',
    popover: { title: t('tour.postSale.templatesFilters.title', 'Filtros de Plantillas'), description: t('tour.postSale.templatesFilters.description', 'Filtra las plantillas disponibles por proyecto o tipo de encuesta.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#templates-new-btn',
    popover: { title: t('tour.postSale.templatesNewBtn.title', 'Nueva Plantilla'), description: t('tour.postSale.templatesNewBtn.description', 'Al hacer clic en "Siguiente", abriremos el diseñador para crear una nueva plantilla.'), side: 'bottom', align: 'end' }
  },
  // ✅ NUEVOS PASOS: Explicación del modal de plantillas
  {
    element: '#survey-template-form-modal',
    popover: { title: t('tour.postSale.templateFormModal.title', 'Diseñador de Plantillas'), description: t('tour.postSale.templateFormModal.description', 'Este modal te permite crear modelos de encuestas estandarizados para ahorrar tiempo.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#template-form-general-info',
    popover: { title: t('tour.postSale.templateFormGeneral.title', 'Información General'), description: t('tour.postSale.templateFormGeneral.description', 'Asigna la plantilla a un proyecto, define su tipo, dale un nombre y decide si está activa.'), side: 'right', align: 'start' }
  },
  {
    element: '#template-form-questions',
    popover: { title: t('tour.postSale.templateFormQuestions.title', 'Preguntas'), description: t('tour.postSale.templateFormQuestions.description', 'Agrega las preguntas que compondrán la encuesta. Debes definir una clave única y el texto en español e inglés.'), side: 'right', align: 'start' }
  },
  {
    element: '#template-form-actions',
    popover: { title: t('tour.postSale.templateFormActions.title', 'Guardar Cambios'), description: t('tour.postSale.templateFormActions.description', 'Revisa que todo esté correcto y haz clic en "Guardar" para crear la plantilla.'), side: 'top', align: 'end' }
  },
  {
    element: '#survey-template-form-close-btn',
    popover: { title: t('tour.postSale.templateFormClose.title', 'Cerrar Diseñador'), description: t('tour.postSale.templateFormClose.description', 'Haz clic aquí para cerrar el modal. Al hacerlo, terminaremos el tour.'), side: 'top', align: 'end' }
  },

  // ==========================================
  // 5. FINAL
  // ==========================================
  {
    element: '#post-sale-page-container',
    popover: { title: t('tour.postSale.finish.title', '¡Tour Completado!'), description: t('tour.postSale.finish.description', 'Has recorrido todo el módulo de Post-Venta. ¡Ahora estás listo para gestionar Onboarding, Garantías, Encuestas y Plantillas como un profesional!'), side: 'top', align: 'center' }
  }
]

export const postSaleTourConfig = { id: 'post-sale-onboarding', autoStart: false }