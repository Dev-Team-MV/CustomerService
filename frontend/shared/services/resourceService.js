// @shared/services/resourceService.js
import api from './api'

export const createResourceService = (config) => {
  console.log(`🔧 [ResourceService] Creating service for: ${config.type}`)
  
  return {
    async getAll() {
      try {
        console.log(`📡 [ResourceService:${config.type}] Fetching all resources...`)
        console.log(`📡 [ResourceService:${config.type}] Endpoint: ${config.endpoints.list}`)
        
const projectId = import.meta.env.VITE_PROJECT_ID
const [resourcesRes, profileRes] = await Promise.all([
  api.get(config.endpoints.list, { params: { projectId } }),
  api.get(config.endpoints.profile)
])
        
        const allResources = resourcesRes.data
        const profile = profileRes.data
        
        console.log(`✅ [ResourceService:${config.type}] Raw resources received:`, allResources)
        console.log(`✅ [ResourceService:${config.type}] Resources count: ${allResources.length}`)
        console.log(`👤 [ResourceService:${config.type}] User profile:`, profile)
        console.log(`👤 [ResourceService:${config.type}] User role: ${profile.role}`)
        
        // Admins see everything
        if (profile.role === 'superadmin' || profile.role === 'admin') {
          console.log(`🔑 [ResourceService:${config.type}] User is admin - showing all resources`)
          const result = allResources.map(resource => ({
            ...resource,
            isOwned: true,
            isShared: false
          }))
          console.log(`📦 [ResourceService:${config.type}] Processed resources for admin:`, result)
          return result
        }
        
        // For properties: check by lots
        if (config.type === 'property') {
          console.log(`🏠 [ResourceService:property] Processing properties by lots...`)
          const lotIds = new Set(
            (profile.lots || []).map(lot => {
              const id = typeof lot === 'object' ? lot._id : lot
              console.log(`  📍 Lot ID: ${id}`)
              return id
            })
          )
          
          console.log(`📍 [ResourceService:property] User lot IDs:`, Array.from(lotIds))
          
          const result = allResources.map(resource => {
            const resourceLotId = typeof resource.lot === 'object'
              ? resource.lot?._id
              : resource.lot
            const isOwned = lotIds.has(resourceLotId)
            
            console.log(`  🏘️ Property "${resource.name}" - Lot: ${resourceLotId} - Owned: ${isOwned}`)
            
            return {
              ...resource,
              isOwned,
              isShared: !isOwned
            }
          })
          
          console.log(`📦 [ResourceService:property] Final processed properties:`, result)
          return result
        }
        
        // For apartments: check by user apartments
        console.log(`🏢 [ResourceService:apartment] Processing apartments by users...`)
        const result = allResources.map(resource => {
          const isOwned = resource.users?.some(u => {
            const userId = typeof u === 'object' ? u._id : u
            return userId === profile._id
          })
          
          console.log(`  🚪 Apartment "${resource.number}" - Owned: ${isOwned}`)
          
          return {
            ...resource,
            isOwned,
            isShared: !isOwned
          }
        })
        
        console.log(`📦 [ResourceService:apartment] Final processed apartments:`, result)
        return result
        
      } catch (error) {
        console.error(`❌ [ResourceService:${config.type}] Error fetching resources:`, error)
        throw error.response?.data || { message: `Failed to fetch ${config.type}s` }
      }
    },
    
    async getById(id) {
      try {
        console.log(`📡 [ResourceService:${config.type}] Fetching resource by ID: ${id}`)
        const response = await api.get(config.endpoints.details(id))
        console.log(`✅ [ResourceService:${config.type}] Resource details:`, response.data)
        return response.data
      } catch (error) {
        console.error(`❌ [ResourceService:${config.type}] Error fetching resource details:`, error)
        throw error.response?.data || { message: `Failed to fetch ${config.type} details` }
      }
    },
    
    async getFinancialSummary() {
      try {
        console.log(`📊 [ResourceService:${config.type}] Fetching financial summary...`)
        const resources = await this.getAll()
        const payloads = await this.getAllPayloads()
        
        console.log(`💰 [ResourceService:${config.type}] Resources for summary:`, resources.length)
        console.log(`💳 [ResourceService:${config.type}] Payloads for summary:`, payloads.length)
        
        const summary = config.transformers.toFinancialSummary(resources, payloads)
        console.log(`📊 [ResourceService:${config.type}] Financial summary:`, summary)
        
        return summary
      } catch (error) {
        console.error(`❌ [ResourceService:${config.type}] Error fetching financial summary:`, error)
        throw error.response?.data || { message: 'Failed to fetch financial summary' }
      }
    },
    
    async getAllPayloads() {
      try {
        console.log(`💳 [ResourceService:${config.type}] Fetching all payloads...`)
        const resources = await this.getAll()
        const resourceIds = resources.map(r => r._id)
        
        console.log(`💳 [ResourceService:${config.type}] Resource IDs for payloads:`, resourceIds)
        
        if (resourceIds.length === 0) {
          console.log(`⚠️ [ResourceService:${config.type}] No resources found, returning empty payloads`)
          return []
        }
        
        // const response = await api.get('/payloads')
        const projectId = import.meta.env.VITE_PROJECT_ID
const response = await api.get('/payloads', { params: { projectId } })
        const allPayloads = response.data
        
        console.log(`💳 [ResourceService:${config.type}] All payloads from API:`, allPayloads.length)
        
        const filtered = allPayloads.filter(payload => {
          const payloadResourceId = typeof payload[config.type] === 'object'
            ? payload[config.type]._id
            : payload[config.type]
          return resourceIds.includes(payloadResourceId)
        })
        
        console.log(`💳 [ResourceService:${config.type}] Filtered payloads:`, filtered.length)
        return filtered
        
      } catch (error) {
        console.error(`❌ [ResourceService:${config.type}] Error fetching payloads:`, error)
        throw error.response?.data || { message: 'Failed to fetch payloads' }
      }
    },
    
    async getPhases(id) {
      try {
        console.log(`🏗️ [ResourceService:${config.type}] Fetching phases for: ${id}`)
        const response = await api.get(config.endpoints.phases(id))
        console.log(`✅ [ResourceService:${config.type}] Phases:`, response.data)
        return response.data
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          console.warn(`⚠️ [ResourceService:${config.type}] Phases not accessible or not found`)
          return []
        }
        console.error(`❌ [ResourceService:${config.type}] Error fetching phases:`, error)
        throw error.response?.data || { message: 'Failed to fetch phases' }
      }
    },
    
async getPayloads(id) {
  try {
    console.log(`💳 [ResourceService:${config.type}] Fetching payloads for: ${id}`)
    const projectId = import.meta.env.VITE_PROJECT_ID
    const response = await api.get(config.endpoints.payloads(id), { params: { projectId } })
        console.log(`✅ [ResourceService:${config.type}] Payloads for resource:`, response.data)
        return response.data
      } catch (error) {
        console.error(`❌ [ResourceService:${config.type}] Error fetching payloads:`, error)
        throw error.response?.data || { message: 'Failed to fetch payloads' }
      }
    }
  }
}