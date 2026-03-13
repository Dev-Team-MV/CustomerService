import { useState, useMemo } from 'react'

const usePropertyFilters = (properties = []) => {
  const [modelFilter, setModelFilter]           = useState('')
  const [residentSortOrder, setResidentSortOrder] = useState('none')

  const modelOptions = useMemo(() => {
    const models = properties.map(p => p.model?.model).filter(Boolean)
    return [...new Set(models)].sort()
  }, [properties])

  const processedData = useMemo(() => {
    let result = [...properties]

    if (modelFilter) {
      result = result.filter(p => p.model?.model === modelFilter)
    }

    if (residentSortOrder !== 'none') {
      result.sort((a, b) => {
        const nameA = (a.users?.[0]?.firstName || a.client?.firstName || '').toLowerCase()
        const nameB = (b.users?.[0]?.firstName || b.client?.firstName || '').toLowerCase()
        if (nameA < nameB) return residentSortOrder === 'asc' ? -1 : 1
        if (nameA > nameB) return residentSortOrder === 'asc' ? 1 : -1
        return 0
      })
    } else {
      result.sort((a, b) => (a.lot?.number || 0) - (b.lot?.number || 0))
    }

    return result
  }, [properties, modelFilter, residentSortOrder])

  const toggleResidentSort = () => {
    setResidentSortOrder(prev =>
      prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'
    )
  }

  return {
    modelFilter,
    setModelFilter,
    residentSortOrder,
    toggleResidentSort,
    modelOptions,
    processedData
  }
}

export default usePropertyFilters