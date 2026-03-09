import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Avatar, IconButton, Tooltip, TextField, InputAdornment, Button } from '@mui/material'
import { Search, Delete, Edit, Visibility, BarChart } from '@mui/icons-material'
import { motion } from 'framer-motion'
import DataTable from '@shared/components/table/DataTable'
import projectService from '@shared/services/projectService'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import ProjectStatsModal from '../components/stats/ProjectStatsModal'
import crmService from '../services/crmService'

export default function Projects() {
  const { t } = useTranslation('project')
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState(null)


  // ── Stats modal ──────────────────────────────────────────────────────────
  const [statsOpen, setStatsOpen]       = useState(false)
  const [statsProject, setStatsProject] = useState(null)
  const [allBalance, setAllBalance]     = useState(null)

  useEffect(() => {
    crmService.getBalance()
      .then(d => setAllBalance(d))
      .catch(() => {})
  }, [])

  const openStats = (project) => {
    setStatsProject(project)
    setStatsOpen(true)
  }
  // ────────────────────────────────────────────────────────────────────────


  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      const data = await projectService.getAll()
      setProjects(data)
      setFiltered(data)
      setLoading(false)
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(projects); return }
    const q = search.toLowerCase()
    setFiltered(projects.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    ))
  }, [search, projects])

  const handleProjectCreated = (project) => {
    setEditProject(null)
    setCreateOpen(false)
    setProjects(prev => {
      const idx = prev.findIndex(p => p._id === project._id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = project
        return copy
      }
      return [project, ...prev]
    })
    setFiltered(prev => {
      const idx = prev.findIndex(p => p._id === project._id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = project
        return copy
      }
      return [project, ...prev]
    })
  }

  const columns = useMemo(() => [
    {
      field: 'name', headerName: t('table.name'), minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#000', borderRadius: 0, fontSize: '0.65rem', fontWeight: 700, fontFamily: '"Courier New", monospace', flexShrink: 0 }}>
            {row.name?.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.88rem', fontWeight: 500, color: '#000', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.5px' }}>
              {row.slug}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'type', headerName: t('table.type'), minWidth: 120,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#444', letterSpacing: '0.5px', textTransform: 'capitalize' }}>
          {row.type?.replace('_', ' ')}
        </Typography>
      )
    },
    {
      field: 'status', headerName: t('table.status'), minWidth: 110,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: row.isActive ? '#000' : '#bbb', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {row.status}
        </Typography>
      )
    },
    {
      field: 'phase', headerName: t('table.phase'), minWidth: 80,
      renderCell: ({ row }) => (
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888' }}>
          {row.phase}
        </Typography>
      )
    },
    {
      field: 'actions', headerName: t('table.actions'), minWidth: 90, align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Stats — nuevo */}
          <Tooltip title="Statistics">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); openStats(row) }}
              sx={{
                color: '#aaa', borderRadius: 0,
                '&:hover': { color: '#000', background: '#f5f5f5' }
              }}
            >
              <BarChart sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('table.view')}>
            <IconButton
              size="small"
              sx={{ color: '#aaa', borderRadius: 0 }}
              onClick={() => navigate(`/projects/${row._id}`)} // <-- Redirección por id
            >
              <Visibility sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('table.edit')}>
            <IconButton
              size="small"
              sx={{ color: '#aaa', borderRadius: 0 }}
              onClick={() => { setEditProject(row); setCreateOpen(true) }}
            >
              <Edit sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('table.delete')}>
            <IconButton size="small" sx={{ color: '#aaa', borderRadius: 0 }}>
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [t, navigate])

  return (
    <PageLayout
      title={t('title')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle', { count: projects.length })}
    >
      {/* Quick Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => { setEditProject(null); setCreateOpen(true) }}
        >
          + {t('table.create')}
        </Button>
      </Box>
      <CreateProjectDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditProject(null) }}
        onCreated={handleProjectCreated}
        initialData={editProject}
        editMode={!!editProject}
      />

      {/* Stats */}
      <StatsStrip stats={[
        { label: t('stats.total'), value: projects.length },
        { label: t('stats.active'), value: projects.filter(p => p.isActive).length },
        { label: t('stats.types'), value: [...new Set(projects.map(p => p.type))].length }
      ]} />

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            size="small"
            sx={{
              width: 320,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0, background: '#fff',
                fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.875rem',
                '& fieldset': { borderColor: '#ddd' },
                '&:hover fieldset': { borderColor: '#000' },
                '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: 2 }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#bbb' }} />
                </InputAdornment>
              )
            }}
          />
          {search && (
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1.5px' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey="_id"
          sx={{
            background: '#fff', border: '1px solid #e8e8e8', borderRadius: 0,
            '& .MuiTableHead-root': { background: '#0a0a0a' },
            '& .MuiTableHead-root .MuiTableCell-root': { fontFamily: '"Courier New", monospace', fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.08)', py: 1.8, fontWeight: 400 },
            '& .MuiTableBody-root .MuiTableRow-root': { transition: 'background 0.15s ease', cursor: 'pointer', '&:hover': { background: '#f7f7f7' } },
            '& .MuiTableBody-root .MuiTableCell-root': { borderBottom: '1px solid #f2f2f2', py: 1.6 },
            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': { background: '#fdfdfd' },
            '& .MuiTablePagination-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', borderTop: '1px solid #ececec', background: '#fafafa' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '0.5px', color: '#aaa' },
            '& .MuiTablePagination-actions .MuiIconButton-root': { color: '#aaa', borderRadius: 0, '&:hover': { background: '#f0f0f0', color: '#000' } }
          }}
        />
      </motion.div>

      {/* Stats Modal */}
      <ProjectStatsModal
        open={statsOpen}
        onClose={() => { setStatsOpen(false); setStatsProject(null) }}
        project={statsProject}
        allBalance={allBalance}
      />
    </PageLayout>
  )
}