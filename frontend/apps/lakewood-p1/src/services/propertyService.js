import api from './api'

export const propertyService = {
    // Get all lots
    getLots: async () => {
        try {
            const response = await api.get('/lots')
            return Array.isArray(response.data) ? response.data : []
        } catch (err) {
            console.error('Error fetching lots:', err)
            return []
        }
    },

    // Get all models
    getModels: async () => {
        try {
            const response = await api.get('/models')
            return Array.isArray(response.data) ? response.data : []
        } catch (err) {
            console.error('Error fetching models:', err)
            return []
        }
    },

    // Get facades for a specific model
    getFacadesByModel: async (modelId) => {
        try {
            const response = await api.get(`/facades/model/${modelId}`)
            return Array.isArray(response.data) ? response.data : []
        } catch (err) {
            console.error('Error fetching facades:', err)
            return []
        }
    },

    // ✅ NUEVO: Obtener opciones de pricing de un modelo
    getModelPricingOptions: async (modelId) => {
        try {
            const response = await api.get(`/models/${modelId}/pricing-options`)
            return response.data
        } catch (err) {
            console.error('Error fetching pricing options:', err)
            return null
        }
    },

    // Get all facades (with optional model filter)
    getFacades: async (modelId = null) => {
        try {
            const url = modelId ? `/facades?model=${modelId}` : '/facades'
            const response = await api.get(url)
            return Array.isArray(response.data) ? response.data : []
        } catch (err) {
            console.error('Error fetching facades:', err)
            return []
        }
    },

    // Get lot by ID
    getLotById: async (id) => {
        try {
            const response = await api.get(`/lots/${id}`)
            return response.data
        } catch (err) {
            console.error('Error fetching lot by ID:', err)
            return null
        }
    },

    // Get model by ID
    getModelById: async (id) => {
        try {
            const response = await api.get(`/models/${id}`)
            return response.data
        } catch (err) {
            console.error('Error fetching model by ID:', err)
            return null
        }
    },

    // Get facade by ID
    getFacadeById: async (id) => {
        try {
            const response = await api.get(`/facades/${id}`)
            return response.data
        } catch (err) {
            console.error('Error fetching facade by ID:', err)
            return null
        }
    },

    // Get lot statistics
    getLotStats: async () => {
        try {
            const response = await api.get('/lots/stats')
            return response.data
        } catch (err) {
            console.error('Error fetching lot stats:', err)
            return null
        }
    },

    // Get property statistics
    getPropertyStats: async () => {
        try {
            const response = await api.get('/properties/stats')
            return response.data
        } catch (err) {
            console.error('Error fetching property stats:', err)
            return null
        }
    },

    // Create property (quote/reservation)
    createProperty: async (propertyData) => {
        try {
            const response = await api.post('/properties', {
                ...propertyData,
                project: propertyData.projectId || propertyData.project || undefined,
                projectId: propertyData.projectId || undefined,
            })
            return response.data
        } catch (err) {
            console.error('Error creating property:', err)
            return null
        }
    },

    // Get property by ID (includes phases)
    getPropertyById: async (id) => {
        try {
            const response = await api.get(`/properties/${id}`)
            return response.data
        } catch (err) {
            console.error('Error fetching property by ID:', err)
            return null
        }
    },

    // Update property
    updateProperty: async (id, propertyData) => {
        try {
            const response = await api.put(`/properties/${id}`, propertyData)
            return response.data
        } catch (err) {
            console.error('Error updating property:', err)
            return null
        }
    },

    // Delete property
    deleteProperty: async (id) => {
        try {
            const response = await api.delete(`/properties/${id}`)
            return response.data
        } catch (err) {
            console.error('Error deleting property:', err)
            return null
        }
    },

    // Get phases for a property
    getPhasesByProperty: async (propertyId) => {
        try {
            const response = await api.get(`/phases/property/${propertyId}`)
            return response.data
        } catch (err) {
            console.error('Error fetching phases by property:', err)
            return null
        }
    },

    // Get specific phase by property and phase number
    getPhaseByNumber: async (propertyId, phaseNumber) => {
        try {
            const response = await api.get(`/phases/property/${propertyId}/phase/${phaseNumber}`)
            return response.data
        } catch (err) {
            console.error('Error fetching phase by number:', err)
            return null
        }
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
export default propertyService