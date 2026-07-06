// src/Pages/Login.jsx
import UniversalLogin from '@shared/components/Login/UniversalLogin'
// Ajusta la ruta según donde tengas tu logo de hTower
// import LogoMain from '../assets/logos/logo-hTower.png'
import LogoMain from '../assets/react.svg'

const Login = () => {
  return (
    <UniversalLogin
      projectName="hTower"
      logoMain={LogoMain}
      brandColors={{
        primary: '#424242',      // Gris oscuro (PRIMARY)
        secondary: '#757575',    // Gris medio (SECONDARY)
        accent: '#E53935'        // Rojo vibrante (ACCENT)
      }}
      showFooter={false}
      tagline="hTower"
    />
  )
}

export default Login