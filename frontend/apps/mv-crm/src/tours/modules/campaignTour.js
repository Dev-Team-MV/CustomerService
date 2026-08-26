export const getCampaignTourSteps = (t) => [
  {
    element: '#campaigns-page-container',
    popover: {
      title: t('tour.campaigns.overview.title', 'Módulo de Campañas'),
      description: t('tour.campaigns.overview.description', 'Desde aquí puedes crear, gestionar y monitorear el envío masivo de mensajes a tus leads o clientes.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#campaigns-filters',
    popover: {
      title: t('tour.campaigns.filters.title', 'Filtros de Búsqueda'),
      description: t('tour.campaigns.filters.description', 'Filtra tus campañas por estado (Borrador, Enviando, Completada, etc.) o por proyecto específico.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#campaigns-create-btn',
    popover: {
      title: t('tour.campaigns.create.title', 'Crear Campaña'),
      description: t('tour.campaigns.create.description', 'Haz clic aquí para iniciar el asistente de creación de campañas. Te guiaré a través de sus pasos.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#campaigns-data-table',
    popover: {
      title: t('tour.campaigns.table.title', 'Tabla de Campañas'),
      description: t('tour.campaigns.table.description', 'Aquí se listan todas tus campañas. Te explicaré el significado de cada columna usando la primera fila como ejemplo.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#campaigns-col-name',
    popover: {
      title: t('tour.campaigns.colName.title', 'Nombre de la Campaña'),
      description: t('tour.campaigns.colName.description', 'El nombre descriptivo que le asignaste a esta campaña para identificarla fácilmente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#campaigns-col-status',
    popover: {
      title: t('tour.campaigns.colStatus.title', 'Estado'),
      description: t('tour.campaigns.colStatus.description', 'Indica si la campaña está en borrador, programada, enviando, completada o si falló.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#campaigns-col-audience',
    popover: {
      title: t('tour.campaigns.colAudience.title', 'Audiencia Objetivo'),
      description: t('tour.campaigns.colAudience.description', 'Muestra a quién va dirigida: Leads o Clientes, y los filtros de proyecto o etapa aplicados.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#campaigns-col-stats',
    popover: {
      title: t('tour.campaigns.colStats.title', 'Estadísticas de Envío'),
      description: t('tour.campaigns.colStats.description', 'Muestra el total de contactos, cuántos mensajes se enviaron con éxito y cuántos fallaron, con una barra de progreso.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#campaigns-col-actions',
    popover: {
      title: t('tour.campaigns.colActions.title', 'Acciones Rápidas'),
      description: t('tour.campaigns.colActions.description', 'Edita o elimina borradores, envía campañas programadas, o reenvía/actualiza campañas en proceso o finalizadas.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#campaigns-page-container',
    popover: {
      title: t('tour.campaigns.finish.title', '¡Listo!'),
      description: t('tour.campaigns.finish.description', 'Ya dominas la gestión de campañas. ¡Crea tu primera campaña y mide su impacto!'),
      side: 'top',
      align: 'center'
    }
  }
]

export const campaignTourConfig = {
  id: 'campaigns-onboarding',
  autoStart: false
}