// import { createContext, useState, useContext, useEffect } from 'react'
// import { authService } from '../services/authService'

// const AuthContext = createContext(null)

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
  

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     const userData = localStorage.getItem('user')
    
//     if (token) {
//       if (userData) {
//         setUser(JSON.parse(userData))
//         setLoading(false)
//       } else {
//         // 🔥 Si hay token pero no user, intenta obtener el usuario con /me
//         authService.me(token)
//           .then(data => {
//             setUser(data.user)
//             localStorage.setItem('user', JSON.stringify(data.user))
//           })
//           .catch(() => {
//             setUser(null)
//             localStorage.removeItem('token')
//             localStorage.removeItem('user')
//           })
//           .finally(() => setLoading(false))
//       }
//     } else {
//       setLoading(false)
//     }
//   }, [])

//   // Sincroniza user con localStorage en cada cambio
// useEffect(() => {
//   if (user) {
//     localStorage.setItem('user', JSON.stringify(user))
//   }
// }, [user])

//   // ✅ Login actualizado para manejar email o teléfono
//   const login = async (emailOrPhone, password) => {
//     try {
//       // Determinar si es email o teléfono
//       const isPhone = emailOrPhone && emailOrPhone.startsWith('+')
      
//       const data = await authService.login(emailOrPhone, password, isPhone)
      
//       setUser(data.user)
//       localStorage.setItem('token', data.token)
//       localStorage.setItem('user', JSON.stringify(data.user))
      
//           setUser(JSON.parse(localStorage.getItem('user')))

//       return { success: true }
//     } catch (error) {
//       console.error('❌ Login error:', error.response?.data)
//       return { 
//         success: false, 
//         error: error.response?.data?.message || error.message,
//         requiresPasswordSetup: error.response?.data?.requiresPasswordSetup
//       }
//     }
//   }

//   const register = async (firstName, lastName, email, password, phoneNumber) => {
//     try {
//       const data = await authService.register(firstName, lastName, email, password, phoneNumber)
//       setUser(data.user)
//       localStorage.setItem('token', data.token)
//       localStorage.setItem('user', JSON.stringify(data.user))
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: error.message }
//     }
//   }

//   // ✅ Nueva función para login directo con token
//   const loginWithToken = (token, userData) => {
//     localStorage.setItem('token', token)
//     localStorage.setItem('user', JSON.stringify(userData))
//     setUser(userData)
//   }

//   const logout = () => {
//     setUser(null)
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//   }

//   const value = {
//     user,
//     setUser,
//     login,
//     register,
//     loginWithToken,
//     logout,
//     loading,
//     isAuthenticated: !!user
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'
import { useLocation } from 'react-router-dom'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get('token')
    let token = localStorage.getItem('token')
    let userData = localStorage.getItem('user')

    // Si llega token por URL, guárdalo y limpia usuario anterior
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl)
      token = tokenFromUrl
      localStorage.removeItem('user')
      userData = null
      // Limpia el token de la URL
      window.history.replaceState({}, document.title, location.pathname)
    }

    if (token) {
      if (userData && !tokenFromUrl) {
        setUser(JSON.parse(userData))
        setLoading(false)
      } else {
        authService.me(token)
          .then(data => {
            setUser(data)
            localStorage.setItem('user', JSON.stringify(data))
          })
          .catch(() => {
            setUser(null)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          })
          .finally(() => setLoading(false))
      }
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [location])

  // Sincroniza user con localStorage en cada cambio
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  // Login normal
  const login = async (emailOrPhone, password) => {
    try {
      const isPhone = emailOrPhone && emailOrPhone.startsWith('+')
      const data = await authService.login(emailOrPhone, password, isPhone)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        requiresPasswordSetup: error.response?.data?.requiresPasswordSetup
      }
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
    logout,
    loading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}