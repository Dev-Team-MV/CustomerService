export const getCommissionStructureTourSteps = (t) => [
  {
    element: '#structure-editor-name-type',
    popover: {
      title: t('tour.structure.nameType.title', 'Nombre y Tipo'),
      description: t('tour.structure.nameType.description', 'Asigna un nombre a la estructura y elige el tipo de cálculo: Monto Fijo, Porcentaje o Escalonado (Tiers).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#structure-editor-rates',
    popover: {
      title: t('tour.structure.rates.title', 'Configuración de Tasas'),
      description: t('tour.structure.rates.description', 'Define el porcentaje, el monto fijo o los rangos escalonados según el tipo de estructura seleccionado.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#structure-editor-bonus',
    popover: {
      title: t('tour.structure.bonus.title', 'Reglas de Bonificación'),
      description: t('tour.structure.bonus.description', 'Agrega incentivos adicionales, como bonos por ventas rápidas o por superar montos mínimos.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#structure-editor-actions',
    popover: {
      title: t('tour.structure.actions.title', 'Guardar Estructura'),
      description: t('tour.structure.actions.description', 'Revisa que todo esté correcto y haz clic en "Crear" o "Actualizar" para guardar la estructura.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const commissionStructureTourConfig = {
  id: 'commission-structure-feature',
  autoStart: false
}