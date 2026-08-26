export const getCommissionTourSteps = (t) => [
  {
    element: '#commissions-page-container',
    popover: {
      title: t('tour.commissions.overview.title', 'Módulo de Comisiones'),
      description: t('tour.commissions.overview.description', 'Gestiona, aprueba y realiza seguimiento de los pagos de comisiones de tus agentes en un solo lugar.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#commissions-tabs',
    popover: {
      title: t('tour.commissions.tabs.title', 'Pestañas de Gestión'),
      description: t('tour.commissions.tabs.description', 'Navega entre el listado de comisiones individuales y la configuración de estructuras de comisiones por proyecto.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#commissions-tab-commissions',
    popover: {
      title: t('tour.commissions.tabCommissions.title', 'Pestaña: Comisiones'),
      description: t('tour.commissions.tabCommissions.description', 'Aquí gestionas el ciclo de vida de cada comisión: desde su creación hasta el pago final.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#commissions-filters',
    popover: {
      title: t('tour.commissions.filters.title', 'Filtros Avanzados'),
      description: t('tour.commissions.filters.description', 'Refina tu búsqueda utilizando estos filtros para encontrar comisiones específicas rápidamente.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#commissions-filter-project',
    popover: {
      title: t('tour.commissions.filterProject.title', 'Filtro por Proyecto'),
      description: t('tour.commissions.filterProject.description', 'Filtra las comisiones asociadas a un proyecto inmobiliario en particular.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#commissions-filter-agent',
    popover: {
      title: t('tour.commissions.filterAgent.title', 'Filtro por Agente'),
      description: t('tour.commissions.filterAgent.description', 'Busca las comisiones generadas por un agente o asesor específico.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#commissions-filter-status',
    popover: {
      title: t('tour.commissions.filterStatus.title', 'Filtro por Estado'),
      description: t('tour.commissions.filterStatus.description', 'Filtra por el estado actual: Pendiente, Aprobado, Pagado o Disputado.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#commissions-data-table',
    popover: {
      title: t('tour.commissions.table.title', 'Listado de Comisiones'),
      description: t('tour.commissions.table.description', 'Aquí ves el desglose de cada comisión. Te explicaré cada columna a continuación.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#commissions-col-date',
    popover: {
      title: t('tour.commissions.colDate.title', 'Fecha'),
      description: t('tour.commissions.colDate.description', 'La fecha en que se registró o generó la comisión.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#commissions-col-agent',
    popover: {
      title: t('tour.commissions.colAgent.title', 'Agente'),
      description: t('tour.commissions.colAgent.description', 'El nombre del agente o asesor que generó la venta y a quien corresponde la comisión.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#commissions-col-project',
    popover: {
      title: t('tour.commissions.colProject.title', 'Proyecto'),
      description: t('tour.commissions.colProject.description', 'El proyecto inmobiliario asociado a esta venta.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#commissions-col-amounts',
    popover: {
      title: t('tour.commissions.colAmounts.title', 'Montos'),
      description: t('tour.commissions.colAmounts.description', 'El monto total de la venta y el monto específico de la comisión a pagar.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#commissions-col-status',
    popover: {
      title: t('tour.commissions.colStatus.title', 'Estado'),
      description: t('tour.commissions.colStatus.description', 'El estado actual del flujo de aprobación de la comisión.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#commissions-col-actions',
    popover: {
      title: t('tour.commissions.colActions.title', 'Acciones Rápidas'),
      description: t('tour.commissions.colActions.description', 'Botones para gestionar la comisión. Al hacer clic en "Siguiente", abriremos el modal de detalles para mostrarte cómo funciona.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#commissions-tab-structures',
    popover: {
      title: t('tour.commissions.tabStructures.title', 'Pestaña: Estructuras'),
      description: t('tour.commissions.tabStructures.description', 'Cambia a esta pestaña para configurar las reglas de cálculo de comisiones para cada proyecto.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#structures-filter-project',
    popover: {
      title: t('tour.commissions.structuresFilter.title', 'Seleccionar Proyecto'),
      description: t('tour.commissions.structuresFilter.description', 'Primero, selecciona un proyecto para ver o crear sus estructuras. El sistema lo seleccionará por ti.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#structures-data-table',
    popover: {
      title: t('tour.commissions.structuresTable.title', 'Tabla de Estructuras'),
      description: t('tour.commissions.structuresTable.description', 'Aquí se listan las estructuras de comisiones configuradas para el proyecto seleccionado.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#structures-col-name',
    popover: {
      title: t('tour.commissions.structuresColName.title', 'Nombre'),
      description: t('tour.commissions.structuresColName.description', 'El nombre identificador de la estructura de comisiones.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#structures-col-type',
    popover: {
      title: t('tour.commissions.structuresColType.title', 'Tipo de Cálculo'),
      description: t('tour.commissions.structuresColType.description', 'El método de cálculo: Monto Fijo, Porcentaje o Escalonado (Tiers).'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#structures-col-default',
    popover: {
      title: t('tour.commissions.structuresColDefault.title', 'Estructura por Defecto'),
      description: t('tour.commissions.structuresColDefault.description', 'Indica si esta es la estructura predeterminada que se aplicará a nuevas comisiones en este proyecto.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#structures-col-actions',
    popover: {
      title: t('tour.commissions.structuresColActions.title', 'Editar'),
      description: t('tour.commissions.structuresColActions.description', 'Haz clic aquí para modificar las reglas de una estructura existente.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#commissions-create-structure-btn',
    popover: {
      title: t('tour.commissions.createStructure.title', 'Crear Estructura'),
      description: t('tour.commissions.createStructure.description', 'Haz clic aquí para configurar las reglas de comisiones. Te guiaré a través del proceso.'),
      side: 'left',
      align: 'end'
    }
  },
  {
    element: '#commissions-page-container',
    popover: {
      title: t('tour.commissions.finish.title', '¡Listo!'),
      description: t('tour.commissions.finish.description', 'Ya dominas la gestión de comisiones. ¡Mantén a tu equipo motivado con pagos transparentes y oportunos!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const commissionTourConfig = {
  id: 'commissions-onboarding',
  autoStart: false
}