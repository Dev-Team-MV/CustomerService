// apps/mv-crm/src/components/stats/ProjectStatsModal.jsx
import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, Box, Typography, IconButton,
  Divider, Avatar, Skeleton, Tab, Tabs, useMediaQuery, useTheme
} from '@mui/material'
import { Close, TrendingUp, People } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import crmService from '../../services/crmService'
import BalanceOverview from './BalanceOverview'
import BalanceDonutChart from './BalanceDonutChart'
import ClientsOverview from './ClientsOverview'
import ClientsPropertyChart from './ClientsPropertyChart'

export default function ProjectStatsModal({ open, onClose, project, allBalance }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [tab, setTab] = useState(0)
  const [clientsData, setClientsData] = useState(null)
  const [loadingClients, setLoadingClients] = useState(false)

  const projectBalance = allBalance?.byProject?.find(
    b => b.projectId === project?._id
  ) ?? { totalCollected: 0, totalPending: 0 }

  useEffect(() => {
    if (!open || !project?._id) return
    setClientsData(null)
    setLoadingClients(true)
    crmService.getClients(project._id)
      .then(d => setClientsData(d))
      .catch(() => setClientsData({ clients: [], total: 0 }))
      .finally(() => setLoadingClients(false))
  }, [open, project?._id])

  if (!project) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
          boxShadow: '8px 8px 0px rgba(0,0,0,0.06)',
          background: '#fff',
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={{
        px: { xs: 2, sm: 4 }, py: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0', background: '#fafafa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Avatar sx={{
            width: 40, height: 40, bgcolor: '#000', borderRadius: 0,
            fontSize: '0.75rem', fontWeight: 700, fontFamily: '"Courier New", monospace', flexShrink: 0
          }}>
            {project.name?.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontFamily: '"Helvetica Neue", sans-serif', fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#000', letterSpacing: '-0.02em', lineHeight: 1.1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {project.name}
            </Typography>
            <Typography sx={{
              fontFamily: '"Courier New", monospace', fontSize: '0.6rem',
              color: '#000', letterSpacing: '1px'
            }}>
              /{project.slug} · STATISTICS
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ borderRadius: 0, '&:hover': { background: '#f0f0f0' }, flexShrink: 0 }}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: { xs: 2, sm: 4 },
          borderBottom: '1px solid #f0f0f0',
          '& .MuiTab-root': {
            fontFamily: '"Courier New", monospace', fontSize: { xs: '0.6rem', sm: '0.65rem' },
            letterSpacing: '1.5px', textTransform: 'uppercase', minHeight: 44,
            color: '#000', padding: 0, mr: 3,
          },
          '& .Mui-selected': { color: '#000 !important' },
          '& .MuiTabs-indicator': { background: '#000', height: 2 },
        }}
      >
        <Tab icon={<TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" label="Balance" />
        <Tab icon={<People sx={{ fontSize: 14, mr: 0.5 }} />} iconPosition="start" label="Clients" />
      </Tabs>

      <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div
              key="balance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <BalanceOverview balance={projectBalance} />
                <Divider />
                <BalanceDonutChart balance={projectBalance} projectName={project.name} />
              </Box>
            </motion.div>
          )}
          {tab === 1 && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {loadingClients ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Skeleton height={80} sx={{ borderRadius: 0 }} />
                  <Skeleton height={220} sx={{ borderRadius: 0 }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <ClientsOverview clientsData={clientsData} />
                  <Divider />
                  <ClientsPropertyChart clientsData={clientsData} />
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}