// export const propertyConfigs = {
//   'lakewood-f2': {
//     projectSlug: 'lakewood-f2',
//     steps: [
//       { key: 'building',   labelKey: 'building'   },
//       { key: 'floor',      labelKey: 'floor'       },
//       { key: 'apartment',  labelKey: 'apartment'   },
//       { key: 'customize',  labelKey: 'customize'   },
//     ],
//     financials: {
//       discountPercent:            10,
//       downPaymentPercent:         10,
//       initialDownPaymentPercent:  3,
//       monthlyPaymentPercent:      2,
//     },
//     customization: {
//       enableBasicPackage:   true,
//       enableUpgradePackage: true,
//     },
//     colors: {
//       available: '#4caf50',
//       pending:   '#2196f3',
//       sold:      '#f44336',
//       cancelled: '#9e9e9e',
//     },
//   },

//   'isq': {
//     projectSlug: 'isq',
//     steps: [
//       { key: 'building',   labelKey: 'building'   },
//       { key: 'floor',      labelKey: 'floor'       },
//       { key: 'apartment',  labelKey: 'apartment'   },
//       { key: 'customize',  labelKey: 'customize'   },
//     ],
//     financials: {
//       discountPercent:            8,
//       downPaymentPercent:         15,
//       initialDownPaymentPercent:  5,
//       monthlyPaymentPercent:      2.5,
//     },
//     customization: {
//       enableBasicPackage:   true,
//       enableUpgradePackage: true,
//     },
//     colors: {
//       available: '#4caf50',
//       pending:   '#2196f3',
//       sold:      '#f44336',
//       cancelled: '#9e9e9e',
//     },
//   },

//   'sheperd': {
//   projectSlug: 'sheperd',
//   steps: [
//     { key: 'building',   labelKey: 'building'   },
//     { key: 'floor',      labelKey: 'floor'       },
//     { key: 'apartment',  labelKey: 'apartment'   },
//     { key: 'customize',  labelKey: 'customize'   },
//   ],
//   financials: {
//     discountPercent:            10,
//     downPaymentPercent:         15,
//     initialDownPaymentPercent:  5,
//     monthlyPaymentPercent:      2,
//   },
//   customization: {
//     enableBasicPackage:   true,
//     enableUpgradePackage: true,
//   },
//   colors: {
//     available: '#4caf50',
//     pending:   '#2196f3',
//     sold:      '#f44336',
//     cancelled: '#9e9e9e',
//   },
// },
// }

// export const getPropertyConfig = (projectSlug) =>
//   propertyConfigs[projectSlug] || propertyConfigs['lakewood-f2']

// export default { propertyConfigs, getPropertyConfig }

// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/config/propertyConfig.js

export const propertyConfigs = {
  'lakewood-f2': {
    projectSlug: 'lakewood-f2',
    catalogType: 'apartments',
    useCatalogConfig: false, // 🔄 Puede migrar en el futuro
    steps: [
      { key: 'building',   labelKey: 'building'   },
      { key: 'floor',      labelKey: 'floor'       },
      { key: 'apartment',  labelKey: 'apartment'   },
      { key: 'customize',  labelKey: 'customize'   },
    ],
    financials: {
      discountPercent:            10,
      downPaymentPercent:         10,
      initialDownPaymentPercent:  3,
      monthlyPaymentPercent:      2,
    },
    customization: {
      enableBasicPackage:   true,
      enableUpgradePackage: true,
    },
    colors: {
      available: '#4caf50',
      pending:   '#2196f3',
      sold:      '#f44336',
      cancelled: '#9e9e9e',
    },
  },

  'isq': {
    projectSlug: 'isq',
    catalogType: 'apartments',
    useCatalogConfig: false,
    steps: [
      { key: 'building',   labelKey: 'building'   },
      { key: 'floor',      labelKey: 'floor'       },
      { key: 'apartment',  labelKey: 'apartment'   },
      { key: 'customize',  labelKey: 'customize'   },
    ],
    financials: {
      discountPercent:            8,
      downPaymentPercent:         15,
      initialDownPaymentPercent:  5,
      monthlyPaymentPercent:      2.5,
    },
    customization: {
      enableBasicPackage:   true,
      enableUpgradePackage: true,
    },
    colors: {
      available: '#4caf50',
      pending:   '#2196f3',
      sold:      '#f44336',
      cancelled: '#9e9e9e',
    },
  },

  'sheperd': {
    projectSlug: 'sheperd',
    catalogType: 'apartments',
    useCatalogConfig: false,
    steps: [
      { key: 'building',   labelKey: 'building'   },
      { key: 'floor',      labelKey: 'floor'       },
      { key: 'apartment',  labelKey: 'apartment'   },
      { key: 'customize',  labelKey: 'customize'   },
    ],
    financials: {
      discountPercent:            10,
      downPaymentPercent:         15,
      initialDownPaymentPercent:  5,
      monthlyPaymentPercent:      2,
    },
    customization: {
      enableBasicPackage:   true,
      enableUpgradePackage: true,
    },
    colors: {
      available: '#4caf50',
      pending:   '#2196f3',
      sold:      '#f44336',
      cancelled: '#9e9e9e',
    },
  },

  // 🆕 NUEVA CONFIGURACIÓN PARA 6TOWN HOUSES
  '6town-houses': {
    projectSlug: '6town-houses',
    catalogType: 'houses', // 🆕 Tipo houses
    useCatalogConfig: true, // 🆕 Usa catalog-config
    steps: [
      { key: 'lot',        labelKey: 'lot'         },
      { key: 'model',      labelKey: 'model'       },
      { key: 'facade',     labelKey: 'facade'      },
      { key: 'levels',     labelKey: 'levels'      }, // 🆕 Paso de levels
      { key: 'summary',    labelKey: 'summary'     },
    ],
    financials: {
      discountPercent:            10,
      downPaymentPercent:         15,
      initialDownPaymentPercent:  5,
      monthlyPaymentPercent:      2,
    },
    customization: {
      enableLevelOptions: true, // 🆕 Habilitar opciones por level
      levels: ['level1', 'level2', 'terrace'] // 🆕 Levels disponibles
    },
    colors: {
      available: '#4caf50',
      pending:   '#2196f3',
      sold:      '#f44336',
      cancelled: '#9e9e9e',
    },
  },

  // 🔄 LAKEWOOD P1 - Puede migrar a catalog-config
  'lakewood': {
    projectSlug: 'lakewood',
    catalogType: 'houses',
    useCatalogConfig: false, // 🔄 Por ahora false, puede migrar
    steps: [
      { key: 'lot',        labelKey: 'lot'         },
      { key: 'model',      labelKey: 'model'       },
      { key: 'facade',     labelKey: 'facade'      },
      { key: 'customize',  labelKey: 'customize'   },
    ],
    financials: {
      discountPercent:            10,
      downPaymentPercent:         15,
      initialDownPaymentPercent:  5,
      monthlyPaymentPercent:      2,
    },
    customization: {
      enableBasicPackage:   true,
      enableUpgradePackage: true,
      enableBalcony:        true,
      enableStorage:        true,
    },
    colors: {
      available: '#4caf50',
      pending:   '#2196f3',
      sold:      '#f44336',
      cancelled: '#9e9e9e',
    },
  }
}

export const getPropertyConfig = (projectSlug) =>
  propertyConfigs[projectSlug] || propertyConfigs['lakewood-f2']

export default { propertyConfigs, getPropertyConfig }