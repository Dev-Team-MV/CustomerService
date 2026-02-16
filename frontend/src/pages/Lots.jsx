import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Container,
  Avatar,
  CircularProgress
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
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const Lots = () => {
  const [lots, setLots] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, pending: 0, sold: 0 })
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)
  const [formData, setFormData] = useState({
    number: '',
    price: 0,
    status: 'available'
  })

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
    if (lot) {
      setSelectedLot(lot)
      setFormData({
        number: lot.number,
        price: lot.price,
        status: lot.status
      })
    } else {
      setSelectedLot(null)
      setFormData({ number: '', price: 0, status: 'available' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedLot(null)
  }

  const handleSubmit = async () => {
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
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lot?')) {
      try {
        await api.delete(`/lots/${id}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting lot:', error)
      }
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                    }}
                  >
                    <Landscape sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                  </Box>
                </motion.div>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      fontSize: { xs: '1.75rem', md: '2.125rem' }
                    }}
                  >
                    Lot Inventory
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    Manage availability and pricing for Lake Conroe properties
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Add New Lot" placement="left">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                    startIcon={<Add />}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#333F1F',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: '1px',
                      fontFamily: '"Poppins", sans-serif',
                      px: 3,
                      py: 1.5,
                      boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        bgcolor: '#8CA551',
                        transition: 'left 0.4s ease',
                        zIndex: 0
                      },
                      '&:hover': {
                        bgcolor: '#333F1F',
                        boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                        '&::before': {
                          left: 0
                        },
                        '& .MuiButton-startIcon': {
                          color: 'white'
                        }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white'
                      }
                    }}
                  >
                    <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                      Add New Lot
                    </Box>
                  </Button>
                </motion.div>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            {
              title: 'Total Lots',
              value: stats.total,
              icon: Terrain,
              gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
              delay: 0
            },
            {
              title: 'Available',
              value: stats.available,
              icon: CheckCircle,
              gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
              delay: 0.1
            },
            {
              title: 'Pending',
              value: stats.pending,
              icon: Schedule,
              gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
              delay: 0.2
            },
            {
              title: 'Sold',
              value: stats.sold,
              icon: TrendingUp,
              gradient: 'linear-gradient(135deg, #706f6f 0%, #8a8989 100%)',
              delay: 0.3
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: stat.gradient,
                    color: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.85,
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem'
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <stat.icon sx={{ fontSize: 20 }} />
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: '-1px',
                        fontSize: '2.5rem'
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.12)',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)',
                      borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
                    }}
                  >
                    {['LOT NUMBER', 'PRICE', 'STATUS', 'ACTIONS'].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontWeight: 700,
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          py: 2,
                          borderBottom: 'none'
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Box display="flex" justifyContent="center" p={6}>
                            <CircularProgress sx={{ color: '#333F1F' }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : lots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Box
                            sx={{
                              py: 8,
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 4,
                                bgcolor: 'rgba(140, 165, 81, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1
                              }}
                            >
                              <Landscape sx={{ fontSize: 40, color: '#8CA551' }} />
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#333F1F',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                mb: 0.5
                              }}
                            >
                              No lots available
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                mb: 2
                              }}
                            >
                              Get started by adding your first lot
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => handleOpenDialog()}
                              sx={{
                                borderRadius: 3,
                                bgcolor: '#333F1F',
                                textTransform: 'none',
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                  bgcolor: '#8CA551'
                                }
                              }}
                            >
                              Add New Lot
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lots.map((lot, index) => (
                        <motion.tr
                          key={lot._id}
                          component={TableRow}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          sx={{
                            transition: 'all 0.3s ease',
                            borderLeft: '3px solid transparent',
                            '&:hover': {
                              bgcolor: 'rgba(140, 165, 81, 0.04)',
                              transform: 'translateX(4px)',
                              boxShadow: '0 2px 8px rgba(51, 63, 31, 0.08)',
                              borderLeftColor: '#8CA551'
                            },
                            '&:last-child td': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <TableCell>
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
                                {lot.number}
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
                                  Lot {lot.number}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#706f6f',
                                    fontFamily: '"Poppins", sans-serif',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  ID: {lot._id.slice(-6)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
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
                                {lot.price?.toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={lot.status}
                              icon={
                                lot.status === 'available' ? <CheckCircle /> :
                                lot.status === 'pending' ? <Schedule /> :
                                <Cancel />
                              }
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
                                ...(lot.status === 'available' && {
                                  bgcolor: 'rgba(140, 165, 81, 0.12)',
                                  color: '#333F1F',
                                  border: '1px solid rgba(140, 165, 81, 0.3)',
                                  '& .MuiChip-icon': { color: '#8CA551' }
                                }),
                                ...(lot.status === 'pending' && {
                                  bgcolor: 'rgba(229, 134, 60, 0.12)',
                                  color: '#E5863C',
                                  border: '1px solid rgba(229, 134, 60, 0.3)',
                                  '& .MuiChip-icon': { color: '#E5863C' }
                                }),
                                ...(lot.status === 'sold' && {
                                  bgcolor: 'rgba(112, 111, 111, 0.12)',
                                  color: '#706f6f',
                                  border: '1px solid rgba(112, 111, 111, 0.3)',
                                  '& .MuiChip-icon': { color: '#706f6f' }
                                })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Edit Lot" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(lot)}
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
                              <Tooltip title="Delete Lot" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(lot._id)}
                                  sx={{
                                    bgcolor: 'rgba(229, 134, 60, 0.08)',
                                    border: '1px solid rgba(229, 134, 60, 0.2)',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: '#E5863C',
                                      borderColor: '#E5863C',
                                      transform: 'scale(1.1)',
                                      '& .MuiSvgIcon-root': {
                                        color: 'white'
                                      }
                                    }
                                  }}
                                >
                                  <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>

        {/* Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: '#333F1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                }}
              >
                <Landscape sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {selectedLot ? 'Edit Lot' : 'Add New Lot'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Manage lot inventory details
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lot Number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8CA551'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333F1F',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-focused': {
                        color: '#333F1F',
                        fontWeight: 600
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ mr: 0.5, fontSize: '0.875rem', color: '#333F1F', fontWeight: 600 }}>
                        $
                      </Typography>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8CA551'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333F1F',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-focused': {
                        color: '#333F1F',
                        fontWeight: 600
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      '& fieldset': {
                        borderColor: 'rgba(140, 165, 81, 0.3)',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8CA551'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333F1F',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-focused': {
                        color: '#333F1F',
                        fontWeight: 600
                      }
                    }
                  }}
                >
                  <MenuItem value="available" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Available
                  </MenuItem>
                  <MenuItem value="pending" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Pending
                  </MenuItem>
                  <MenuItem value="sold" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Sold
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                border: '2px solid #e0e0e0',
                '&:hover': {
                  bgcolor: 'rgba(112, 111, 111, 0.05)',
                  borderColor: '#706f6f'
                }
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.number || !formData.price}
              sx={{
                borderRadius: 3,
                bgcolor: '#333F1F',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  bgcolor: '#8CA551',
                  transition: 'left 0.4s ease',
                  zIndex: 0
                },
                '&:hover': {
                  bgcolor: '#333F1F',
                  boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                  '&::before': {
                    left: 0
                  }
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                  boxShadow: 'none'
                },
                '& span': {
                  position: 'relative',
                  zIndex: 1
                }
              }}
            >
              <span>{selectedLot ? 'Update' : 'Create'}</span>
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default Lots