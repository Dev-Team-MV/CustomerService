export const getResidentTourSteps = (t) => [
  {
    element: '#resident-dialog',
    popover: {
      title: t('residents:tour.residents.welcome.title', 'Invitar Nuevo Residente'),
      description: t('residents:tour.residents.welcome.description', 
        'Este modal te permite invitar nuevos residentes al sistema. Se les enviará un SMS con instrucciones para configurar su acceso.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#resident-info-alert',
    popover: {
      title: t('residents:tour.residents.infoAlert.title', 'Mensaje de Invitación'),
      description: t('residents:tour.residents.infoAlert.description', 
        'Este mensaje confirma que el residente recibirá un SMS con un enlace seguro para configurar su contraseña y acceder al portal.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#resident-name-fields',
    popover: {
      title: t('residents:tour.residents.nameFields.title', 'Nombre y Apellido'),
      description: t('residents:tour.residents.nameFields.description', 
        'Ingresa el nombre completo del residente. Esta información aparecerá en el portal y en los reportes del CRM.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#resident-email-field',
    popover: {
      title: t('residents:tour.residents.email.title', 'Correo Electrónico'),
      description: t('residents:tour.residents.email.description', 
        'El correo debe ser único en el sistema. Se usa para notificaciones y como credencial de acceso.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#resident-phone-field',
    popover: {
      title: t('residents:tour.residents.phone.title', 'Número de Teléfono'),
      description: t('residents:tour.residents.phone.description', 
        'Campo crítico: el residente recibe el SMS de invitación aquí. El formato E.164 se genera automáticamente al seleccionar el país.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#resident-country-field',
    popover: {
      title: t('residents:tour.residents.country.title', 'País de Residencia'),
      description: t('residents:tour.residents.country.description', 
        'Usa el autocompletado de Google para seleccionar el país. Esto ayuda a configurar correctamente el formato del teléfono y la zona horaria.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#resident-birthday-role',
    popover: {
      title: t('residents:tour.residents.birthdayRole.title', 'Fecha de Nacimiento y Rol'),
      description: t('residents:tour.residents.birthdayRole.description', 
        'La fecha de nacimiento es opcional. El rol determina los permisos del residente: user (básico), admin, superadmin o owner.'),
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#resident-actions',
    popover: {
      title: t('residents:tour.residents.actions.title', 'Enviar Invitación'),
      description: t('residents:tour.residents.actions.description', 
        'Al hacer clic en "Enviar Invitación", el sistema creará el usuario y enviará el SMS automáticamente. El botón se activa cuando todos los campos requeridos están completos.'),
      side: 'top',
      align: 'center'
    }
  }
]

export const residentTourConfig = {
  id: 'resident-modal',
  autoStart: false
}