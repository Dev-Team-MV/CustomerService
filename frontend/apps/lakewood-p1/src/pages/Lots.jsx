import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Container,
  Avatar,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Landscape,
  CheckCircle,
  Schedule,
  Cancel,
  TrendingUp,
  AttachMoney,
  Terrain
} from '@mui/icons-material'
import api from '@shared/services/api'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '../components/table/DataTable'
import EmptyState from '../components/table/EmptyState'
import LotDialog from '../components/lot/LotDialog'

const Lots = () => {
  const { t } = useTranslation(['lots', 'common'])
  const [lots, setLots] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, pending: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lotsRes, statsRes] = await Promise.all([
        api.get('/lots'),
        api.get('/lots/stats')
      ])
      setLots(lotsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching lots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (lot = null) => {
    setSelectedLot(lot)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedLot(null)
  }

  const handleSubmit = async (formData, selectedLot) => {
    try {
      if (selectedLot) {
        await api.put(`/lots/${selectedLot._id}`, formData)
      } else {
        await api.post('/lots', formData)
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving lot:', error)
      alert(error.response?.data?.message || 'Error saving lot')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('lots:confirmDelete'))) {
      try {
        await api.delete(`/lots/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting lot:', error)
      }
    }
  }

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      field: 'number',
      headerName: t('lots:table.lotNumber'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}
          >
            {row.number}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem'
              }}
            >
              {t('lots:table.lot')} {row.number}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.7rem'
              }}
            >
              ID: {row._id?.slice(-6)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'price',
      headerName: t('lots:table.price'),
      renderCell: ({ value }) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <AttachMoney sx={{ fontSize: 18, color: '#8CA551' }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '1rem'
            }}
          >
            {value?.toLocaleString()}
          </Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: t('lots:table.status'),
      renderCell: ({ value }) => {
        const config = {
          available: { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: t('lots:status.available') },
          pending: { icon: Schedule, color: '#E5863C', bg: 'rgba(229, 134, 60, 0.12)', label: t('lots:status.pending') },
          sold: { icon: Cancel, color: '#706f6f', bg: 'rgba(112, 111, 111, 0.12)', label: t('lots:status.sold') }
        }[value] || { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: value }
        return (
          <Chip
            label={config.label}
            icon={<config.icon />}
            size="small"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              height: 28,
              px: 1.5,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              borderRadius: 2,
              textTransform: 'capitalize',
              bgcolor: config.bg,
              color: config.color,
              border: `1px solid ${config.color}40`,
              '& .MuiChip-icon': { color: config.color }
            }}
          />
        )
      }
    },
    {
      field: 'actions',
      headerName: t('lots:table.actions'),
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('lots:actions.edit')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenDialog(row)
              }}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#8CA551',
                  borderColor: '#8CA551',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('lots:actions.delete')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(row._id)
              }}
              sx={{
                bgcolor: 'rgba(229, 134, 60, 0.08)',
                border: '1px solid rgba(229, 134, 60, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#E5863C',
                  borderColor: '#E5863C',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [t])

  // Stats cards traducidas
  const lotsStats = [
    {
      title: t('lots:stats.total'),
      value: stats.total,
      icon: Terrain,
      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      color: '#333F1F',
      delay: 0
    },
    {
      title: t('lots:stats.available'),
      value: stats.available,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0.1
    },
    {
      title: t('lots:stats.pending'),
      value: stats.pending,
      icon: Schedule,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.2
    },
    {
      title: t('lots:stats.sold'),
      value: stats.sold,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
      color: '#706f6f',
      delay: 0.3
    }
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        <PageHeader
          icon={Landscape}
          title={t('lots:title')}
          subtitle={t('lots:subtitle')}
          actionButton={{
            label: t('lots:actions.add'),
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: t('lots:actions.add')
          }}
        />

        <StatsCards stats={lotsStats} loading={loading} />

        <DataTable
          columns={columns}
          data={lots.slice().sort((a, b) => Number(a.number) - Number(b.number))}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Landscape}
              title={t('lots:empty.title')}
              description={t('lots:empty.description')}
              actionLabel={t('lots:empty.action')}
              onAction={() => setOpenDialog(true)}
            />
          }
        />

        <LotDialog
          open={openDialog}
          onClose={handleCloseDialog}
          selectedLot={selectedLot}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  )
}

export default Lots