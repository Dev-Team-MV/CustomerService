export const getAgentsTourSteps = (t) => [
  { 
    element: '#agents-page-container', 
    popover: { title: t('tour.agents.overview.title', 'Módulo de Agentes'), description: t('tour.agents.overview.description', 'Gestiona y monitorea el desempeño de tu equipo de ventas, sus métricas y metas mensuales.'), side: 'bottom', align: 'center' } 
  },
  { 
    element: '#agents-stats-strip', 
    popover: { title: t('tour.agents.stats.title', 'Resumen del Equipo'), description: t('tour.agents.stats.description', 'Visualiza rápidamente el total de agentes, roles y el rendimiento global de leads y conversiones.'), side: 'bottom', align: 'start' } 
  },
  { 
    element: '#agents-data-table', 
    popover: { title: t('tour.agents.table.title', 'Tabla de Agentes'), description: t('tour.agents.table.description', 'Aquí se listan todos los agentes. Te explicaré el significado de cada columna.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-name', 
    popover: { title: t('tour.agents.colName.title', 'Nombre'), description: t('tour.agents.colName.description', 'Nombre completo del agente y su correo electrónico de contacto.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-role', 
    popover: { title: t('tour.agents.colRole.title', 'Rol'), description: t('tour.agents.colRole.description', 'El nivel de permisos del usuario en el sistema (Super Admin o Admin).'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-phone', 
    popover: { title: t('tour.agents.colPhone.title', 'Teléfono'), description: t('tour.agents.colPhone.description', 'Número de contacto directo del agente.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-leads', 
    popover: { title: t('tour.agents.colLeads.title', 'Leads'), description: t('tour.agents.colLeads.description', 'Total de leads asignados y cuántos de ellos han sido convertidos exitosamente.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-target', 
    popover: { title: t('tour.agents.colTarget.title', 'Meta del Mes'), description: t('tour.agents.colTarget.description', 'Progreso visual de las metas establecidas para conversiones y leads en el período actual.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-activities', 
    popover: { title: t('tour.agents.colActivities.title', 'Actividades'), description: t('tour.agents.colActivities.description', 'Cantidad de actividades (llamadas, citas, seguimientos) completadas este mes.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-clients', 
    popover: { title: t('tour.agents.colClients.title', 'Clientes'), description: t('tour.agents.colClients.description', 'Número de clientes atendidos este mes en comparación con el total histórico.'), side: 'top', align: 'start' } 
  },
  { 
    element: '#agents-col-actions', 
    popover: { title: t('tour.agents.colActions.title', 'Acciones'), description: t('tour.agents.colActions.description', 'Botones para gestionar al agente: fijar metas mensuales o ver sus métricas detalladas.'), side: 'left', align: 'start' } 
  },
  { 
    element: '#agents-action-targets', 
    popover: { title: t('tour.agents.actionTargets.title', 'Fijar Metas'), description: t('tour.agents.actionTargets.description', 'Al hacer clic en "Siguiente", abriremos el modal para establecer objetivos mensuales para este agente.'), side: 'left', align: 'start' } 
  },
  { 
    element: '#agents-action-metrics', 
    popover: { title: t('tour.agents.actionMetrics.title', 'Ver Métricas'), description: t('tour.agents.actionMetrics.description', 'Al hacer clic en "Siguiente", abriremos el panel de métricas detalladas de este agente.'), side: 'left', align: 'start' } 
  },
  { 
    element: '#agents-page-container', 
    popover: { title: t('tour.agents.finish.title', '¡Tour Completado!'), description: t('tour.agents.finish.description', 'Ahora puedes gestionar eficazmente el rendimiento y las metas de tu equipo de ventas.'), side: 'top', align: 'center' } 
  }
]

export const agentsTourConfig = { id: 'agents-onboarding', autoStart: false }