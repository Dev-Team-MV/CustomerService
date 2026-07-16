// /Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useProjects.js

import { useState, useEffect, useCallback } from 'react'
import projectService from '@shared/services/projectService'
import uploadService from '@shared/services/uploadService'
import crmService from '@shared/services/crmService'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [allBalance, setAllBalance] = useState(null)

  // Fetch all projects
  useEffect(() => {
    console.log('🔄 Fetching projects...')
    projectService.getAll()
      .then(data => {
        console.log('✅ Projects loaded:', data.length, 'projects')
        setProjects(data)
        setFiltered(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('❌ Error fetching projects:', err)
        setLoading(false)
      })
  }, [])

  // ✅ Fetch global balance - CON LOGS
  useEffect(() => {
    console.log('💰 Fetching balance from /crm/balance...')
    crmService.getBalance()
      .then(d => {
        console.log('✅ Balance loaded:', d)
        setAllBalance(d)
      })
      .catch(err => {
        console.error('❌ Error fetching balance:', err)
        console.error('Error details:', err.response?.data || err.message)
      })
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
      console.error('❌ Error deleting project:', e)
      alert('Error deleting project')
    }
  }, [])

  return {
    projects,
    filtered,
    loading,
    search,
    setSearch,
    allBalance,
    handleProjectCreated,
    handleDelete,
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
  logo: '',
  brandColors: [],
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

function normalizeBrandColors(brandColors) {
  if (!Array.isArray(brandColors)) return []
  return brandColors.map(color => {
    if (typeof color === 'object' && color !== null) {
      return {
        key: color.key || 'color',
        value: color.value || '#000000'
      }
    }
    return { key: 'color', value: color }
  })
}

export function useProjectConfig(projectId) {
  const [form, setForm] = useState(initialConfig)
  const [mainImage, setMainImage] = useState('')
  const [logo, setLogo] = useState('')
  const [gallery, setGallery] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      try {
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
            logo: project.logo || '',
            brandColors: normalizeBrandColors(project.brandColors),
            gallery: Array.isArray(project.gallery) ? project.gallery : [],
            features: project.features || { en: [], es: [] },
            status: project.status || '',
            externalUrl: project.externalUrl || '',
            location: project.location || '',
            area: project.area || '',
            videos: Array.isArray(project.videos) ? project.videos : [],
          })
          setMainImage(project.image || '')
          setLogo(project.logo || '')
          setGallery(Array.isArray(project.gallery) ? project.gallery : [])
          setVideos(Array.isArray(project.videos) ? project.videos : [])
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
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

  const handleLogoUpload = useCallback(async (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      try {
        const url = await uploadService.uploadImage(file, 'projects/logos', '', true)
        setLogo(url)
        handleChange('logo', url)
      } catch (error) {
        console.error('Error uploading logo:', error)
      }
    }
  }, [handleChange])

  const handleLogoRemove = useCallback(() => {
    setLogo('')
    handleChange('logo', '')
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
          logo,
          gallery,
          videos,
        }
      )
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setLoading(false)
    }
  }, [form, mainImage, logo, gallery, videos, projectId])

  return {
    form,
    setForm,
    mainImage,
    setMainImage,
    logo,
    setLogo,
    gallery,
    setGallery,
    videos,
    setVideos,
    loading,
    setLoading,
    handleChange,
    handleLangChange,
    handleImageUpload,
    handleLogoUpload,
    handleLogoRemove,
    handleGalleryUpload,
    handleGalleryRemove,
    handleVideoUpload,
    handleRemoveVideo,
    handleMainImageRemove,
    handleSave,
  }
}