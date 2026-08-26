// /Users/oficina/MV-CRM/CustomerService/frontend/apps/isq/src/tours/modules/dashboardTour.js

export const getIsqDashboardTourSteps = (t) => [
  {
    element: '#isq-dashboard-container',
    popover: { 
      title: t('tour.isqDashboard.layoutIntro.title', 'Conoce la Interfaz'), 
      description: t('tour.isqDashboard.layoutIntro.description', 'Antes de explorar los datos, hagamos un recorrido rápido por las herramientas de navegación generales.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#isq-dashboard-container',
    popover: { 
      title: t('tour.isqDashboard.overview.title', 'Panel de Control'), 
      description: t('tour.isqDashboard.overview.description', 'Bienvenido a tu vista principal de ISQ. Aquí tienes un resumen de tu actividad y accesos directos.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#isq-map-section',
    popover: { 
      title: t('tour.isqDashboard.map.title', 'Mapa de Amenidades'), 
      description: t('tour.isqDashboard.map.description', 'Explora las amenidades del proyecto de forma interactiva.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#isq-quick-actions',
    popover: { 
      title: t('tour.isqDashboard.quickActions.title', 'Acciones Rápidas'), 
      description: t('tour.isqDashboard.quickActions.description', 'Accede directamente a las funciones más utilizadas.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#isq-recent-payloads',
    popover: {
      title: t('tour.isqDashboard.payloads.title', 'Actividad Reciente'),
      description: t('tour.isqDashboard.payloads.description', 'Monitorea las últimas transacciones y movimientos importantes del sistema.'),
      side: 'top',
      align: 'start'
    }
  }
]

export const isqDashboardTourConfig = { 
  id: 'isq-dashboard-onboarding', 
  autoStart: false 
}