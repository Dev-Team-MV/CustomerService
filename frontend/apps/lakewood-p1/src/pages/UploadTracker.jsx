import { useState } from 'react'
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
  Chip
} from '@mui/material'
import { GridOn as GridOnIcon, Search as SearchIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import PageHeader from '@shared/components/PageHeader'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { getUploadTracker } from '../services/reportService'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [days, setDays] = useState([])

  const handleGenerate = async () => {
    if (!startDate || !endDate) return
    if (startDate > endDate) {
      setError('Start date must be before end date')
      return
    }

    const types = []
    if (includeProperties) types.push('properties')
    if (includeMasterplan) types.push('masterplan')
    if (!types.length) {
      setError('Select at least one type')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await getUploadTracker({ startDate, endDate, types })
      setData(result)
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
      fontFamily: '"Poppins", sans-serif',
      '& fieldset': { borderColor: theme.palette.cardBorder, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: theme.palette.primary.main, fontWeight: 600 }
    }
  }

  const hasResults = data && (
    (data.properties && data.properties.length > 0) ||
    (data.masterplan && data.masterplan.length > 0)
  )

  const rows = []
  if (data) {
    if (data.properties) {
      data.properties.forEach((p) => rows.push({ type: 'property', ...p }))
    }
    if (data.masterplan && data.masterplan.length > 0) {
      const masterplanDates = {}
      data.masterplan.forEach((m) => { masterplanDates[m.date] = true })
      rows.push({ type: 'masterplan', id: 'masterplan', label: 'Masterplan', dates: masterplanDates })
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

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeProperties}
                onChange={(e) => setIncludeProperties(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, fontSize: 14 }}>
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
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, fontSize: 14 }}>
                Masterplan
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
                      fontFamily: '"Poppins", sans-serif',
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
                        fontFamily: '"Poppins", sans-serif',
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
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: row.type === 'masterplan' ? 700 : 500,
                        fontSize: 13,
                        borderBottom: `1px solid ${theme.palette.cardBorder}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.type === 'masterplan' ? (
                        <Chip
                          label={row.label}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
                        />
                      ) : (
                        row.label
                      )}
                    </TableCell>
                    {days.map((day) => {
                      const count = row.dates?.[day]
                      const hasData = count != null && count !== false && count !== 0

                      return (
                        <TableCell
                          key={day}
                          align="center"
                          sx={{
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: 13,
                            fontWeight: hasData ? 700 : 400,
                            borderBottom: `1px solid ${theme.palette.cardBorder}`,
                            color: hasData
                              ? (row.type === 'masterplan' ? theme.palette.primary.main : theme.palette.success.main)
                              : theme.palette.text.disabled
                          }}
                        >
                          {row.type === 'masterplan'
                            ? (row.dates?.[day] ? '✓' : '')
                            : (count > 0 ? count : '')}
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
    </Box>
  )
}

export default UploadTracker
