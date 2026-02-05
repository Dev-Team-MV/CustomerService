import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  // ✅ Login actualizado para manejar email o teléfono
  const login = async (emailOrPhone, password) => {
    try {
      // Determinar si es email o teléfono
      const isPhone = emailOrPhone && emailOrPhone.startsWith('+')
      
      console.log('🔐 Login attempt:', { 
        emailOrPhone, 
        isPhone,
        type: isPhone ? 'phone' : 'email'
      })
      
      const data = await authService.login(emailOrPhone, password, isPhone)
      
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return { success: true }
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
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ✅ Nueva función para login directo con token
  const loginWithToken = (token, userData) => {
    console.log('🔐 loginWithToken called with:', { 
      token: token?.substring(0, 20) + '...', 
      userData 
    })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    register,
    loginWithToken,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}