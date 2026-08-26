import { useState, useEffect } from 'react'
import { Box, Typography, Button, CircularProgress, Avatar } from '@mui/material'
import {
  SwapHoriz, NoteAdd, CloudUpload, Edit, Add, Flag, Delete, Info
} from '@mui/icons-material'
import loanService from '../../services/loanService'

const ACTION_ICONS = {
  created: Add,
  updated: Edit,
  stage_changed: SwapHoriz,
  status_changed: Flag,
  document_updated: Info,
  document_uploaded: CloudUpload,
  document_deleted: Delete,
  note_added: NoteAdd,
  next_action_updated: Flag
}

const ACTION_COLORS = {
  created: '#4caf50',
  updated: '#2196f3',
  stage_changed: '#9c27b0',
  status_changed: '#ff9800',
  document_updated: '#2196f3',
  document_uploaded: '#4caf50',
  document_deleted: '#f44336',
  note_added: '#607d8b',
  next_action_updated: '#ff9800'
}

function personName(p) {
  if (!p) return 'System'
  if (typeof p === 'object') return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || 'Unknown'
  return String(p)
}

function personInitials(p) {
  if (!p || typeof p !== 'object') return '?'
  return ((p.firstName?.[0] || '') + (p.lastName?.[0] || '')).toUpperCase() || '?'
}

export default function LoanTimeline({ loanId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadTimeline = async (p = 1) => {
    setLoading(true)
    try {
      const { timeline, pagination } = await loanService.getTimeline(loanId, { page: p, limit: 20 })
      if (p === 1) {
        setEntries(timeline)
      } else {
        setEntries(prev => [...prev, ...timeline])
      }
      setHasMore(pagination.page < pagination.totalPages)
      setPage(p)
    } catch (err) {
      console.error('Failed to load timeline:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loanId) loadTimeline(1)
  }, [loanId])

  return (
    <Box sx={{ border: '1px solid #e0e0e0', bgcolor: '#fff', mb: 3 }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
        <Typography
          sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#000' }}
        >
          Activity Timeline
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {entries.map((entry, i) => {
          const Icon = ACTION_ICONS[entry.action] || Info
          const color = ACTION_COLORS[entry.action] || '#757575'
          return (
            <Box
              key={entry._id || i}
              sx={{
                display: 'flex',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderBottom: '1px solid #f5f5f5',
                position: 'relative'
              }}
            >
              {/* Timeline line */}
              {i < entries.length - 1 && (
                <Box sx={{
                  position: 'absolute',
                  left: 31,
                  top: 36,
                  bottom: -4,
                  width: 1,
                  bgcolor: '#e0e0e0'
                }} />
              )}

              <Avatar sx={{ width: 26, height: 26, bgcolor: color + '20', fontSize: '0.6rem', color }}>
                <Icon sx={{ fontSize: 14 }} />
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: '"Helvetica Neue", sans-serif',
                    fontSize: '0.8rem',
                    color: '#000',
                    lineHeight: 1.3
                  }}
                >
                  {entry.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.3, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#aaa' }}>
                    {personName(entry.performedBy)}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: '#ccc' }}>
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        })}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {!loading && entries.length === 0 && (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#aaa' }}>
              No activity yet
            </Typography>
          </Box>
        )}
      </Box>

      {hasMore && !loading && (
        <Box sx={{ borderTop: '1px solid #e0e0e0', px: 2, py: 1, textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => loadTimeline(page + 1)}
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', textTransform: 'none', borderRadius: 0, color: '#000' }}
          >
            Load more
          </Button>
        </Box>
      )}
    </Box>
  )
}
