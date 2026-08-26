export const getGlobalSearchTourSteps = (t) => [
  {
    element: '#global-search-input',
    popover: {
      title: t('tour.globalSearch.input.title', 'Campo de Búsqueda'),
      description: t('tour.globalSearch.input.description', 'Escribe el nombre de un cliente, proyecto o lead. Los resultados se actualizan en tiempo real.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#global-search-results',
    popover: {
      title: t('tour.globalSearch.results.title', 'Resultados'),
      description: t('tour.globalSearch.results.description', 'Haz clic en cualquier resultado para navegar directamente a esa sección del CRM.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#global-search-shortcut-hint',
    popover: {
      title: t('tour.globalSearch.shortcut.title', 'Atajo de Teclado'),
      description: t('tour.globalSearch.shortcut.description', 'Puedes abrir esta búsqueda rápidamente presionando ⌘K (Mac) o Ctrl+K (Windows) desde cualquier lugar.'),
      side: 'top',
      align: 'center'
    }
  }
]

export const globalSearchTourConfig = {
  id: 'global-search-feature',
  autoStart: false
}