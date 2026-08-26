// /Users/oficina/MV-CRM/CustomerService/frontend/shared/tours/shared/universalLoginTour.js

export const getUniversalLoginTourSteps = (t) => [
  {
    element: '#universal-login-container',
    popover: {
      title: t('tour.universalLogin.overview.title', 'Pantalla de Inicio de Sesión'),
      description: t('tour.universalLogin.overview.description', 'Bienvenido al sistema. Aquí podrás autenticarte para acceder a tu cuenta.'),
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '#language-switcher',
    popover: {
      title: t('tour.universalLogin.languageSwitcher.title', 'Selector de Idioma'),
      description: t('tour.universalLogin.languageSwitcher.description', 'Cambia el idioma de la interfaz entre español e inglés en cualquier momento.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#login-method-toggle',
    popover: {
      title: t('tour.universalLogin.methodToggle.title', 'Método de Autenticación'),
      description: t('tour.universalLogin.methodToggle.description', 'Elige si prefieres iniciar sesión con tu correo electrónico o número de teléfono.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#login-email-field',
    popover: {
      title: t('tour.universalLogin.emailField.title', 'Correo Electrónico'),
      description: t('tour.universalLogin.emailField.description', 'Ingresa tu dirección de correo electrónico registrada en el sistema.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#login-password-field',
    popover: {
      title: t('tour.universalLogin.passwordField.title', 'Contraseña'),
      description: t('tour.universalLogin.passwordField.description', 'Ingresa tu contraseña. Puedes usar el ícono del ojo para mostrarla u ocultarla.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#forgot-password-link',
    popover: {
      title: t('tour.universalLogin.forgotPassword.title', '¿Olvidaste tu Contraseña?'),
      description: t('tour.universalLogin.forgotPassword.description', 'Si olvidaste tu contraseña, haz clic aquí para recuperarla mediante un código de verificación.'),
      side: 'left',
      align: 'end'
    }
  },
  {
    element: '#terms-link',
    popover: {
      title: t('tour.universalLogin.terms.title', 'Términos y Condiciones'),
      description: t('tour.universalLogin.terms.description', 'Al iniciar sesión, aceptas nuestros términos y condiciones de uso del sistema.'),
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#login-submit-button',
    popover: {
      title: t('tour.universalLogin.submit.title', 'Iniciar Sesión'),
      description: t('tour.universalLogin.submit.description', 'Haz clic aquí para autenticarte y acceder al sistema.'),
      side: 'top',
      align: 'center'
    }
  }
]

export const universalLoginTourConfig = {
  id: 'universal-login-onboarding',
  autoStart: false
}