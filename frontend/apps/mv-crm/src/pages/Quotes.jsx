// apps/mv-crm/src/pages/Quotes.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Button, Chip, CircularProgress, Alert, Paper } from '@mui/material'
import { Add, Description } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import QuoteBuilderModal from '../components/quotes/QuoteBuilderModal'
import SendQuoteModal from '../components/quotes/SendQuoteModal'
import ConvertToSaleModal from '../components/quotes/ConvertToSaleModal'
import { useQuoteColumns } from '../constants/Columns/quoteColumns'
import { useQuotes } from '../constants/hooks/useQuotes'
import { useProjects } from '@shared/hooks/useProjects'
import { useLeads } from '../constants/hooks/useLeads'
import { useResidents } from '@shared/hooks/useResidents'
import quoteService from '../services/quoteService'

export default function Quotes() {
  const { t } = useTranslation('quoteCrm')
  const { projects } = useProjects()
  const { leads } = useLeads()
  const { users: clients } = useResidents()

  const { 
    quotes, loading, error, fetchQuotes,
    createQuote, updateQuote, deleteQuote
  } = useQuotes()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [convertModalOpen, setConvertModalOpen] = useState(false)

  const handleCreate = () => {
    setSelectedQuote(null)
    setModalOpen(true)
  }

  const handleEdit = (quote) => {
    setSelectedQuote(quote)
    setModalOpen(true)
  }

  const handleSave = async (id, data) => {
    if (id) await updateQuote(id, data)
    else await createQuote(data)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDelete', '¿Estás seguro de eliminar esta cotización?'))) {
      await deleteQuote(id)
    }
  }

  // ✅ Acciones específicas que abren modales
  const handleSend = (quote) => {
    setSelectedQuote(quote)
    setSendModalOpen(true)
  }

  const handleConvert = (quote) => {
    setSelectedQuote(quote)
    setConvertModalOpen(true)
  }

  const handleDownload = async (quote) => {
    try {
      await quoteService.downloadPdf(quote._id)
    } catch (err) {
      alert('Error al descargar el PDF')
    }
  }

  const columns = useQuoteColumns({ 
    t, 
    onEdit: handleEdit, 
    onDelete: handleDelete,
    onSend: handleSend,        // ✅ Pasado a columnas
    onConvert: handleConvert,  // ✅ Pasado a columnas
    onDownload: handleDownload
  })

  const activeCount = quotes.filter(q => q.status === 'converted' || q.status === 'sent').length

  return (
    <PageLayout
      title={t('title', 'Cotizaciones')}
      titleBold={t('titleBold', 'Ventas')}
      topbarLabel={t('topbarLabel', 'Gestión de Cotizaciones')}
      subtitle={t('subtitle', 'Crea, envía y convierte cotizaciones con tablas de amortización')}
    >
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={1} alignItems="center">
            <Chip label={`${quotes.length} ${t('total', 'Total')}`} size="small" sx={{ bgcolor: '#000', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }} />
            <Chip label={`${activeCount} ${t('active', 'Convertidas o Enviadas')}`} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 600 }} />
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {t('createQuote', 'Nueva Cotización')}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
        ) : quotes.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, border: '1px solid #ececec', borderRadius: 1, textAlign: 'center' }}>
            <Description sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', color: '#888', mb: 1 }}>{t('empty.title', 'No hay cotizaciones')}</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreate} sx={{ borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace' }}>
              {t('createQuote', 'Nueva Cotización')}
            </Button>
          </Paper>
        ) : (
          <DataTable columns={columns} data={quotes} loading={loading} rowKey="_id" emptyMessage={t('empty.description', 'No se encontraron cotizaciones')} />
        )}

        {/* Modales */}
        <QuoteBuilderModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedQuote(null) }} quote={selectedQuote} onSave={handleSave} projects={projects} leads={leads} clients={clients.filter(c => c.role === 'user')} />
        
        <SendQuoteModal open={sendModalOpen} onClose={() => { setSendModalOpen(false); setSelectedQuote(null) }} quote={selectedQuote} onSuccess={fetchQuotes} />
        
        <ConvertToSaleModal open={convertModalOpen} onClose={() => { setConvertModalOpen(false); setSelectedQuote(null) }} quote={selectedQuote} onSuccess={fetchQuotes} />
      </Box>
    </PageLayout>
  )
}