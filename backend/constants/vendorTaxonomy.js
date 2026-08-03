/**
 * Taxonomía fija de vendors (categorías + subcategorías).
 * Labels en/es para que el frontend arme tabs/grid sin hardcodear de nuevo.
 */

const L = (en, es) => Object.freeze({ en, es })

export const VENDOR_TAXONOMY = Object.freeze({
  home_maintenance_repairs: Object.freeze({
    label: L('Home Maintenance & Repairs', 'Mantenimiento y reparaciones del hogar'),
    subcategories: Object.freeze({
      hvac: L('HVAC', 'Climatización (HVAC)'),
      plumbing: L('Plumbing', 'Plomería'),
      electrical: L('Electrical', 'Electricidad'),
      roofing: L('Roofing', 'Techos'),
      general_contractor: L('General Contractor', 'Contratista general'),
      handyman: L('Handyman', 'Handyman'),
      appliance_repair: L('Appliance Repair', 'Reparación de electrodomésticos'),
      garage_door_repair: L('Garage Door Repair', 'Reparación de puertas de garage'),
      locksmith: L('Locksmith', 'Cerrajero'),
      glass_window_repair: L('Glass & Window Repair', 'Reparación de vidrios y ventanas'),
      drywall_repair: L('Drywall Repair', 'Reparación de drywall'),
      painting: L('Painting (Interior & Exterior)', 'Pintura (interior y exterior)'),
      flooring: L('Flooring', 'Pisos'),
      cabinetry_millwork: L('Cabinetry & Millwork', 'Gabinetes y carpintería'),
      countertops: L('Countertops', 'Cubiertas / mesadas'),
      tile_stone: L('Tile & Stone', 'Azulejos y piedra'),
      foundation_repair: L('Foundation Repair', 'Reparación de cimientos'),
      concrete_masonry: L('Concrete & Masonry', 'Concreto y mampostería'),
      fence_installation_repair: L('Fence Installation & Repair', 'Instalación y reparación de cercas'),
      gutter_installation_cleaning: L('Gutter Installation & Cleaning', 'Instalación y limpieza de canaletas'),
      pressure_washing: L('Pressure Washing', 'Lavado a presión')
    })
  }),
  outdoor_services: Object.freeze({
    label: L('Outdoor Services', 'Servicios exteriores'),
    subcategories: Object.freeze({
      landscaping: L('Landscaping', 'Paisajismo'),
      lawn_maintenance: L('Lawn Maintenance', 'Mantenimiento de césped'),
      tree_trimming_removal: L('Tree Trimming & Removal', 'Poda y remoción de árboles'),
      irrigation_sprinkler: L('Irrigation/Sprinkler Systems', 'Riego / aspersores'),
      drainage: L('Drainage', 'Drenaje'),
      outdoor_lighting: L('Outdoor Lighting', 'Iluminación exterior'),
      pest_control: L('Pest Control', 'Control de plagas'),
      mosquito_control: L('Mosquito Control', 'Control de mosquitos')
    })
  }),
  pool_water_features: Object.freeze({
    label: L('Pool & Water Features', 'Piscinas y elementos de agua'),
    subcategories: Object.freeze({
      pool_maintenance: L('Pool Maintenance', 'Mantenimiento de piscina'),
      pool_repair: L('Pool Repair', 'Reparación de piscina'),
      pool_equipment: L('Pool Equipment', 'Equipos de piscina'),
      spa_maintenance: L('Spa Maintenance', 'Mantenimiento de spa'),
      water_feature_maintenance: L('Water Feature Maintenance', 'Mantenimiento de fuentes / features')
    })
  }),
  cleaning_services: Object.freeze({
    label: L('Cleaning Services', 'Servicios de limpieza'),
    subcategories: Object.freeze({
      house_cleaning: L('House Cleaning', 'Limpieza del hogar'),
      deep_cleaning: L('Deep Cleaning', 'Limpieza profunda'),
      move_in_out_cleaning: L('Move-In/Move-Out Cleaning', 'Limpieza de mudanza'),
      window_cleaning: L('Window Cleaning', 'Limpieza de ventanas'),
      carpet_upholstery_cleaning: L('Carpet & Upholstery Cleaning', 'Limpieza de alfombras y tapicería'),
      tile_grout_cleaning: L('Tile & Grout Cleaning', 'Limpieza de azulejos y juntas'),
      power_washing: L('Power Washing', 'Lavado a presión')
    })
  }),
  security_technology: Object.freeze({
    label: L('Security & Technology', 'Seguridad y tecnología'),
    subcategories: Object.freeze({
      security_systems: L('Security Systems', 'Sistemas de seguridad'),
      alarm_monitoring: L('Alarm Monitoring', 'Monitoreo de alarmas'),
      cctv_installation: L('CCTV Installation', 'Instalación de CCTV'),
      access_control: L('Access Control', 'Control de acceso'),
      smart_home_installation: L('Smart Home Installation', 'Instalación smart home'),
      audio_video_systems: L('Audio/Video Systems', 'Sistemas de audio/video'),
      home_automation: L('Home Automation', 'Automatización del hogar'),
      internet_wifi_services: L('Internet & Wi-Fi Services', 'Servicios de Internet y Wi-Fi')
    })
  }),
  utilities: Object.freeze({
    label: L('Utilities', 'Servicios públicos'),
    subcategories: Object.freeze({
      electric_provider: L('Electric Provider', 'Proveedor de electricidad'),
      gas_provider: L('Gas Provider', 'Proveedor de gas'),
      water_utility: L('Water Utility', 'Agua potable'),
      trash_recycling: L('Trash & Recycling', 'Basura y reciclaje'),
      internet_provider: L('Internet Provider', 'Proveedor de Internet'),
      cable_tv_provider: L('Cable/TV Provider', 'Proveedor de cable/TV')
    })
  }),
  moving_storage: Object.freeze({
    label: L('Moving & Storage', 'Mudanzas y almacenamiento'),
    subcategories: Object.freeze({
      moving_company: L('Moving Company', 'Empresa de mudanzas'),
      packing_services: L('Packing Services', 'Servicios de empaque'),
      storage_facilities: L('Storage Facilities', 'Depósitos / self-storage')
    })
  }),
  interior_design_improvements: Object.freeze({
    label: L('Interior Design & Improvements', 'Diseño interior y mejoras'),
    subcategories: Object.freeze({
      interior_designer: L('Interior Designer', 'Diseñador de interiores'),
      home_staging: L('Home Staging', 'Home staging'),
      custom_closets: L('Custom Closets', 'Closets a medida'),
      blinds_shades: L('Blinds & Shades', 'Persianas y cortinas'),
      window_treatments: L('Window Treatments', 'Tratamientos de ventanas'),
      furniture: L('Furniture', 'Muebles'),
      lighting_fixtures: L('Lighting Fixtures', 'Luminarias')
    })
  }),
  hoa_community_services: Object.freeze({
    label: L('HOA & Community Services', 'HOA y servicios comunitarios'),
    subcategories: Object.freeze({
      hoa_management: L('HOA Management', 'Administración de HOA'),
      property_management: L('Property Management', 'Administración de propiedades'),
      concierge_services: L('Concierge Services', 'Servicios de conserjería'),
      community_event_services: L('Community Event Services', 'Servicios de eventos comunitarios')
    })
  }),
  professional_services: Object.freeze({
    label: L('Professional Services', 'Servicios profesionales'),
    subcategories: Object.freeze({
      insurance_agent: L('Insurance Agent', 'Agente de seguros'),
      mortgage_lender: L('Mortgage Lender', 'Prestamista hipotecario'),
      title_company: L('Title Company', 'Compañía de títulos'),
      real_estate_agent: L('Real Estate Agent', 'Agente inmobiliario'),
      home_inspector: L('Home Inspector', 'Inspector de vivienda'),
      surveyor: L('Surveyor', 'Topógrafo'),
      architect: L('Architect', 'Arquitecto'),
      engineer: L('Engineer', 'Ingeniero'),
      attorney: L('Attorney', 'Abogado'),
      cpa_tax_advisor: L('CPA/Tax Advisor', 'Contador / asesor fiscal'),
      notary_public: L('Notary Public', 'Notario público')
    })
  }),
  wellness_lifestyle: Object.freeze({
    label: L('Wellness & Lifestyle', 'Bienestar y estilo de vida'),
    subcategories: Object.freeze({
      house_sitting: L('House Sitting', 'Cuidado de casa'),
      pet_sitting: L('Pet Sitting', 'Cuidado de mascotas'),
      dog_walking: L('Dog Walking', 'Paseo de perros'),
      pet_grooming: L('Pet Grooming', 'Estética de mascotas'),
      private_chef: L('Private Chef', 'Chef privado'),
      personal_trainer: L('Personal Trainer', 'Entrenador personal'),
      massage_therapist: L('Massage Therapist', 'Masajista'),
      home_healthcare: L('Home Healthcare', 'Cuidado de salud en casa'),
      childcare_babysitting: L('Childcare/Babysitting', 'Cuidado de niños / babysitting')
    })
  }),
  automotive: Object.freeze({
    label: L('Automotive', 'Automotriz'),
    subcategories: Object.freeze({
      mobile_car_wash_detailing: L('Mobile Car Wash & Detailing', 'Lavado y detailing móvil'),
      auto_repair: L('Auto Repair', 'Reparación de autos'),
      towing: L('Towing', 'Remolque'),
      ev_charger_installation: L('EV Charger Installation', 'Instalación de cargador EV')
    })
  }),
  emergency_services: Object.freeze({
    label: L('Emergency Services', 'Servicios de emergencia'),
    subcategories: Object.freeze({
      emergency_plumbing_24h: L('24-Hour Emergency Plumbing', 'Plomería de emergencia 24h'),
      emergency_electrical_24h: L('24-Hour Electrical', 'Electricidad de emergencia 24h'),
      fire_water_restoration: L('Fire & Water Restoration', 'Restauración por fuego y agua'),
      mold_remediation: L('Mold Remediation', 'Remediación de moho'),
      biohazard_cleanup: L('Biohazard Cleanup', 'Limpieza de riesgo biológico'),
      emergency_locksmith: L('Emergency Locksmith', 'Cerrajero de emergencia')
    })
  })
})

export const VENDOR_CATEGORIES = Object.freeze(Object.keys(VENDOR_TAXONOMY))

export const VENDOR_SUBCATEGORIES = Object.freeze(
  VENDOR_CATEGORIES.flatMap((category) => Object.keys(VENDOR_TAXONOMY[category].subcategories))
)

export const isValidVendorCategory = (category) => VENDOR_CATEGORIES.includes(category)

export const isSubcategoryOfCategory = (category, subcategory) => {
  if (!isValidVendorCategory(category) || !subcategory) return false
  return Object.prototype.hasOwnProperty.call(VENDOR_TAXONOMY[category].subcategories, subcategory)
}

/** Shape listo para el endpoint GET /api/vendors/categories */
export const getVendorTaxonomyResponse = () =>
  VENDOR_CATEGORIES.map((slug) => {
    const entry = VENDOR_TAXONOMY[slug]
    return {
      slug,
      label: entry.label,
      subcategories: Object.entries(entry.subcategories).map(([subSlug, label]) => ({
        slug: subSlug,
        label
      }))
    }
  })
