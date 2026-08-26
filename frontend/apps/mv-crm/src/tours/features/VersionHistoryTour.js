export const getVersionHistoryTourSteps = (t) => [
  {
    element: '#document-history-drawer',
    popover: {
      title: t('tour.versionHistory.drawer.title', 'Historial de Versiones'),
      description: t('tour.versionHistory.drawer.description', 'Mantiene un registro de todos los cambios y actualizaciones de este documento a lo largo del tiempo.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#document-history-list',
    popover: {
      title: t('tour.versionHistory.list.title', 'Lista de Versiones'),
      description: t('tour.versionHistory.list.description', 'Muestra la versión actual (marcada en verde) y las versiones anteriores archivadas, con la fecha y el usuario que las subió.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#document-history-upload',
    popover: {
      title: t('tour.versionHistory.upload.title', 'Subir Nueva Versión'),
      description: t('tour.versionHistory.upload.description', 'Al subir un nuevo archivo con el mismo nombre, el sistema incrementa la versión y archiva la anterior automáticamente.'),
      side: 'top',
      align: 'end'
    }
  }
]
export const versionHistoryTourConfig = { id: 'version-history-feature', autoStart: false }