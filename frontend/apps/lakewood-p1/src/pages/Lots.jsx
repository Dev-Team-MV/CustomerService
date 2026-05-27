import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Container
} from '@mui/material'
import {
  Add,
  Landscape,
  CheckCircle,
  Schedule,
  TrendingUp,
  Terrain
} from '@mui/icons-material'
import api from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'
import PageHeader from '@shared/components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import LotDialog from '../components/lot/LotDialog'
import { useLotsColumns } from '../constants/Columns/lots'

const Lots = () => {
  const { t } = useTranslation(['lots', 'common'])
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [lots, setLots] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, pending: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)

  const projectId = import.meta.env.VITE_PROJECT_ID || '69a73ce5b20401b061da6451'

  useEffect(() => {
    if (projectId) {
      fetchData()
    }
  }, [projectId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = projectId ? { projectId } : {}
      
      const [lotsRes, statsRes] = await Promise.all([
        api.get('/lots', { params }),
        api.get('/lots/stats', { params })
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
      const dataWithProject = {
        ...formData,
        projectId
      }

      if (selectedLot) {
        await api.put(`/lots/${selectedLot._id}`, dataWithProject)
      } else {
        await api.post('/lots', dataWithProject)
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

  const columns = useLotsColumns(t, handleOpenDialog, handleDelete, isOwner)

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