// /Users/oficina/MV-CRM/CustomerService/frontend/apps/sheperd/src/tours/modules/dashboardTour.js

export const getSheperdDashboardTourSteps = (t) => [
  {
    element: '#sheperd-dashboard-container',
    popover: { 
      title: t('tour.sheperdDashboard.layoutIntro.title', 'Conoce la Interfaz'), 
      description: t('tour.sheperdDashboard.layoutIntro.description', 'Antes de explorar los datos, hagamos un recorrido rápido por las herramientas de navegación generales.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#sheperd-dashboard-container',
    popover: { 
      title: t('tour.sheperdDashboard.overview.title', 'Panel de Control'), 
      description: t('tour.sheperdDashboard.overview.description', 'Bienvenido a tu vista principal de Sheperd. Aquí tienes un resumen de tu actividad y accesos directos.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#sheperd-map-section',
    popover: { 
      title: t('tour.sheperdDashboard.map.title', 'Master Plan'), 
      description: t('tour.sheperdDashboard.map.description', 'Visualiza el plano maestro del proyecto y la distribución de los edificios de forma interactiva.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#sheperd-quick-actions',
    popover: { 
      title: t('tour.sheperdDashboard.quickActions.title', 'Acciones Rápidas'), 
      description: t('tour.sheperdDashboard.quickActions.description', 'Accede directamente a las funciones más utilizadas, como crear cotizaciones o gestionar residentes.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#sheperd-recent-payloads',
    popover: {
      title: t('tour.sheperdDashboard.payloads.title', 'Actividad Reciente'),
      description: t('tour.sheperdDashboard.payloads.description', 'Monitorea las últimas transacciones y movimientos importantes del sistema.'),
      side: 'top',
      align: 'start'
    }
  }
]

export const sheperdDashboardTourConfig = { 
  id: 'sheperd-dashboard-onboarding', 
  autoStart: false 
}