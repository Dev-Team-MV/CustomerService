
// /shared/hooks/useTokenLogin.js
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export const useTokenLogin = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { loginWithToken, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token && !isAuthenticated && !isProcessing) {
      setIsProcessing(true)
      
      // Auto-login con token de URL
      authService.me(token)
        .then(async (data) => {
          await loginWithToken(token, data.user)
          
          // Limpiar token de URL
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('token')
          setSearchParams(newSearchParams, { replace: true })
        })
        .catch((error) => {
          console.error('❌ Token login failed:', error)
          // No redirigir a login, solo limpiar el token inválido
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('token')
          setSearchParams(newSearchParams, { replace: true })
        })
        .finally(() => {
          setIsProcessing(false)
        })
    }
  }, [searchParams, loginWithToken, isAuthenticated, isProcessing, setSearchParams])

  return { isProcessing }
}