// @shared/config/termsConfig.js
import {
  Description, AccountBalance, Security,
  Gavel, Info
} from '@mui/icons-material'

/**
 * Configuraciones de términos y condiciones por proyecto
 * Cada proyecto puede tener sus propias secciones y highlights
 */
export const termsConfigs = {
  lakewood: {
    projectName: 'Lakewood Oaks on Lake Conroe',
    i18n: {
      namespace: 'termsConditions'
    },
    // Secciones específicas de Lakewood
    sections: [
      'generalTerms',
      'userResponsibilities',
      'privacyData',
      'paymentTerms',
      'intellectualProperty',
      'liability'
    ]
  },
  
  phase2: {
    projectName: 'Phase 2',
    i18n: {
      namespace: 'termsConditions'
    },
    // Secciones específicas de Phase 2 (puede ser diferente)
    sections: [
      'generalTerms',
      'userResponsibilities',
      'privacyData',
      'paymentTerms'
    ]
  },
  
  isq: {
    projectName: 'ISQ',
    i18n: {
      namespace: 'termsConditions'
    },
    sections: [
      'generalTerms',
      'userResponsibilities',
      'privacyData',
      'liability'
    ]
  }
}

/**
 * Iconos y colores para cada sección (reutilizable)
 */
const SECTION_ICONS = {
  generalTerms: Description,
  userResponsibilities: AccountBalance,
  privacyData: Security,
  paymentTerms: Gavel,
  intellectualProperty: Info,
  liability: Security
}

/**
 * Obtiene las secciones de términos configuradas para un proyecto
 * @param {string} projectSlug - Slug del proyecto (ej: 'lakewood')
 * @param {Object} theme - Tema de Material-UI
 * @param {Object} t - Función de traducción de i18next
 * @returns {Array} Array de secciones configuradas
 */
export const getTermsSections = (projectSlug, theme, t) => {
  const config = termsConfigs[projectSlug] || termsConfigs.lakewood
  const sectionKeys = config.sections
  
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning?.main || '#E5863C',
    theme.palette.info?.main || '#706f6f',
    theme.palette.primary.main,
    theme.palette.secondary.main
  ]
  
// Línea 88-97 debe ser:
return sectionKeys.map((sectionKey, index) => {
  const IconComponent = SECTION_ICONS[sectionKey]
  return {
    id: `panel${index + 1}`,
    title: t(`sections.${sectionKey}.title`),
    iconComponent: IconComponent,  // Retornar el componente, no JSX
    color: colors[index % colors.length],
    content: t(`sections.${sectionKey}.content`)
  }
})
}

/**
 * Obtiene los highlights de términos y condiciones
 * @param {Object} theme - Tema de Material-UI
 * @param {Object} t - Función de traducción de i18next
 * @returns {Array} Array de highlights configurados
 */
export const getTermsHighlights = (theme, t) => [
  { 
    label: t('highlights.lastUpdated'), 
    value: t('highlights.lastUpdatedValue'), 
    color: theme.palette.primary.main 
  },
  { 
    label: t('highlights.effectiveDate'), 
    value: t('highlights.effectiveDateValue'), 
    color: theme.palette.secondary.main 
  },
  { 
    label: t('highlights.version'), 
    value: t('highlights.versionValue'), 
    color: theme.palette.warning?.main || '#E5863C' 
  }
]

/**
 * Obtiene la configuración completa de términos para un proyecto
 * @param {string} projectSlug - Slug del proyecto
 * @returns {Object} Configuración del proyecto
 */
export const getTermsConfig = (projectSlug) => {
  return termsConfigs[projectSlug] || termsConfigs.lakewood
}