// @shared/hooks/useNewsModal.js
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import uploadService from '../services/uploadService'
import { EMPTY_NEWS_FORM, createBlock } from '../config/newsConfig'

// ─────────────────────────────────────────────────────────────
// useNewsModal — Modal logic (form, blocks, uploads, validation)
// ─────────────────────────────────────────────────────────────
export const useNewsModal = ({ open, newsData, onSubmit, onClose }) => {
  const { t } = useTranslation(['news', 'common'])

  // ── Form state ────────────────────────────────────────────
  const [formData, setFormData] = useState(EMPTY_NEWS_FORM)
  const [contentBlocks, setContentBlocks] = useState([])
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [tagInput, setTagInput] = useState('')

  // ── Upload states ─────────────────────────────────────────
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVideos, setUploadingVideos] = useState(false)

  const isUploading = uploadingHero || uploadingImages || uploadingVideos

  // ── Populate / reset on open ──────────────────────────────
  const resetForm = useCallback(() => {
    setFormData(EMPTY_NEWS_FORM)
    setContentBlocks([])
    setImages([])
    setVideos([])
    setTagInput('')
  }, [])

  useEffect(() => {
    if (!open) return
    
    if (newsData) {
      setFormData({
        title: newsData.title || '',
        description: newsData.description || '',
        category: newsData.category || 'announcement',
        status: newsData.status || 'draft',
        heroImage: newsData.heroImage || null,
        tags: newsData.tags || [],
        projectId: newsData.projectId || null
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
    if (!formData.title.trim()) {
      alert(t('news:requiredTitle'))
      return
    }
    if (!formData.description.trim()) {
      alert(t('news:requiredDescription'))
      return
    }
    if (!formData.heroImage) {
      alert(t('news:requiredHeroImage'))
      return
    }
    if (contentBlocks.length === 0) {
      alert(t('news:requiredBlock'))
      return
    }

    onSubmit({ ...formData, contentBlocks, images, videos })
  }, [formData, contentBlocks, images, videos, onSubmit, t])

  // ── Close ─────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  return {
    formData,
    setField,
    tagInput,
    setTagInput,
    addTag,
    deleteTag,
    contentBlocks,
    onDragEnd,
    addBlock,
    updateBlock,
    deleteBlock,
    addListItem,
    updateListItem,
    deleteListItem,
    images,
    setImages,
    videos,
    setVideos,
    handleHeroUpload,
    handleImagesUpload,
    handleVideosUpload,
    uploadingHero,
    uploadingImages,
    uploadingVideos,
    isUploading,
    handleSubmit,
    handleClose
  }
}