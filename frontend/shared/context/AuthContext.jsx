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
// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/context/AuthContext.jsx
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    const fetchAndSetUserWithProjects = async (userObj) => {
      try {
        const projects = await Promise.race([
          userService.getMyProjects(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ])
        const userWithProjects = { ...userObj, projects }
        setUser(userWithProjects)
        localStorage.setItem('user', JSON.stringify(userWithProjects))
      } catch (e) {
        console.warn('⚠️ Could not fetch projects, continuing with user data:', e.message)
        // ✅ IMPORTANTE: Continuar con el user aunque falle getMyProjects
        setUser(userObj)
        localStorage.setItem('user', JSON.stringify(userObj))
      }
    }

    if (token) {
      if (userData) {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.projects) {
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
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  // ✅ Login mejorado con mejor manejo de errores
  const login = async (emailOrPhone, password) => {
    try {
      const isPhone = emailOrPhone && emailOrPhone.startsWith('+')
      const data = await authService.login(emailOrPhone, password, isPhone)
      
      // ✅ Guardar token PRIMERO
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // ✅ Establecer user inmediatamente (sin esperar projects)
      setUser(data.user)
      
      // ✅ Intentar traer proyectos en background (sin bloquear el login)
      try {
        const projects = await userService.getMyProjects()
        const userWithProjects = { ...data.user, projects }
        setUser(userWithProjects)
        localStorage.setItem('user', JSON.stringify(userWithProjects))
      } catch (projectError) {
        console.warn('⚠️ Could not fetch projects after login:', projectError.message)
        // No hacer nada, el usuario ya está logueado
      }
      
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
      
      // ✅ Guardar token PRIMERO
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // ✅ Establecer user inmediatamente
      setUser(data.user)
      
      // ✅ Intentar traer proyectos en background
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

  // ✅ Login directo con token mejorado
  const loginWithToken = async (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // ✅ Establecer user inmediatamente
    setUser(userData)
    
    // ✅ Intentar traer proyectos en background
    try {
      const projects = await userService.getMyProjects()
      const userWithProjects = { ...userData, projects }
      localStorage.setItem('user', JSON.stringify(userWithProjects))
      setUser(userWithProjects)
    } catch (projectError) {
      console.warn('⚠️ Could not fetch projects with token:', projectError.message)
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
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}