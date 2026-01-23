import api from './api'

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

    // Get facades for a specific model
    getFacadesByModel: async (modelId) => {
        const response = await api.get(`/facades/model/${modelId}`)
        return response.data
    },

      // ✅ NUEVO: Obtener opciones de pricing de un modelo
    getModelPricingOptions: async (modelId) => {
        const response = await api.get(`/models/${modelId}/pricing-options`)
        return response.data
    },

    // Get all facades (with optional model filter)
    getFacades: async (modelId = null) => {
        const url = modelId ? `/facades?model=${modelId}` : '/facades'
        const response = await api.get(url)
        return response.data
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

    // Get facade by ID
    getFacadeById: async (id) => {
        const response = await api.get(`/facades/${id}`)
        return response.data
    },

    // Get lot statistics
    getLotStats: async () => {
        const response = await api.get('/lots/stats')
        return response.data
    },

    // Get property statistics
    getPropertyStats: async () => {
        const response = await api.get('/properties/stats')
        return response.data
    },

    // Create property (quote/reservation)
    createProperty: async (propertyData) => {
        const response = await api.post('/properties', propertyData)
        return response.data
    },

    // Get property by ID (includes phases)
    getPropertyById: async (id) => {
        const response = await api.get(`/properties/${id}`)
        return response.data
    },

    // Update property
    updateProperty: async (id, propertyData) => {
        const response = await api.put(`/properties/${id}`, propertyData)
        return response.data
    },

    // Delete property
    deleteProperty: async (id) => {
        const response = await api.delete(`/properties/${id}`)
        return response.data
    },

    // Get phases for a property
    getPhasesByProperty: async (propertyId) => {
        const response = await api.get(`/phases/property/${propertyId}`)
        return response.data
    },

    // Get specific phase by property and phase number
    getPhaseByNumber: async (propertyId, phaseNumber) => {
        const response = await api.get(`/phases/property/${propertyId}/phase/${phaseNumber}`)
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