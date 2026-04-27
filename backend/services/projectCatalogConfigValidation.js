function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function validatePricingRule(rule, index) {
  const errors = []
  const path = `pricingRules[${index}]`

  if (!isObject(rule)) {
    errors.push(`${path} must be an object`)
    return errors
  }
  if (!rule.id || typeof rule.id !== 'string') {
    errors.push(`${path}.id is required`)
  }
  if (!isObject(rule.apply)) {
    errors.push(`${path}.apply is required`)
  } else {
    if (!['fixed', 'percentage'].includes(rule.apply.type)) {
      errors.push(`${path}.apply.type must be fixed or percentage`)
    }
    if (typeof rule.apply.amount !== 'number' || Number.isNaN(rule.apply.amount)) {
      errors.push(`${path}.apply.amount must be a number`)
    }
  }

  if (rule.when !== undefined) {
    if (!Array.isArray(rule.when)) {
      errors.push(`${path}.when must be an array`)
    } else {
      const validOperators = ['eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'truthy', 'falsy']
      rule.when.forEach((condition, cIndex) => {
        const cPath = `${path}.when[${cIndex}]`
        if (!isObject(condition)) {
          errors.push(`${cPath} must be an object`)
          return
        }
        if (!condition.field || typeof condition.field !== 'string') {
          errors.push(`${cPath}.field is required`)
        }
        if (!validOperators.includes(condition.operator)) {
          errors.push(`${cPath}.operator is invalid`)
        }
      })
    }
  }

  return errors
}

export function validateProjectCatalogConfigPayload(payload = {}) {
  const errors = []

  if (!['houses', 'apartments', 'mixed'].includes(payload.catalogType)) {
    errors.push('catalogType must be houses, apartments or mixed')
  }
  if (!isObject(payload.structure)) {
    errors.push('structure must be an object')
  }
  if (!isObject(payload.assetsSchema)) {
    errors.push('assetsSchema must be an object')
  }
  if (payload.pricingRules !== undefined && !Array.isArray(payload.pricingRules)) {
    errors.push('pricingRules must be an array')
  }
  if (
    payload.pricingMode !== undefined &&
    !['legacy_components', 'lot_fixed_total'].includes(payload.pricingMode)
  ) {
    errors.push('pricingMode must be legacy_components or lot_fixed_total')
  }

  if (Array.isArray(payload.pricingRules)) {
    payload.pricingRules.forEach((rule, index) => {
      errors.push(...validatePricingRule(rule, index))
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
