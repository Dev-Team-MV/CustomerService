import { Box, Typography, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const BG = '#c8d89a'
const TEXT_DARK = '#2e3d18'
const TEXT_MUTED = '#3d5020'

const navLinks = [
  { label: 'PRINCIPAL PANEL', path: '/dashboard' },
  { label: 'MY PROPERTY', path: '/my-property' },
  { label: 'AMENITIES', path: '/amenities' },
  { label: 'FAMILY GROUP', path: '/family-group' }
]

const LabelText = ({ children }) => (
  <Typography
    sx={{
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: TEXT_DARK,
      mb: 0.75
    }}
  >
    {children}
  </Typography>
)

const ValueText = ({ children }) => (
  <Typography
    sx={{
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 400,
      fontSize: 14,
      color: TEXT_MUTED,
      lineHeight: 1.6
    }}
  >
    {children}
  </Typography>
)

const Footer = () => {
  const navigate = useNavigate()

  return (
    <Box component="footer" sx={{ bgcolor: BG, mt: 'auto' }}>
      {/* Main content */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 4, md: 10 },
          py: { xs: 6, md: 8 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 6
        }}
      >
        {/* Left — contact info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          <Box>
            <LabelText>Sales Office</LabelText>
            <ValueText>Lakewood Oaks on Lake Conroe</ValueText>
            <ValueText>14830 FM 1097 W, Willis, TX 77318</ValueText>
          </Box>

          <Box>
            <LabelText>Phone</LabelText>
            <ValueText>+1 (832) 446–8453</ValueText>
          </Box>

          <Box>
            <LabelText>Email</LabelText>
            <ValueText>info@lakewoodoaksonlakeconroe.com</ValueText>
          </Box>

          <Box>
            <LabelText>Office Hours</LabelText>
            <ValueText>Mon – Fri: 9:00 AM – 6:00 PM</ValueText>
            <ValueText>Sat: 10:00 AM – 4:00 PM</ValueText>
            <ValueText>Sun: By Appointment</ValueText>
          </Box>
        </Box>

        {/* Right — nav links */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 2.5
          }}
        >
          {navLinks.map((link) => (
            <Typography
              key={link.label}
              onClick={() => navigate(link.path)}
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: TEXT_DARK,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.6 }
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Bottom bar */}
      <Divider sx={{ borderColor: `${TEXT_DARK}30` }} />
      <Box sx={{ py: 2.5, textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            color: TEXT_MUTED,
            fontWeight: 400
          }}
        >
          © 2026 Lakewood Oaks on Lake Conroe. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default Footer
