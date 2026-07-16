// /Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useProjectBranding.js
import { useState, useEffect } from 'react'
import projectService from '../services/projectService'

// ✅ NUEVO: Helper para obtener el valor según el idioma actual
export const getLocalizedValue = (field, lang = 'es') => {
  if (!field) return ''
  
  // Si es un string, retornarlo tal cual
  if (typeof field === 'string') return field
  
  // Si es un objeto con idiomas, retornar el solicitado o fallback
  if (typeof field === 'object') {
    return field[lang] || field.es || field.en || ''
  }
  
  return ''
}

export const useProjectBranding = (projectSlug) => {
  const [branding, setBranding] = useState({
    logo: '',
    logoSecondary: '',
    brandColors: {},
    projectName: '',
    tagline: '',
    backgroundImage: '',
    // ✅ NUEVO: Exponer los campos multilenguaje completos
    title: { en: '', es: '' },
    subtitle: { en: '', es: '' },
    description: { en: '', es: '' },
    fullDescription: { en: '', es: '' },
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchProjectBranding = async () => {
      if (!projectSlug) {
        setBranding(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        setBranding(prev => ({ ...prev, loading: true, error: null }))
        
        const projects = await projectService.getAll()
        const project = projects.find(p => p.slug === projectSlug)
        
        if (project) {
          // Convertir array de brandColors a objeto
          const brandColorsObj = {}
          if (Array.isArray(project.brandColors)) {
            project.brandColors.forEach(color => {
              if (color.key === 'color-1') {
                brandColorsObj.primary = color.value
              } else if (color.key === 'color-2') {
                brandColorsObj.secondary = color.value
              } else if (color.key === 'color-3') {
                brandColorsObj.accent = color.value
              } else {
                brandColorsObj[color.key] = color.value
              }
            })
          }

          // ✅ NUEVO: Normalizar campos multilenguaje
          const normalizeLangField = (field) => {
            if (typeof field === 'object' && field !== null) {
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

          const title = normalizeLangField(project.title)
          const subtitle = normalizeLangField(project.subtitle)
          const description = normalizeLangField(project.description)
          const fullDescription = normalizeLangField(project.fullDescription)

          setBranding({
            logo: project.logo || '',
            logoSecondary: project.logoSecondary || '',
            brandColors: brandColorsObj,
            // ✅ NUEVO: Exponer campos completos multilenguaje
            title,
            subtitle,
            description,
            fullDescription,
            // ✅ Mantener compatibilidad con valores por defecto (español)
            projectName: title.es || project.name || '',
            tagline: subtitle.es || '',
            backgroundImage: project.backgroundImage || '',
            loading: false,
            error: null
          })
        } else {
          setBranding(prev => ({
            ...prev,
            loading: false,
            error: 'Proyecto no encontrado'
          }))
        }
      } catch (error) {
        console.error('Error fetching project branding:', error)
        setBranding(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Error al cargar datos del proyecto'
        }))
      }
    }

    fetchProjectBranding()
  }, [projectSlug])

  return branding
}

export default useProjectBranding