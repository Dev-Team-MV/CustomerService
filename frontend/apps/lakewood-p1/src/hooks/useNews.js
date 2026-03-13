import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation }                            from 'react-i18next'
import { useNavigate }                               from 'react-router-dom'
import newsService                                   from '../services/newsService'
import uploadService                                 from '../services/uploadService'
import useFetch                                      from './useFetch'

// ─────────────────────────────────────────────────────────────
// Constantes compartidas
// ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title:       '',
  description: '',
  category:    'announcement',
  status:      'draft',
  heroImage:   null,
  tags:        [],
}

const createBlock = (type) => ({
  id: `block-${Date.now()}`,
  type,
  ...(type === 'heading'   && { level: 2, text: ''              }),
  ...(type === 'paragraph' && { text: ''                        }),
  ...(type === 'list'      && { items: [''], ordered: false     }),
  ...(type === 'quote'     && { text: '', author: ''            }),
})

// ─────────────────────────────────────────────────────────────
// useNews — modo admin (NewsTable.jsx)
// ─────────────────────────────────────────────────────────────
export const useNews = () => {
  const { t }    = useTranslation(['news', 'common'])
  const navigate = useNavigate()

  // ── Remote data ───────────────────────────────────────────
  const { data: news, loading, refetch } = useFetch(
    useCallback(() => newsService.getAllNews(), [])
  )

  // ── Modal state ───────────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingNews, setEditingNews] = useState(null)

  // ── Delete dialog state ───────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNews,     setSelectedNews]     = useState(null)

  // ── Snackbar ──────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }, [])

  // ── Modal handlers ────────────────────────────────────────
  const handleCreateNew = useCallback(() => {
    setEditingNews(null)
    setModalOpen(true)
  }, [])

  const handleEdit = useCallback((newsItem) => {
    setEditingNews(newsItem)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingNews(null)
  }, [])

  // ── View ──────────────────────────────────────────────────
  const handleView = useCallback((newsItem) => {
    navigate(`/explore/news/${newsItem._id}`)
  }, [navigate])

  // ── Delete ────────────────────────────────────────────────
  const handleDeleteClick = useCallback((newsItem) => {
    setSelectedNews(newsItem)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setSelectedNews(null)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await newsService.deleteNews(selectedNews._id)
      showSnackbar(t('news:newsDeleted'), 'success')
      refetch()
      setDeleteDialogOpen(false)
      setSelectedNews(null)
    } catch {
      showSnackbar(t('news:errorDeletingNews'), 'error')
    }
  }, [selectedNews, refetch, showSnackbar, t])

  // ── Submit (create / update) ──────────────────────────────
  const handleSubmit = useCallback(async (newsData) => {
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews._id, newsData)
        showSnackbar(t('news:newsUpdated'), 'success')
      } else {
        await newsService.createNews(newsData)
        showSnackbar(t('news:newsCreated'), 'success')
      }
      refetch()
      handleCloseModal()
    } catch {
      showSnackbar(t('news:errorSavingNews'), 'error')
    }
  }, [editingNews, refetch, handleCloseModal, showSnackbar, t])

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:        news.length,
    published:    news.filter(n => n.status === 'published').length,
    draft:        news.filter(n => n.status === 'draft').length,
    construction: news.filter(n => n.category === 'construction').length,
  }), [news])

  return {
    news, stats, loading,
    modalOpen, editingNews,
    handleCreateNew, handleEdit, handleCloseModal, handleSubmit,
    handleView,
    deleteDialogOpen, selectedNews,
    handleDeleteClick, handleDeleteCancel, handleDeleteConfirm,
    snackbar, handleCloseSnackbar,
  }
}

// ─────────────────────────────────────────────────────────────
// useNewsModal — lógica interna del modal (NewsModal.jsx)
// Gestiona form, bloques, uploads y validación
// ─────────────────────────────────────────────────────────────
export const useNewsModal = ({ open, newsData, onSubmit, onClose }) => {
  const { t } = useTranslation(['news', 'common'])

  // ── Form state ────────────────────────────────────────────
  const [formData,      setFormData]      = useState(EMPTY_FORM)
  const [contentBlocks, setContentBlocks] = useState([])
  const [images,        setImages]        = useState([])
  const [videos,        setVideos]        = useState([])
  const [tagInput,      setTagInput]      = useState('')

  // ── Upload states ─────────────────────────────────────────
  const [uploadingHero,   setUploadingHero]   = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideos, setUploadingVideos] = useState(false)

  const isUploading = uploadingHero || uploadingImages || uploadingVideos

  // ── Populate / reset al abrir ─────────────────────────────
  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM)
    setContentBlocks([])
    setImages([])
    setVideos([])
    setTagInput('')
  }, [])

  useEffect(() => {
    if (!open) return
    if (newsData) {
      setFormData({
        title:       newsData.title       || '',
        description: newsData.description || '',
        category:    newsData.category    || 'announcement',
        status:      newsData.status      || 'draft',
        heroImage:   newsData.heroImage   || null,
        tags:        newsData.tags        || [],
      })
      setContentBlocks(newsData.contentBlocks || [])
      setImages(newsData.images || [])
      setVideos(newsData.videos || [])
    } else {
      resetForm()
    }
  }, [open, newsData, resetForm])

  // ── Form field helper ─────────────────────────────────────
  const setField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // ── Drag & drop ───────────────────────────────────────────
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return
    setContentBlocks(prev => {
      const items = Array.from(prev)
      const [moved] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, moved)
      return items
    })
  }, [])

  // ── Blocks ────────────────────────────────────────────────
  const addBlock = useCallback((type) => {
    setContentBlocks(prev => [...prev, createBlock(type)])
  }, [])

  const updateBlock = useCallback((id, updates) => {
    setContentBlocks(prev =>
      prev.map(b => b.id === id ? { ...b, ...updates } : b)
    )
  }, [])

  const deleteBlock = useCallback((id) => {
    setContentBlocks(prev => prev.filter(b => b.id !== id))
  }, [])

  // ── List items ────────────────────────────────────────────
  const addListItem = useCallback((blockId) => {
    setContentBlocks(prev =>
      prev.map(b =>
        b.id === blockId && b.type === 'list'
          ? { ...b, items: [...b.items, ''] }
          : b
      )
    )
  }, [])

  const updateListItem = useCallback((blockId, idx, value) => {
    setContentBlocks(prev =>
      prev.map(b => {
        if (b.id !== blockId || b.type !== 'list') return b
        const items = [...b.items]
        items[idx] = value
        return { ...b, items }
      })
    )
  }, [])

  const deleteListItem = useCallback((blockId, idx) => {
    setContentBlocks(prev =>
      prev.map(b =>
        b.id === blockId && b.type === 'list'
          ? { ...b, items: b.items.filter((_, i) => i !== idx) }
          : b
      )
    )
  }, [])

  // ── Tags ──────────────────────────────────────────────────
  const addTag = useCallback(() => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setField('tags', [...formData.tags, tag])
      setTagInput('')
    }
  }, [tagInput, formData.tags, setField])

  const deleteTag = useCallback((tag) => {
    setField('tags', formData.tags.filter(tg => tg !== tag))
  }, [formData.tags, setField])

  // ── Uploads ───────────────────────────────────────────────
  const handleHeroUpload = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const url = await uploadService.uploadImage(file, 'news/hero-images')
      setField('heroImage', url)
    } catch {
      alert(t('news:errorUploadingHeroImage'))
    } finally {
      setUploadingHero(false)
    }
  }, [setField, t])

  const handleImagesUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingImages(true)
    try {
      const urls = await uploadService.uploadMultipleImages(files, 'news/gallery')
      setImages(prev => [...prev, ...urls])
    } catch {
      alert(t('news:errorUploadingImages'))
    } finally {
      setUploadingImages(false)
    }
  }, [t])

  const handleVideosUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingVideos(true)
    try {
      const urls = await Promise.all(
        files.map(f => uploadService.uploadImage(f, 'news/videos'))
      )
      setVideos(prev => [...prev, ...urls])
    } catch {
      alert(t('news:errorUploadingVideos'))
    } finally {
      setUploadingVideos(false)
    }
  }, [t])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!formData.title.trim())       { alert(t('news:requiredTitle'));       return }
    if (!formData.description.trim()) { alert(t('news:requiredDescription')); return }
    if (!formData.heroImage)          { alert(t('news:requiredHeroImage'));    return }
    if (contentBlocks.length === 0)   { alert(t('news:requiredBlock'));        return }

    onSubmit({ ...formData, contentBlocks, images, videos })
  }, [formData, contentBlocks, images, videos, onSubmit, t])

  // ── Close ─────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  return {
    // form
    formData, setField,
    tagInput, setTagInput,
    addTag, deleteTag,
    // blocks
    contentBlocks,
    onDragEnd,
    addBlock, updateBlock, deleteBlock,
    addListItem, updateListItem, deleteListItem,
    // media
    images, setImages,
    videos, setVideos,
    handleHeroUpload,
    handleImagesUpload,
    handleVideosUpload,
    // upload states
    uploadingHero, uploadingImages, uploadingVideos, isUploading,
    // actions
    handleSubmit, handleClose,
  }
}