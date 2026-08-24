export const getClientDetailTourSteps = (t) => [
  {
    element: '#client-detail-header',
    popover: {
      title: t('tour.clientDetail.header.title', 'Perfil del Cliente'),
      description: t('tour.clientDetail.header.description', 'Aquí ves el nombre, estado de la cuenta y las acciones principales de este residente.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#client-detail-btn-appointment',
    popover: {
      title: t('tour.clientDetail.appointment.title', 'Agendar Cita'),
      description: t('tour.clientDetail.appointment.description', 'Programa una reunión o llamada con este cliente directamente desde su perfil.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#client-detail-tabs-container',
    popover: {
      title: t('tour.clientDetail.tabs.title', 'Navegación por Pestañas'),
      description: t('tour.clientDetail.tabs.description', 'Toda la información está organizada aquí. El tour navegará por cada una para mostrarte su contenido.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#client-detail-tab-overview',
    popover: {
      title: t('tour.clientDetail.overview.title', '1. Resumen General'),
      description: t('tour.clientDetail.overview.description', 'Hagamos clic aquí para ver el resumen. El tour te mostrará cada sección de esta pestaña.'),
      side: 'bottom',
      align: 'start'
    }
  },
  // ✅ NUEVOS PASOS: Contenido interno de la pestaña Overview
  {
    element: '#client-overview-personal',
    popover: {
      title: t('tour.clientDetail.overviewPersonal.title', 'Datos Personales'),
      description: t('tour.clientDetail.overviewPersonal.description', 'Aquí se muestra el avatar, correo, país, teléfono, fecha de nacimiento y el rol asignado al cliente en el sistema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#client-overview-projects',
    popover: {
      title: t('tour.clientDetail.overviewProjects.title', 'Proyectos Relacionados'),
      description: t('tour.clientDetail.overviewProjects.description', 'Muestra las membresías activas del cliente, indicando a qué proyectos tiene acceso y con qué rol (ej: admin o residente).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#client-overview-stats',
    popover: {
      title: t('tour.clientDetail.overviewStats.title', 'Resumen Financiero'),
      description: t('tour.clientDetail.overviewStats.description', 'Un vistazo rápido al total de propiedades, valor acumulado, monto pagado y saldo pendiente de este cliente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#client-overview-properties',
    popover: {
      title: t('tour.clientDetail.overviewProperties.title', 'Propiedades Asignadas'),
      description: t('tour.clientDetail.overviewProperties.description', 'Lista detallada de lotes o apartamentos, agrupados por proyecto. Incluye estado, precio, saldo y barra de progreso de pago.'),
      side: 'right',
      align: 'start'
    }
  },
  // ✅ Continuación con las demás pestañas
{
    element: '#client-detail-tab-payments',
    popover: {
      title: t('tour.clientDetail.payments.title', '2. Historial de Pagos'),
      description: t('tour.clientDetail.payments.description', 'Hagamos clic aquí para explorar el historial financiero. Te explicaré sus componentes.'),
      side: 'bottom',
      align: 'start'
    }
  },
  // ✅ NUEVOS PASOS: Contenido interno de la pestaña Pagos
  {
    element: '#client-payments-filter',
    popover: {
      title: t('tour.clientDetail.paymentsFilter.title', 'Filtro de Estado'),
      description: t('tour.clientDetail.paymentsFilter.description', 'Filtra los pagos por su estado: Pendiente, Firmado o Rechazado para encontrar rápidamente lo que necesitas.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#client-payments-table',
    popover: {
      title: t('tour.clientDetail.paymentsTable.title', 'Tabla de Pagos'),
      description: t('tour.clientDetail.paymentsTable.description', 'Aquí ves el detalle de cada cuota: tipo de pago, monto, fechas de vencimiento y estado actual.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#client-payments-pagination',
    popover: {
      title: t('tour.clientDetail.paymentsPagination.title', 'Paginación'),
      description: t('tour.clientDetail.paymentsPagination.description', 'Navega entre las páginas o ajusta la cantidad de registros mostrados por pantalla.'),
      side: 'top',
      align: 'end'
    }
  },

  {
    element: '#client-detail-tab-activities',
    popover: {
      title: t('tour.clientDetail.activities.title', '3. Actividades'),
      description: t('tour.clientDetail.activities.description', 'Registro cronológico de cada interacción: llamadas, correos, cambios de estado y notas del equipo.'),
      side: 'bottom',
      align: 'start'
    }
  },
   // ✅ NUEVOS PASOS: Desglose de la Línea de Tiempo
  {
    element: '#timeline-first-item-marker',
    popover: {
      title: t('tour.clientDetail.timeline.marker.title', 'Indicador de Actividad'),
      description: t('tour.clientDetail.timeline.marker.description', 'El color y el ícono indican el tipo de interacción: nota, SMS, correo o automatización.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#timeline-first-item-card',
    popover: {
      title: t('tour.clientDetail.timeline.card.title', 'Detalles de la Actividad'),
      description: t('tour.clientDetail.timeline.card.description', 'Aquí ves el título, la descripción completa y la fecha exacta en que se registró la acción.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#timeline-first-item-metadata',
    popover: {
      title: t('tour.clientDetail.timeline.metadata.title', 'Metadatos Contextuales'),
      description: t('tour.clientDetail.timeline.metadata.description', 'Muestra a qué proyecto pertenece, la columna del pipeline y el nivel de prioridad de esta tarea.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#timeline-first-item-users',
    popover: {
      title: t('tour.clientDetail.timeline.users.title', 'Responsables'),
      description: t('tour.clientDetail.timeline.users.description', 'Identifica claramente quién creó la actividad y a qué miembro del equipo está asignada para su seguimiento.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#client-detail-tab-notes',
    popover: {
      title: t('tour.clientDetail.notes.title', '4. Notas Internas'),
      description: t('tour.clientDetail.notes.description', 'Espacio para agregar observaciones privadas sobre el cliente que solo tu equipo podrá ver.'),
      side: 'bottom',
      align: 'start'
    }
  },
  // ✅ NUEVOS PASOS: Desglose de la sección de Notas
  {
    element: '#client-notes-add-form',
    popover: {
      title: t('tour.clientDetail.notes.form.title', 'Agregar Nueva Nota'),
      description: t('tour.clientDetail.notes.form.description', 'Usa este formulario para registrar observaciones internas, vinculándolas opcionalmente a un proyecto específico.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#client-notes-first-item-card',
    popover: {
      title: t('tour.clientDetail.notes.card.title', 'Detalle de la Nota'),
      description: t('tour.clientDetail.notes.card.description', 'Cada nota muestra su título, el contenido completo y la fecha exacta en que se registró.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#client-notes-first-item-metadata',
    popover: {
      title: t('tour.clientDetail.notes.metadata.title', 'Contexto de la Nota'),
      description: t('tour.clientDetail.notes.metadata.description', 'Indica a qué proyecto o columna del pipeline está asociada esta nota, y su nivel de prioridad.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#client-notes-first-item-users',
    popover: {
      title: t('tour.clientDetail.notes.users.title', 'Seguimiento'),
      description: t('tour.clientDetail.notes.users.description', 'Muestra claramente quién creó la nota y a qué miembro del equipo está asignada para darle seguimiento.'),
      side: 'right',
      align: 'start'
    }
  },

  // ✅ PASO ÚNICO DE HISTORIAL (Eliminado el duplicado)
  {
    element: '#client-detail-tab-history',
    popover: {
      title: t('tour.clientDetail.history.title', '5. Historial de Cambios'),
      description: t('tour.clientDetail.history.description', 'Hagamos clic aquí para ver la auditoría completa de modificaciones.'),
      side: 'bottom',
      align: 'start'
    }
  },
  // ✅ NUEVOS PASOS: Desglose de la pestaña Historial
  {
    element: '#audit-log-filters',
    popover: {
      title: t('tour.clientDetail.history.filters.title', 'Filtros de Auditoría'),
      description: t('tour.clientDetail.history.filters.description', 'Filtra los cambios por tipo de acción (crear, actualizar, eliminar) y por rango de fechas para encontrar eventos específicos.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#audit-log-table-container',
    popover: {
      title: t('tour.clientDetail.history.table.title', 'Registro de Cambios'),
      description: t('tour.clientDetail.history.table.description', 'Aquí ves cada modificación: quién la hizo, qué campo cambió, los valores anterior y nuevo, y la fecha exacta.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#audit-log-pagination',
    popover: {
      title: t('tour.clientDetail.history.pagination.title', 'Paginación'),
      description: t('tour.clientDetail.history.pagination.description', 'Navega por las páginas del historial si hay muchos registros de cambios.'),
      side: 'top',
      align: 'end'
    }
  },

  // ✅ PASO DE DOCUMENTOS
  {
    element: '#client-detail-tab-documents',
    popover: {
      title: t('tour.clientDetail.documents.title', '6. Documentos'),
      description: t('tour.clientDetail.documents.description', 'Hagamos clic aquí para gestionar los archivos, contratos y documentos legales del cliente.'),
      side: 'bottom',
      align: 'start'
    }
  },
  // ✅ NUEVOS PASOS: Desglose de la pestaña Documentos
  {
    element: '#client-docs-upload-btn',
    popover: {
      title: t('tour.clientDetail.documents.uploadBtn.title', 'Subir Nuevo Documento'),
      description: t('tour.clientDetail.documents.uploadBtn.description', 'Usa este botón para cargar nuevos archivos, asignarles una categoría y vincularlos a un proyecto específico.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#client-docs-filters',
    popover: {
      title: t('tour.clientDetail.documents.filters.title', 'Filtros de Búsqueda'),
      description: t('tour.clientDetail.documents.filters.description', 'Busca por nombre, filtra por categoría (contratos, escrituras, planos, etc.) o por proyecto asociado.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#client-docs-first-card',
    popover: {
      title: t('tour.clientDetail.documents.card.title', 'Tarjeta de Documento'),
      description: t('tour.clientDetail.documents.card.description', 'Cada tarjeta muestra una vista previa, el nombre, la fecha y acciones rápidas para previsualizar, ver el historial de versiones, archivar o eliminar.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#client-detail-content',
    popover: {
      title: t('tour.clientDetail.finish.title', '¡Explora el Perfil!'),
      description: t('tour.clientDetail.finish.description', 'El tour ha terminado. Ahora puedes navegar libremente por todas las secciones para gestionar a este cliente.'),
      side: 'top',
      align: 'center'
    }
  }
]


export const clientDetailTourConfig = {
  id: 'client-detail-onboarding',
  autoStart: true, // ✅ CAMBIAR A TRUE para que inicie al montar el componente
  conditions: {
    firstVisit: true // ✅ Solo se mostrará si es la primera vez que el usuario visita esta vista
  }
}