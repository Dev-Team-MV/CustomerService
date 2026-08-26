export const getLoginTourSteps = (t) => [
  {
    element: '#login-language-switcher',
    popover: {
      title: t('tour.login.language.title', 'Idioma del Sistema'),
      description: t('tour.login.language.description', 'Puedes cambiar el idioma de toda la plataforma entre Español e Inglés en cualquier momento desde aquí.'),
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#login-method-toggle',
    popover: {
      title: t('tour.login.method.title', 'Método de Acceso'),
      description: t('tour.login.method.description', 'Elige si deseas iniciar sesión utilizando tu correo electrónico o tu número de teléfono registrado.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#login-credential-field',
    popover: {
      title: t('tour.login.credential.title', 'Tu Credencial'),
      description: t('tour.login.credential.description', 'Ingresa tu correo electrónico o número de teléfono (con código de país) que te fue asignado.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#login-password-field',
    popover: {
      title: t('tour.login.password.title', 'Contraseña'),
      description: t('tour.login.password.description', 'Ingresa tu contraseña. Puedes hacer clic en el ícono del ojo para mostrar u ocultar el texto.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#login-submit-btn',
    popover: {
      title: t('tour.login.submit.title', 'Iniciar Sesión'),
      description: t('tour.login.submit.description', 'Haz clic aquí para acceder al sistema. Si es tu primera vez, usa las credenciales temporales proporcionadas por tu administrador.'),
      side: 'top',
      align: 'center'
    }
  }
]

export const loginTourConfig = {
  id: 'login-onboarding',
  autoStart: false,
  conditions: {
    firstVisit: true
  }
}