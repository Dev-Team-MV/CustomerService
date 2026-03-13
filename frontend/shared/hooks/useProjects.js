
import { useState, useEffect, useCallback } from 'react'
import projectService from '@shared/services/projectService'
import crmService from '../../apps/mv-crm/src/services/crmService'
import uploadService from '../../apps/lakewood-p1/src/services/uploadService'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [allBalance, setAllBalance] = useState(null)

  // Fetch all projects
  useEffect(() => {
    projectService.getAll()
      .then(data => {
        setProjects(data)
        setFiltered(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Fetch global balance
  useEffect(() => {
    crmService.getBalance()
      .then(d => setAllBalance(d))
      .catch(() => {})
  }, [])

  // Filter projects by search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(projects)
      return
    }
    const q = search.toLowerCase()
    setFiltered(projects.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    ))
  }, [search, projects])

  // Handle project creation or update
  const handleProjectCreated = useCallback((project) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p._id === project._id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = project
        return copy
      }
      return [project, ...prev]
    })
    setFiltered(prev => {
      const idx = prev.findIndex(p => p._id === project._id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = project
        return copy
      }
      return [project, ...prev]
    })
  }, [])

  // Handle project deletion
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return
    try {
      await projectService.delete(id)
      setProjects(prev => prev.filter(p => p._id !== id))
      setFiltered(prev => prev.filter(p => p._id !== id))
    } catch (e) {
      alert('Error deleting project')
    }
  }, [])

  return {
    projects,      // Todos los proyectos
    filtered,      // Proyectos filtrados por búsqueda
    loading,       // Estado de carga
    search,        // Texto de búsqueda
    setSearch,     // Setter para búsqueda
    allBalance,    // Balance global de todos los proyectos
    handleProjectCreated, // Crear/actualizar proyecto
    handleDelete,         // Eliminar proyecto
  }
}


// ─────────────────────────────────────────────────────────────
// useProjectConfig — configuración de un solo proyecto
// ─────────────────────────────────────────────────────────────
const initialConfig = {
  slug: '',
  phase: '',
  title: { en: '', es: '' },
  subtitle: { en: '', es: '' },
  description: { en: '', es: '' },
  fullDescription: { en: '', es: '' },
  image: '',
  gallery: [],
  features: { en: [], es: [] },
  status: '',
  externalUrl: '',
  location: '',
  area: '',
  videos: [],
}

function normalizeLangField(field) {
  if (typeof field === 'object' && field !== null && field._id) {
    return { en: '', es: '' }
  }
  if (typeof field === 'object' && field !== null && ('en' in field || 'es' in field)) {
    return {
      en: field.en || '',
      es: field.es || ''
    }
  }
  if (typeof field === 'string') {
    return { en: field, es: field }
  }
  return { en: '', es: '' }
}

export function useProjectConfig(projectId) {
  const [form, setForm] = useState(initialConfig)
  const [mainImage, setMainImage] = useState('')
  const [gallery, setGallery] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      const projects = await projectService.getAll()
      const project = Array.isArray(projects)
        ? projects.find(p => p._id === projectId)
        : null
      if (project) {
        setForm({
          slug: project.slug || '',
          phase: project.phase || '',
          title: normalizeLangField(project.title),
          subtitle: normalizeLangField(project.subtitle),
          description: normalizeLangField(project.description),
          fullDescription: normalizeLangField(project.fullDescription),
          image: project.image || '',
          gallery: Array.isArray(project.gallery) ? project.gallery : [],
          features: project.features || { en: [], es: [] },
          status: project.status || '',
          externalUrl: project.externalUrl || '',
          location: project.location || '',
          area: project.area || '',
          videos: Array.isArray(project.videos) ? project.videos : [],
        })
        setMainImage(project.image || '')
        setGallery(Array.isArray(project.gallery) ? project.gallery : [])
        setVideos(Array.isArray(project.videos) ? project.videos : [])
      }
      setLoading(false)
    }
    fetchProject()
  }, [projectId])

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleLangChange = useCallback((field, lang, value) => {
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }))
  }, [])

  const handleImageUpload = useCallback(async (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      try {
        const url = await uploadService.uploadImage(file, 'projects', '', true)
        setMainImage(url)
        handleChange('image', url)
      } catch (error) {
        console.error('Error uploading main image:', error)
      }
    }
  }, [handleChange])

  const handleGalleryUpload = useCallback(async (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      try {
        const url = await uploadService.uploadImage(file, 'projects/gallery', '', true)
        setGallery(prev => [...prev, url])
        handleChange('gallery', [...gallery, url])
      } catch (error) {
        console.error('Error uploading gallery image:', error)
      }
    }
  }, [gallery, handleChange])

  const handleGalleryRemove = useCallback(idx => {
    const newGallery = gallery.filter((_, i) => i !== idx)
    setGallery(newGallery)
    handleChange('gallery', newGallery)
  }, [gallery, handleChange])

  const handleVideoUpload = useCallback(async (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      try {
        const url = await uploadService.uploadImage(file, 'projects/videos', '', true)
        setVideos(prev => [...prev, url])
        handleChange('videos', [...videos, url])
      } catch (error) {
        console.error('Error uploading video:', error)
      }
    }
  }, [videos, handleChange])

  const handleRemoveVideo = useCallback(idx => {
    const newArr = videos.filter((_, i) => i !== idx)
    setVideos(newArr)
    handleChange('videos', newArr)
  }, [videos, handleChange])

  const handleMainImageRemove = useCallback(() => {
    setMainImage('')
    handleChange('image', '')
  }, [handleChange])

  const handleSave = useCallback(async () => {
    setLoading(true)
    try {
      await projectService.update(
        projectId,
        {
          ...form,
          image: mainImage,
          gallery,
          videos,
        }
      )
    } catch (error) {
      console.error('Error saving configuration:', error)
    }
    setLoading(false)
  }, [form, mainImage, gallery, videos, projectId])

  return {
    form,
    setForm,
    mainImage,
    setMainImage,
    gallery,
    setGallery,
    videos,
    setVideos,
    loading,
    setLoading,
    handleChange,
    handleLangChange,
    handleImageUpload,
    handleGalleryUpload,
    handleGalleryRemove,
    handleVideoUpload,
    handleRemoveVideo,
    handleMainImageRemove,
    handleSave,
  }
}