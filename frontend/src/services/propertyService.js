import api from './api'

// Mock facades data (since backend doesn't have facades yet)
const MOCK_FACADES = {
    '5': [
        { id: 'f5-1', name: 'Frontage 1', modelNumber: '5', image: '/facades/model5-f1.jpg', priceModifier: 0 },
        { id: 'f5-2', name: 'Frontage 2', modelNumber: '5', image: '/facades/model5-f2.jpg', priceModifier: 5000 },
        { id: 'f5-3', name: 'Frontage 3', modelNumber: '5', image: '/facades/model5-f3.jpg', priceModifier: 10000 },
        { id: 'f5-4', name: 'Frontage 4', modelNumber: '5', image: '/facades/model5-f4.jpg', priceModifier: 15000 },
        { id: 'f5-5', name: 'Frontage 5', modelNumber: '5', image: '/facades/model5-f5.jpg', priceModifier: 20000 },
        { id: 'f5-6', name: 'Frontage 6', modelNumber: '5', image: '/facades/model5-f6.jpg', priceModifier: 25000 }
    ],
    '8': [
        { id: 'f8-1', name: 'Frontage 1', modelNumber: '8', image: '/facades/model8-f1.jpg', priceModifier: 0 },
        { id: 'f8-2', name: 'Frontage 2', modelNumber: '8', image: '/facades/model8-f2.jpg', priceModifier: 8000 },
        { id: 'f8-3', name: 'Frontage 3', modelNumber: '8', image: '/facades/model8-f3.jpg', priceModifier: 16000 },
        { id: 'f8-4', name: 'Frontage 4', modelNumber: '8', image: '/facades/model8-f4.jpg', priceModifier: 24000 },
        { id: 'f8-5', name: 'Frontage 5', modelNumber: '8', image: '/facades/model8-f5.jpg', priceModifier: 32000 },
        { id: 'f8-6', name: 'Frontage 6', modelNumber: '8', image: '/facades/model8-f6.jpg', priceModifier: 40000 }
    ],
    '9': [
        { id: 'f9-1', name: 'Frontage 1', modelNumber: '9', image: '/facades/model9-f1.jpg', priceModifier: 0 },
        { id: 'f9-2', name: 'Frontage 2', modelNumber: '9', image: '/facades/model9-f2.jpg', priceModifier: 10000 },
        { id: 'f9-3', name: 'Frontage 3', modelNumber: '9', image: '/facades/model9-f3.jpg', priceModifier: 20000 },
        { id: 'f9-4', name: 'Frontage 4', modelNumber: '9', image: '/facades/model9-f4.jpg', priceModifier: 30000 },
        { id: 'f9-5', name: 'Frontage 5', modelNumber: '9', image: '/facades/model9-f5.jpg', priceModifier: 40000 },
        { id: 'f9-6', name: 'Frontage 6', modelNumber: '9', image: '/facades/model9-f6.jpg', priceModifier: 50000 }
    ]
}

export const propertyService = {
    // Get all lots
    getLots: async () => {
        const response = await api.get('/lots')
        return response.data
    },

    // Get all models
    getModels: async () => {
        const response = await api.get('/models')
        return response.data
    },

    // Get facades for a specific model (mock data for now)
    getFacades: (modelNumber) => {
        return MOCK_FACADES[modelNumber] || []
    },

    // Get lot by ID
    getLotById: async (id) => {
        const response = await api.get(`/lots/${id}`)
        return response.data
    },

    // Get model by ID
    getModelById: async (id) => {
        const response = await api.get(`/models/${id}`)
        return response.data
    },

    // Create property (quote/reservation)
    createProperty: async (propertyData) => {
        const response = await api.post('/properties', propertyData)
        return response.data
    },

    // Send quote (for non-authenticated users or email quote)
    sendQuote: async (quoteData) => {
        const response = await api.post('/quotes', quoteData)
        return response.data
    },

    // Calculate progressive discount
    // Every 10 houses sold, discount is reduced by 2%
    calculateProgressiveDiscount: (baseDiscount, housesSold) => {
        const reductions = Math.floor(housesSold / 10)
        const discountReduction = reductions * 2
        return Math.max(0, baseDiscount - discountReduction)
    },

    // Calculate financial details
    calculateFinancials: (params) => {
        const {
            listPrice = 0,
            discountPercent = 0,
            downPaymentPercent = 10,
            initialDownPaymentPercent = 3,
            monthlyPaymentPercent = 2
        } = params

        const discount = (listPrice * discountPercent) / 100
        const presalePrice = listPrice - discount
        const totalDownPayment = (presalePrice * downPaymentPercent) / 100
        const initialDownPayment = (totalDownPayment * initialDownPaymentPercent) / 100
        const remaining = presalePrice - totalDownPayment
        const monthlyPayment = (remaining * monthlyPaymentPercent) / 100
        const mortgage = presalePrice - totalDownPayment

        return {
            listPrice,
            discount,
            discountPercent,
            presalePrice,
            totalDownPayment,
            downPaymentPercent,
            initialDownPayment,
            initialDownPaymentPercent,
            monthlyPayment,
            monthlyPaymentPercent,
            mortgage
        }
    }
}
