import { useMemo } from 'react'
import { Box, Paper, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export default function ReferrerLeaderboard({ referrals, residents }) {
  const { t } = useTranslation('referrals')

  // Agrupar y calcular estadísticas por referidor
  const leaderboard = useMemo(() => {
    const stats = {}
    referrals.forEach(ref => {
      // ✅ Manejo seguro: extraer el ID como string, ya sea que venga como objeto o string
      const refId = typeof ref.referrerId === 'object' ? ref.referrerId._id : ref.referrerId
      const refName = typeof ref.referrerId === 'object' 
        ? `${ref.referrerId.firstName} ${ref.referrerId.lastName}`.trim() 
        : null

      if (!stats[refId]) {
        stats[refId] = { 
          id: refId, 
          name: refName, // Guardamos el nombre si ya viene populado
          count: 0, 
          earned: 0, 
          converted: 0 
        }
      }
      stats[refId].count += 1
      if (ref.status === 'converted' || ref.status === 'reward_paid') {
        stats[refId].converted += 1
        stats[refId].earned += (ref.rewardAmount || 0)
      }
    })

    return Object.values(stats)
      .sort((a, b) => b.earned - a.earned) // Ordenar por dinero ganado
      .slice(0, 10) // Top 10
  }, [referrals])

  const residentMap = useMemo(() => {
    const map = {}
    residents.forEach(r => { map[r._id] = r })
    return map
  }, [residents])

  const getMedal = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 800, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
        <EmojiEvents color="warning" fontSize="large" />
        <Typography variant="h5" fontWeight={700}>{t('leaderboard.title')}</Typography>
      </Box>

      {leaderboard.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No hay datos de referidos para mostrar aún.
        </Typography>
      ) : (
        <List sx={{ width: '100%' }}>
          {leaderboard.map((item, index) => {
            // ✅ Obtener el nombre de forma segura: 1. Del objeto populado, 2. Del residentMap, 3. Fallback con slice seguro
            const user = residentMap[item.id]
            const name = item.name || (user ? `${user.firstName} ${user.lastName}` : `Usuario ${String(item.id).slice(-4)}`)
            const initial = name.charAt(0).toUpperCase()

            return (
              <Box key={item.id}>
                <ListItem alignItems="flex-start" sx={{ bgcolor: index < 3 ? '#fafafa' : 'transparent', borderRadius: 2, mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1976d2', fontWeight: 700 }}>
                      {getMedal(index).replace(/#/g, '') || initial}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={700}>
                        {name}
                      </Typography>
                    }
                    secondary={
                      <Box display="flex" gap={2} mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {item.count} {t('leaderboard.referrals')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.converted} Convertidos
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      ${item.earned.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('leaderboard.earned')}
                    </Typography>
                  </Box>
                </ListItem>
                {index < leaderboard.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            )
          })}
        </List>
      )}
    </Paper>
  )
}