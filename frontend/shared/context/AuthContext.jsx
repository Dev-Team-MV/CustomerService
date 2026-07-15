// /Users/oficina/MV-CRM/CustomerService/frontend/shared/context/AuthContext.jsx

import i18n from '../i18n'
import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import userService from '../services/userService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useProjectSlug = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useProjectSlug must be used within an AuthProvider')
  }
  return context.projectSlug
}

// ═══════════════════════════════════════════════════════════════
// ✅ NUEVO: Hook específico para impersonación
// ═══════════════════════════════════════════════════════════════

export const useImpersonation = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useImpersonation must be used within an AuthProvider')
  }
  return {
    isImpersonating: context.isImpersonating,
    impersonatedBy: context.impersonatedBy,
    impersonatedUser: context.impersonatedUser,
    impersonate: context.impersonate,
    stopImpersonation: context.stopImpersonation
  }
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  ORIGINAL_TOKEN: 'originalToken',
  ORIGINAL_USER: 'originalUser',
  IMPERSONATION_ACTIVE: 'impersonationActive',
  IMPERSONATED_BY: 'impersonatedBy'
}

export const AuthProvider = ({ children, projectSlug }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ✅ NUEVO: Estado de impersonación
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedBy, setImpersonatedBy] = useState(null) // SuperAdmin original
  const [impersonatedUser, setImpersonatedUser] = useState(null) // Usuario personificado

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN DE PROYECTOS
  // ═══════════════════════════════════════════════════════════════

  const validateProjectAccess = (projects, requiredSlug) => {
    if (!requiredSlug) return true
    const hasAccess = projects.some(p => p.slug === requiredSlug)
    if (!hasAccess) {
      console.error(`⛔ User does not have access to project: ${requiredSlug}`)
      console.log('📋 User projects:', projects.map(p => p.slug))
    }
    return hasAccess
  }

  // ═══════════════════════════════════════════════════════════════
  // INICIALIZACIÓN - Detectar impersonación activa al cargar
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    // ✅ Verificar si hay sesión de impersonación activa
    const impersonationActive = sessionStorage.getItem(STORAGE_KEYS.IMPERSONATION_ACTIVE) === 'true'
    const impersonatedByData = sessionStorage.getItem(STORAGE_KEYS.IMPERSONATED_BY)

    if (impersonationActive && impersonatedByData) {
      setIsImpersonating(true)
      setImpersonatedBy(JSON.parse(impersonatedByData))
    }

    const fetchAndSetUserWithProjects = async (userObj) => {
      try {
        const projects = await Promise.race([
          userService.getMyProjects(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ])
        
        if (!projects || projects.length === 0) {
          console.error('⛔ User has no projects')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          return
        }

        if (projectSlug && !validateProjectAccess(projects, projectSlug)) {
          console.error(`⛔ User cannot access ${projectSlug}`)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          return
        }
        
        const userWithProjects = { ...userObj, projects }
        setUser(userWithProjects)
        localStorage.setItem('user', JSON.stringify(userWithProjects))
        
        // ✅ Si está impersonando, guardar datos del usuario personificado
        if (impersonationActive) {
          setImpersonatedUser(userWithProjects)
        }
      } catch (e) {
        console.error('❌ Could not fetch projects:', e.message)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }

    if (token) {
      if (userData) {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.projects) {
          if (projectSlug && !validateProjectAccess(parsedUser.projects, projectSlug)) {
            console.error(`⛔ Cached user cannot access ${projectSlug}`)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            setLoading(false)
            return
          }
          setUser(parsedUser)
          if (impersonationActive) {
            setImpersonatedUser(parsedUser)
          }
          setLoading(false)
        } else {
          fetchAndSetUserWithProjects(parsedUser).finally(() => setLoading(false))
        }
      } else {
        authService.me(token)
          .then(async data => {
            await fetchAndSetUserWithProjects(data.user)
          })
          .catch((err) => {
            console.error('❌ Failed to fetch user with token:', err)
            setUser(null)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          })
          .finally(() => setLoading(false))
      }
    } else {
      setLoading(false)
    }
  }, [projectSlug])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  // ═══════════════════════════════════════════════════════════════
  // ✅ IMPERSONACIÓN - Funciones
  // ═══════════════════════════════════════════════════════════════

  /**
   * Iniciar impersonación de un usuario
   * @param {string} userId - ID del usuario a impersonar
   * @param {Object} options - { redirectTo: '/dashboard' }
   */
  const impersonate = useCallback(async (userId, options = {}) => {
    try {
      // Validar que sea superadmin
      if (!user || user.role !== 'superadmin') {
        throw new Error('Only superadmins can impersonate users')
      }

      // No permitir impersonarse a sí mismo
      if (user._id === userId) {
        throw new Error('Cannot impersonate yourself')
      }

      // Guardar sesión original en sessionStorage
      const currentToken = localStorage.getItem('token')
      const currentUser = localStorage.getItem('user')
      
      sessionStorage.setItem(STORAGE_KEYS.ORIGINAL_TOKEN, currentToken)
      sessionStorage.setItem(STORAGE_KEYS.ORIGINAL_USER, currentUser)
      sessionStorage.setItem(STORAGE_KEYS.IMPERSONATED_BY, JSON.stringify(user))
      sessionStorage.setItem(STORAGE_KEYS.IMPERSONATION_ACTIVE, 'true')

      // Llamar al backend para iniciar impersonación
      const data = await authService.startImpersonation(userId)

      // Reemplazar localStorage con los datos del usuario personificado
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Actualizar estado
      setUser(data.user)
      setIsImpersonating(true)
      setImpersonatedBy(user)
      setImpersonatedUser(data.user)

      console.log('✅ Impersonation started:', {
        impersonator: user.email,
        impersonated: data.user.email
      })

      // Redirigir si se especifica
      if (options.redirectTo) {
        window.location.href = options.redirectTo
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('❌ Impersonation failed:', error)
      
      // Limpiar sessionStorage en caso de error
      sessionStorage.removeItem(STORAGE_KEYS.ORIGINAL_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER)
      sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATED_BY)
      sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATION_ACTIVE)
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }, [user])

  /**
   * Detener impersonación y restaurar sesión de superadmin
   */
  const stopImpersonation = useCallback(async () => {
    try {
      // Intentar llamar al backend para detener impersonación
      try {
        await authService.stopImpersonation()
      } catch (backendError) {
        console.warn('⚠️ Backend stop failed, restoring from sessionStorage:', backendError.message)
      }

      // Restaurar sesión original desde sessionStorage
      const originalToken = sessionStorage.getItem(STORAGE_KEYS.ORIGINAL_TOKEN)
      const originalUser = sessionStorage.getItem(STORAGE_KEYS.ORIGINAL_USER)

      if (originalToken && originalUser) {
        localStorage.setItem('token', originalToken)
        localStorage.setItem('user', originalUser)
        
        const parsedUser = JSON.parse(originalUser)
        setUser(parsedUser)
      } else {
        // Fallback: limpiar todo
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }

      // Limpiar sessionStorage
      sessionStorage.removeItem(STORAGE_KEYS.ORIGINAL_TOKEN)
      sessionStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER)
      sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATED_BY)
      sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATION_ACTIVE)

      // Actualizar estado
      setIsImpersonating(false)
      setImpersonatedBy(null)
      setImpersonatedUser(null)

      console.log('✅ Impersonation stopped')

      // Redirigir al CRM
      window.location.href = '/dashboard'

      return { success: true }
    } catch (error) {
      console.error('❌ Error stopping impersonation:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════
  // LOGIN / LOGOUT / REGISTER (EXISTENTES)
  // ═══════════════════════════════════════════════════════════════

  const login = async (emailOrPhone, password) => {
    try {
      const isPhone = emailOrPhone && emailOrPhone.startsWith('+')
      const data = await authService.login(emailOrPhone, password, isPhone)
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      try {
        const projects = await userService.getMyProjects()
        
        if (!projects || projects.length === 0) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          
          return {
            success: false,
            error: i18n.t('auth:noProjects'),
            noProjects: true
          }
        }
        
        if (projectSlug && !validateProjectAccess(projects, projectSlug)) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          
          return {
            success: false,
            error: i18n.t('auth:noProjectAccess', { projects: projects.map(p => p.name).join(', ') }),
            noProjectAccess: true
          }
        }
        
        const userWithProjects = { ...data.user, projects }
        setUser(userWithProjects)
        localStorage.setItem('user', JSON.stringify(userWithProjects))
        
        return { success: true, projects }
      } catch (projectError) {
        console.error('❌ Error fetching projects:', projectError)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        
        return {
          success: false,
          error: i18n.t('auth:projectsLoadError'),
          projectError: true
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error.response?.data)
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        requiresPasswordSetup: error.response?.data?.requiresPasswordSetup
      }
    }
  }

  const register = async (firstName, lastName, email, password, phoneNumber) => {
    try {
      const data = await authService.register(firstName, lastName, email, password, phoneNumber)
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      try {
        const projects = await userService.getMyProjects()
        const userWithProjects = { ...data.user, projects }
        setUser(userWithProjects)
        localStorage.setItem('user', JSON.stringify(userWithProjects))
      } catch (projectError) {
        console.warn('⚠️ Could not fetch projects after register:', projectError.message)
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const loginWithToken = async (token, userData) => {
    localStorage.setItem('token', token)

    try {
      const profileResponse = await authService.getProfile()
      const freshUser = profileResponse.user || profileResponse

      try {
        const projects = await userService.getMyProjects()
        
        if (!projects || projects.length === 0) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          throw new Error('NO_PROJECTS')
        }

        if (projectSlug && !validateProjectAccess(projects, projectSlug)) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          throw new Error(`NO_ACCESS_TO_${projectSlug}`)
        }
        
        const userWithProjects = { ...freshUser, projects }
        localStorage.setItem('user', JSON.stringify(userWithProjects))
        setUser(userWithProjects)
        
      } catch (projectError) {
        console.error('❌ Error with projects in token login:', projectError)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        throw projectError
      }

    } catch (err) {
      console.error('⛔ Token login failed:', err.message)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setIsImpersonating(false)
    setImpersonatedBy(null)
    setImpersonatedUser(null)
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem(STORAGE_KEYS.ORIGINAL_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER)
    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATED_BY)
    sessionStorage.removeItem(STORAGE_KEYS.IMPERSONATION_ACTIVE)
  }

  // ═══════════════════════════════════════════════════════════════
  // VALUE DEL CONTEXTO
  // ═══════════════════════════════════════════════════════════════

  const value = {
    user,
    setUser,
    login,
    register,
    loginWithToken,
    logout,
    loading,
    isAuthenticated: !!user,
    projectSlug,
    
    // ✅ NUEVO: Impersonación
    isImpersonating,
    impersonatedBy,
    impersonatedUser,
    impersonate,
    stopImpersonation
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}