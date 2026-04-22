import UniversalLogin from '@shared/components/Login/UniversalLogin'
import logo6TownHouses from '../assets/react.svg'
import { BRAND } from '../theme'

const Login = () => {
  return (
    <UniversalLogin
      projectName="6Town Houses"
      logoMain={logo6TownHouses}
      brandColors={{
        primary: BRAND.PRIMARY,
        secondary: BRAND.SECONDARY,
        gradient: BRAND.GRADIENT
      }}
      tagline="Modern Townhouse Living"
    />
  )
}

export default Login