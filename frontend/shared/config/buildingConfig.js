// @shared/config/buildingConfig.js

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
  COMMERCIAL: 'commercial',
  PARKING: 'parking',
  AMENITY: 'amenity'
}

// ── BUILDING CONFIGURATIONS ────────────────────────────────────
export const buildingsConfigs = {
  'lakewood-f2': {
    projectId: PROJECT_IDS.PHASE2,
    projectSlug: 'lakewood-f2',
    projectName: 'Lakewood Phase 2',
    
    // Single building mode
    singleBuildingMode: false,
    
    // Building type
    buildingType: BUILDING_TYPES.MIXED_USE,
    
    // Floor configuration
    floors: {
      default: 4,
      min: 2,
      max: 20,
      hasCommercial: true,
      commercialFloorNumbers: [1],
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
    
    // Single building mode
    singleBuildingMode: false,
    
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
  },

  sheperd: {
    projectId: PROJECT_IDS.SHEPERD,
    projectSlug: 'sheperd',
    projectName: 'Sheperd',
    
    // ✅ Single building mode - ÚNICO EDIFICIO
    singleBuildingMode: true,
    
    // Building type
    buildingType: BUILDING_TYPES.MIXED_USE,
    
    // ✅ Floor configuration - FLEXIBLE CON ARRAYS
floors: {
  total: 20, // Cambiado de 12 a 20
  min: 5,
  max: 30,
  
// In sheperd config, add to parking section:
parking: {
  enabled: true,
  floors: [1, 2],
  spotsPerFloor: 50,
  types: ['resident', 'visitor', 'commercial'],
  
  // ✅ NEW: Parking management configuration
  management: {
    enabled: true,
    allowBulkCreate: true,
    allowAssignment: true,
    codeFormat: 'P{floor}-{number}', // e.g., P1-001, P2-045
    spotTypes: [
      { value: 'standard', label: 'Standard', icon: 'DirectionsCar' },
      { value: 'covered', label: 'Covered', icon: 'DirectionsCar' },
      { value: 'uncovered', label: 'Uncovered', icon: 'Accessible' },
      { value: 'tandem', label: 'Tandem', icon: 'EvStation' },
      { value: 'motorcycle', label: 'Motorcycle', icon: 'TwoWheeler' }
    ],
    statusOptions: [
      { value: 'available', label: 'Available', color: '#43A047' },
      { value: 'assigned', label: 'Assigned', color: '#FF6B35' },
      { value: 'reserved', label: 'Reserved', color: '#FFA726' },
      { value: 'blocked', label: 'Blocked', color: '#757575' }
    ],
    defaultSpotType: 'standard',
    defaultStatus: 'available'
  }
},
  
  commercial: {
    enabled: true,
    floors: [3, 4],
    allowMixedUse: true
  },
  
  residential: {
    enabled: true,
    floors: [5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19], // Extendido hasta 19
    apartmentTypes: ['studio', '1bed', '2bed', '3bed', 'penthouse']
  },
  
  amenities: {
    enabled: true,
    floors: [20,10], // Cambiado de [12] a [20]
    allowMultipleFloorsPerAmenity: true,
  types: [
    // Piso 10
    { id: 'dining', key: 'dining', name: 'Comedor', label: 'Dining', icon: 'Restaurant', floor: 10, defaultFloor: 10 },
    { id: 'coworking', key: 'coworking', name: 'Coworking', label: 'Coworking', icon: 'Work', floor: 10, defaultFloor: 10 },
    { id: 'meeting-room', key: 'meeting-room', name: 'Sala de Reuniones', label: 'Meeting Room', icon: 'MeetingRoom', floor: 10, defaultFloor: 10 },
    { id: 'sports', key: 'sports', name: 'Deportes', label: 'Sports', icon: 'Sports', floor: 10, defaultFloor: 10 },
    
    // Piso 20
    { id: 'parks', key: 'parks', name: 'Parques', label: 'Parks', icon: 'Park', floor: 20, defaultFloor: 20 },
    { id: 'schools', key: 'schools', name: 'Escuelas', label: 'Schools', icon: 'School', floor: 20, defaultFloor: 20 },
    { id: 'pool', key: 'pool', name: 'Piscina', label: 'Pool', icon: 'Pool', floor: 20, defaultFloor: 20 },
    // { id: 'terrace', key: 'terrace', name: 'Terraza', label: 'Terrace', icon: 'Deck', floor: 20, defaultFloor: 20 }
  ]
  }
},
    
    // ✅ Floor labeling (para UI)
    floorLabels: {
      useNegativeNumbers: false, // Si usa números negativos para subterráneos
      parkingPrefix: 'P', // "P1", "P2" o vacío para números normales
      customLabels: {
        // Ejemplo: { 1: 'Ground Floor', 12: 'Rooftop' }
      }
    },
    
    // Polygon configuration
    polygons: {
      masterPlan: {
        required: true,
        defaultColor: '#F7931E',
        defaultStrokeColor: '#1F2937',
        defaultOpacity: 0.35
      },
      floorPlan: {
        required: true,
        defaultColor: '#FF8C42',
        allowMultiple: true
      },
      buildingFloor: {
        required: true,
        defaultColor: '#FFB84D',
        allowTypeFlags: true
      }
    },
    
    // Render configuration
    renders: {
      exterior: {
        required: true,
        multiple: true,
        maxCount: 15
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
      renderTypes: ['basic', 'upgrade'],
      
      // ✅ Configuración por tipo de piso
      byFloorType: {
        residential: {
          models: ['studio', '1bed', '2bed', '3bed', 'penthouse'],
          allowCustomModels: true
        },
        commercial: {
          models: ['office', 'retail', 'restaurant', 'coworking'],
          allowCustomModels: true
        }
      }
    },
    
    // Colors por tipo de piso
    colors: {
      primary: '#F7931E',
      secondary: '#FF8C42',
      accent: '#FFA726',
      parking: '#757575',
      commercial: '#FF6B35',
      residential: '#43A047',
      amenity: '#FFB84D'
    },
    
    // i18n
    i18n: {
      namespace: 'buildings',
      labels: {
        parking: 'Parking Floor',
        commercial: 'Commercial Floor',
        residential: 'Residential Floor',
        amenity: 'Amenity Floor'
      }
    },
    
    // Validation rules
    validation: {
      requireSection: false,
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

// ✅ ACTUALIZADO - Detecta tipo de piso por arrays
export const getFloorType = (projectSlug, floorNumber) => {
  const config = getBuildingConfig(projectSlug)
  
  if (config.singleBuildingMode && config.floors.parking?.floors) {
    if (config.floors.parking.floors.includes(floorNumber)) return FLOOR_TYPES.PARKING
    if (config.floors.commercial?.floors.includes(floorNumber)) return FLOOR_TYPES.COMMERCIAL
    if (config.floors.residential?.floors.includes(floorNumber)) return FLOOR_TYPES.RESIDENTIAL
    if (config.floors.amenities?.floors.includes(floorNumber)) return FLOOR_TYPES.AMENITY
    
    // ✅ NUEVO: Si no está definido, asumir que es residencial por defecto
    return FLOOR_TYPES.RESIDENTIAL
  }
  
  if (config.floors.commercialFloorNumbers?.includes(floorNumber)) {
    return FLOOR_TYPES.COMMERCIAL
  }
  return FLOOR_TYPES.RESIDENTIAL
}

// ✅ NUEVO - Obtener label de piso
export const getFloorLabel = (projectSlug, floorNumber) => {
  const config = getBuildingConfig(projectSlug)
  const labels = config.floorLabels
  
  if (!labels) return `Floor ${floorNumber}`
  
  // Custom label
  if (labels.customLabels?.[floorNumber]) {
    return labels.customLabels[floorNumber]
  }
  
  // Parking prefix
  const floorType = getFloorType(projectSlug, floorNumber)
  if (floorType === FLOOR_TYPES.PARKING && labels.parkingPrefix) {
    const parkingIndex = config.floors.parking.floors.indexOf(floorNumber) + 1
    return `${labels.parkingPrefix}${parkingIndex}`
  }
  
  // Negative numbers
  if (labels.useNegativeNumbers && floorNumber < 0) {
    return `${floorNumber}`
  }
  
  // Default
  return `Floor ${floorNumber}`
}

// ✅ NUEVO - Obtener pisos por tipo
export const getFloorsByType = (projectSlug, type) => {
  const config = getBuildingConfig(projectSlug)
  
  if (!config.singleBuildingMode) {
    // Lógica para ISQ y Phase-2
    return []
  }
  
  switch (type) {
    case FLOOR_TYPES.PARKING:
      return config.floors.parking?.floors || []
    case FLOOR_TYPES.COMMERCIAL:
      return config.floors.commercial?.floors || []
    case FLOOR_TYPES.RESIDENTIAL:
      return config.floors.residential?.floors || []
    case FLOOR_TYPES.AMENITY:
      return config.floors.amenities?.floors || []
    default:
      return []
  }
}

// ✅ NUEVO - Obtener todos los pisos organizados
export const getAllFloorsOrganized = (projectSlug, totalFloors = null) => {
  const config = getBuildingConfig(projectSlug)
  
  if (!config.singleBuildingMode) return []
  
  const floorCount = totalFloors || config.floors.total
  const floors = []
  for (let i = 1; i <= floorCount; i++) {
    floors.push({
      number: i,
      type: getFloorType(projectSlug, i),
      label: getFloorLabel(projectSlug, i)
    })
  }
  
  return floors
}

// Funciones originales (sin cambios)
export const isCommercialFloor = (projectSlug, floorNumber) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.commercialFloorNumbers?.includes(floorNumber) || false
}

export const hasCommercialFloors = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.hasCommercial || false
}

export const getDefaultFloorCount = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.default || config.floors.total || 1
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

// Get parking configuration
export const getParkingConfig = (projectSlug) => {
  const config = getBuildingConfig(projectSlug)
  return config.floors.parking || null
}

// Check if parking management is enabled
export const hasParkingManagement = (projectSlug) => {
  const parkingConfig = getParkingConfig(projectSlug)
  return parkingConfig?.management?.enabled || false
}

// Get parking spot types
export const getParkingSpotTypes = (projectSlug) => {
  const parkingConfig = getParkingConfig(projectSlug)
  return parkingConfig?.management?.spotTypes || []
}

// Get parking status options
export const getParkingStatusOptions = (projectSlug) => {
  const parkingConfig = getParkingConfig(projectSlug)
  return parkingConfig?.management?.statusOptions || []
}

// Generate parking code
export const generateParkingCode = (projectSlug, floorNumber, spotNumber) => {
  const parkingConfig = getParkingConfig(projectSlug)
  const format = parkingConfig?.management?.codeFormat || 'P{floor}-{number}'
  
  return format
    .replace('{floor}', floorNumber)
    .replace('{number}', String(spotNumber).padStart(3, '0'))
}