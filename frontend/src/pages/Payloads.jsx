import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Tooltip,
  Container,
  Grid
} from '@mui/material'
import { 
  Add, 
  Edit, 
  AttachFile, 
  CheckCircle, 
  Cancel,
  Download,
  AccountBalance,
  Schedule,
  ErrorOutline
} from '@mui/icons-material'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '../components/table/DataTable'
import EmptyState from '../components/table/EmptyState'
import PayloadDialog from '../components/payloads/createPayload'
const Payloads = () => {
  const [payloads, setPayloads] = useState([])
  const [properties, setProperties] = useState([])
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingPayloads: 0,
    rejectedPayloads: 0,
    recentFailures: 0
  })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPayload, setSelectedPayload] = useState(null)
  const [formData, setFormData] = useState({
    property: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'pending',
    type: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [payloadsRes, propertiesRes, statsRes] = await Promise.all([
        api.get('/payloads'),
        api.get('/properties'),
        api.get('/payloads/stats')
      ])
      setPayloads(payloadsRes.data)
      setProperties(propertiesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ HANDLERS CON useCallback
  const handleOpenDialog = useCallback((payload = null) => {
    if (payload) {
      setSelectedPayload(payload)
      setFormData({
        property: payload.property._id,
        date: new Date(payload.date).toISOString().split('T')[0],
        amount: payload.amount,
        status: payload.status,
        type: payload.type || '',
        notes: payload.notes || ''
      })
    } else {
      setSelectedPayload(null)
      setFormData({
        property: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        status: 'pending',
        type: '',
        notes: ''
      })
    }
    setOpenDialog(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)
    setSelectedPayload(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    try {
      if (selectedPayload) {
        await api.put(`/payloads/${selectedPayload._id}`, formData)
      } else {
        await api.post('/payloads', formData)
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving payload:', error)
    }
  }, [selectedPayload, formData, handleCloseDialog])

  const getFileUrl = useCallback((payload) => {
    if (!payload) return null
    if (payload.support) {
      if (typeof payload.support === 'string') return payload.support
      if (payload.support.url) return payload.support.url
    }
    if (payload.fileUrl) return payload.fileUrl
    if (payload.documentUrl) return payload.documentUrl
    if (payload.attachment) return payload.attachment
    return null
  }, [])

  const handleDownload = useCallback((payload) => {
    const url = getFileUrl(payload)
    if (!url) {
      alert('No attached file available for this payload.')
      return
    }
    window.open(url, '_blank', 'noopener')
  }, [getFileUrl])

  const handleApprove = useCallback(async (payload, e) => {
    e.stopPropagation()
    if (!payload) return
    if (!window.confirm('Approve this payment and mark as signed?')) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'signed' })
      fetchData()
    } catch (err) {
      console.error('Error approving payload:', err)
      alert('Error approving payload')
    }
  }, [])

  const handleReject = useCallback(async (payload, e) => {
    e.stopPropagation()
    if (!payload) return
    if (!window.confirm('Reject this payment? This will set status to rejected.')) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'rejected' })
      fetchData()
    } catch (err) {
      console.error('Error rejecting payload:', err)
      alert('Error rejecting payload')
    }
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'signed':
        return { 
          bg: 'rgba(140, 165, 81, 0.12)', 
          color: '#333F1F', 
          border: 'rgba(140, 165, 81, 0.3)', 
          icon: CheckCircle 
        }
      case 'pending':
        return { 
          bg: 'rgba(229, 134, 60, 0.12)', 
          color: '#E5863C', 
          border: 'rgba(229, 134, 60, 0.3)', 
          icon: Schedule 
        }
      case 'rejected':
        return { 
          bg: 'rgba(211, 47, 47, 0.12)', 
          color: '#d32f2f', 
          border: 'rgba(211, 47, 47, 0.3)', 
          icon: Cancel 
        }
      default:
        return { 
          bg: 'rgba(112, 111, 111, 0.12)', 
          color: '#706f6f', 
          border: 'rgba(112, 111, 111, 0.3)', 
          icon: ErrorOutline 
        }
    }
  }, [])

  // ✅ STATS
  const payloadsStats = useMemo(() => [
    {
      title: 'Total Collected (YTD)',
      value: `$${(stats.totalCollected / 1000000).toFixed(1)}M`,
      icon: AccountBalance,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0,
      subtitle: '+12%',
      trend: 'up'
    },
    {
      title: 'Pending Review',
      value: stats.pendingPayloads,
      icon: Schedule,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.1,
      subtitle: 'Needs Action'
    },
    {
      title: 'Recent Failures',
      value: `$${stats.recentFailures?.toLocaleString() || 0}`,
      icon: ErrorOutline,
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
      color: '#d32f2f',
      delay: 0.2,
      subtitle: 'Last 30 days',
      trend: 'down'
    },
    {
      title: 'Rejected',
      value: stats.rejectedPayloads,
      icon: Cancel,
      gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
      color: '#706f6f',
      delay: 0.3,
      subtitle: 'Total'
    }
  ], [stats])

  // ✅ DEFINIR COLUMNAS
  const columns = useMemo(() => [
    {
      field: 'property',
      headerName: 'PROPERTY',
      minWidth: 150,
      renderCell: ({ row }) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Unit {row.property?.lot?.number || 'N/A'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.7rem'
            }}
          >
            ID: #{row.property?.model?.modelNumber || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'payer',
      headerName: 'PAYER',
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
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
            {row.property?.user?.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {row.property?.user?.firstName} {row.property?.user?.lastName}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'date',
      headerName: 'DATE',
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          ${value?.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'type',
      headerName: 'TYPE',
      minWidth: 140,
      renderCell: ({ value }) => (
        <Chip
          label={value || 'N/A'}
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
            bgcolor: 'rgba(33, 150, 243, 0.12)',
            color: '#1976d2',
            border: '1px solid rgba(33, 150, 243, 0.3)'
          }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'STATUS',
      minWidth: 120,
      renderCell: ({ row }) => {
        const statusColors = getStatusColor(row.status)
        const StatusIcon = statusColors.icon

        return (
          <Chip
            label={row.status}
            icon={<StatusIcon />}
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
              bgcolor: statusColors.bg,
              color: statusColors.color,
              border: `1px solid ${statusColors.border}`,
              '& .MuiChip-icon': { color: statusColors.color }
            }}
          />
        )
      }
    },
    {
      field: 'docs',
      headerName: 'DOCS',
      align: 'center',
      width: 80,
      renderCell: ({ row }) => (
        <Tooltip title={getFileUrl(row) ? 'Download file' : 'No file attached'}>
          <span>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleDownload(row)
              }}
              disabled={!getFileUrl(row)}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#8CA551',
                  borderColor: '#8CA551',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                },
                '&:disabled': {
                  opacity: 0.3,
                  bgcolor: 'rgba(112, 111, 111, 0.08)'
                }
              }}
            >
              <Download sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </span>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      align: 'center',
      minWidth: 160,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
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
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Approve">
            <span>
              <IconButton
                size="small"
                onClick={(e) => handleApprove(row, e)}
                disabled={row.status === 'signed'}
                sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#4caf50',
                    borderColor: '#4caf50',
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    bgcolor: 'rgba(112, 111, 111, 0.08)'
                  }
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Reject">
            <span>
              <IconButton
                size="small"
                onClick={(e) => handleReject(row, e)}
                disabled={row.status === 'rejected'}
                sx={{
                  bgcolor: 'rgba(211, 47, 47, 0.08)',
                  border: '1px solid rgba(211, 47, 47, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#d32f2f',
                    borderColor: '#d32f2f',
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  },
                  '&:disabled': {
                    opacity: 0.3,
                    bgcolor: 'rgba(112, 111, 111, 0.08)'
                  }
                }}
              >
                <Cancel sx={{ fontSize: 18, color: '#d32f2f' }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    }
  ], [getStatusColor, getFileUrl, handleDownload, handleOpenDialog, handleApprove, handleReject])

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
          icon={AccountBalance}
          title="Payment Records"
          subtitle="Manage and track property payment transactions"
          actionButton={{
            label: 'Add New Payment',
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: 'New Payment'
          }}
        />

        {/* Stats Cards */}
        <StatsCards stats={payloadsStats} loading={loading} />

        {/* ✅ TABLA REUTILIZABLE */}
        <DataTable
          columns={columns}
          data={payloads}
          loading={loading}
          emptyState={
            <EmptyState
              icon={AccountBalance}
              title="No payment records found"
              description="Start by adding your first payment"
              actionLabel="New Payment"
              onAction={() => handleOpenDialog()}
            />
          }
          onRowClick={(row) => console.log('Payment clicked:', row)}
          stickyHeader
          maxHeight={600}
        />

          <PayloadDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            properties={properties}
            selectedPayload={selectedPayload}
          />
      </Container>
    </Box>
  )
}

export default Payloads