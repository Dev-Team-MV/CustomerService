export const getConvertToSaleTourSteps = (t) => [
  {
    element: '#convert-sale-modal',
    popover: { title: t('tour.convertSale.modal.title', 'Convertir a Venta'), description: t('tour.convertSale.modal.description', 'Este proceso transforma la cotización en una venta real, creando o vinculando la propiedad en el sistema.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#convert-sale-info',
    popover: { title: t('tour.convertSale.info.title', 'Resumen de la Conversión'), description: t('tour.convertSale.info.description', 'Muestra el cliente, el monto cotizado y si la propiedad ya existe o necesita ser creada.'), side: 'right', align: 'start' }
  },
  {
    element: '#convert-sale-actions',
    popover: { title: t('tour.convertSale.actions.title', 'Confirmar Conversión'), description: t('tour.convertSale.actions.description', 'Al hacer clic en "Confirmar Conversión", el sistema vinculará la cotización a la propiedad y actualizará los estados.'), side: 'top', align: 'end' }
  }
]
export const convertToSaleTourConfig = { id: 'convert-sale-feature', autoStart: false }