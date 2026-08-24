export const getDocumentUploadTourSteps = (t) => [
  {
    element: '#doc-upload-dropzone',
    popover: {
      title: t('tour.docUpload.dropzone.title', 'Arrastra o Selecciona Archivos'),
      description: t('tour.docUpload.dropzone.description', 'Arrastra tus archivos aquí o haz clic para seleccionarlos desde tu dispositivo. Puedes subir múltiples documentos a la vez.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#doc-upload-basic-info',
    popover: {
      title: t('tour.docUpload.basicInfo.title', 'Información Básica'),
      description: t('tour.docUpload.basicInfo.description', 'Asigna un título descriptivo y selecciona la categoría del documento (Contrato, Escritura, Plano, etc.).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#doc-upload-linking',
    popover: {
      title: t('tour.docUpload.linking.title', 'Vinculación'),
      description: t('tour.docUpload.linking.description', 'Vincula el documento a un Proyecto, y opcionalmente a un Lead, Cliente o una propiedad específica (Lote/Apartamento).'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#doc-upload-metadata',
    popover: {
      title: t('tour.docUpload.metadata.title', 'Metadatos'),
      description: t('tour.docUpload.metadata.description', 'Agrega etiquetas para facilitar la búsqueda y, si aplica, establece una fecha de vencimiento para el documento.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#doc-upload-actions',
    popover: {
      title: t('tour.docUpload.actions.title', 'Subir Documentos'),
      description: t('tour.docUpload.actions.description', 'Revisa que toda la información sea correcta y haz clic en "Subir" para guardar los documentos en el sistema.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const documentUploadTourConfig = {
  id: 'document-upload-feature',
  autoStart: false
}