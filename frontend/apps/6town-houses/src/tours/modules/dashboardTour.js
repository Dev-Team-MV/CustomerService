// /Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/tours/modules/dashboardTour.js

export const get6townDashboardTourSteps = (t) => [
  {
    element: '#sixtown-dashboard-container', // ✅ Cambiado
    popover: { 
      title: t('tour.sixtownDashboard.layoutIntro.title', 'Conoce la Interfaz'), 
      description: t('tour.sixtownDashboard.layoutIntro.description', 'Antes de explorar los datos, hagamos un recorrido rápido por las herramientas de navegación generales.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#sixtown-dashboard-container', // ✅ Cambiado
    popover: { 
      title: t('tour.sixtownDashboard.overview.title', 'Panel de Control'), 
      description: t('tour.sixtownDashboard.overview.description', 'Bienvenido a tu vista principal de 6town Houses. Aquí tienes un resumen de tu actividad y accesos directos.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#sixtown-map-section', // ✅ Cambiado
    popover: { 
      title: t('tour.sixtownDashboard.map.title', 'Master Plan'), 
      description: t('tour.sixtownDashboard.map.description', 'Visualiza el plano maestro del proyecto y la distribución de las propiedades de forma interactiva.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#sixtown-quick-actions', // ✅ Cambiado
    popover: { 
      title: t('tour.sixtownDashboard.quickActions.title', 'Acciones Rápidas'), 
      description: t('tour.sixtownDashboard.quickActions.description', 'Accede directamente a las funciones más utilizadas, como crear cotizaciones o ver propiedades.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#sixtown-recent-payloads', // ✅ Cambiado
    popover: {
      title: t('tour.sixtownDashboard.payloads.title', 'Actividad Reciente'),
      description: t('tour.sixtownDashboard.payloads.description', 'Monitorea las últimas transacciones y movimientos importantes del sistema.'),
      side: 'top',
      align: 'start'
    }
  }
]

export const sixtownDashboardTourConfig = { 
  id: 'sixtown-dashboard-onboarding', // ✅ Cambiado
  autoStart: false 
}