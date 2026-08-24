export const getQuoteBuilderTourSteps = (t) => [
  {
    element: '#quote-builder-stepper',
    popover: {
      title: t('tour.quoteBuilder.stepper.title', 'Asistente de 3 Pasos'),
      description: t('tour.quoteBuilder.stepper.description', 'Este asistente te guía secuencialmente: Selección de Propiedad, Configuración de Financiamiento y Vista Previa.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#quote-builder-step1',
    popover: {
      title: t('tour.quoteBuilder.step1.title', 'Paso 1: Propiedad'),
      description: t('tour.quoteBuilder.step1.description', 'Selecciona el Lead o Cliente, el proyecto y la propiedad específica. El sistema completará estos campos automáticamente en este tour.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#quote-builder-step2',
    popover: {
      title: t('tour.quoteBuilder.step2.title', 'Paso 2: Financiamiento'),
      description: t('tour.quoteBuilder.step2.description', 'Define el precio total, cuota inicial, tasa de interés y plazo. El sistema usará valores de prueba para esta demostración.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#quote-builder-step3',
    popover: {
      title: t('tour.quoteBuilder.step3.title', 'Paso 3: Vista Previa'),
      description: t('tour.quoteBuilder.step3.description', 'Revisa el resumen financiero y la tabla de amortización generada. Puedes agregar notas antes de guardar.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#quote-builder-actions',
    popover: {
      title: t('tour.quoteBuilder.actions.title', 'Guardar Cotización'),
      description: t('tour.quoteBuilder.actions.description', 'Al hacer clic en "Siguiente", el sistema simulará el guardado y cerrará el modal automáticamente.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const quoteBuilderTourConfig = {
  id: 'quote-builder-feature',
  autoStart: false
}