import ProjectCatalogConfig from '../models/ProjectCatalogConfig.js'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function get(obj, path) {
  if (!path) return undefined
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function evaluateCondition(condition, context) {
  const actual = get(context, condition.field)
  const expected = condition.value
  switch (condition.operator) {
    case 'eq': return actual === expected
    case 'neq': return actual !== expected
    case 'in': return Array.isArray(expected) ? expected.includes(actual) : false
    case 'not_in': return Array.isArray(expected) ? !expected.includes(actual) : false
    case 'gt': return toNumber(actual) > toNumber(expected)
    case 'gte': return toNumber(actual) >= toNumber(expected)
    case 'lt': return toNumber(actual) < toNumber(expected)
    case 'lte': return toNumber(actual) <= toNumber(expected)
    case 'truthy': return Boolean(actual)
    case 'falsy': return !actual
    default: return false
  }
}

function getFirstActivePrice(options) {
  if (!Array.isArray(options)) return 0
  const selected = options.find((item) => item.status !== 'inactive') || options[0]
  return toNumber(selected?.price)
}

function resolveLegacyOptionAdjustments({ modelExists, selectedOptions }) {
  const adjustments = []
  if (selectedOptions.hasBalcony) {
    adjustments.push({
      code: 'legacy-balcony',
      label: 'Balcony option',
      amount: getFirstActivePrice(modelExists?.balconies)
    })
  }
  if (selectedOptions.modelType === 'upgrade') {
    adjustments.push({
      code: 'legacy-upgrade',
      label: 'Upgrade option',
      amount: getFirstActivePrice(modelExists?.upgrades)
    })
  }
  if (selectedOptions.hasStorage) {
    adjustments.push({
      code: 'legacy-storage',
      label: 'Storage option',
      amount: getFirstActivePrice(modelExists?.storages)
    })
  }
  return adjustments.filter((adj) => adj.amount !== 0)
}

// export function evaluatePricingRules({ rules = [], context = {}, base = 0 }) {
//   const adjustments = []
//   const enabledRules = (Array.isArray(rules) ? rules : [])
//     .filter((rule) => rule.enabled !== false)
//     .sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100))

//   for (const rule of enabledRules) {
//     const when = Array.isArray(rule.when) ? rule.when : []
//     const pass = when.every((condition) => evaluateCondition(condition, context))
//     if (!pass) continue

//     const amount = toNumber(rule.apply?.amount)
//     const finalAmount = rule.apply?.type === 'percentage'
//       ? (base * amount) / 100
//       : amount
//     adjustments.push({
//       code: rule.apply?.code || rule.id,
//       label: rule.apply?.label || rule.name || rule.id,
//       amount: finalAmount
//     })
//   }

//   return adjustments
// }

// Líneas 63-86 - Función evaluatePricingRules actualizada

export function evaluatePricingRules({ rules = [], context = {}, base = 0 }) {
  const adjustments = []
  const enabledRules = (Array.isArray(rules) ? rules : [])
    .filter((rule) => rule.enabled !== false)
    .sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100))

  for (const rule of enabledRules) {
    const when = Array.isArray(rule.when) ? rule.when : []
    const pass = when.every((condition) => evaluateCondition(condition, context))
    if (!pass) continue

    // ✅ NUEVO: Resolver el monto según amountSource
    let amount = 0
    const amountSource = rule.apply?.amountSource || 'fixed'
    
    if (amountSource === 'selected_option_price') {
      // Obtener el ID de la opción seleccionada
      const selectedId = get(context, rule.apply?.selectedIdPath)
      
      if (selectedId) {
        // Obtener la colección de opciones (ej: model.upgrades)
        const optionCollection = get(context, rule.apply?.optionCollectionPath)
        
        if (Array.isArray(optionCollection)) {
          // Buscar la opción por ID
          const selectedOption = optionCollection.find(opt => 
            String(opt._id) === String(selectedId)
          )
          
          if (selectedOption) {
            // Extraer el precio de la opción
            const valueField = rule.apply?.valueField || 'price'
            amount = toNumber(selectedOption[valueField])
          }
        }
      }
    } else if (amountSource === 'context_path') {
      // Obtener monto desde una ruta del contexto
      const contextValue = get(context, rule.apply?.amountFrom)
      amount = toNumber(contextValue)
    } else {
      // amountSource === 'fixed' (comportamiento por defecto)
      amount = toNumber(rule.apply?.amount)
    }

    const finalAmount = rule.apply?.type === 'percentage'
      ? (base * amount) / 100
      : amount
      
    adjustments.push({
      code: rule.apply?.code || rule.id,
      label: rule.apply?.label || rule.name || rule.id,
      amount: finalAmount
    })
  }

  return adjustments
}

export async function getActiveCatalogConfigForProject(projectId) {
  if (!projectId) return null
  const active = await ProjectCatalogConfig.findOne({
    project: projectId,
    status: 'published',
    isActiveVersion: true
  }).lean()
  if (active) return active
  return ProjectCatalogConfig.findOne({
    project: projectId,
    status: 'published'
  }).sort({ version: -1 }).lean()
}

export async function evaluateProjectPricing({
  projectId,
  lotExists,
  modelExists,
  facadeExists,
  selectedOptions = {}
}) {
  const config = await getActiveCatalogConfigForProject(projectId)
  const pricingMode = config?.pricingMode || 'legacy_components'
  const lotPrice = toNumber(lotExists?.price)
  const modelBasePrice = toNumber(modelExists?.price)
  const facadePrice = toNumber(facadeExists?.price)
  const base = pricingMode === 'lot_fixed_total'
    ? lotPrice
    : lotPrice + modelBasePrice + facadePrice

  const adjustments = []
  if (pricingMode !== 'lot_fixed_total') {
    adjustments.push(...resolveLegacyOptionAdjustments({ modelExists, selectedOptions }))
  }

  if (config && Array.isArray(config.pricingRules) && config.pricingRules.length > 0) {
    const context = {
      selectedOptions,
      lot: lotExists,
      model: modelExists,
      facade: facadeExists,
      base,
      pricingMode
    }
    adjustments.push(...evaluatePricingRules({
      rules: config.pricingRules,
      context,
      base
    }))
  }

  const totalAdjustments = adjustments.reduce((sum, item) => sum + toNumber(item.amount), 0)
  const totalPrice = base + totalAdjustments

  return {
    configVersion: config?.version || null,
    pricingMode,
    baseBreakdown: {
      lotPrice,
      modelBasePrice: pricingMode === 'lot_fixed_total' ? 0 : modelBasePrice,
      facadePrice: pricingMode === 'lot_fixed_total' ? 0 : facadePrice
    },
    adjustments,
    totalAdjustments,
    totalPrice
  }
}
