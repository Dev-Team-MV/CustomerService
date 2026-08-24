export const getWarrantyFormTourSteps = (t) => [
  {
    element: '#warranty-form-modal',
    popover: {
      title: t('tour.warrantyForm.modal.title', 'Formulario de Reclamo'),
      description: t('tour.warrantyForm.modal.description', 'Este modal te permite registrar un nuevo reclamo de garantía con toda la evidencia necesaria.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#warranty-form-project',
    popover: {
      title: t('tour.warrantyForm.project.title', 'Proyecto'),
      description: t('tour.warrantyForm.project.description', 'Selecciona el proyecto al que pertenece la propiedad afectada.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-form-link-type',
    popover: {
      title: t('tour.warrantyForm.linkType.title', 'Vinculación'),
      description: t('tour.warrantyForm.linkType.description', 'Indica si el reporte lo hace un Lead (prospecto) o un Cliente (residente) registrado.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-form-property',
    popover: {
      title: t('tour.warrantyForm.property.title', 'Unidad Afectada'),
      description: t('tour.warrantyForm.property.description', 'Selecciona el lote o apartamento específico donde se presenta el problema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-form-category-priority',
    popover: {
      title: t('tour.warrantyForm.categoryPriority.title', 'Categoría y Prioridad'),
      description: t('tour.warrantyForm.categoryPriority.description', 'Clasifica el tipo de problema (ej: plomería, eléctrico) y define su nivel de urgencia.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-form-description',
    popover: {
      title: t('tour.warrantyForm.description.title', 'Descripción Detallada'),
      description: t('tour.warrantyForm.description.description', 'Describe con el mayor detalle posible el problema reportado por el cliente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-form-photos',
    popover: {
      title: t('tour.warrantyForm.photos.title', 'Evidencia Fotográfica'),
      description: t('tour.warrantyForm.photos.description', 'Adjunta fotos o videos que respalden el reclamo para una evaluación más rápida.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#warranty-form-actions',
    popover: {
      title: t('tour.warrantyForm.actions.title', 'Guardar Reclamo'),
      description: t('tour.warrantyForm.actions.description', 'Revisa que todos los campos obligatorios estén completos y haz clic en "Crear" para registrar el reclamo.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const warrantyFormTourConfig = { id: 'warranty-form-feature', autoStart: false }