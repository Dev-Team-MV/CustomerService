export const getReferralsTourSteps = (t) => [
  {
    element: '#referrals-page-container',
    popover: { title: t('tour.referrals.overview.title', 'Módulo de Referidos'), description: t('tour.referrals.overview.description', 'Gestiona el programa de referidos, rastrea el progreso de los leads y administra las recompensas.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#referrals-tabs',
    popover: { title: t('tour.referrals.tabs.title', 'Pestañas de Gestión'), description: t('tour.referrals.tabs.description', 'Navega entre la lista de referidos, el ranking de referidores y la configuración del programa.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#referrals-tab-list',
    popover: { title: t('tour.referrals.tabList.title', 'Lista de Referidos'), description: t('tour.referrals.tabList.description', 'Aquí puedes ver y gestionar todos los referidos registrados en el sistema.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#referrals-stats',
    popover: { title: t('tour.referrals.stats.title', 'Estadísticas Clave'), description: t('tour.referrals.stats.description', 'Visualiza rápidamente el total de referidos, la tasa de conversión y el monto total de recompensas pagadas.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#referrals-filters',
    popover: { title: t('tour.referrals.filters.title', 'Filtros'), description: t('tour.referrals.filters.description', 'Filtra la lista por proyecto específico o por el estado actual del referido.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#referrals-create-btn',
    popover: { title: t('tour.referrals.createBtn.title', 'Crear Nuevo Referido'), description: t('tour.referrals.createBtn.description', 'Al hacer clic en "Siguiente", abriremos el formulario compartido para registrar un nuevo referido.'), side: 'bottom', align: 'end' }
  },
  {
    element: '#referrals-data-table',
    popover: { title: t('tour.referrals.table.title', 'Tabla de Referidos'), description: t('tour.referrals.table.description', 'Aquí se listan todos los referidos con su información. Te explicaré cada una de sus columnas.'), side: 'top', align: 'start' }
  },
  {
    element: '#referral-col-referrer',
    popover: { title: t('tour.referrals.colReferrer.title', 'Referidor'), description: t('tour.referrals.colReferrer.description', 'El nombre del cliente o residente que está haciendo la recomendación.'), side: 'top', align: 'start' }
  },
  {
    element: '#referral-col-referred',
    popover: { title: t('tour.referrals.colReferred.title', 'Referido'), description: t('tour.referrals.colReferred.description', 'Los datos de contacto de la persona que fue recomendada.'), side: 'top', align: 'start' }
  },
  {
    element: '#referral-col-project',
    popover: { title: t('tour.referrals.colProject.title', 'Proyecto'), description: t('tour.referrals.colProject.description', 'El proyecto inmobiliario al que se está refiriendo al contacto.'), side: 'top', align: 'start' }
  },
  {
    element: '#referral-col-status',
    popover: { title: t('tour.referrals.colStatus.title', 'Estado'), description: t('tour.referrals.colStatus.description', 'El progreso actual del referido (Pendiente, Contactado, Calificado, Convertido, etc.).'), side: 'top', align: 'start' }
  },
  {
    element: '#referral-col-reward',
    popover: { title: t('tour.referrals.colReward.title', 'Recompensa'), description: t('tour.referrals.colReward.description', 'El tipo y monto de la recompensa acordada (Efectivo o Descuento en Propiedad).'), side: 'top', align: 'start' }
  },
  {
    element: '#referral-col-actions',
    popover: { 
      title: t('tour.referrals.colActions.title', 'Acciones'), 
      description: t('tour.referrals.colActions.description', 'Aquí encontrarás el botón "Marcar como Venta" para convertir el referido, o "Aprobar Recompensa" una vez que la venta se haya concretado.'), 
      side: 'left', 
      align: 'start' 
    }
  },
  // --- LEADERBOARD ---
  {
    element: '#referrals-tab-leaderboard',
    popover: { title: t('tour.referrals.tabLeaderboard.title', 'Ir al Leaderboard'), description: t('tour.referrals.tabLeaderboard.description', 'Al hacer clic en "Siguiente", nos moveremos a la pestaña de ranking.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#leaderboard-container',
    popover: { title: t('tour.referrals.leaderboardContainer.title', 'Ranking de Referidores'), description: t('tour.referrals.leaderboardContainer.description', 'Aquí se muestra el top 10 de los referidores más exitosos, ordenados por el monto total ganado.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#leaderboard-list',
    popover: { title: t('tour.referrals.leaderboardList.title', 'Detalle del Ranking'), description: t('tour.referrals.leaderboardList.description', 'Cada fila muestra la medalla, el nombre, la cantidad de referidos, cuántos se convirtieron en venta y el monto total ganado.'), side: 'right', align: 'start' }
  },

  // --- PROGRAM CONFIG ---
  {
    element: '#referrals-tab-program',
    popover: { title: t('tour.referrals.tabProgram.title', 'Ir a Configuración'), description: t('tour.referrals.tabProgram.description', 'Al hacer clic en "Siguiente", iremos a la configuración de recompensas del programa.'), side: 'bottom', align: 'start' }
  },
  {
    element: '#program-config-filters',
    popover: { title: t('tour.referrals.programFilters.title', 'Filtros de Programa'), description: t('tour.referrals.programFilters.description', 'Filtra las configuraciones de recompensas existentes por proyecto.'), side: 'bottom', align: 'start' }
  },
  // ✅ PASO 19: Botón Crear Programa
  {
    element: '#program-config-create-btn',
    popover: { title: t('tour.referrals.programCreate.title', 'Nuevo Programa'), description: t('tour.referrals.programCreate.description', 'Al hacer clic en "Siguiente", abriremos el formulario para crear una nueva configuración de recompensas.'), side: 'bottom', align: 'end' }
  },
  // ✅ PASOS 20-25: Explicación del Modal
  {
    element: '#program-config-modal',
    popover: { title: t('tour.referrals.programModal.title', 'Diseñador de Programas'), description: t('tour.referrals.programModal.description', 'Este modal te permite definir las reglas de recompensa para un proyecto específico.'), side: 'bottom', align: 'center' }
  },
  {
    element: '#program-config-modal-project',
    popover: { title: t('tour.referrals.programModalProject.title', 'Proyecto'), description: t('tour.referrals.programModalProject.description', 'Selecciona el proyecto al que se aplicará esta configuración de recompensas.'), side: 'right', align: 'start' }
  },
  {
    element: '#program-config-modal-name',
    popover: { title: t('tour.referrals.programModalName.title', 'Nombre del Programa'), description: t('tour.referrals.programModalName.description', 'Asigna un nombre descriptivo para identificar fácilmente esta configuración.'), side: 'right', align: 'start' }
  },
  {
    element: '#program-config-modal-reward-type',
    popover: { title: t('tour.referrals.programModalReward.title', 'Tipo de Recompensa'), description: t('tour.referrals.programModalReward.description', 'Elige si la recompensa será en efectivo (Cash) o un descuento en la propiedad.'), side: 'right', align: 'start' }
  },
  {
    element: '#program-config-modal-terms',
    popover: { title: t('tour.referrals.programModalTerms.title', 'Términos y Condiciones'), description: t('tour.referrals.programModalTerms.description', 'Define las reglas legales o notas importantes en español e inglés.'), side: 'right', align: 'start' }
  },
  {
    element: '#program-config-modal-cancel-btn',
    popover: { title: t('tour.referrals.programModalClose.title', 'Cerrar'), description: t('tour.referrals.programModalClose.description', 'Haz clic en "Cancelar" para cerrar este modal sin guardar y finalizar el tour.'), side: 'top', align: 'end' }
  },
  // ✅ PASO 26: FINAL
  {
    element: '#referrals-page-container',
    popover: { title: t('tour.referrals.finish.title', '¡Tour Completado!'), description: t('tour.referrals.finish.description', 'Ahora estás listo para gestionar y hacer crecer tu red de referidos.'), side: 'top', align: 'center' }
  }
]

export const referralsTourConfig = { id: 'referrals-onboarding', autoStart: false }