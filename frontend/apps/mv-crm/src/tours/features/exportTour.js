export const getExportTourSteps = (t) => [
  {
    element: '#export-filter-projectId', // ✅ Apunta específicamente al selector de proyectos
    popover: {
      title: t('tour.export.projectFilter.title', 'Filtro por Proyecto'),
      description: t('tour.export.projectFilter.description', 'Selecciona un proyecto específico para exportar solo los clientes asociados a él, o déjalo en "Todos" para descargar la base completa.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#export-modal-format',
    popover: {
      title: t('tour.export.format.title', 'Formato de Archivo'),
      description: t('tour.export.format.description', 'Elige el formato de salida. CSV es ideal para abrir en Excel, mientras que JSON es útil para integraciones técnicas o respaldos.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#export-modal-actions',
    popover: {
      title: t('tour.export.actions.title', 'Descargar Datos'),
      description: t('tour.export.actions.description', 'Haz clic en el botón de exportar para descargar el archivo con los datos filtrados en el formato que seleccionaste.'),
      side: 'top',
      align: 'end'
    }
  }
]

export const exportTourConfig = {
  id: 'export-feature',
  autoStart: false
}