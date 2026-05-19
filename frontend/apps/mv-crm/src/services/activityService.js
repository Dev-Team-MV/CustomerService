// frontend/apps/mv-crm/src/services/activityService.js

// Datos mock para desarrollo
const MOCK_ACTIVITIES = [
  {
    _id: '1',
    title: 'Reunión Ejecutiva Semanal',
    description: 'Revisión de avances de todos los proyectos',
    status: 'pending',
    category: 'meeting',
    priority: 'high',
    project: { _id: 'p1', name: 'Lakewood P1' },
    relatedUser: null,
    externalContact: null,
    subActivities: [
      { _id: 's1', title: 'Preparar presentación', status: 'completed', createdAt: new Date() },
      { _id: 's2', title: 'Confirmar asistentes', status: 'pending', createdAt: new Date() }
    ],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: 'Llamada con inversionista potencial',
    description: 'Presentar oportunidad de inversión en Phase 2',
    status: 'in_progress',
    category: 'call',
    priority: 'urgent',
    project: { _id: 'p2', name: 'Phase 2' },
    relatedUser: null,
    externalContact: {
      name: 'Carlos Mendoza',
      email: 'carlos@inversiones.com',
      phone: '+1 305 555 1234',
      company: 'Inversiones CM',
      notes: 'Interesado en 3 unidades'
    },
    subActivities: [],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    title: 'Revisar contrato de venta Lote 15',
    description: 'Verificar términos y condiciones antes de firma',
    status: 'in_review',
    category: 'task',
    priority: 'high',
    project: { _id: 'p1', name: 'Lakewood P1' },
    relatedUser: { _id: 'u1', name: 'María García', email: 'maria@email.com', phone: '+1 786 555 4321' },
    externalContact: null,
    subActivities: [
      { _id: 's3', title: 'Revisión legal', status: 'completed', createdAt: new Date() },
      { _id: 's4', title: 'Aprobación financiera', status: 'in_progress', createdAt: new Date() }
    ],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    title: 'Seguimiento propuesta comercial',
    description: 'Contactar cliente después de envío de propuesta',
    status: 'completed',
    category: 'follow_up',
    priority: 'medium',
    project: null,
    relatedUser: null,
    externalContact: {
      name: 'Roberto Sánchez',
      email: 'roberto.s@gmail.com',
      phone: '+1 954 555 9876',
      company: null,
      notes: 'Busca propiedad para familia'
    },
    subActivities: [],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '5',
    title: 'Negociación precio Unidad 4B',
    description: 'Cliente solicita descuento del 5%',
    status: 'approved',
    category: 'negotiation',
    priority: 'high',
    project: { _id: 'p3', name: '6 Town Houses' },
    relatedUser: { _id: 'u2', name: 'Ana López', email: 'ana.lopez@email.com', phone: '+1 305 555 7777' },
    externalContact: null,
    subActivities: [],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '6',
    title: 'Preparar informe mensual',
    description: 'Consolidar ventas y avances de construcción',
    status: 'pending',
    category: 'task',
    priority: 'medium',
    project: null,
    relatedUser: null,
    externalContact: null,
    subActivities: [
      { _id: 's5', title: 'Recopilar datos de ventas', status: 'pending', createdAt: new Date() },
      { _id: 's6', title: 'Actualizar gráficos', status: 'pending', createdAt: new Date() },
      { _id: 's7', title: 'Revisar con equipo', status: 'pending', createdAt: new Date() }
    ],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Mock de proyectos para el selector
const MOCK_PROJECTS = [
  { _id: 'p1', name: 'Lakewood P1' },
  { _id: 'p2', name: 'Phase 2' },
  { _id: 'p3', name: '6 Town Houses' },
  { _id: 'p4', name: 'ISQ' },
  { _id: 'p5', name: 'Sheperd' }
]

// Mock de usuarios registrados para el selector
const MOCK_USERS = [
  { _id: 'u1', name: 'María García', email: 'maria@email.com', phone: '+1 786 555 4321' },
  { _id: 'u2', name: 'Ana López', email: 'ana.lopez@email.com', phone: '+1 305 555 7777' },
  { _id: 'u3', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+1 954 555 1111' },
  { _id: 'u4', name: 'Pedro Rodríguez', email: 'pedro.r@email.com', phone: '+1 786 555 2222' }
]

// Simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let activities = [...MOCK_ACTIVITIES]

const activityService = {
  // Obtener todas las actividades
  getAll: async (filters = {}) => {
    await delay(300)
    let result = [...activities]
    
    if (filters.status) {
      result = result.filter(a => a.status === filters.status)
    }
    if (filters.category) {
      result = result.filter(a => a.category === filters.category)
    }
    if (filters.projectId) {
      result = result.filter(a => a.project?._id === filters.projectId)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(a => 
        a.title.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      )
    }
    
    return result
  },

  // Obtener por ID
  getById: async (id) => {
    await delay(200)
    return activities.find(a => a._id === id) || null
  },

  // Crear actividad
  create: async (data) => {
    await delay(300)
    const newActivity = {
      _id: `${Date.now()}`,
      ...data,
      subActivities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    activities.push(newActivity)
    return newActivity
  },

  // Actualizar actividad
  update: async (id, data) => {
    await delay(300)
    const index = activities.findIndex(a => a._id === id)
    if (index === -1) throw new Error('Activity not found')
    
    activities[index] = {
      ...activities[index],
      ...data,
      updatedAt: new Date()
    }
    return activities[index]
  },

  // Cambiar estado (para drag & drop)
  updateStatus: async (id, status) => {
    await delay(200)
    const index = activities.findIndex(a => a._id === id)
    if (index === -1) throw new Error('Activity not found')
    
    activities[index].status = status
    activities[index].updatedAt = new Date()
    if (status === 'completed' || status === 'approved') {
      activities[index].completedAt = new Date()
    }
    return activities[index]
  },

  // Eliminar
  delete: async (id) => {
    await delay(200)
    activities = activities.filter(a => a._id !== id)
    return { success: true }
  },

  // SubActividades
  addSubActivity: async (activityId, data) => {
    await delay(200)
    const activity = activities.find(a => a._id === activityId)
    if (!activity) throw new Error('Activity not found')
    
    const newSub = {
      _id: `s${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    }
    activity.subActivities.push(newSub)
    return activity
  },

  updateSubActivity: async (activityId, subId, data) => {
    await delay(200)
    const activity = activities.find(a => a._id === activityId)
    if (!activity) throw new Error('Activity not found')
    
    const subIndex = activity.subActivities.findIndex(s => s._id === subId)
    if (subIndex === -1) throw new Error('SubActivity not found')
    
    activity.subActivities[subIndex] = { ...activity.subActivities[subIndex], ...data }
    return activity
  },

  deleteSubActivity: async (activityId, subId) => {
    await delay(200)
    const activity = activities.find(a => a._id === activityId)
    if (!activity) throw new Error('Activity not found')
    
    activity.subActivities = activity.subActivities.filter(s => s._id !== subId)
    return activity
  },

  // Helpers
  getProjects: async () => {
    await delay(100)
    return MOCK_PROJECTS
  },

  getUsers: async (search = '') => {
    await delay(100)
    if (!search) return MOCK_USERS
    const s = search.toLowerCase()
    return MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    )
  }
}

export default activityService