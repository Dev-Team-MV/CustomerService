// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/utils/pricingEngine.js

export function evaluatePricingRules({ rules = [], selectedOptions = {}, basePrice = 0 }) {
  const adjustments = []
  
  const enabledRules = (Array.isArray(rules) ? rules : [])
    .filter(rule => rule.enabled !== false)
    .sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100))

  for (const rule of enabledRules) {
    const when = Array.isArray(rule.when) ? rule.when : []
    const pass = when.every(condition => evaluateCondition(condition, { selectedOptions }))
    
    if (!pass) continue

    const amount = Number(rule.apply?.amount) || 0
    const finalAmount = rule.apply?.type === 'percentage'
      ? (basePrice * amount) / 100
      : amount
      
    adjustments.push({
      code: rule.apply?.code || rule.id,
      label: rule.apply?.label || rule.name || rule.id,
      amount: finalAmount
    })
  }

  return adjustments
}

function evaluateCondition(condition, context) {
  const actual = getNestedValue(context, condition.field)
  const expected = condition.value

  switch (condition.operator) {
    case 'eq': return actual === expected
    case 'neq': return actual !== expected
    case 'truthy': return Boolean(actual)
    case 'falsy': return !actual
    case 'gt': return Number(actual) > Number(expected)
    case 'gte': return Number(actual) >= Number(expected)
    case 'lt': return Number(actual) < Number(expected)
    case 'lte': return Number(actual) <= Number(expected)
    case 'in': return Array.isArray(expected) ? expected.includes(actual) : false
    case 'not_in': return Array.isArray(expected) ? !expected.includes(actual) : false
    default: return false
  }
}

function getNestedValue(obj, path) {
  if (!path) return undefined
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

export function calculateEstimatedPrice({ basePrice, pricingRules, selectedOptions }) {
  const adjustments = evaluatePricingRules({ 
    rules: pricingRules, 
    selectedOptions, 
    basePrice 
  })
  
  const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.amount, 0)
  const totalPrice = basePrice + totalAdjustments
  
  return {
    basePrice,
    adjustments,
    totalAdjustments,
    totalPrice
  }
}