import assert from 'node:assert/strict'
import { validateProjectCatalogConfigPayload } from '../services/projectCatalogConfigValidation.js'

const validPayload = {
  catalogType: 'houses',
  structure: { levels: { level1: { options: [] } } },
  assetsSchema: { defaultAssets: ['plans'] },
  pricingRules: [
    {
      id: 'r1',
      priority: 10,
      when: [{ field: 'selectedOptions.hasBalcony', operator: 'truthy' }],
      apply: { type: 'fixed', amount: 1000 }
    }
  ]
}

const invalidPayload = {
  catalogType: 'invalid',
  structure: [],
  assetsSchema: null,
  pricingRules: [
    {
      id: '',
      when: [{ field: '', operator: 'bad-op' }],
      apply: { type: 'unknown', amount: 'NaN' }
    }
  ]
}

const valid = validateProjectCatalogConfigPayload(validPayload)
assert.equal(valid.valid, true, 'Valid payload should pass validation')
assert.equal(valid.errors.length, 0, 'Valid payload should not have errors')

const invalid = validateProjectCatalogConfigPayload(invalidPayload)
assert.equal(invalid.valid, false, 'Invalid payload should fail validation')
assert.ok(invalid.errors.length > 0, 'Invalid payload should include validation errors')

console.log('testProjectCatalogConfigValidation passed')
