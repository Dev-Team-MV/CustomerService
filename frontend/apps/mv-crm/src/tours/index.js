// Tours de Autenticación
export { loginTourSteps, loginTourConfig } from './modules/loginTour'

// Tours de Módulos Principales
// export { dashboardTourSteps, dashboardTourConfig } from './modules/dashboardTour'
// ... (el resto de tus exportaciones existentes)

export const allTours = {
  login: {
    steps: loginTourSteps,
    config: loginTourConfig
  },
//   dashboard: {
//     steps: dashboardTourSteps,
//     config: dashboardTourConfig
//   },
  // ... (el resto de tus tours existentes)
}