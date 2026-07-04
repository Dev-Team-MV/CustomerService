// // @shared/hooks/useResource.js
// import { useState, useEffect, useCallback } from 'react'
// import { createResourceService } from '../services/resourceService'

// export const useResource = (resourceConfig) => {
//   console.log(`🎣 [useResource] Initializing hook for: ${resourceConfig.type}`)
//   console.log(`🎣 [useResource] Config:`, resourceConfig)
  
//   const service = createResourceService(resourceConfig)
  
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [items, setItems] = useState([])
//   const [selectedItem, setSelectedItem] = useState(null)
//   const [itemDetails, setItemDetails] = useState(null)
//   const [financialSummary, setFinancialSummary] = useState(null)
//   const [phases, setPhases] = useState([])
//   const [loadingPhases, setLoadingPhases] = useState(false)
//   const [payloads, setPayloads] = useState([])
//   const [loadingPayloads, setLoadingPayloads] = useState(false)
//   const [activeTab, setActiveTab] = useState(0)
//   const [hoveredCard, setHoveredCard] = useState(null)

//   const fetchData = useCallback(async () => {
//     try {
//       console.log(`🔄 [useResource:${resourceConfig.type}] Starting data fetch...`)
//       setLoading(true)
//       setError(null)
      
//       const [itemsList, summary] = await Promise.all([
//         service.getAll(),
//         service.getFinancialSummary()
//       ])
      
//       console.log(`✅ [useResource:${resourceConfig.type}] Items received:`, itemsList)
//       console.log(`✅ [useResource:${resourceConfig.type}] Items count: ${itemsList.length}`)
//       console.log(`📊 [useResource:${resourceConfig.type}] Financial summary:`, summary)
      
//       setItems(itemsList)
//       setFinancialSummary(summary)
      
//       if (itemsList.length === 1) {
//         console.log(`🎯 [useResource:${resourceConfig.type}] Only one item, auto-selecting...`)
//         await selectItem(itemsList[0]._id)
//       }
//     } catch (err) {
//       console.error(`❌ [useResource:${resourceConfig.type}] Error fetching data:`, err)
//       setError(err.message || `Failed to load ${resourceConfig.type}s`)
//     } finally {
//       setLoading(false)
//       console.log(`🏁 [useResource:${resourceConfig.type}] Data fetch completed`)
//     }
//   }, [resourceConfig.type])

//   useEffect(() => {
//     console.log(`🚀 [useResource:${resourceConfig.type}] Component mounted, fetching data...`)
//     fetchData()
//   }, [fetchData])

//   const selectItem = useCallback(async (itemId) => {
//     try {
//       console.log(`🎯 [useResource:${resourceConfig.type}] Selecting item: ${itemId}`)
//       setLoading(true)
//       const details = await service.getById(itemId)
//       console.log(`✅ [useResource:${resourceConfig.type}] Item details:`, details)
//       setItemDetails(details)
//       setSelectedItem(itemId)
//       setActiveTab(0)
//     } catch (err) {
//       console.error(`❌ [useResource:${resourceConfig.type}] Error loading details:`, err)
//       setError(err.message || 'Failed to load details')
//     } finally {
//       setLoading(false)
//     }
//   }, [resourceConfig.type])

//   const deselectItem = useCallback(() => {
//     console.log(`↩️ [useResource:${resourceConfig.type}] Deselecting item`)
//     setSelectedItem(null)
//     setItemDetails(null)
//     setActiveTab(0)
//   }, [resourceConfig.type])

//   const fetchPhases = useCallback(async () => {
//     if (!selectedItem) return
//     try {
//       console.log(`🏗️ [useResource:${resourceConfig.type}] Fetching phases for: ${selectedItem}`)
//       setLoadingPhases(true)
//       const data = await service.getPhases(selectedItem)
//       console.log(`✅ [useResource:${resourceConfig.type}] Phases loaded:`, data)
//       setPhases(data)
//     } catch (err) {
//       console.error(`❌ [useResource:${resourceConfig.type}] Failed to load phases:`, err)
//     } finally {
//       setLoadingPhases(false)
//     }
//   }, [selectedItem, resourceConfig.type])

//   const fetchPayloads = useCallback(async () => {
//     if (!selectedItem) return
//     try {
//       console.log(`💳 [useResource:${resourceConfig.type}] Fetching payloads for: ${selectedItem}`)
//       setLoadingPayloads(true)
//       const data = await service.getPayloads(selectedItem)
//       console.log(`✅ [useResource:${resourceConfig.type}] Payloads loaded:`, data)
//       setPayloads(data)
//     } catch (err) {
//       console.error(`❌ [useResource:${resourceConfig.type}] Failed to load payloads:`, err)
//     } finally {
//       setLoadingPayloads(false)
//     }
//   }, [selectedItem, resourceConfig.type])

//   useEffect(() => {
//     if (selectedItem) {
//       console.log(`🔄 [useResource:${resourceConfig.type}] Item selected, fetching phases and payloads...`)
//       fetchPhases()
//       fetchPayloads()
//     }
//   }, [selectedItem, fetchPhases, fetchPayloads])

//   return {
//     loading,
//     error,
//     items,
//     financialSummary,
//     selectedItem,
//     itemDetails,
//     phases,
//     loadingPhases,
//     payloads,
//     loadingPayloads,
//     activeTab,
//     setActiveTab,
//     hoveredCard,
//     setHoveredCard,
//     selectItem,
//     deselectItem,
//     fetchPayloads,
//     refetch: fetchData
//   }
// }

// @shared/hooks/useResource.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createResourceService } from '../services/resourceService'
import { useHomecareServices } from './useHomecareServices'

export const useResource = (resourceConfig) => {
  console.log(`🎣 [useResource] Initializing hook for: ${resourceConfig.type}`)
  console.log(`🎣 [useResource] Config:`, resourceConfig)
  
  const service = createResourceService(resourceConfig)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemDetails, setItemDetails] = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [phases, setPhases] = useState([])
  const [loadingPhases, setLoadingPhases] = useState(false)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [hoveredCard, setHoveredCard] = useState(null)

  // ✅ NUEVO: Extraer IDs de los items para homecare
  const resourceIds = useMemo(() => {
    const ids = items.map(item => item._id).filter(Boolean)
    console.log(`🏠 [useResource:${resourceConfig.type}] Resource IDs for homecare:`, ids)
    return ids
  }, [items])

  const projectId = import.meta.env.VITE_PROJECT_ID

  // ✅ NUEVO: Hook de homecare services
  const {
    loading: loadingHomecare,
    error: homecareError,
    statusMap: homecareStatusMap,
    getStatus: getHomecareStatus,
    getStatusBadge: getHomecareStatusBadge
  } = useHomecareServices(resourceConfig.type, resourceIds, projectId)

  console.log(`🏠 [useResource:${resourceConfig.type}] Homecare statusMap:`, homecareStatusMap)

  const fetchData = useCallback(async () => {
    try {
      console.log(`🔄 [useResource:${resourceConfig.type}] Starting data fetch...`)
      setLoading(true)
      setError(null)
      
      const [itemsList, summary] = await Promise.all([
        service.getAll(),
        service.getFinancialSummary()
      ])
      
      console.log(`✅ [useResource:${resourceConfig.type}] Items received:`, itemsList)
      console.log(`✅ [useResource:${resourceConfig.type}] Items count: ${itemsList.length}`)
      console.log(`📊 [useResource:${resourceConfig.type}] Financial summary:`, summary)
      
      setItems(itemsList)
      setFinancialSummary(summary)
      
      if (itemsList.length === 1) {
        console.log(`🎯 [useResource:${resourceConfig.type}] Only one item, auto-selecting...`)
        await selectItem(itemsList[0]._id)
      }
    } catch (err) {
      console.error(`❌ [useResource:${resourceConfig.type}] Error fetching data:`, err)
      setError(err.message || `Failed to load ${resourceConfig.type}s`)
    } finally {
      setLoading(false)
      console.log(`🏁 [useResource:${resourceConfig.type}] Data fetch completed`)
    }
  }, [resourceConfig.type])

  useEffect(() => {
    console.log(`🚀 [useResource:${resourceConfig.type}] Component mounted, fetching data...`)
    fetchData()
  }, [fetchData])

  const selectItem = useCallback(async (itemId) => {
    try {
      console.log(`🎯 [useResource:${resourceConfig.type}] Selecting item: ${itemId}`)
      setLoading(true)
      const details = await service.getById(itemId)
      console.log(`✅ [useResource:${resourceConfig.type}] Item details:`, details)
      setItemDetails(details)
      setSelectedItem(itemId)
      setActiveTab(0)
    } catch (err) {
      console.error(`❌ [useResource:${resourceConfig.type}] Error loading details:`, err)
      setError(err.message || 'Failed to load details')
    } finally {
      setLoading(false)
    }
  }, [resourceConfig.type])

  const deselectItem = useCallback(() => {
    console.log(`↩️ [useResource:${resourceConfig.type}] Deselecting item`)
    setSelectedItem(null)
    setItemDetails(null)
    setActiveTab(0)
  }, [resourceConfig.type])

  const fetchPhases = useCallback(async () => {
    if (!selectedItem) return
    try {
      console.log(`🏗️ [useResource:${resourceConfig.type}] Fetching phases for: ${selectedItem}`)
      setLoadingPhases(true)
      const data = await service.getPhases(selectedItem)
      console.log(`✅ [useResource:${resourceConfig.type}] Phases loaded:`, data)
      setPhases(data)
    } catch (err) {
      console.error(`❌ [useResource:${resourceConfig.type}] Failed to load phases:`, err)
    } finally {
      setLoadingPhases(false)
    }
  }, [selectedItem, resourceConfig.type])

  const fetchPayloads = useCallback(async () => {
    if (!selectedItem) return
    try {
      console.log(`💳 [useResource:${resourceConfig.type}] Fetching payloads for: ${selectedItem}`)
      setLoadingPayloads(true)
      const data = await service.getPayloads(selectedItem)
      console.log(`✅ [useResource:${resourceConfig.type}] Payloads loaded:`, data)
      setPayloads(data)
    } catch (err) {
      console.error(`❌ [useResource:${resourceConfig.type}] Failed to load payloads:`, err)
    } finally {
      setLoadingPayloads(false)
    }
  }, [selectedItem, resourceConfig.type])

  useEffect(() => {
    if (selectedItem) {
      console.log(`🔄 [useResource:${resourceConfig.type}] Item selected, fetching phases and payloads...`)
      fetchPhases()
      fetchPayloads()
    }
  }, [selectedItem, fetchPhases, fetchPayloads])

  // ✅ NUEVO: Enriquecer items con datos de homecare
  const enrichedItems = useMemo(() => {
    console.log(`🏠 [useResource:${resourceConfig.type}] Enriching items with homecare data`)
    console.log(`  items.length: ${items.length}`)
    console.log(`  homecareStatusMap keys: ${Object.keys(homecareStatusMap).length}`)
    
    if (items.length === 0) {
      return []
    }

    const enriched = items.map(item => {
      const status = getHomecareStatus(item._id)
      const badge = getHomecareStatusBadge(item._id)
      
      console.log(`  📦 Item ${item._id}:`, {
        hasStatus: status?.total > 0,
        activeStatus: status?.activeStatus,
        badge: badge?.label
      })
      
      return {
        ...item,
        homecareStatus: status,
        homecareBadge: badge
      }
    })
    
    console.log(`✅ [useResource:${resourceConfig.type}] Enriched items: ${enriched.length}`)
    return enriched
  }, [items, homecareStatusMap, getHomecareStatus, getHomecareStatusBadge])

  return {
    loading,
    error,
    items: enrichedItems, // ✅ CAMBIADO: Ahora devuelve items enriquecidos
    financialSummary,
    selectedItem,
    itemDetails,
    phases,
    loadingPhases,
    payloads,
    loadingPayloads,
    activeTab,
    setActiveTab,
    hoveredCard,
    setHoveredCard,
    selectItem,
    deselectItem,
    fetchPayloads,
    refetch: fetchData,
    // ✅ NUEVO: Exponer datos de homecare
    loadingHomecare,
    homecareError,
    homecareStatusMap
  }
}