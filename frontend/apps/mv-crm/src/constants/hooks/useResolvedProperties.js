///Users/oficina/MV-CRM/CustomerService/frontend/apps/mv-crm/src/constants/hooks/useResolvedProperties.js
import { useState, useEffect } from 'react'
import api from '@shared/services/api'

export const useResolvedProperties = (items) => {
  const [propertiesMap, setPropertiesMap] = useState({
    lots: {},
    models: {},
    buildings: {},
    apartments: {}
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const resolveProperties = async () => {
      if (!items || items.length === 0) return

      const lotIds = new Set()
      const modelIds = new Set()
      const buildingIds = new Set()
      const apartmentIds = new Set()
      const propertyIds = new Set()

      items.forEach(item => {
        const prop = item.propertyId || item.property
        if (prop) {
          if (typeof prop === 'string') {
            // Si es string, podría ser ID de lote o de propiedad. Lo agregamos a ambos para asegurar.
            lotIds.add(prop)
            propertyIds.add(prop)
          } else if (typeof prop === 'object') {
            if (prop._id) propertyIds.add(prop._id)
            if (prop.lot && typeof prop.lot === 'string') lotIds.add(prop.lot)
            if (prop.model && typeof prop.model === 'string') modelIds.add(prop.model)
          }
        }

        const apt = item.apartmentId || item.apartment
        if (apt) {
          if (typeof apt === 'string') {
            apartmentIds.add(apt)
          } else if (typeof apt === 'object') {
            if (apt.building && typeof apt.building === 'string') {
              buildingIds.add(apt.building)
            }
          }
        }
      })

      if (lotIds.size === 0 && modelIds.size === 0 && buildingIds.size === 0 && apartmentIds.size === 0 && propertyIds.size === 0) return

      setLoading(true)
      try {
        const promises = []
        
        // 1. Lots
        if (lotIds.size > 0) {
          promises.push(api.get('/lots', { params: { ids: Array.from(lotIds).join(',') } }).catch(() => ({ data: [] })))
        } else {
          promises.push(Promise.resolve({ data: [] }))
        }
        
        // 2. Models
        if (modelIds.size > 0) {
          promises.push(api.get('/models', { params: { ids: Array.from(modelIds).join(',') } }).catch(() => ({ data: [] })))
        } else {
          promises.push(Promise.resolve({ data: [] }))
        }
        
        // 3. Buildings
        if (buildingIds.size > 0) {
          promises.push(api.get('/buildings', { params: { ids: Array.from(buildingIds).join(',') } }).catch(() => ({ data: [] })))
        } else {
          promises.push(Promise.resolve({ data: [] }))
        }
        
        // 4. Apartments
        if (apartmentIds.size > 0) {
          promises.push(api.get('/apartments', { params: { ids: Array.from(apartmentIds).join(',') } }).catch(() => ({ data: [] })))
        } else {
          promises.push(Promise.resolve({ data: [] }))
        }

        // 5. Properties
        if (propertyIds.size > 0) {
          promises.push(api.get('/properties', { params: { ids: Array.from(propertyIds).join(',') } }).catch(() => ({ data: [] })))
        } else {
          promises.push(Promise.resolve({ data: [] }))
        }

        const [lotsRes, modelsRes, buildingsRes, apartmentsRes, propertiesRes] = await Promise.all(promises)
        
        const lotsData = Array.isArray(lotsRes.data) ? lotsRes.data : (lotsRes.data.lots || [])
        const modelsData = Array.isArray(modelsRes.data) ? modelsRes.data : (modelsRes.data.models || [])
        const buildingsData = Array.isArray(buildingsRes.data) ? buildingsRes.data : (buildingsRes.data.buildings || [])
        const apartmentsData = Array.isArray(apartmentsRes.data) ? apartmentsRes.data : (apartmentsRes.data.apartments || [])
        const propertiesData = Array.isArray(propertiesRes.data) ? propertiesRes.data : (propertiesRes.data.properties || [])

        const map = { lots: {}, models: {}, buildings: {}, apartments: {} }
        
        // ✅ Unificamos en 'lots' para que la búsqueda sea transparente sin importar si el ID era del lote o de la propiedad
        lotsData.forEach(l => { map.lots[l._id] = l })
        propertiesData.forEach(p => { map.lots[p._id] = p })
        
        modelsData.forEach(m => { map.models[m._id] = m })
        buildingsData.forEach(b => { map.buildings[b._id] = b })
        apartmentsData.forEach(a => { map.apartments[a._id] = a })
        
        setPropertiesMap(map)
      } catch (err) {
        console.error('Error resolviendo propiedades:', err)
      } finally {
        setLoading(false)
      }
    }

    resolveProperties()
  }, [items])

  return { propertiesMap, loading }
}