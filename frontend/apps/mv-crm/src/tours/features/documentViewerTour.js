export const getDocumentViewerTourSteps = (t) => [
  {
    element: '#document-viewer-modal',
    popover: {
      title: t('tour.documentViewer.modal.title', 'Visor de Documentos'),
      description: t('tour.documentViewer.modal.description', 'Aquí puedes previsualizar el contenido del documento sin necesidad de descargarlo a tu dispositivo.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#document-viewer-content',
    popover: {
      title: t('tour.documentViewer.content.title', 'Área de Previsualización'),
      description: t('tour.documentViewer.content.description', 'Soporta vista directa para imágenes y PDFs. Para otros formatos, te ofrecerá la opción de abrirlo en una nueva pestaña.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#document-viewer-actions',
    popover: {
      title: t('tour.documentViewer.actions.title', 'Acciones del Visor'),
      description: t('tour.documentViewer.actions.description', 'Descarga el archivo a tu computadora o ábrelo en una pestaña nueva del navegador para una vista más amplia.'),
      side: 'top',
      align: 'end'
    }
  }
]
export const documentViewerTourConfig = { id: 'document-viewer-feature', autoStart: false }