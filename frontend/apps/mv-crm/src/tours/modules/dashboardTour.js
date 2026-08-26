export const getDashboardTourSteps = (t) => [
  {
    popover: {
      title: t('tour.dashboard.welcome.title', 'Bienvenido al Dashboard'),
      description: t('tour.dashboard.welcome.description', 
        'Esta es tu vista central. Desde aquí gestionas todos los proyectos, clientes y métricas financieras. Te guiaré por las secciones principales.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#sidebar-menu',
    popover: {
      title: t('tour.dashboard.sidebar.title', 'Menú de Navegación'),
      description: t('tour.dashboard.sidebar.description', 
        'Accede a todos los módulos del CRM: Clientes, Proyectos, Ventas, Campañas, Automatizaciones y más.'),
      side: 'right',
      align: 'start'
    }
  },
  // ✅ NUEVOS: Steps de la Topbar (Navbar)
  {
    element: '#topbar-language-switcher',
    popover: {
      title: t('tour.dashboard.topbar.language.title', 'Cambio de Idioma'),
      description: t('tour.dashboard.topbar.language.description', 
        'Cambia entre Español e Inglés para toda la interfaz del CRM. Esta configuración se guarda en tu sesión.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#topbar-search-btn',
    popover: {
      title: t('tour.dashboard.topbar.search.title', 'Búsqueda Global'),
      description: t('tour.dashboard.topbar.search.description', 
        'Busca clientes, proyectos, leads y más desde cualquier parte del sistema. Atajo: ⌘K o Ctrl+K.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#topbar-notification-creator',
    popover: {
      title: t('tour.dashboard.topbar.notificationCreator.title', 'Crear Notificación'),
      description: t('tour.dashboard.topbar.notificationCreator.description', 
        'Envía notificaciones personalizadas a usuarios específicos o grupos. Solo disponible para administradores.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#topbar-notification-bell',
    popover: {
      title: t('tour.dashboard.topbar.notificationBell.title', 'Centro de Notificaciones'),
      description: t('tour.dashboard.topbar.notificationBell.description', 
        'Revisa alertas del sistema, pagos vencidos, actividades próximas y mensajes. El badge rojo indica notificaciones sin leer.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#topbar-clock',
    popover: {
      title: t('tour.dashboard.topbar.clock.title', 'Hora del Sistema'),
      description: t('tour.dashboard.topbar.clock.description', 
        'Muestra la hora actual en tiempo real. Útil para coordinar actividades y citas con clientes.'),
      side: 'bottom',
      align: 'end'
    }
  },
  // Continuación de los steps existentes
  {
    element: '#quick-actions-panel',
    popover: {
      title: t('tour.dashboard.quickActions.title', 'Acciones Rápidas'),
      description: t('tour.dashboard.quickActions.description', 
        'Los dos botones más usados del CRM: crear un nuevo proyecto inmobiliario o registrar un nuevo cliente/residente.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#create-project-btn',
    popover: {
      title: t('tour.dashboard.createProject.title', 'Crear Proyecto'),
      description: t('tour.dashboard.createProject.description', 
        'Abre el asistente para registrar un nuevo proyecto con toda su información, multimedia y configuración de variables.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#add-client-btn',
    popover: {
      title: t('tour.dashboard.addClient.title', 'Agregar Cliente'),
      description: t('tour.dashboard.addClient.description', 
        'Registra un nuevo residente. Se le enviará una invitación por SMS con instrucciones para configurar su acceso.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#stats-strip',
    popover: {
      title: t('tour.dashboard.statsStrip.title', 'Indicadores Globales'),
      description: t('tour.dashboard.statsStrip.description', 
        'Vista consolidada de todo tu portafolio: total de proyectos, clientes, monto recaudado y pendiente.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#project-list',
    popover: {
      title: t('tour.dashboard.projectList.title', 'Lista de Proyectos'),
      description: t('tour.dashboard.projectList.description', 
        'Todos tus proyectos con su contador de clientes. Haz clic en cualquiera para ver sus métricas detalladas.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#project-card-first',
    popover: {
      title: t('tour.dashboard.projectCard.title', 'Tarjeta de Proyecto'),
      description: t('tour.dashboard.projectCard.description', 
        'Muestra el nombre del proyecto y cuántos clientes tiene registrados. Al seleccionarla, se cargan los detalles a la derecha.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#project-detail',
    popover: {
      title: t('tour.dashboard.projectDetail.title', 'Detalle del Proyecto'),
      description: t('tour.dashboard.projectDetail.description', 
        'Aquí ves las métricas específicas del proyecto seleccionado: clientes, monto recaudado, pendiente y estado actual.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#project-metrics-clients',
    popover: {
      title: t('tour.dashboard.metrics.clients.title', 'Clientes del Proyecto'),
      description: t('tour.dashboard.metrics.clients.description', 
        'Número de propietarios registrados en este proyecto específico.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#project-metrics-collected',
    popover: {
      title: t('tour.dashboard.metrics.collected.title', 'Monto Recaudado'),
      description: t('tour.dashboard.metrics.collected.description', 
        'Total de dinero efectivamente cobrado de este proyecto. Un indicador clave de flujo de caja.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#project-metrics-pending',
    popover: {
      title: t('tour.dashboard.metrics.pending.title', 'Monto Pendiente'),
      description: t('tour.dashboard.metrics.pending.description', 
        'Total por cobrar. Un número alto puede indicar la necesidad de activar campañas de cobranza.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#project-metrics-phase',
    popover: {
      title: t('tour.dashboard.metrics.phase.title', 'Fase y Estado'),
      description: t('tour.dashboard.metrics.phase.description', 
        'Indica en qué fase de construcción está el proyecto y si se encuentra activo o inactivo.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#open-project-btn',
    popover: {
      title: t('tour.dashboard.openProject.title', 'Abrir Portal del Proyecto'),
      description: t('tour.dashboard.openProject.description', 
        'Abre en una nueva pestaña el portal público del proyecto, donde los residentes pueden ver sus propiedades, documentos y pagar sus cuotas.'),
      side: 'top',
      align: 'center'
    }
  },
  {
    popover: {
      title: t('tour.dashboard.finish.title', '¡Listo!'),
      description: t('tour.dashboard.finish.description', 
        'Ya conoces el Dashboard. Cada módulo tiene su propio tour guiado. ¡Explora el CRM con confianza!'),
      side: 'bottom',
      align: 'center'
    }
  }
]

export const dashboardTourConfig = {
  id: 'dashboard-onboarding',
  autoStart: false,
  conditions: {
    firstVisit: true
  }
}