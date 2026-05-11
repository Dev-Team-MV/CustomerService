import RegisterPage from '@shared/components/Register/RegisterPage'

const Register = () => {
  return (
    <RegisterPage
      projectName="Sheperd Residences"
      logoMain="/images/logos/sheperd-logo.png"
      logoSecondary="/images/logos/sheperd-secondary.png"
      backgroundImage="/images/sheperd-background.jpg"
      tagline="Modern Living Redefined"
      brandColors={{
        primary: '#FF6B35',
        secondary: '#F7931E'
      }}
    />
  )
}

export default Register