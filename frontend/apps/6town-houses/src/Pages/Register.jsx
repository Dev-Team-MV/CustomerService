import RegisterPage from '@shared/components/Register/RegisterPage'
import logo6TownHouses from '../assets/react.svg'
import { BRAND } from '../theme'

const Register = () => (
  <RegisterPage
    projectName="6Town Houses"
    logoMain={logo6TownHouses}
    tagline="Modern Townhouse Living"
    brandColors={{
      primary: BRAND.PRIMARY,
      secondary: BRAND.SECONDARY,
      gradient: BRAND.GRADIENT
    }}
  />
)

export default Register