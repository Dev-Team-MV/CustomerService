// /Users/oficina/MV-CRM/CustomerService/frontend/apps/lakewood-p1/src/tours/modules/dashboardTour.js

export const getLakewoodDashboardTourSteps = (t) => [
  {
    element: '#lakewood-dashboard-container', // Elemento invisible o el contenedor principal para iniciar el subtour
    popover: {
      title: t('tour.lakewoodDashboard.layoutIntro.title', 'Conoce la Interfaz'),
      description: t('tour.lakewoodDashboard.layoutIntro.description', 'Antes de explorar los datos, hagamos un recorrido rápido por las herramientas de navegación generales.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#lakewood-dashboard-container',
    popover: {
      title: t('tour.lakewoodDashboard.overview.title', 'Panel de Control'),
      description: t('tour.lakewoodDashboard.overview.description', 'Bienvenido a tu vista principal. Aquí tienes un resumen de tu actividad y accesos directos.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#lakewood-map-section',
    popover: {
      title: t('tour.lakewoodDashboard.map.title', 'Mapa de Inventario'),
      description: t('tour.lakewoodDashboard.map.description', 'Visualiza la disponibilidad de lotes y propiedades en tiempo real de forma interactiva.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#lakewood-quick-actions',
    popover: {
      title: t('tour.lakewoodDashboard.quickActions.title', 'Acciones Rápidas'),
      description: t('tour.lakewoodDashboard.quickActions.description', 'Accede directamente a las funciones más utilizadas, como agregar propiedades, invitar usuarios o ver analíticas.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#lakewood-recent-payloads',
    popover: {
      title: t('tour.lakewoodDashboard.payloads.title', 'Actividad Reciente'),
      description: t('tour.lakewoodDashboard.payloads.description', 'Monitorea las últimas transacciones y movimientos importantes del sistema.'),
      side: 'top',
      align: 'start'
    }
  }
]

export const lakewoodDashboardTourConfig = {
  id: 'lakewood-dashboard-onboarding',
  autoStart: false
}