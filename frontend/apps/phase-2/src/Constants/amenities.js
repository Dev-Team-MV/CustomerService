// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Constants/amenities.js

export const OUTDOOR_AMENITIES = [
  { 
    id: 1, 
    key: 'pool', 
    name: 'Piscina', 
    x: 30, 
    y: 40 
  },
  { 
    id: 2, 
    key: 'gym', 
    name: 'Gimnasio', 
    x: 60, 
    y: 50 
  },
  { 
    id: 3, 
    key: 'bbq', 
    name: 'Zona BBQ', 
    x: 45, 
    y: 70 
  },
  { 
    id: 4, 
    key: 'playground', 
    name: 'Parque Infantil', 
    x: 80, 
    y: 20 
  },
  { 
    id: 5, 
    key: 'parking', 
    name: 'Estacionamiento Visitantes', 
    x: 15, 
    y: 85 
  },
  { 
    id: 6, 
    key: 'gardens', 
    name: 'Jardines', 
    x: 70, 
    y: 65 
  },
]

export const AMENITY_KEYS = OUTDOOR_AMENITIES.map(a => a.key)