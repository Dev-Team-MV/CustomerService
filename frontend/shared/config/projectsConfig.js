// @shared/config/projectsConfig.js

// ── PROJECT IDS ────────────────────────────────────────────────
export const PROJECT_IDS = {
  LAKEWOOD: '69a73ce5b20401b061da6451',
  PHASE2: '69b9b2188186434073c6b13d',
  ISQ: '69d3b025b5ad6754488df957'
}

// ── PROJECT SLUGS ──────────────────────────────────────────────
export const PROJECT_SLUGS = {
  LAKEWOOD: 'lakewood',
  PHASE2: 'lakewood-f2',
  ISQ: 'isq'
}

// ── RESOURCE TYPES ─────────────────────────────────────────────
export const RESOURCE_TYPES = {
  PROPERTY: 'property',
  APARTMENT: 'apartment',
  BUILDING: 'building'
}

// ── PROJECT CONFIGURATIONS ─────────────────────────────────────
export const projectConfigs = {
  lakewood: {
    id: PROJECT_IDS.LAKEWOOD,
    slug: PROJECT_SLUGS.LAKEWOOD,
    name: 'Lakewood Phase 1',
    port: 5174,
    
    // Brand colors
    colors: {
      primary: '#333F1F',
      secondary: '#8CA551',
      accent: '#E5863C',
      border: '#e8f5ee',
      gradient: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
    },
    
    // Feature flags
    features: {
      hasCommercialFloors: false,
      hasPropertyLots: true,
      hasApartments: false,
      hasBuildings: false,
      showConstructionPhases: true,
      showContracts: true,
      showPayments: true,
      showNews: true,
      showResources: true
    },
    
    // Resource configuration
    resourceType: RESOURCE_TYPES.PROPERTY,
    
    // Routes
    routes: {
      dashboard: '/dashboard',
      properties: '/properties',
      myProperty: '/my-property',
      news: '/news',
      resources: '/resources',
      contracts: '/contracts'
    },
    
    // Assets
    assets: {
      logoMain: '/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png',
      logoSecondary: '/images/logos/Logo_LakewoodOaks-05.png',
      backgroundImage: '/images/260721_001_0010_ISOMETRIA_3-1.png'
    },
    
    // i18n
    i18n: {
      namespace: 'myProperty',
      resourceKey: 'property'
    },
    
    // API endpoints
    endpoints: {
      list: '/properties?visible=true',
      details: (id) => `/properties/${id}?visible=true`,
      phases: (id) => `/phases/property/${id}`,
      payloads: (id) => `/payloads?property=${id}`,
      financialSummary: '/user-properties/financial-summary'
    }
  },

  'lakewood-f2': {
    id: PROJECT_IDS.PHASE2,
    slug: PROJECT_SLUGS.PHASE2,
    name: 'Lakewood Phase 2',
    port: 5175,
    
    colors: {
      primary: '#1976d2',
      secondary: '#42a5f5',
      accent: '#90caf9',
      border: '#e3f2fd',
      gradient: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)'
    },
    
    features: {
      hasCommercialFloors: true,  // Primer piso comercial
      hasPropertyLots: false,
      hasApartments: true,
      hasBuildings: true,
      showConstructionPhases: true,
      showContracts: true,
      showPayments: true,
      showNews: true,
      showResources: true,
      showPolygonEditor: true
    },
    
    resourceType: RESOURCE_TYPES.APARTMENT,
    
    routes: {
      dashboard: '/dashboard',
      buildings: '/buildings',
      properties: '/properties',
      myApartment: '/my-apartment',
      news: '/news',
      resources: '/resources',
      contracts: '/contracts'
    },
    
    assets: {
      logoMain: '/assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png',
      logoSecondary: null,
      backgroundImage: null
    },
    
    i18n: {
      namespace: 'myApartment',
      resourceKey: 'apartment'
    },
    
    endpoints: {
      list: '/apartments?visible=true',
      details: (id) => `/apartments/${id}?visible=true`,
      phases: (id) => `/phases/apartment/${id}`,
      payloads: (id) => `/payloads?apartment=${id}`,
      financialSummary: '/user-apartments/financial-summary',
      buildings: `/buildings?projectId=${PROJECT_IDS.PHASE2}`,
      apartmentModels: (buildingId) => `/apartment-models?buildingId=${buildingId}`
    }
  },

  isq: {
    id: PROJECT_IDS.ISQ,
    slug: PROJECT_SLUGS.ISQ,
    name: 'ISQ',
    port: 5176,
    
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#9f7aea',
      border: '#e8eaf6',
      gradient: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)'
    },
    
    features: {
      hasCommercialFloors: false,  // Solo residencial
      hasPropertyLots: false,
      hasApartments: true,
      hasBuildings: true,
      showConstructionPhases: true,
      showContracts: true,
      showPayments: true,
      showNews: true,
      showResources: true,
      showPolygonEditor: true
    },
    
    resourceType: RESOURCE_TYPES.APARTMENT,
    
    routes: {
      dashboard: '/dashboard',
      buildings: '/buildings',
      properties: '/properties',
      myApartment: '/my-apartment',
      news: '/news',
      resources: '/resources',
      contracts: '/contracts'
    },
    
    assets: {
      logoMain: '/assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png',
      logoSecondary: null,
      backgroundImage: null
    },
    
    i18n: {
      namespace: 'myApartment',
      resourceKey: 'apartment'
    },
    
    endpoints: {
      list: '/apartments?visible=true',
      details: (id) => `/apartments/${id}?visible=true`,
      phases: (id) => `/phases/apartment/${id}`,
      payloads: (id) => `/payloads?apartment=${id}`,
      financialSummary: '/user-apartments/financial-summary',
      buildings: `/buildings?projectId=${PROJECT_IDS.ISQ}`,
      apartmentModels: (buildingId) => `/apartment-models?buildingId=${buildingId}`
    }
  }
}

// ── HELPER FUNCTIONS ───────────────────────────────────────────
export const getProjectConfig = (projectSlug) => {
  return projectConfigs[projectSlug] || projectConfigs.lakewood
}

export const getProjectById = (projectId) => {
  return Object.values(projectConfigs).find(config => config.id === projectId)
}

export const getProjectBySlug = (slug) => {
  return projectConfigs[slug]
}

export const hasFeature = (projectSlug, featureName) => {
  const config = getProjectConfig(projectSlug)
  return config.features[featureName] || false
}

export const getProjectColor = (projectSlug, colorType = 'primary') => {
  const config = getProjectConfig(projectSlug)
  return config.colors[colorType] || config.colors.primary
}

export const getProjectEndpoint = (projectSlug, endpointName, ...params) => {
  const config = getProjectConfig(projectSlug)
  const endpoint = config.endpoints[endpointName]
  return typeof endpoint === 'function' ? endpoint(...params) : endpoint
}

// ── BUILDING CONFIGURATIONS ────────────────────────────────────
export const buildingConfigs = {
  'lakewood-f2': {
    defaultFloors: 4,
    hasCommercialFloor: true,
    commercialFloorNumber: 1,
    floorPlanRequired: true,
    exteriorRendersRequired: true
  },
  
  isq: {
    defaultFloors: 6,
    hasCommercialFloor: false,
    commercialFloorNumber: null,
    floorPlanRequired: true,
    exteriorRendersRequired: true
  }
}

export const getBuildingConfig = (projectSlug) => {
  return buildingConfigs[projectSlug] || buildingConfigs.isq
}