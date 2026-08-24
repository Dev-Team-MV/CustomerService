export const getSurveyTemplateFormTourSteps = (t) => [
  {
    element: '#survey-template-form-modal',
    popover: {
      title: t('tour.templateForm.modal.title', 'Diseñador de Plantillas'),
      description: t('tour.templateForm.modal.description', 'Este modal te permite crear o editar modelos de encuestas reutilizables para estandarizar la recolección de feedback.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#template-form-general-info',
    popover: {
      title: t('tour.templateForm.generalInfo.title', 'Información General'),
      description: t('tour.templateForm.generalInfo.description', 'Asigna la plantilla a un proyecto, define su tipo (Post-venta, Anual, etc.), dale un nombre y decide si está activa.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#template-form-questions',
    popover: {
      title: t('tour.templateForm.questions.title', 'Preguntas de la Encuesta'),
      description: t('tour.templateForm.questions.description', 'Agrega las preguntas que compondrán la encuesta. Debes definir una clave única y el texto tanto en español como en inglés.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#template-form-actions',
    popover: {
      title: t('tour.templateForm.actions.title', 'Guardar Plantilla'),
      description: t('tour.templateForm.actions.description', 'Revisa que todas las preguntas tengan clave y texto en español. Luego, haz clic en "Guardar". Al cerrar, finalizaremos el tour.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const surveyTemplateFormTourConfig = {
  id: 'survey-template-form-feature',
  autoStart: false
}