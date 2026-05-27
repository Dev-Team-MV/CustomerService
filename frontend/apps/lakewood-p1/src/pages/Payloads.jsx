import { useEffect, useMemo, useState } from 'react' // ✅ Agregar useState
import { useTranslation } from 'react-i18next'
import { Box, Container, CircularProgress } from '@mui/material' // ✅ Agregar CircularProgress
import {
  Add, AccountBalance,
  Schedule, ErrorOutline, Cancel,
  Download // ✅ Agregar Download
} from '@mui/icons-material'

import PageHeader    from '@shared/components/PageHeader'
import StatsCards    from '../components/statscard'
import DataTable     from '@shared/components/table/DataTable'
import EmptyState    from '@shared/components/table/EmptyState'
import PayloadDialog from '@shared/components/Modals/PayloadDialog'
import { usePayloads } from '@shared/hooks/usePayloads'
import api from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'
import { usePayloadColumns } from '../constants/Columns/payloads'
import projectService from '@shared/services/projectService' // ✅ Agregar

const paymentTypes = [
  "initial down payment",
  "complementary down payment",
  "monthly payment",
  "additional payment",
  "closing payment"
]

const projectId = import.meta.env.VITE_PROJECT_ID

const Payloads = () => {
  const { t } = useTranslation(['payloads', 'common'])
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [downloadingProjectStatement, setDownloadingProjectStatement] = useState(false) // ✅ Nuevo estado
 
  const {
    payloads, resources, stats, loading,
    openDialog, selectedPayload, formData, setFormData,
    handleOpenDialog, handleCloseDialog, handleSubmit,
    handleApprove, handleReject, handleDownload,
    files, setFiles, fetchAll
  } = usePayloads({
    resourceType: 'property',
    fetchResources: async () => {
      const res = await api.get('/properties', { params: { projectId } })
      return res.data
    },
    fetchStats: async () => {
      const res = await api.get('/payloads/stats', { params: { projectId } })
      return res.data
    }
  })
 
  // ✅ Nuevo handler para descargar estado de cuenta del proyecto
  const handleDownloadProjectStatement = async () => {
    try {
      setDownloadingProjectStatement(true)
      await projectService.downloadAccountStatementPdf(
        projectId,
        `project-statement-${new Date().toISOString().split('T')[0]}.pdf`
      )
    } catch (error) {
      console.error('Error downloading project statement:', error)
      alert('Error downloading project statement: ' + error.message)
    } finally {
      setDownloadingProjectStatement(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = usePayloadColumns({
    t,
    onEdit:     handleOpenDialog,
    onApprove:  handleApprove,
    onReject:   handleReject,
    onDownload: handleDownload,
    isOwner,
  })

  const payloadsStats = useMemo(() => [
    {
      title:    t('payloads:totalCollected'),
      value:    `$${(stats.totalCollected / 1_000_000).toFixed(1)}M`,
      icon:     AccountBalance,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color:    '#8CA551',
      delay:    0,
      subtitle: '+12%',
      trend:    'up'
    },
    {
      title:    t('payloads:pendingReview'),
      value:    stats.pendingPayloads,
      icon:     Schedule,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color:    '#E5863C',
      delay:    0.1,
      subtitle: t('payloads:needsAction')
    },
    {
      title:    t('payloads:recentFailures'),
      value:    `$${stats.recentFailures?.toLocaleString() || 0}`,
      icon:     ErrorOutline,
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
      color:    '#d32f2f',
      delay:    0.2,
      subtitle: t('payloads:last30Days'),
      trend:    'down'
    },
    {
      title:    t('payloads:rejected'),
      value:    stats.rejectedPayloads,
      icon:     Cancel,
      gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
      color:    '#706f6f',
      delay:    0.3,
      subtitle: t('payloads:total')
    }
  ], [stats, t])

  // Solo payloads de property
  const filteredPayloads = payloads.filter(p => !!p.property)

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">

<PageHeader
  icon={AccountBalance}
  title={t('payloads:title')}
  subtitle={t('payloads:subtitle')}
  actionButton={{
    label:   t('payloads:add'),
    onClick: () => handleOpenDialog(),
    icon:    <Add />,
    tooltip: t('payloads:new')
  }}
  secondaryButton={{
    label: downloadingProjectStatement ? 'Downloading...' : 'Project Statement',
    onClick: handleDownloadProjectStatement,
    icon: downloadingProjectStatement ? <CircularProgress size={16} sx={{ color: '#8CA551' }} /> : <Download />,
    tooltip: 'Download project account statement PDF',
    variant: 'outlined',
    disabled: downloadingProjectStatement,
    sx: {
      borderColor: '#8CA551',
      color: '#8CA551',
      '&:hover': {
        borderColor: '#7a9447',
        bgcolor: 'rgba(140, 165, 81, 0.08)'
      },
      '&:disabled': {
        opacity: 0.6
      }
    }
  }}
/>

        <StatsCards stats={payloadsStats} loading={loading} />

        <DataTable
          columns={columns}
          data={filteredPayloads}
          loading={loading}
          emptyState={
            <EmptyState
              icon={AccountBalance}
              title={t('payloads:noRecords')}
              description={t('payloads:startByAdding')}
              actionLabel={t('payloads:new')}
              onAction={() => handleOpenDialog()}
            />
          }
          stickyHeader
          maxHeight={600}
        />

        <PayloadDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          resources={resources}
          resourceType="property"
          selectedPayload={selectedPayload}
          files={files}
          setFiles={setFiles}
          paymentTypes={paymentTypes}
        />

      </Container>
    </Box>
  )
}

export default Payloads