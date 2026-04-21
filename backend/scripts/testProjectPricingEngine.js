import assert from 'node:assert/strict'
import { evaluatePricingRules } from '../services/projectPricingEngine.js'

const rules = [
  {
    id: 'rule-1',
    priority: 20,
    enabled: true,
    when: [{ field: 'selectedOptions.level1Upgrade', operator: 'truthy' }],
    apply: { type: 'fixed', amount: 3000, code: 'lvl1', label: 'Upgrade nivel 1' }
  },
  {
    id: 'rule-2',
    priority: 10,
    enabled: true,
    when: [{ field: 'selectedOptions.level2Upgrade', operator: 'truthy' }],
    apply: { type: 'percentage', amount: 2, code: 'lvl2', label: 'Upgrade nivel 2' }
  }
]

const context = {
  selectedOptions: {
    level1Upgrade: true,
    level2Upgrade: true
  }
}

const adjustments = evaluatePricingRules({ rules, context, base: 100000 })
assert.equal(adjustments.length, 2, 'Expected two pricing adjustments')
assert.equal(adjustments[0].code, 'lvl2', 'Priority order should apply first')
assert.equal(adjustments[0].amount, 2000, '2% of 100000 should be 2000')
assert.equal(adjustments[1].amount, 3000, 'Fixed amount should be applied')

console.log('testProjectPricingEngine passed')
