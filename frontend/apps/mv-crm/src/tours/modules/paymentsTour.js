export const getPaymentsTourSteps = (t) => [
  {
    element: '#payments-page-container',
    popover: { 
      title: t('tour.payments.overview.title', 'Módulo de Pagos'), 
      description: t('tour.payments.overview.description', 'Gestiona y da seguimiento a todos los pagos pendientes, firmados y vencidos de tus clientes.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#payments-summary-strip',
    popover: { 
      title: t('tour.payments.summary.title', 'Resumen Financiero'), 
      description: t('tour.payments.summary.description', 'Visualiza de un vistazo el monto total pendiente, lo recaudado y el valor en riesgo por pagos vencidos.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#payments-filters',
    popover: { 
      title: t('tour.payments.filters.title', 'Filtros de Búsqueda'), 
      description: t('tour.payments.filters.description', 'Filtra los pagos por proyecto, estado (Pendiente, Firmado, Vencido) o rango de fechas.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#payments-export-btn',
    popover: { 
      title: t('tour.payments.export.title', 'Exportar Reportes'), 
      description: t('tour.payments.export.description', 'Descarga un reporte detallado de los pagos en Excel o CSV, aplicando los filtros actuales.'), 
      side: 'bottom', 
      align: 'start' 
    }
  },
  {
    element: '#payments-data-table',
    popover: { 
      title: t('tour.payments.table.title', 'Tabla de Pagos'), 
      description: t('tour.payments.table.description', 'Aquí se listan todos los pagos. Te explicaré cada una de sus columnas.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-col-client',
    popover: { 
      title: t('tour.payments.colClient.title', 'Cliente'), 
      description: t('tour.payments.colClient.description', 'Nombre del cliente y su número de teléfono de contacto rápido.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-col-project',
    popover: { 
      title: t('tour.payments.colProject.title', 'Proyecto'), 
      description: t('tour.payments.colProject.description', 'El proyecto inmobiliario al que corresponde este pago.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-col-unit',
    popover: { 
      title: t('tour.payments.colUnit.title', 'Unidad'), 
      description: t('tour.payments.colUnit.description', 'El número de lote o apartamento específico asociado al pago.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-col-amount',
    popover: { 
      title: t('tour.payments.colAmount.title', 'Monto'), 
      description: t('tour.payments.colAmount.description', 'El valor monetario que el cliente debe pagar en esta cuota.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-col-dueDate',
    popover: { 
      title: t('tour.payments.colDueDate.title', 'Fecha de Vencimiento'), 
      description: t('tour.payments.colDueDate.description', 'La fecha límite de pago. Si la fecha ya pasó, se marcará visualmente como "Vencido" en rojo.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-col-status',
    popover: { 
      title: t('tour.payments.colStatus.title', 'Estado'), 
      description: t('tour.payments.colStatus.description', 'Indica si el pago está Pendiente, ya fue Firmado o está Vencido.'), 
      side: 'top', 
      align: 'start' 
    }
  },
  {
    element: '#payments-page-container',
    popover: { 
      title: t('tour.payments.finish.title', '¡Tour Completado!'), 
      description: t('tour.payments.finish.description', 'Ahora puedes gestionar, filtrar y dar seguimiento a los pagos de manera eficiente.'), 
      side: 'top', 
      align: 'center' 
    }
  }
]

export const paymentsTourConfig = { id: 'payments-onboarding', autoStart: false }