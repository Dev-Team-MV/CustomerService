import i18n from '../i18n'
import { createContext, useState, useContext, useEffect } from 'react'
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

export const AuthProvider = ({ children, projectSlug }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Validar acceso al proyecto específico
  const validateProjectAccess = (projects, requiredSlug) => {
    if (!requiredSlug) return true // Sin slug = acceso a todos
    
    const hasAccess = projects.some(p => p.slug === requiredSlug)
    if (!hasAccess) {
      console.error(`⛔ User does not have access to project: ${requiredSlug}`)
      console.log('📋 User projects:', projects.map(p => p.slug))
    }
    return hasAccess
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    const fetchAndSetUserWithProjects = async (userObj) => {
      try {
        const projects = await Promise.race([
          userService.getMyProjects(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ])
        
        // Validar que tenga proyectos
        if (!projects || projects.length === 0) {
          console.error('⛔ User has no projects')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          return
        }

        // Validar acceso al proyecto específico
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
          // Validar acceso incluso si ya tiene projects en localStorage
          if (projectSlug && !validateProjectAccess(parsedUser.projects, projectSlug)) {
            console.error(`⛔ Cached user cannot access ${projectSlug}`)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            setLoading(false)
            return
          }
          setUser(parsedUser)
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

        // Validar acceso al proyecto específico
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    setUser,
    login,
    register,
    loginWithToken,
    logout,
    loading,
    isAuthenticated: !!user,
    projectSlug
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}