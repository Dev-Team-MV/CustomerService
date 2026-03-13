import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography, Avatar } from '@mui/material'
import { People, CheckCircleOutline } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const Counter = ({ to = 0, prefix = '', suffix = '', duration = 1.6 }) => {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) clearInterval(ref.current)
    let cur = 0
    const steps = Math.ceil(duration * 60)
    const inc = to / steps
    ref.current = setInterval(() => {
      cur += inc
      if (cur >= to) { setVal(to); clearInterval(ref.current) }
      else setVal(Math.floor(cur))
    }, 1000 / 60)
    return () => clearInterval(ref.current)
  }, [to, duration])
  return <>{prefix}{val.toLocaleString()}{suffix}</>
}

// ─── ProjectCard ─────────────────────────────────────────────────────────────
export default function ProjectCard({ project, index = 0, onClick, selected = false, clientCount = 0 }) {
  const { t } = useTranslation('dashboard')

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 * index }}
      whileHover={{ x: 3 }}
      onClick={onClick}
    >
      <Box sx={{
        border: `1px solid ${selected ? '#000' : '#e8e8e8'}`,
        p: '16px 20px',
        background: selected ? '#000' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: '#000' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 30, height: 30,
            bgcolor: selected ? '#fff' : '#000',
            borderRadius: 0,
            fontSize: '0.65rem', fontWeight: 700,
            color: selected ? '#000' : '#fff',
            fontFamily: '"Courier New", monospace'
          }}>
            {project.name?.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{
              fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem',
              fontWeight: 500, color: selected ? '#fff' : '#000', letterSpacing: '-0.01em'
            }}>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People sx={{ fontSize: 10, color: selected ? 'rgba(255,255,255,0.5)' : '#000000ff' }} />
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.58rem', color: selected ? 'rgba(255,255,255,0.5)' : '#000000ff' }}>
                {/* ← clientCount real en vez de mock */}
                <Counter to={clientCount} duration={1.2} /> {t('metrics.clients')}
              </Typography>
            </Box>
          </Box>
        </Box>
        {selected && <CheckCircleOutline sx={{ fontSize: 16, color: '#fff' }} />}
      </Box>
    </motion.div>
  )
}

export { Counter }