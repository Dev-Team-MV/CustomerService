// /Users/oficina/MV-CRM/CustomerService/frontend/apps/htower/src/tours/modules/dashboardTour.js

export const getHtowerDashboardTourSteps = (t) => [
  {
    element: '#htower-layout-intro-trigger',
    popover: { 
      title: t('tour.htowerDashboard.layoutIntro.title', 'Conoce la Interfaz'), 
      description: t('tour.htowerDashboard.layoutIntro.description', 'Antes de explorar los datos, hagamos un recorrido rápido por las herramientas de navegación generales.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#htower-dashboard-container',
    popover: { 
      title: t('tour.htowerDashboard.overview.title', 'Panel de Control'), 
      description: t('tour.htowerDashboard.overview.description', 'Bienvenido a tu vista principal de hTower. Aquí tienes un resumen de la actividad del edificio.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#htower-map-section',
    popover: { 
      title: t('tour.htowerDashboard.map.title', 'Mapa del Proyecto'), 
      description: t('tour.htowerDashboard.map.description', 'Visualiza la distribución de torres, departamentos y amenidades de forma interactiva.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#htower-quick-actions',
    popover: { 
      title: t('tour.htowerDashboard.quickActions.title', 'Acciones Rápidas'), 
      description: t('tour.htowerDashboard.quickActions.description', 'Accede directamente a las funciones más utilizadas, como gestionar residentes o ver reportes.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#htower-recent-payloads',
    popover: {
      title: t('tour.htowerDashboard.payloads.title', 'Actividad Reciente'),
      description: t('tour.htowerDashboard.payloads.description', 'Monitorea las últimas transacciones, pagos y movimientos importantes del sistema.'),
      side: 'top',
      align: 'start'
    }
  }
]

export const htowerDashboardTourConfig = { 
  id: 'htower-dashboard-onboarding', 
  autoStart: false 
}