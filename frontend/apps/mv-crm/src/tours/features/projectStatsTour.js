export const getProjectStatsTourSteps = (t) => [
  {
    element: '#project-stats-modal',
    popover: {
      title: t('tour.statsModal.overview.title', 'Panel de Estadísticas'),
      description: t('tour.statsModal.overview.description', 'Este panel te ofrece un análisis financiero y comercial detallado del proyecto seleccionado.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#project-stats-tabs',
    popover: {
      title: t('tour.statsModal.tabs.title', 'Pestañas de Análisis'),
      description: t('tour.statsModal.tabs.description', 'Alterna entre "Balance" para ver lo recaudado vs. pendiente, y "Clients" para analizar la ocupación.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#project-stats-balance-overview',
    popover: {
      title: t('tour.statsModal.balanceOverview.title', 'Resumen de Balance'),
      description: t('tour.statsModal.balanceOverview.description', 'Muestra el total recaudado y el monto pendiente de pago para este proyecto específico.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#project-stats-balance-chart',
    popover: {
      title: t('tour.statsModal.balanceChart.title', 'Gráfico de Distribución'),
      description: t('tour.statsModal.balanceChart.description', 'Visualización gráfica en dona del porcentaje cobrado versus el porcentaje pendiente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#project-stats-tab-clients',
    popover: {
      title: t('tour.statsModal.clientsTab.title', 'Pestaña de Clientes'),
      description: t('tour.statsModal.clientsTab.description', 'Al hacer clic en "Siguiente", cambiaremos a esta pestaña para ver la información de los clientes.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#project-stats-clients-overview',
    popover: {
      title: t('tour.statsModal.clientsOverview.title', 'Resumen de Clientes'),
      description: t('tour.statsModal.clientsOverview.description', 'Muestra el total de clientes asociados y el estado de sus propiedades (vendidas, reservadas, disponibles).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#project-stats-clients-chart',
    popover: {
      title: t('tour.statsModal.clientsChart.title', 'Gráfico de Propiedades'),
      description: t('tour.statsModal.clientsChart.description', 'Distribución visual de las propiedades asignadas a los clientes dentro de este proyecto.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#project-stats-close',
    popover: {
      title: t('tour.statsModal.close.title', 'Cerrar Panel'),
      description: t('tour.statsModal.close.description', 'Haz clic aquí para cerrar las estadísticas y finalizar el tour del módulo de proyectos.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const projectStatsTourConfig = { id: 'project-stats-modal-tour', autoStart: false }