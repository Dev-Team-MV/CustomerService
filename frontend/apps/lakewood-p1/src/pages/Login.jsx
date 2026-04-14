import UniversalLogin from '@shared/components/Login/UniversalLogin'
import TypingFooter from '../components/Footer'

const Login = () => {
  return (
    <UniversalLogin
      projectName="Lakewood Oaks on Lake Conroe"
      logoMain="/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png"
      logoSecondary="/images/logos/Logo_LakewoodOaks-05.png"
      backgroundImage="/images/260721_001_0010_ISOMETRIA_3-1.png"
      tagline="Resort Lifestyle"
      brandColors={{
        primary: '#333F1F',
        secondary: '#8CA551',
        gradient: 'linear-gradient(90deg, #333F1F, #8CA551)'
      }}
      Footer={TypingFooter}
    />
  )
}

export default Login