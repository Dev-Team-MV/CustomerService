import { useState, useEffect, useCallback } from 'react'
import contractsService from '../services/contractsService'
import uploadService from '../services/uploadService'

const DOCUMENT_TYPES = [
  { key: 'promissoryNote', label: 'Promissory note', icon: '📄' },
  { key: 'purchaseContract', label: 'Purchase contract', icon: '📝' },
  { key: 'agreement', label: 'Credit agreement', icon: '📋' }
]

export const useContracts = ({ property, open, onContractUpdated }) => {
  // ── State ─────────────────────────────────────────────────
  const [existingContracts, setExistingContracts] = useState({})
  const [pendingFiles, setPendingFiles] = useState({})
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState(null)

  // ── Fetch contracts on open ───────────────────────────────
  useEffect(() => {
    if (open && property) {
      fetchContracts()
      setPendingFiles({})
      setError(null)
    }
  }, [open, property])

  // ── Fetch existing contracts ──────────────────────────────
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📥 Fetching existing contracts for property:', property._id)

      const response = await contractsService.getContractsByProperty(property._id)

      const organizedDocs = {}
      if (response?.contracts && Array.isArray(response.contracts)) {
        response.contracts.forEach(contract => {
          organizedDocs[contract.type] = contract
        })
      }

      setExistingContracts(organizedDocs)
      console.log('✅ Existing contracts loaded:', organizedDocs)
    } catch (error) {
      console.error('❌ Error fetching contracts:', error)
      if (error.response?.status !== 404) {
        setError('Failed to load existing contracts')
      }
    } finally {
      setLoading(false)
    }
  }, [property])

  // ── File selection ────────────────────────────────────────
  const handleFileSelect = useCallback((docType, file) => {
    if (!file) return

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      alert('⚠️ Please select a valid file (PDF, DOC, or DOCX)')
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('⚠️ File size must be less than 10MB')
      return
    }

    console.log('📎 File selected:', {
      type: docType.key,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type
    })

    setPendingFiles(prev => ({
      ...prev,
      [docType.key]: file
    }))
  }, [])

  // ── Remove pending file ───────────────────────────────────
  const handleRemovePendingFile = useCallback((docType) => {
    setPendingFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[docType.key]
      return newFiles
    })
    console.log('🗑️ Removed pending file:', docType.key)
  }, [])

  // ── Delete contract ───────────────────────────────────────
  const handleDeleteContract = useCallback(async (docType) => {
    const contract = existingContracts[docType.key]
    if (!contract) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the ${docType.label}?\n\n` +
      `This action cannot be undone. You can upload a new document after deletion.`
    )

    if (!confirmDelete) return

    try {
      setDeleting(docType.key)
      console.log('🗑️ Deleting contract:', {
        type: docType.key,
        propertyId: property._id
      })

      const remainingContracts = Object.entries(existingContracts)
        .filter(([key]) => key !== docType.key)
        .map(([_, contract]) => ({
          type: contract.type,
          fileUrl: contract.fileUrl,
          uploadedAt: contract.uploadedAt
        }))

      console.log('📤 Sending remaining contracts:', remainingContracts)

      if (remainingContracts.length === 0) {
        console.log('🗑️ No contracts remaining, deleting entire document...')
        const response = await contractsService.getContractsByProperty(property._id)
        if (response?._id) {
          await contractsService.deleteContract(response._id)
          console.log('✅ Contract document deleted completely')
        }
      } else {
        await contractsService.updateContractsByProperty(
          property._id,
          remainingContracts
        )
        console.log('✅ Contract deleted successfully (keeping others)')
      }

      setExistingContracts(prev => {
        const newContracts = { ...prev }
        delete newContracts[docType.key]
        return newContracts
      })

      alert(`✅ ${docType.label} deleted successfully. You can now upload a new document.`)

      if (onContractUpdated) onContractUpdated()
    } catch (error) {
      console.error('❌ Delete error:', error)
      setError(error.response?.data?.message || 'Failed to delete contract')
      alert(`❌ Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setDeleting(null)
    }
  }, [existingContracts, property, onContractUpdated])

  // ── Download contract ─────────────────────────────────────
  const handleDownloadContract = useCallback(async (docType) => {
    const contract = existingContracts[docType.key]
    if (!contract?.fileUrl) return

    try {
      const fileName = contract.fileUrl.split('/').pop()?.split('?')[0] || `${docType.key}.pdf`
      const response = await fetch(contract.fileUrl)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      alert('No se pudo descargar automáticamente. El archivo se abrirá en otra pestaña.')
      const link = document.createElement('a')
      link.href = contract.fileUrl
      link.download = ''
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [existingContracts])

  // ── View contract ─────────────────────────────────────────
  const handleViewContract = useCallback((docType) => {
    const contract = existingContracts[docType.key]
    if (contract?.fileUrl) {
      const isPDF = contract.fileUrl.endsWith('.pdf')
      if (isPDF) {
        window.open(contract.fileUrl, '_blank')
      } else {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(contract.fileUrl)}&embedded=true`
        window.open(viewerUrl, '_blank')
      }
    }
  }, [existingContracts])

  // ── Submit contracts ──────────────────────────────────────
  const handleSubmitContracts = useCallback(async () => {
    if (Object.keys(pendingFiles).length === 0) {
      alert('⚠️ No files selected to upload')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      console.log('📤 Starting batch upload...')
      console.log('Files to upload:', Object.keys(pendingFiles))

      const filesToUpload = Object.values(pendingFiles)
      console.log('📤 Uploading files to GCS...')
      const fileUrls = await uploadService.uploadContractFiles(filesToUpload)
      console.log('✅ Files uploaded to GCS:', fileUrls)

      const contractsToUpload = Object.entries(pendingFiles).map(([type, file], index) => ({
        type,
        fileUrl: fileUrls[index],
        uploadedAt: new Date().toISOString()
      }))

      console.log('📦 Contracts to upload:', contractsToUpload)

      let response
      const hasExistingContracts = Object.keys(existingContracts).length > 0

      if (hasExistingContracts) {
        console.log('🔄 Updating existing contracts (merge by type)...')
        response = await contractsService.updateContractsByProperty(
          property._id,
          contractsToUpload
        )
        console.log('✅ Contracts updated:', response)
      } else {
        console.log('➕ Creating new contracts document...')
        response = await contractsService.createContracts(
          property._id,
          contractsToUpload
        )
        console.log('✅ Contracts created:', response)
      }

      setPendingFiles({})
      await fetchContracts()

      alert(`✅ ${contractsToUpload.length} contract(s) uploaded successfully!`)

      if (onContractUpdated) onContractUpdated()
    } catch (error) {
      console.error('❌ Upload error:', error)
      setError(error.response?.data?.message || 'Failed to upload contracts')
      alert(`❌ Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setSubmitting(false)
    }
  }, [pendingFiles, existingContracts, property, fetchContracts, onContractUpdated])

  // ── Stats ─────────────────────────────────────────────────
  const getPendingCount = useCallback(() => Object.keys(pendingFiles).length, [pendingFiles])
  const getExistingCount = useCallback(() => Object.keys(existingContracts).length, [existingContracts])
  const getTotalProgress = useCallback(() => {
    const total = DOCUMENT_TYPES.length
    const completed = getExistingCount()
    return Math.round((completed / total) * 100)
  }, [getExistingCount])

  return {
    // data
    existingContracts,
    pendingFiles,
    DOCUMENT_TYPES,
    // state
    activeStep, setActiveStep,
    loading,
    submitting,
    deleting,
    error, setError,
    // handlers
    handleFileSelect,
    handleRemovePendingFile,
    handleDeleteContract,
    handleDownloadContract,
    handleViewContract,
    handleSubmitContracts,
    // stats
    getPendingCount,
    getExistingCount,
    getTotalProgress,
  }
}