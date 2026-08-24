export const getSendQuoteTourSteps = (t) => [
  {
    element: '#send-quote-modal',
    popover: { title: t('tour.sendQuote.modal.title', 'Modal de Envío'), description: t('tour.sendQuote.modal.description', 'Desde aquí puedes enviar la cotización al cliente por correo, SMS o ambos.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#send-quote-method',
    popover: { title: t('tour.sendQuote.method.title', 'Método de Envío'), description: t('tour.sendQuote.method.description', 'Selecciona si deseas enviar por Email, SMS o ambos canales simultáneamente.'), side: 'right', align: 'start' }
  },
  {
    element: '#send-quote-contact',
    popover: { title: t('tour.sendQuote.contact.title', 'Datos de Contacto'), description: t('tour.sendQuote.contact.description', 'El sistema pre-llena el correo y teléfono del cliente. Puedes editarlos si es necesario antes de enviar.'), side: 'right', align: 'start' }
  },
  {
    element: '#send-quote-actions',
    popover: { title: t('tour.sendQuote.actions.title', 'Enviar'), description: t('tour.sendQuote.actions.description', 'Haz clic en "Enviar" para despachar la cotización. El sistema la marcará automáticamente como "Enviado".'), side: 'top', align: 'end' }
  }
]
export const sendQuoteTourConfig = { id: 'send-quote-feature', autoStart: false }