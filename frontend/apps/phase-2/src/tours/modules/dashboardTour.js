   // /Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/tours/modules/dashboardTour.js
   export const getPhase2DashboardTourSteps = (t) => [
     {
       element: '#phase2-dashboard-container    ',
       popover: { title: t('tour.phase2Dashboard.layoutIntro.title', 'Conoce la Interfaz'), description: t('tour.phase2Dashboard.layoutIntro.description', 'Antes de explorar los datos, hagamos un recorrido rápido por las herramientas de navegación generales.'), side: 'bottom', align: 'center' }
     },
     {
       element: '#phase2-dashboard-container',
       popover: { title: t('tour.phase2Dashboard.overview.title', 'Panel de Control'), description: t('tour.phase2Dashboard.overview.description', 'Bienvenido a tu vista principal de Phase 2.'), side: 'bottom', align: 'center' }
     },
     {
       element: '#phase2-map-section',
       popover: { title: t('tour.phase2Dashboard.map.title', 'Mapa de Amenidades'), description: t('tour.phase2Dashboard.map.description', 'Explora las amenidades del proyecto de forma interactiva.'), side: 'top', align: 'start' }
     },
     {
       element: '#phase2-quick-actions',
       popover: { title: t('tour.phase2Dashboard.quickActions.title', 'Acciones Rápidas'), description: t('tour.phase2Dashboard.quickActions.description', 'Accede directamente a las funciones más utilizadas.'), side: 'top', align: 'start' }
     },
       {
    element: '#phase2-recent-payloads',
    popover: {
      title: t('tour.phase2Dashboard.payloads.title', 'Actividad Reciente'),
      description: t('tour.phase2Dashboard.payloads.description', 'Monitorea las últimas transacciones y movimientos importantes del sistema.'),
      side: 'top',
      align: 'start'
    }
  }
   ]
   export const phase2DashboardTourConfig = { id: 'phase2-dashboard-onboarding', autoStart: false }