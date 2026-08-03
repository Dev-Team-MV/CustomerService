// apps/mv-crm/src/components/stats/ClientsOverview.jsx
import { Box, Typography, Avatar, useMediaQuery, useTheme } from '@mui/material'
import { Person, Apartment, StarOutline } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const KPICard = ({ icon, label, value, sub, color = '#000' }) => (
  <Box sx={{
    flex: { xs: '1 1 100%', sm: 1 }, p: '20px 24px', border: '1px solid #f0f0f0', borderRadius: 0,
    position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, width: 3, height: '100%', bgcolor: color, borderRadius: 0 }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: { xs: '1.5rem', sm: '1.9rem' }, color, letterSpacing: '-0.04em', lineHeight: 1, mb: 0.5 }}>
      {value}
    </Typography>
    {sub && <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000' }}>{sub}</Typography>}
  </Box>
)

export default function ClientsOverview({ clientsData }) {
  const { t } = useTranslation('analytics')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const clients    = clientsData?.clients ?? []
  const total      = clientsData?.total   ?? 0
  const totalProps = clients.reduce((s, c) => s + (c.propertyCount ?? 0), 0)
  const avg        = total > 0 ? (totalProps / total).toFixed(1) : '0'
  const topClient  = [...clients].sort((a, b) => (b.propertyCount ?? 0) - (a.propertyCount ?? 0))[0]

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
        {t('mv.modal.clientsOverview.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <KPICard
          icon={<Person sx={{ fontSize: 16 }} />}
          label={t('mv.modal.clientsOverview.totalClients')}
          value={total}
          sub={t('mv.modal.clientsOverview.totalClientsSub')}
          color="#000"
        />
        <KPICard
          icon={<Apartment sx={{ fontSize: 16 }} />}
          label={t('mv.modal.clientsOverview.avgProperties')}
          value={avg}
          sub={t('mv.modal.clientsOverview.avgPropertiesSub', { total: totalProps })}
          color="#4a7c59"
        />
        {topClient && (
          <KPICard
            icon={<StarOutline sx={{ fontSize: 16 }} />}
            label={t('mv.modal.clientsOverview.topClient')}
            value={`${topClient.propertyCount}`}
            sub={`${topClient.firstName} ${topClient.lastName}`}
            color="#c0842a"
          />
        )}
      </Box>

      {clients.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
            {t('mv.modal.clientsOverview.clientList')}
          </Typography>
          {clients.map((c, i) => (
            <Box key={c._id} sx={{
              display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between',
              py: 1.5, px: 2, gap: { xs: 1, sm: 0 },
              borderTop: i === 0 ? '1px solid #f0f0f0' : 'none',
              borderBottom: '1px solid #f0f0f0',
              '&:hover': { background: '#fafafa' },
              borderRadius: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', color: '#555', fontSize: '0.6rem', fontWeight: 700, borderRadius: 0, flexShrink: 0 }}>
                  {c.firstName?.[0]}{c.lastName?.[0]}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.firstName} {c.lastName}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.4, border: '1px solid #e0e0e0', borderRadius: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                <Apartment sx={{ fontSize: 10, color: '#4a7c59', flexShrink: 0 }} />
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#4a7c59', fontWeight: 700 }}>
                  {c.propertyCount}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}