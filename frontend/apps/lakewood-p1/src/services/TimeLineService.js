import api from './api' // Ajusta el import según tu configuración de axios o fetch

const ENDPOINT = '/under-construction';

const TimeLineService = {
  // Obtener todos los steps (público)
  getAll: async () => {
    const res = await api.get(ENDPOINT);
    return res.data;
  },

  // Obtener detalle de un step por id (público)
  getById: async (id) => {
    const res = await api.get(`${ENDPOINT}/${id}`);
    return res.data;
  },

  // Crear un nuevo step (admin)
  create: async (data) => {
    const res = await api.post(ENDPOINT, data);
    return res.data;
  },

  // Actualizar un step (admin)
  update: async (id, data) => {
    const res = await api.put(`${ENDPOINT}/${id}`, data);
    return res.data;
  },

  // Borrar un step (admin)
  remove: async (id) => {
    const res = await api.delete(`${ENDPOINT}/${id}`);
    return res.data;
  }
};

export default TimeLineService;