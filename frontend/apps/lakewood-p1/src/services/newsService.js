import api from './api';

const newsService = {
  // ✅ Obtener todas las noticias (Admin)
  getAllNews: async (params = {}) => {
    try {
      const response = await api.get('/news', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all news:', error);
      throw error.response?.data?.message || 'Error fetching news';
    }
  },

  // ✅ Obtener noticias públicas (sin auth)
  getPublishedNews: async (params = {}) => {
    try {
      const response = await api.get('/news/published', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching published news:', error);
      throw error.response?.data?.message || 'Error fetching published news';
    }
  },

  // ✅ Obtener noticia por ID
  getNewsById: async (id) => {
    try {
      const response = await api.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching news by ID:', error);
      throw error.response?.data?.message || 'Error fetching news';
    }
  },

  // ✅ Crear noticia
  createNews: async (newsData) => {
    try {
      const response = await api.post('/news', newsData);
      console.log('✅ News created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating news:', error);
      throw error.response?.data?.message || 'Error creating news';
    }
  },

  // ✅ Actualizar noticia
  updateNews: async (id, newsData) => {
    try {
      const response = await api.put(`/news/${id}`, newsData);
      console.log('✅ News updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating news:', error);
      throw error.response?.data?.message || 'Error updating news';
    }
  },

  // ✅ Eliminar noticia
  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}`);
      console.log('✅ News deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting news:', error);
      throw error.response?.data?.message || 'Error deleting news';
    }
  }
};

export default newsService;