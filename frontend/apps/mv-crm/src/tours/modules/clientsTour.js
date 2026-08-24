export const getClientsTourSteps = (t) => [
  {
    element: '#clients-page-container',
    popover: {
      title: t('tour.clients.welcome.title', 'Gestión de Clientes'),
      description: t('tour.clients.welcome.description', 'Desde aquí puedes ver, buscar, editar y gestionar todos los residentes del sistema de forma centralizada.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#clients-search-input',
    popover: {
      title: t('tour.clients.search.title', 'Buscador Inteligente'),
      description: t('tour.clients.search.description', 'Filtra rápidamente la lista en tiempo real por nombre, correo electrónico, número de teléfono o rol del cliente.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#clients-btn-add',
    popover: {
      title: t('tour.clients.addAction.title', 'Agregar Nuevo Cliente'),
      description: t('tour.clients.addAction.description', 'Haz clic aquí para registrar un nuevo residente. Se abrirá un asistente que te guiará para configurar sus datos y enviarle la invitación.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#clients-btn-send-message',
    popover: {
      title: t('tour.clients.sendMessage.title', 'Enviar Mensaje Masivo'),
      description: t('tour.clients.sendMessage.description', 'Usa esta herramienta para enviar SMS o correos electrónicos a múltiples clientes simultáneamente, usando plantillas o mensajes personalizados.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#clients-btn-export',
    popover: {
      title: t('tour.clients.export.title', 'Exportar Datos'),
      description: t('tour.clients.export.description', 'Descarga la lista de clientes en formato CSV o JSON. Puedes aplicar filtros antes de exportar para obtener solo los datos que necesitas.'),
      side: 'bottom',
      align: 'start'
    }
  },
  // ✅ PASOS DE LA TABLA
  {
    element: '#clients-data-table',
    popover: {
      title: t('tour.clients.table.title', 'Tabla de Datos'),
      description: t('tour.clients.table.description', 'Aquí se listan todos los clientes. Te explicaré cada columna y las acciones disponibles en la primera fila.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#clients-col-name',
    popover: {
      title: t('tour.clients.colName.title', 'Nombre y Correo'),
      description: t('tour.clients.colName.description', 'Muestra el avatar con las iniciales, el nombre completo y el correo electrónico principal de contacto.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-phone',
    popover: {
      title: t('tour.clients.colPhone.title', 'Teléfono'),
      description: t('tour.clients.colPhone.description', 'El número de teléfono formateado. Es el canal principal para enviar invitaciones y recordatorios.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-role',
    popover: {
      title: t('tour.clients.colRole.title', 'Rol del Usuario'),
      description: t('tour.clients.colRole.description', 'Indica el nivel de permisos: Super Administrador, Administrador, Owner o Residente.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-projects',
    popover: {
      title: t('tour.clients.colProjects.title', 'Proyectos Asignados'),
      description: t('tour.clients.colProjects.description', 'Muestra los proyectos inmobiliarios a los que este cliente tiene acceso, con un máximo de 4 avatares visibles.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-lots',
    popover: {
      title: t('tour.clients.colLots.title', 'Lotes/Propiedades'),
      description: t('tour.clients.colLots.description', 'Cantidad de lotes, apartamentos o propiedades específicas que el cliente tiene asignadas.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-status',
    popover: {
      title: t('tour.clients.colStatus.title', 'Estado de la Cuenta'),
      description: t('tour.clients.colStatus.description', 'Indica si la cuenta del cliente está activa o inactiva en el sistema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-joined',
    popover: {
      title: t('tour.clients.colJoined.title', 'Fecha de Registro'),
      description: t('tour.clients.colJoined.description', 'La fecha en la que el cliente fue creado o invitado al sistema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#clients-col-actions',
    popover: {
      title: t('tour.clients.colActions.title', 'Columna de Acciones'),
      description: t('tour.clients.colActions.description', 'Aquí encontrarás los botones para gestionar al cliente. Te los mostraré uno por uno en la primera fila.'),
      side: 'left',
      align: 'start'
    }
  },
  // ✅ PASOS BOTÓN POR BOTÓN (Primera fila)
  {
    element: '#clients-action-first-sms',
    popover: {
      title: t('tour.clients.actionSms.title', 'Enviar SMS de Configuración'),
      description: t('tour.clients.actionSms.description', 'Haz clic aquí para reenviar el enlace de configuración de contraseña al teléfono del cliente.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#clients-action-first-edit',
    popover: {
      title: t('tour.clients.actionEdit.title', 'Editar Cliente'),
      description: t('tour.clients.actionEdit.description', 'Abre el modal para modificar el nombre, correo, teléfono, rol o proyecto asignado a este cliente.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#clients-action-first-delete',
    popover: {
      title: t('tour.clients.actionDelete.title', 'Eliminar Cliente'),
      description: t('tour.clients.actionDelete.description', 'Elimina permanentemente al cliente del sistema. Se te pedirá confirmación antes de proceder.'),
      side: 'left',
      align: 'start'
    }
  },
  // ✅ NUEVO PASO FINAL: Resaltar la fila completa e invitar a hacer clic
  {
    element: '#data-table-first-row',
    popover: {
      title: t('tour.clients.clickRow.title', 'Ver Detalles del Cliente'),
      description: t('tour.clients.clickRow.description', '¡Haz clic en esta fila (o en cualquier otra) para abrir la vista detallada del cliente, donde podrás gestionar sus pagos, actividades, notas y documentos!'),
      side: 'right',
      align: 'start'
    }
  }
]

export const clientsTourConfig = {
  id: 'clients-onboarding',
  autoStart: false
}