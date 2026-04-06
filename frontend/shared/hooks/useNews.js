// @shared/hooks/useNews.js
import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import newsService from '../services/newsService'
import useFetch from './useFetch'
import { useNewsColumns } from '../constants/Column/news'

// ─────────────────────────────────────────────────────────────
// useNews — Admin mode (NewsTable)
// Manages news CRUD operations with project filtering
// ─────────────────────────────────────────────────────────────
export const useNews = (config) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])
  const navigate = useNavigate()

  // ── Remote data with project filter ───────────────────────
  const { data: news, loading, refetch } = useFetch(
    useCallback(() => 
      newsService.getAllNews({ projectId: config.projectId }), 
      [config.projectId]
    )
  )

  // ── Modal state ───────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState(null)

  // ── Delete dialog state ───────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)

  // ── Snackbar ──────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  })

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
      const dataWithProject = {
        ...newsData,
        projectId: config.projectId
      }

      if (editingNews) {
        await newsService.updateNews(editingNews._id, dataWithProject)
        showSnackbar(t('news:newsUpdated'), 'success')
      } else {
        await newsService.createNews(dataWithProject)
        showSnackbar(t('news:newsCreated'), 'success')
      }
      refetch()
      handleCloseModal()
    } catch {
      showSnackbar(t('news:errorSavingNews'), 'error')
    }
  }, [editingNews, config.projectId, refetch, handleCloseModal, showSnackbar, t])

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: news.length,
    published: news.filter(n => n.status === 'published').length,
    draft: news.filter(n => n.status === 'draft').length,
    construction: news.filter(n => n.category === 'construction').length
  }), [news])

  // ── Columns ───────────────────────────────────────────────
  const columns = useNewsColumns({ 
    t, 
    config, 
    handleView, 
    handleEdit, 
    handleDeleteClick 
  })

  return {
    news,
    stats,
    loading,
    modalOpen,
    editingNews,
    handleCreateNew,
    handleEdit,
    handleCloseModal,
    handleSubmit,
    handleView,
    deleteDialogOpen,
    selectedNews,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    snackbar,
    handleCloseSnackbar,
    columns
  }
}