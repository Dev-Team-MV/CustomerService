// /Users/oficina/MV-CRM/CustomerService/frontend/shared/context/ProjectBrandingContext.jsx
import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import useProjectBranding from '../hooks/useProjectBranding'

const ProjectBrandingContext = createContext(null)

export const ProjectBrandingProvider = ({ children }) => {
  const { projectSlug } = useAuth()
  const branding = useProjectBranding(projectSlug)

  return (
    <ProjectBrandingContext.Provider value={branding}>
      {children}
    </ProjectBrandingContext.Provider>
  )
}

// ✅ MODIFICADO: No lanza error si no está en un provider, retorna valores por defecto
export const useProjectBrandingContext = () => {
  const context = useContext(ProjectBrandingContext)
  
  // Si no está en un provider, retorna valores por defecto
  if (!context) {
    return {
      logo: '',
      logoSecondary: '',
      brandColors: {},
      projectName: '',
      tagline: '',
      backgroundImage: '',
      loading: false,
      error: null
    }
  }
  
  return context
}

export default ProjectBrandingContext