import { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material'
import { GridOn as GridOnIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { getUploadTracker } from '../services/reportService'
import api from '../services/api'
import ClubhouseUnderConstructionService from '../services/ClubhouseUnderConstructionService'
import EagleViewService from '../services/EagleViewService'

const getDaysInRange = (startDate, endDate) => {
  const days = []
  const current = new Date(startDate)
  current.setUTCHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setUTCHours(0, 0, 0, 0)
  while (current <= end) {
    days.push(current.toISOString().split('T')[0])
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return days
}

const formatDayLabel = (dateStr) => {
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

const UploadTracker = () => {
  const theme = useTheme()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(sevenDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [includeProperties, setIncludeProperties] = useState(true)
  const [includeMasterplan, setIncludeMasterplan] = useState(true)
  const [includeUnderConstruction, setIncludeUnderConstruction] = useState(true)
  const [includeEagleView, setIncludeEagleView] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [days, setDays] = useState([])
  const [mediaModal, setMediaModal] = useState(null)
  const [mediaMap, setMediaMap] = useState({})
  const [modalLoading, setModalLoading] = useState(false)

  const handlePropertyCellClick = useCallback(async (propertyId, label, day) => {
    setMediaModal({ label, items: [] })
    setModalLoading(true)
    try {
      const res = await api.get(`/phases/property/${propertyId}`)
      const phases = Array.isArray(res.data) ? res.data : []
      const items = []
      phases.forEach((phase) => {
        (phase.mediaItems || []).forEach((item) => {
          if (!item.uploadedAt) return
          const itemDay = new Date(item.uploadedAt).toISOString().split('T')[0]
          if (itemDay === day) {
            items.push({ type: item.mediaType || 'image', url: item.url, name: item.title || '' })
          }
        })
      })
      setMediaModal({ label, items })
    } catch {
      setMediaModal({ label, items: [] })
    } finally {
      setModalLoading(false)
    }
  }, [])

  const handleGenerate = async () => {
    if (!startDate || !endDate) return
    if (startDate > endDate) {
      setError('Start date must be before end date')
      return
    }

    const types = []
    if (includeProperties) types.push('properties')
    if (includeMasterplan) types.push('masterplan')
    if (!includeProperties && !includeMasterplan && !includeUnderConstruction && !includeEagleView) {
      setError('Select at least one type')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const newMediaMap = {}

      // Fetch report data (properties + masterplan) — only if at least one is selected
      let result = { properties: [], masterplan: [] }
      if (types.length > 0) {
        result = await getUploadTracker({ startDate, endDate, types })
      }

      // Under Construction — parallel fetch
      let underConstructionItems = []
      let underConstructionPromise = Promise.resolve([])
      if (includeUnderConstruction) {
        underConstructionPromise = ClubhouseUnderConstructionService.getAll().catch(() => [])
      }

      // Eagle View — parallel fetch
      let eagleViewItems = []
      let eagleViewPromise = Promise.resolve([])
      if (includeEagleView) {
        eagleViewPromise = EagleViewService.getAll().catch(() => [])
      }

      const [ucResponse, evEntries] = await Promise.all([underConstructionPromise, eagleViewPromise])

      // Clubhouse returns { clubHouseTimeline: [...] }; date field is clubHouseDate
      const ucSteps = Array.isArray(ucResponse)
        ? ucResponse
        : (ucResponse?.clubHouseTimeline || [])

      ucSteps.forEach((step) => {
        const day = (step.clubHouseDate || step.date)?.toString().split('T')[0]
        if (day && day >= startDate && day <= endDate && step.media?.length) {
          const key = `underConstruction__${day}`
          if (!newMediaMap[key]) newMediaMap[key] = []
          newMediaMap[key].push(...step.media)
          underConstructionItems.push({ date: day })
        }
      })

      // EagleView returns a bare array; date field is date
      const evList = Array.isArray(evEntries) ? evEntries : (evEntries?.data || [])
      evList.forEach((entry) => {
        const day = entry.date?.split('T')[0]
        if (day && day >= startDate && day <= endDate && entry.media?.length) {
          const key = `eagleView__${day}`
          if (!newMediaMap[key]) newMediaMap[key] = []
          newMediaMap[key].push(...entry.media)
          eagleViewItems.push({ date: day })
        }
      })

      // Deduplicate dates
      const seenUC = new Set()
      underConstructionItems = underConstructionItems.filter((item) => {
        if (seenUC.has(item.date)) return false
        seenUC.add(item.date)
        return true
      })
      const seenEV = new Set()
      eagleViewItems = eagleViewItems.filter((item) => {
        if (seenEV.has(item.date)) return false
        seenEV.add(item.date)
        return true
      })

      setMediaMap(newMediaMap)
      setData({ ...result, underConstruction: underConstructionItems, eagleView: eagleViewItems })
      setDays(getDaysInRange(startDate, endDate))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      fontFamily: '"DM Sans", sans-serif',
      '& fieldset': { borderColor: theme.palette.cardBorder, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 500,
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: theme.palette.primary.main, fontWeight: 600 }
    }
  }

  const hasResults = data && (
    (data.properties?.length > 0) ||
    (data.masterplan?.length > 0) ||
    (data.underConstruction?.length > 0) ||
    (data.eagleView?.length > 0)
  )

  const rows = []
  if (data) {
    if (data.properties) {
      data.properties.forEach((p) => rows.push({ type: 'property', ...p }))
    }
    if (data.masterplan?.length > 0) {
      const masterplanDates = {}
      data.masterplan.forEach((m) => { masterplanDates[m.date] = true })
      rows.push({ type: 'masterplan', id: 'masterplan', label: 'Masterplan', dates: masterplanDates })
    }
    if (data.underConstruction?.length > 0) {
      const ucDates = {}
      data.underConstruction.forEach((item) => { ucDates[item.date] = true })
      rows.push({ type: 'underConstruction', id: 'underConstruction', label: 'Under Construction', dates: ucDates })
    }
    if (data.eagleView?.length > 0) {
      const evDates = {}
      data.eagleView.forEach((item) => { evDates[item.date] = true })
      rows.push({ type: 'eagleView', id: 'eagleView', label: 'Eagle View', dates: evDates })
    }
  }

  const rowColor = (type) => {
    switch (type) {
      case 'masterplan': return theme.palette.primary.main
      case 'underConstruction': return theme.palette.warning.main
      case 'eagleView': return theme.palette.info.main
      default: return theme.palette.success.main
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Upload Tracker"
        subtitle="View which days construction photos were uploaded"
        icon={GridOnIcon}
      />

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: `2px solid ${theme.palette.cardBorder}`,
          borderRadius: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-end'
        }}
      >
        <TextField
          type="date"
          label="From"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ ...fieldSx, width: 180 }}
        />
        <TextField
          type="date"
          label="To"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ ...fieldSx, width: 180 }}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeProperties}
                onChange={(e) => setIncludeProperties(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 14 }}>
                Properties
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeMasterplan}
                onChange={(e) => setIncludeMasterplan(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 14 }}>
                Masterplan
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeUnderConstruction}
                onChange={(e) => setIncludeUnderConstruction(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 14 }}>
                Under Construction
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeEagleView}
                onChange={(e) => setIncludeEagleView(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: 14 }}>
                Eagle View
              </Typography>
            }
          />
        </Box>

        <PrimaryButton
          onClick={handleGenerate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
        >
          {loading ? 'Loading...' : 'Generate Table'}
        </PrimaryButton>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results Table */}
      {data && !hasResults && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No uploads found in the selected date range.
        </Alert>
      )}

      {hasResults && (
        <Paper
          elevation={0}
          sx={{
            border: `2px solid ${theme.palette.cardBorder}`,
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      bgcolor: theme.palette.background.paper,
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: 13,
                      borderBottom: `2px solid ${theme.palette.cardBorder}`,
                      minWidth: 200,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Item
                  </TableCell>
                  {days.map((day) => (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 600,
                        fontSize: 12,
                        borderBottom: `2px solid ${theme.palette.cardBorder}`,
                        minWidth: 70,
                        whiteSpace: 'nowrap',
                        color: theme.palette.text.secondary
                      }}
                    >
                      {formatDayLabel(day)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': { bgcolor: `${theme.palette.primary.main}08` },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        bgcolor: theme.palette.background.paper,
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: row.type === 'property' ? 500 : 700,
                        fontSize: 13,
                        borderBottom: `1px solid ${theme.palette.cardBorder}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.type === 'property' ? (
                        row.label
                      ) : (
                        <Chip
                          label={row.label}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontWeight: 600,
                            borderColor: rowColor(row.type),
                            color: rowColor(row.type)
                          }}
                        />
                      )}
                    </TableCell>
                    {days.map((day) => {
                      const count = row.dates?.[day]
                      const hasData = count != null && count !== false && count !== 0
                      const isProperty = row.type === 'property'
                      const mediaKey = `${row.id}__${day}`
                      const cellMedia = mediaMap[mediaKey]
                      const isClickable = isProperty ? count > 0 : !!cellMedia?.length
                      const modalLabel = `${row.label} — ${formatDayLabel(day)}`

                      return (
                        <TableCell
                          key={day}
                          align="center"
                          onClick={
                            isClickable
                              ? () => isProperty
                                  ? handlePropertyCellClick(row.id, modalLabel, day)
                                  : setMediaModal({ label: modalLabel, items: cellMedia })
                              : undefined
                          }
                          sx={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: 13,
                            fontWeight: hasData ? 700 : 400,
                            borderBottom: `1px solid ${theme.palette.cardBorder}`,
                            color: hasData ? rowColor(row.type) : theme.palette.text.disabled,
                            cursor: isClickable ? 'pointer' : 'default',
                            '&:hover': isClickable ? { bgcolor: `${rowColor(row.type)}15` } : {}
                          }}
                        >
                          {isProperty ? (count > 0 ? count : '') : (hasData ? '✓' : '')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Media Preview Modal */}
      <Dialog open={!!mediaModal} onClose={() => setMediaModal(null)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {mediaModal?.label}
          <IconButton onClick={() => setMediaModal(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 1, justifyContent: modalLoading ? 'center' : 'flex-start' }}>
            {modalLoading ? (
              <CircularProgress sx={{ m: 4 }} />
            ) : mediaModal?.items?.length === 0 ? (
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: 'text.secondary', p: 2 }}>
                No media found for this date.
              </Typography>
            ) : mediaModal?.items.map((item, i) =>
              item.type === 'video' ? (
                <video
                  key={i}
                  src={item.url}
                  controls
                  style={{ width: '100%', maxWidth: 360, borderRadius: 8 }}
                />
              ) : (
                <img
                  key={i}
                  src={item.url}
                  alt={item.name || `media-${i}`}
                  style={{ width: '100%', maxWidth: 360, borderRadius: 8, objectFit: 'cover' }}
                />
              )
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default UploadTracker
