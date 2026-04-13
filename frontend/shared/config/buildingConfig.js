// @shared/config/buildingsConfig.js

import { PROJECT_IDS } from './projectsConfig'

// ── BUILDING TYPES ─────────────────────────────────────────────
export const BUILDING_TYPES = {
  RESIDENTIAL: 'residential',
  MIXED_USE: 'mixed_use',
  COMMERCIAL: 'commercial'
}

// ── FLOOR TYPES ────────────────────────────────────────────────
export const FLOOR_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial'
}

// ── BUILDING CONFIGURATIONS ────────────────────────────────────
export const buildingsConfigs = {
  'lakewood-f2': {
    projectId: PROJECT_IDS.PHASE2,
    projectSlug: 'lakewood-f2',
    projectName: 'Lakewood Phase 2',
    
    // Building type
    buildingType: BUILDING_TYPES.MIXED_USE,
    
    // Floor configuration
    floors: {
      default: 4,
      min: 2,
      max: 20,
      hasCommercial: true,
      commercialFloorNumbers: [1], // Primer piso es comercial
      residentialStartFloor: 2
    },
    
    // Polygon configuration
    polygons: {
      masterPlan: {
        required: true,
        defaultColor: '#1976d2',
        defaultStrokeColor: '#1F2937',
        defaultOpacity: 0.35
      },
      floorPlan: {
        required: true,
        defaultColor: '#42a5f5',
        allowMultiple: true
      },
      buildingFloor: {
        required: true,
        defaultColor: '#90caf9',
        allowCommercialFlag: true
      }
    },
    
    // Render configuration
    renders: {
      exterior: {
        required: true,
        multiple: true,
        maxCount: 10
      },
      floorPlans: {
        required: true,
        perFloor: true
      }
    },
    
    // Apartment configuration
    apartments: {
      enabled: true,
      requireModel: true,
      allowPolygonPlacement: true,
      renderTypes: ['basic', 'upgrade']
    },
    
    // Colors
    colors: {
      primary: '#1976d2',
      secondary: '#42a5f5',
      accent: '#90caf9',
      commercial: '#ff6f00',
      residential: '#43a047'
    },
    
    // i18n
    i18n: {
      namespace: 'buildings',
      commercialLabel: 'Commercial Floor',
      residentialLabel: 'Residential Floor'
    },
    
    // Validation rules
    validation: {
      requireSection: false,
      requireTotalApartments: true,
      requireExteriorRenders: true,
      requireFloorPlans: true,
      requireBuildingFloorPolygons: true
    }
  },

  isq: {
    projectId: PROJECT_IDS.ISQ,
    projectSlug: 'isq',
    projectName: 'ISQ',
    
    // Building type
    buildingType: BUILDING_TYPES.RESIDENTIAL,
    
    // Floor configuration
    floors: {
      default: 6,
      min: 3,
      max: 25,
      hasCommercial: false,
      commercialFloorNumbers: [],
      residentialStartFloor: 1
    },
    
    // Polygon configuration
    polygons: {
      masterPlan: {
        required: true,
        defaultColor: '#667eea',
        defaultStrokeColor: '#1F2937',
        defaultOpacity: 0.35
      },
      floorPlan: {
        required: true,
        defaultColor: '#764ba2',
        allowMultiple: true
      },
      buildingFloor: {
        required: true,
        defaultColor: '#9f7aea',
        allowCommercialFlag: false
      }
    },
    
    // Render configuration
    renders: {
      exterior: {
        required: true,
        multiple: true,
        maxCount: 10
      },
      floorPlans: {
        required: true,
        perFloor: true
      }
    },
    
    // Apartment configuration
    apartments: {
      enabled: true,
      requireModel: true,
      allowPolygonPlacement: true,
      renderTypes: ['basic', 'upgrade']
    },
    
    // Colors
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#9f7aea',
      commercial: null,
      residential: '#667eea'
    },
    
    // i18n
    i18n: {
      namespace: 'buildings',
      commercialLabel: null,
      residentialLabel: 'Residential Floor'
    },
    
    // Validation rules
    validation: {
      requireSection: true,
      requireTotalApartments: true,
      requireExteriorRenders: true,
      requireFloorPlans: true,
      requireBuildingFloorPolygons: true
    }
  }
}

// ── HELPER FUNCTIONS ───────────────────────────────────────────
export const getBuildingConfig = (projectSlug) => {
  return buildingsConfigs[projectSlug] || buildingsConfigs.isq
}

export const isCommercialFloor = (projectSlug, floorNumber) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.commercialFloorNumbers.includes(floorNumber)
}

export const getFloorType = (projectSlug, floorNumber) => {
  return isCommercialFloor(projectSlug, floorNumber) 
    ? FLOOR_TYPES.COMMERCIAL 
    : FLOOR_TYPES.RESIDENTIAL
}

export const hasCommercialFloors = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.hasCommercial
}

export const getDefaultFloorCount = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.default
}

export const getFloorRange = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return {
    min: config.floors.min,
    max: config.floors.max
  }
}

export const getPolygonDefaults = (projectSlug, polygonType) => {
  const config = getBuildingConfig(projectSlug)
  return config.polygons[polygonType] || {}
}

export const getBuildingColor = (projectSlug, colorType = 'primary') => {
  const config = getBuildingConfig(projectSlug)
  return config.colors[colorType] || config.colors.primary
}

export const validateBuildingData = (projectSlug, buildingData) => {
  const config = getBuildingConfig(projectSlug)
  const errors = []
  
  if (config.validation.requireSection && !buildingData.section) {
    errors.push('Section is required')
  }
  
  if (config.validation.requireTotalApartments && !buildingData.totalApartments) {
    errors.push('Total apartments is required')
  }
  
  if (config.validation.requireExteriorRenders && (!buildingData.exteriorRenders || buildingData.exteriorRenders.length === 0)) {
    errors.push('Exterior renders are required')
  }
  
  if (config.validation.requireFloorPlans && (!buildingData.floorPlans || buildingData.floorPlans.length === 0)) {
    errors.push('Floor plans are required')
  }
  
  if (config.validation.requireBuildingFloorPolygons && (!buildingData.buildingFloorPolygons || buildingData.buildingFloorPolygons.length === 0)) {
    errors.push('Building floor polygons are required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ── FLOOR UTILITIES ────────────────────────────────────────────
export const generateFloorNumbers = (projectSlug, totalFloors) => {
  const config = getBuildingConfig(projectSlug)
  const floors = []
  
  for (let i = 1; i <= totalFloors; i++) {
    floors.push({
      number: i,
      type: getFloorType(projectSlug, i),
      isCommercial: isCommercialFloor(projectSlug, i)
    })
  }
  
  return floors
}

export const getResidentialFloors = (projectSlug, totalFloors) => {
  return generateFloorNumbers(projectSlug, totalFloors)
    .filter(floor => floor.type === FLOOR_TYPES.RESIDENTIAL)
}

export const getCommercialFloors = (projectSlug, totalFloors) => {
  return generateFloorNumbers(projectSlug, totalFloors)
    .filter(floor => floor.type === FLOOR_TYPES.COMMERCIAL)
}

// ── APARTMENT MODEL UTILITIES ──────────────────────────────────
export const getApartmentModelDefaults = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return {
    requireModel: config.apartments.requireModel,
    allowPolygonPlacement: config.apartments.allowPolygonPlacement,
    renderTypes: config.apartments.renderTypes
  }
}

export const getRenderTypeOptions = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return config.apartments.renderTypes.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }))
}