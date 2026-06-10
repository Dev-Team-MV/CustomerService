// @shared/components/HomeCareLinkButton.jsx
import { Button } from '@mui/material'
import { useAuth } from '@shared/context/AuthContext'
import { getHomeCareRedirectUrl } from '@shared/config/homeCareConfig'
import PropTypes from 'prop-types'

const HomeCareLinkButton = ({
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  children = 'Solicitar Servicio',
  sx = {},
  onClick = null,
  propertyId = null,      // ID de la propiedad
  propertyName = null,    // Nombre de la propiedad
  ...props
}) => {
  const { user } = useAuth()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.error('No token found. User must be authenticated.')
      return
    }
    
    // Construir URL de redirección a HomeCare con parámetros de la propiedad
    const redirectUrl = getHomeCareRedirectUrl(token, {
      propertyId,
      propertyName
    })
    
    // Redirigir a HomeCare
    window.open(redirectUrl, '_blank')
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      sx={sx}
      {...props}
    >
      {children}
    </Button>
  )
}

HomeCareLinkButton.propTypes = {
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  children: PropTypes.node,
  sx: PropTypes.object,
  onClick: PropTypes.func,
  propertyId: PropTypes.string,
  propertyName: PropTypes.string
}

export default HomeCareLinkButton