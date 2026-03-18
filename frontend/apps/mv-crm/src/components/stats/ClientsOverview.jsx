import { Box, Typography, Avatar } from '@mui/material'
import { Person, Apartment, StarOutline } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const KPICard = ({ icon, label, value, sub, color = '#000' }) => (
  <Box sx={{
    flex: 1, p: '20px 24px', border: '1px solid #f0f0f0',
    position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, width: 3, height: '100%', bgcolor: color }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 200, fontSize: '1.9rem', color, letterSpacing: '-0.04em', lineHeight: 1, mb: 0.5 }}>
      {value}
    </Typography>
    {sub && <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff' }}>{sub}</Typography>}
  </Box>
)

export default function ClientsOverview({ clientsData }) {
  const { t } = useTranslation('analytics')

  const clients    = clientsData?.clients ?? []
  const total      = clientsData?.total   ?? 0
  const totalProps = clients.reduce((s, c) => s + (c.propertyCount ?? 0), 0)
  const avg        = total > 0 ? (totalProps / total).toFixed(1) : '0'
  const topClient  = [...clients].sort((a, b) => (b.propertyCount ?? 0) - (a.propertyCount ?? 0))[0]

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
        {t('mv.modal.clientsOverview.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, mb: 3 }}>
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
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
            {t('mv.modal.clientsOverview.clientList')}
          </Typography>
          {clients.map((c, i) => (
            <Box key={c._id} sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              py: 1.5, px: 2,
              borderTop: i === 0 ? '1px solid #f0f0f0' : 'none',
              borderBottom: '1px solid #f0f0f0',
              '&:hover': { background: '#fafafa' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#f0f0f0', color: '#555', fontSize: '0.6rem', fontWeight: 700, borderRadius: 0 }}>
                  {c.firstName?.[0]}{c.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#000' }}>
                    {c.firstName} {c.lastName}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#000000ff' }}>
                    {c.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.4, border: '1px solid #e0e0e0' }}>
                <Apartment sx={{ fontSize: 10, color: '#4a7c59' }} />
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