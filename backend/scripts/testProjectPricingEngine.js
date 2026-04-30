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
  },
  {
    id: 'rule-3',
    priority: 30,
    enabled: true,
    when: [{ field: 'selectedOptions.upgradeId', operator: 'truthy' }],
    apply: {
      type: 'fixed',
      amount: 0,
      amountSource: 'selected_option_price',
      optionCollectionPath: 'model.upgrades',
      selectedIdPath: 'selectedOptions.upgradeId',
      code: 'selected-upgrade',
      label: 'Upgrade seleccionado'
    }
  }
]

const context = {
  selectedOptions: {
    level1Upgrade: true,
    level2Upgrade: true,
    upgradeId: 'u2'
  },
  model: {
    upgrades: [
      { _id: 'u1', price: 1200 },
      { _id: 'u2', price: 2500 }
    ]
  }
}

const adjustments = evaluatePricingRules({ rules, context, base: 100000 })
assert.equal(adjustments.length, 3, 'Expected three pricing adjustments')
assert.equal(adjustments[0].code, 'lvl2', 'Priority order should apply first')
assert.equal(adjustments[0].amount, 2000, '2% of 100000 should be 2000')
assert.equal(adjustments[1].amount, 3000, 'Fixed amount should be applied')
assert.equal(adjustments[2].code, 'selected-upgrade', 'Should include selected option dynamic adjustment')
assert.equal(adjustments[2].amount, 2500, 'Should use selected upgrade price by id')

console.log('testProjectPricingEngine passed')
