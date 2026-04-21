export const propertyConfigs = {
  'lakewood-f2': {
    projectSlug: 'lakewood-f2',
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
}

export const getPropertyConfig = (projectSlug) =>
  propertyConfigs[projectSlug] || propertyConfigs['lakewood-f2']

export default { propertyConfigs, getPropertyConfig }