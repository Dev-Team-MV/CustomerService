export const getOnboardingFormTourSteps = (t) => [
  {
    element: '#onboarding-form-modal',
    popover: {
      title: t('tour.onboardingForm.modal.title', 'Formulario de Creación'),
      description: t('tour.onboardingForm.modal.description', 'Este modal te permite iniciar el proceso de onboarding para un cliente específico.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#onboarding-form-project',
    popover: {
      title: t('tour.onboardingForm.project.title', 'Selección de Proyecto'),
      description: t('tour.onboardingForm.project.description', 'Selecciona el proyecto al que pertenece el cliente. Esto filtrará las opciones siguientes.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-form-client',
    popover: {
      title: t('tour.onboardingForm.client.title', 'Cliente'),
      description: t('tour.onboardingForm.client.description', 'Elige al cliente (residente) que realizará el proceso de onboarding.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-form-property',
    popover: {
      title: t('tour.onboardingForm.property.title', 'Propiedad Asignada'),
      description: t('tour.onboardingForm.property.description', 'Selecciona el lote o apartamento específico. El sistema solo mostrará las propiedades asignadas a este cliente en el proyecto.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#onboarding-form-actions',
    popover: {
      title: t('tour.onboardingForm.actions.title', 'Crear Onboarding'),
      description: t('tour.onboardingForm.actions.description', 'Revisa que los datos sean correctos y haz clic en "Crear" para generar el checklist inicial.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const onboardingFormTourConfig = { id: 'onboarding-form-feature', autoStart: false }