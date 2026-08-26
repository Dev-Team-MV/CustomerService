// /Users/oficina/MV-CRM/CustomerService/frontend/shared/tours/shared/layoutTour.js

export const getLayoutTourSteps = (t) => [
  {
    element: '#layout-sidebar-toggle',
    popover: { 
      title: t('tour.layout.sidebarToggle.title', 'Menú Principal'), 
      description: t('tour.layout.sidebarToggle.description', 'Haz clic aquí para desplegar el menú lateral.'), 
      side: 'bottom', align: 'start' 
    }
  },
  {
    element: '#layout-sidebar-drawer',
    popover: { 
      title: t('tour.layout.sidebarNav.title', 'Navegación'), 
      description: t('tour.layout.sidebarNav.description', 'Desde aquí accedes a todas las secciones. El tour lo cerrará automáticamente para continuar.'), 
      side: 'right', align: 'center' 
    }
  },
  {
    element: '#layout-notifications-btn',
    popover: { 
      title: t('tour.layout.notifications.title', 'Notificaciones'), 
      description: t('tour.layout.notifications.description', 'Haz clic para revisar alertas y mensajes en tiempo real.'), 
      side: 'bottom', align: 'end' 
    }
  },
  {
    element: '#notification-drawer-container',
    popover: { 
      title: t('tour.layout.notificationsAction.title', 'Centro de Alertas'), 
      description: t('tour.layout.notificationsAction.description', 'Aquí gestionas tus notificaciones. El tour lo cerrará para seguir.'), 
      side: 'left', align: 'start' 
    }
  },
  {
    element: '#layout-user-menu-btn',
    popover: { 
      title: t('tour.layout.userMenu.title', 'Perfil de Usuario'), 
      description: t('tour.layout.userMenu.description', 'Accede a la configuración de tu cuenta o cierra sesión.'), 
      side: 'bottom', align: 'end' 
    }
  },
  {
    element: '#layout-main-content',
    popover: { 
      title: t('tour.layout.mainContent.title', 'Área de Trabajo'), 
      description: t('tour.layout.mainContent.description', '¡Listo! Aquí se renderiza el contenido. Comencemos explorando el Dashboard.'), 
      side: 'top', align: 'center' 
    }
  }
]

export const layoutTourConfig = {
  id: 'shared-layout-onboarding',
  autoStart: false
}