import RegisterPage from '@shared/components/Register/RegisterPage'

const Register = () => {
  return (
    <RegisterPage
      projectName="Lakewood Oaks on Lake Conroe"
      logoMain="/images/logos/Logo_LakewoodOaks-05.png"
      logoSecondary="/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png"
      backgroundImage="/images/260721_001_0010_ISOMETRIA_3-1.png"
      tagline="Resort-Style Living on Lake Conroe"
      brandColors={{
        primary: '#333F1F',
        secondary: '#8CA551'
      }}
    />
  )
}

export default Register