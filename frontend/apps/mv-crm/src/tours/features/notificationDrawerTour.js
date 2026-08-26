export const getNotificationDrawerTourSteps = (t) => [
  {
    element: '#notif-drawer-header',
    popover: {
      title: t('tour.notifDrawer.header.title', 'Centro de Notificaciones'),
      description: t('tour.notifDrawer.header.description', 'Aquí ves el resumen de todas tus alertas. El número junto al título indica cuántas notificaciones tienes en total.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#notif-drawer-tabs',
    popover: {
      title: t('tour.notifDrawer.tabs.title', 'Filtros por Categoría'),
      description: t('tour.notifDrawer.tabs.description', 'Filtra rápidamente por pagos vencidos, actividades próximas o leads estancados para priorizar tu trabajo.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#notif-drawer-mark-all',
    popover: {
      title: t('tour.notifDrawer.markAll.title', 'Marcar Todo como Leído'),
      description: t('tour.notifDrawer.markAll.description', '¿Ya revisaste todo? Usa este botón para limpiar tu bandeja de entrada de un solo clic.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#notif-drawer-list',
    popover: {
      title: t('tour.notifDrawer.list.title', 'Lista de Alertas'),
      description: t('tour.notifDrawer.list.description', 'Haz clic en cualquier alerta para marcarla como leída. Las alertas no leídas tienen un fondo de color para destacar.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#notif-drawer-footer',
    popover: {
      title: t('tour.notifDrawer.footer.title', 'Actualización en Tiempo Real'),
      description: t('tour.notifDrawer.footer.description', 'Este panel se actualiza automáticamente. ¡Mantente al tanto de las acciones críticas de tus proyectos!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const notificationDrawerTourConfig = {
  id: 'notification-drawer-feature',
  autoStart: false
}