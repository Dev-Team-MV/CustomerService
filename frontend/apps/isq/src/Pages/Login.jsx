// import UniversalLogin from '@shared/components/Login/UniversalLogin'
import UniversalLogin from '@shared/components/Login/UniversalLogin'
import LogoMain from '../assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'  // Ajusta según tus assets
const Login = () => {
  return (
    <UniversalLogin
      projectName="ISQ"
      logoMain={LogoMain}
      brandColors={{
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#9f7aea'
      }}
      showFooter={false}
      tagline="ISQ"
    />
  )
}

export default Login