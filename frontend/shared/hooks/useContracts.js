import { useState, useEffect, useCallback } from 'react'
import contractsService from '../services/contractService'
import uploadService from '../services/uploadService'

export const DOCUMENT_TYPES = [
  { key: 'promissoryNote', label: 'Promissory note', icon: '📄' },
  { key: 'purchaseContract', label: 'Purchase contract', icon: '📝' },
  { key: 'agreement', label: 'Credit agreement', icon: '📋' }
]

export const useContracts = ({
  resource,         // property o apartment
  resourceType,     // 'property' o 'apartment'
  open,
  onContractUpdated
}) => {
  const [existingContracts, setExistingContracts] = useState({})
  const [pendingFiles, setPendingFiles] = useState({})
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState(null)

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    if (!resource?._id) return
    setLoading(true)
    setError(null)
    try {
      const data = await contractsService.getContractsByResource(resourceType, resource._id)
      // data.contracts es un array [{type, fileUrl, uploadedAt}]
      const contractsMap = {}
      if (data?.contracts) {
        for (const c of data.contracts) contractsMap[c.type] = c
      }
      setExistingContracts(contractsMap)
    } catch (err) {
      setExistingContracts({})
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [resource, resourceType])

  useEffect(() => {
    if (open && resource?._id) fetchContracts()
    if (!open) {
      setPendingFiles({})
      setActiveStep(0)
      setError(null)
    }
  }, [open, resource, fetchContracts])

  // File selection
  const handleFileSelect = (docType, file) => {
    setPendingFiles(prev => ({ ...prev, [docType.key]: file }))
  }

  const handleRemovePendingFile = (docType) => {
    setPendingFiles(prev => {
      const copy = { ...prev }
      delete copy[docType.key]
      return copy
    })
  }

  // Upload contracts
  const handleSubmitContracts = async () => {
    setSubmitting(true)
    setError(null)
    try {
      // Subir archivos y obtener URLs
      const uploads = await Promise.all(
        DOCUMENT_TYPES.map(async (docType) => {
          const file = pendingFiles[docType.key]
          if (!file) return null
          const url = await uploadService.uploadContractFile(file)
          return { type: docType.key, fileUrl: url }
        })
      )
      const contractsToSend = uploads.filter(Boolean)
      if (contractsToSend.length === 0) return

      // POST o PUT según si ya hay contratos
      if (Object.keys(existingContracts).length === 0) {
        await contractsService.createContracts(resourceType, resource._id, contractsToSend)
      } else {
        await contractsService.updateContractsByResource(resourceType, resource._id, contractsToSend)
      }
      setPendingFiles({})
      if (onContractUpdated) onContractUpdated()
      await fetchContracts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete contract
  const handleDeleteContract = async (docType) => {
    setDeleting(docType.key)
    setError(null)
    try {
      const contractsToSend = [{ type: docType.key, fileUrl: '' }]
      await contractsService.updateContractsByResource(resourceType, resource._id, contractsToSend)
      if (onContractUpdated) onContractUpdated()
      await fetchContracts()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  // Download contract
  const handleDownloadContract = async (docType) => {
    try {
      await contractsService.downloadContract(resourceType, resource._id, docType.key)
    } catch (err) {
      setError(err.message)
    }
  }

  // View contract (abre en nueva pestaña)
  const handleViewContract = (docType) => {
    const contract = existingContracts[docType.key]
    if (contract?.fileUrl) window.open(contract.fileUrl, '_blank')
  }

  // Helpers
  const getPendingCount = () => Object.keys(pendingFiles).length
  const getExistingCount = () => Object.keys(existingContracts).length
  const getTotalProgress = () => Math.round((getExistingCount() / DOCUMENT_TYPES.length) * 100)

  return {
    existingContracts,
    pendingFiles,
    DOCUMENT_TYPES,
    activeStep, setActiveStep,
    loading,
    submitting,
    deleting,
    error, setError,
    handleFileSelect,
    handleRemovePendingFile,
    handleDeleteContract,
    handleDownloadContract,
    handleViewContract,
    handleSubmitContracts,
    getPendingCount,
    getExistingCount,
    getTotalProgress,
  }
}