export const getAuditLogTourSteps = (t) => [
  { element: '#audit-log-page-container', popover: { title: t('tour.auditLog.overview.title', 'Módulo de Auditoría'), description: t('tour.auditLog.overview.description', 'Este módulo registra todas las acciones realizadas en el sistema.'), side: 'bottom', align: 'center' } },
  { element: '#audit-log-filters', popover: { title: t('tour.auditLog.filters.title', 'Filtros de Búsqueda'), description: t('tour.auditLog.filters.description', 'Filtra los registros por entidad, proyecto, acción, usuario o rango de fechas.'), side: 'bottom', align: 'start' } },
  { element: '#audit-filter-entity', popover: { title: t('tour.auditLog.filterEntity.title', 'Entidad'), description: t('tour.auditLog.filterEntity.description', 'Selecciona el tipo de entidad para ver solo sus registros.'), side: 'right', align: 'start' } },
  { element: '#audit-filter-project', popover: { title: t('tour.auditLog.filterProject.title', 'Proyecto'), description: t('tour.auditLog.filterProject.description', 'Filtra los registros por proyecto específico.'), side: 'right', align: 'start' } },
  { element: '#audit-filter-action', popover: { title: t('tour.auditLog.filterAction.title', 'Acción'), description: t('tour.auditLog.filterAction.description', 'Filtra por tipo de acción: Creado, Actualizado, Eliminado, etc.'), side: 'right', align: 'start' } },
  { element: '#audit-filter-user', popover: { title: t('tour.auditLog.filterUser.title', 'Usuario'), description: t('tour.auditLog.filterUser.description', 'Filtra los registros por el usuario que realizó la acción.'), side: 'right', align: 'start' } },
  { element: '#audit-filter-dates', popover: { title: t('tour.auditLog.filterDates.title', 'Rango de Fechas'), description: t('tour.auditLog.filterDates.description', 'Define un rango de fechas para ver registros de un período específico.'), side: 'right', align: 'start' } },
  { element: '#audit-log-data-table', popover: { title: t('tour.auditLog.table.title', 'Tabla de Registros'), description: t('tour.auditLog.table.description', 'Aquí se listan todos los registros. Te explicaré cada columna.'), side: 'top', align: 'start' } },
  { element: '#audit-col-user', popover: { title: t('tour.auditLog.colUser.title', 'Usuario'), description: t('tour.auditLog.colUser.description', 'La persona que realizó la acción, mostrando su nombre y rol.'), side: 'top', align: 'start' } },
  { element: '#audit-col-action', popover: { title: t('tour.auditLog.colAction.title', 'Acción'), description: t('tour.auditLog.colAction.description', 'El tipo de acción realizada con un código de color.'), side: 'top', align: 'start' } },
  { element: '#audit-col-entity', popover: { title: t('tour.auditLog.colEntity.title', 'Entidad'), description: t('tour.auditLog.colEntity.description', 'El tipo de objeto afectado (Lead, Cliente, Proyecto, etc.).'), side: 'top', align: 'start' } },
  { element: '#audit-col-changes', popover: { title: t('tour.auditLog.colChanges.title', 'Cambios'), description: t('tour.auditLog.colChanges.description', 'Los campos que fueron modificados en esta acción.'), side: 'top', align: 'start' } },
  { element: '#audit-col-timestamp', popover: { title: t('tour.auditLog.colTimestamp.title', 'Fecha'), description: t('tour.auditLog.colTimestamp.description', 'Cuándo se realizó la acción, con tiempo relativo y fecha completa.'), side: 'top', align: 'start' } },
  
  // ✅ PASO 13: Indicación para hacer clic en la fila
  { element: '#audit-log-row-click', popover: { title: t('tour.auditLog.rowClick.title', 'Ver Detalles'), description: t('tour.auditLog.rowClick.description', 'Al hacer clic en "Siguiente", abriremos el panel de detalles de la primera fila.'), side: 'left', align: 'start' } },
  
  // ✅ PASOS 14-17: Recorrido detallado del Drawer
  { element: '#audit-detail-drawer', popover: { title: t('tour.auditLog.detailDrawer.title', 'Panel de Detalles'), description: t('tour.auditLog.detailDrawer.description', 'Este panel contiene toda la información forense del registro.'), side: 'left', align: 'start' } },
  { element: '#audit-drawer-general-info', popover: { title: t('tour.auditLog.drawerInfo.title', 'Información General'), description: t('tour.auditLog.drawerInfo.description', 'Muestra el usuario que realizó la acción, su dirección IP y la fecha exacta del evento.'), side: 'left', align: 'start' } },
  { element: '#audit-drawer-modified-fields', popover: { title: t('tour.auditLog.drawerFields.title', 'Campos Modificados'), description: t('tour.auditLog.drawerFields.description', 'Aquí puedes comparar exactamente qué valores tenían los campos "Antes" y "Después" del cambio.'), side: 'left', align: 'start' } },
  { element: '#audit-drawer-full-json', popover: { title: t('tour.auditLog.drawerJson.title', 'Datos Completos (JSON)'), description: t('tour.auditLog.drawerJson.description', 'Para necesidades técnicas avanzadas, aquí tienes el objeto completo del registro en formato JSON, con opción de copiar.'), side: 'left', align: 'start' } },
  
  // ✅ PASO 18: Cerrar el Drawer
  { element: '#audit-detail-close', popover: { title: t('tour.auditLog.detailClose.title', 'Cerrar Panel'), description: t('tour.auditLog.detailClose.description', 'Haz clic aquí para cerrar el panel de detalles.'), side: 'top', align: 'end' } },
  
  // ✅ PASO 19: Final
  { element: '#audit-log-page-container', popover: { title: t('tour.auditLog.finish.title', '¡Tour Completado!'), description: t('tour.auditLog.finish.description', 'Ahora puedes rastrear y auditar todas las acciones del sistema de manera efectiva.'), side: 'top', align: 'center' } }
]

export const auditLogTourConfig = { id: 'audit-log-onboarding', autoStart: false }