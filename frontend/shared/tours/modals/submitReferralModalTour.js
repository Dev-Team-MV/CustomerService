export const getSubmitReferralModalTourSteps = (t) => [
  {
    element: '#shared-referral-modal',
    popover: { 
      title: t('tour.sharedReferralModal.modal.title', 'Formulario de Referido'), 
      description: t('tour.sharedReferralModal.modal.description', 'Este es un componente compartido para registrar nuevos referidos, ya sea desde el CRM o desde el portal del cliente.'), 
      side: 'bottom', 
      align: 'center' 
    }
  },
  {
    element: '#shared-referral-project',
    popover: { 
      title: t('tour.sharedReferralModal.project.title', 'Proyecto'), 
      description: t('tour.sharedReferralModal.project.description', 'Selecciona el proyecto inmobiliario al que se referirá al contacto.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#shared-referral-referrer',
    popover: { 
      title: t('tour.sharedReferralModal.referrer.title', 'Referidor'), 
      description: t('tour.sharedReferralModal.referrer.description', 'Elige al cliente o residente que está haciendo la recomendación.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#shared-referral-contact',
    popover: { 
      title: t('tour.sharedReferralModal.contact.title', 'Datos del Referido'), 
      description: t('tour.sharedReferralModal.contact.description', 'Ingresa el nombre, teléfono, correo y país de la persona referida.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#shared-referral-reward',
    popover: { 
      title: t('tour.sharedReferralModal.reward.title', 'Tipo de Recompensa'), 
      description: t('tour.sharedReferralModal.reward.description', 'Define si la recompensa será en efectivo o un descuento en la propiedad, y su monto.'), 
      side: 'right', 
      align: 'start' 
    }
  },
  {
    element: '#shared-referral-actions',
    popover: { 
      title: t('tour.sharedReferralModal.actions.title', 'Guardar Referido'), 
      description: t('tour.sharedReferralModal.actions.description', 'Revisa la información y haz clic en "Enviar" para registrar el referido. Al cerrar, continuaremos con el tour.'), 
      side: 'top', 
      align: 'end' 
    }
  }
]

export const submitReferralModalTourConfig = {
  id: 'shared-submit-referral-modal',
  autoStart: false
}