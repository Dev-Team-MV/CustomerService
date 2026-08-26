// apps/mv-crm/src/tours/features/campaignWizardTour.js

export const getCampaignWizardTourSteps = (t) => [
  {
    element: '#wizard-stepper',
    popover: {
      title: t('tour.wizard.stepper.title', 'Asistente de 4 Pasos'),
      description: t('tour.wizard.stepper.description', 'Este asistente te guía de forma secuencial: Configuración, Plantilla, Vista Previa y Envío.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#wizard-step1-name',
    popover: {
      title: t('tour.wizard.step1.name.title', 'Nombre de la Campaña'),
      description: t('tour.wizard.step1.name.description', 'Asigna un nombre descriptivo. (En este tour, el sistema lo completará automáticamente).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#wizard-step1-audience',
    popover: {
      title: t('tour.wizard.step1.audience.title', 'Tipo de Audiencia'),
      description: t('tour.wizard.step1.audience.description', 'Define si enviarás a Leads o Clientes. El sistema pre-seleccionará una opción de prueba.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#wizard-step1-project',
    popover: {
      title: t('tour.wizard.step1.project.title', 'Proyecto y Etapa'),
      description: t('tour.wizard.step1.project.description', 'Filtra por proyecto y etapa para segmentar correctamente tu audiencia.'),
      side: 'right',
      align: 'start'
    }
  },
  // ✅ PASO CLAVE: El botón de continuar (Índice 4)
  {
    element: '#wizard-continue-btn',
    popover: {
      title: t('tour.wizard.step1.continue.title', 'Avanzar al Paso 2'),
      description: t('tour.wizard.step1.continue.description', 'El sistema completará automáticamente los campos con datos de prueba y avanzará a la selección de plantilla.'),
      side: 'left',
      align: 'end'
    }
  },
  {
    element: '#wizard-step2-mode',
    popover: {
      title: t('tour.wizard.step2.mode.title', 'Modo de Plantilla'),
      description: t('tour.wizard.step2.mode.description', 'Elige si deseas usar una plantilla existente o crear una nueva. El sistema ya ha seleccionado una por defecto para esta demostración.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#wizard-step2-content',
    popover: {
      title: t('tour.wizard.step2.content.title', 'Contenido y Variables'),
      description: t('tour.wizard.step2.content.description', 'Si creas una nueva, usa los chips para insertar variables dinámicas (como {{firstName}}) que se personalizarán para cada contacto.'),
      side: 'right',
      align: 'start'
    }
  },
  // ✅ PASO 3: Vista Previa
  {
    element: '#wizard-step-3',
    popover: {
      title: t('tour.wizard.step3.title', 'Paso 3: Vista Previa'),
      description: t('tour.wizard.step3.description', 'Aquí puedes ver una tabla con los contactos que recibirán el mensaje. Verifica que el total y los datos coincidan con tu audiencia seleccionada.'),
      side: 'right',
      align: 'start'
    }
  },
  // ✅ PASO 4: Envío
  {
    element: '#wizard-step-4',
    popover: {
      title: t('tour.wizard.step4.title', 'Paso 4: Confirmación y Envío'),
      description: t('tour.wizard.step4.description', 'Revisa el estado del envío. En este tour, el sistema simulará el progreso. En un caso real, aquí lanzarías la campaña y monitorearías los mensajes en tiempo real.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const campaignWizardTourConfig = {
  id: 'campaign-wizard-feature',
  autoStart: false
}