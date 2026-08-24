export const getAutomationBuilderTourSteps = (t) => [
  {
    element: '#automation-builder-name',
    popover: {
      title: t('tour.automationBuilder.name.title', 'Nombre y Estado'),
      description: t('tour.automationBuilder.name.description', 'Asigna un nombre descriptivo a tu automatización y define si estará activa o inactiva desde el inicio.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#automation-builder-trigger',
    popover: {
      title: t('tour.automationBuilder.trigger.title', 'Desencadenante (Trigger)'),
      description: t('tour.automationBuilder.trigger.description', 'Elige el evento que iniciará esta automatización (ej: cambio de etapa del lead, pago vencido, etc.).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-builder-conditions',
    popover: {
      title: t('tour.automationBuilder.conditions.title', 'Condiciones'),
      description: t('tour.automationBuilder.conditions.description', 'Refina cuándo se ejecuta. Puedes filtrar por etapa específica del lead, días de inactividad o un proyecto en particular.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-builder-action',
    popover: {
      title: t('tour.automationBuilder.action.title', 'Acción a Ejecutar'),
      description: t('tour.automationBuilder.action.description', 'Define qué sucederá cuando se cumplan las condiciones: enviar un SMS, crear una actividad o notificar a un agente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-builder-config',
    popover: {
      title: t('tour.automationBuilder.config.title', 'Configuración de la Acción'),
      description: t('tour.automationBuilder.config.description', 'Detalla la acción: selecciona una plantilla de mensaje, escribe un mensaje personalizado con variables dinámicas o asigna la tarea a un agente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#automation-builder-actions',
    popover: {
      title: t('tour.automationBuilder.actions.title', 'Guardar y Probar'),
      description: t('tour.automationBuilder.actions.description', 'Usa el botón "Probar" para simular la automatización. Cuando estés listo, haz clic en "Crear" o "Actualizar" para guardar.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const automationBuilderTourConfig = {
  id: 'automation-builder-feature',
  autoStart: false
}