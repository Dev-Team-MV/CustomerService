export const getAutomationTourSteps = (t) => [
  {
    element: '#automations-page-container',
    popover: {
      title: t('tour.automation.overview.title', 'Módulo de Automatizaciones'),
      description: t('tour.automation.overview.description', 'Aquí puedes crear, editar y gestionar flujos de trabajo automáticos para ahorrar tiempo y mejorar la comunicación.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#automations-stats',
    popover: {
      title: t('tour.automation.stats.title', 'Estadísticas Rápidas'),
      description: t('tour.automation.stats.description', 'Visualiza rápidamente el total de automatizaciones creadas y cuántas de ellas están actualmente activas.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#automations-create-btn',
    popover: {
      title: t('tour.automation.create.title', 'Crear Automatización'),
      description: t('tour.automation.create.description', 'Haz clic aquí para comenzar a diseñar una nueva automatización. Te guiaré a través del constructor paso a paso.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#automations-list',
    popover: {
      title: t('tour.automation.list.title', 'Lista de Automatizaciones'),
      description: t('tour.automation.list.description', 'Aquí verás todas tus automatizaciones. Te explicaré los componentes de la primera tarjeta para que entiendas cómo leerlas.'),
      side: 'top',
      align: 'start'
    }
  },
  // ✅ NUEVOS PASOS: Desglose de la primera tarjeta
  {
    element: '#automation-card-first',
    popover: {
      title: t('tour.automation.card.title', 'Tarjeta de Automatización'),
      description: t('tour.automation.card.description', 'Cada automatización se muestra en una tarjeta con toda la información relevante de un vistazo.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-card-toggle',
    popover: {
      title: t('tour.automation.card.toggle.title', 'Activar / Desactivar'),
      description: t('tour.automation.card.toggle.description', 'Usa este interruptor para pausar o reanudar la automatización al instante, sin necesidad de eliminarla.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-card-header',
    popover: {
      title: t('tour.automation.card.header.title', 'Nombre y Flujo'),
      description: t('tour.automation.card.header.description', 'Muestra el nombre de la automatización, el evento que la desencadena (trigger) y la acción que ejecuta.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-card-conditions',
    popover: {
      title: t('tour.automation.card.conditions.title', 'Condiciones Específicas'),
      description: t('tour.automation.card.conditions.description', 'Aquí se resumen los filtros aplicados, como la etapa del lead, el proyecto específico o los días de inactividad requeridos.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-card-action-detail',
    popover: {
      title: t('tour.automation.card.action.title', 'Detalle de la Acción'),
      description: t('tour.automation.card.action.description', 'Muestra el contenido exacto que se ejecutará: el mensaje de la plantilla SMS, los detalles de la actividad o el agente a notificar.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-card-footer',
    popover: {
      title: t('tour.automation.card.footer.title', 'Información Adicional'),
      description: t('tour.automation.card.footer.description', 'Indica quién creó la automatización, cuándo fue la última vez que se ejecutó y su estado actual.'),
      side: 'right',
      align: 'start'
    }
  },
  // ✅ PASO FINAL
  {
    element: '#automations-page-container',
    popover: {
      title: t('tour.automation.finish.title', '¡Listo!'),
      description: t('tour.automation.finish.description', 'Ya dominas el módulo de automatizaciones. ¡Crea flujos inteligentes y optimiza tu CRM!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const automationTourConfig = {
  id: 'automation-onboarding',
  autoStart: false
}