import api from './api'

export const quoteService = {
  // Para Lakewood (Properties)
  getPropertyQuote: async (quoteData) => {
    const response = await api.post('/properties/quote', quoteData)
    return response.data
  },

  // Para Phase-2, ISQ, Sheperd (Apartments)
  getApartmentQuote: async (quoteData) => {
    const response = await api.post('/apartments/quote', quoteData)
    return response.data
  }
}

export default quoteService