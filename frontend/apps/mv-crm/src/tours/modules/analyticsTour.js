export const getAnalyticsTourSteps = (t) => [
  {
    element: '#analytics-page-container',
    popover: { 
      title: t('tour.analytics.overview.title', 'Módulo de Analíticas'), 
      description: t('tour.analytics.overview.description', 'Visualiza el rendimiento financiero y la distribución de clientes de todos tus proyectos en tiempo real.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#analytics-project-filter',
    popover: { 
      title: t('tour.analytics.filter.title', 'Filtro de Proyectos'), 
      description: t('tour.analytics.filter.description', 'Selecciona o deselecciona proyectos específicos. Todos los gráficos y KPIs se actualizarán automáticamente para mostrar solo los datos seleccionados.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#analytics-global-kpis',
    popover: { 
      title: t('tour.analytics.kpis.title', 'Indicadores Clave (KPIs)'), 
      description: t('tour.analytics.kpis.description', 'Resumen global del dinero recaudado, pendiente, la tasa de cobro y el total de clientes activos en los proyectos seleccionados.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#analytics-balance-chart',
    popover: { 
      title: t('tour.analytics.balance.title', 'Balance Comparativo'), 
      description: t('tour.analytics.balance.description', 'Gráfico de barras que compara visualmente el monto recaudado vs. el monto pendiente por cada proyecto.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#analytics-project-share',
    popover: { 
      title: t('tour.analytics.share.title', 'Distribución por Proyecto'), 
      description: t('tour.analytics.share.description', 'Gráfico de dona que muestra qué porcentaje del total recaudado pertenece a cada proyecto, con una leyenda detallada.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#analytics-clients-chart',
    popover: { 
      title: t('tour.analytics.clients.title', 'Clientes y Propiedades'), 
      description: t('tour.analytics.clients.description', 'Compara la cantidad de clientes únicos frente al total de propiedades asignadas en cada proyecto.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#analytics-page-container',
    popover: { 
      title: t('tour.analytics.finish.title', '¡Tour Completado!'), 
      description: t('tour.analytics.finish.description', 'Ahora puedes monitorear y analizar el crecimiento de tu portafolio inmobiliario de manera efectiva.'), 
      side: 'top', 
      align: 'center' 
    }
  }
]

export const analyticsTourConfig = { id: 'analytics-onboarding', autoStart: false }