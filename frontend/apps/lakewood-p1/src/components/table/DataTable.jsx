import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Typography,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
  onRowClick = null,
  rowHoverEffect = true,
  stickyHeader = false,
  maxHeight = null
}) => {
  // Validar que columns tenga al menos un elemento
  if (!columns || columns.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">No columns defined</Typography>
      </Paper>
    );
  }

  return (
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
        <TableContainer sx={{ maxHeight: maxHeight }}>
          <Table stickyHeader={stickyHeader}>
            {/* TABLE HEAD */}
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)',
                  borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
                }}
              >
                {columns.map((column, idx) => (
                  <TableCell
                    key={column.id || column.field || idx}
                    align={column.align || 'left'}
                    sx={{
                      fontWeight: 700,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.75rem',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      py: 2,
                      borderBottom: 'none',
                      width: column.width || 'auto',
                      minWidth: column.minWidth || 'auto',
                      ...(stickyHeader && {
                        bgcolor: 'rgba(250, 250, 250, 0.95)',
                        backdropFilter: 'blur(10px)'
                      }),
                      ...column.headerSx
                    }}
                  >
                    {column.headerName || column.label || column.field}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <TableBody>
              <AnimatePresence>
                {/* LOADING STATE */}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <Box display="flex" justifyContent="center" p={6}>
                        <CircularProgress sx={{ color: '#333F1F' }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  /* EMPTY STATE */
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      {emptyState || (
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
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#333F1F',
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            No data available
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            No records found
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  /* DATA ROWS */
                  data.map((row, rowIndex) => {
                    const rowId = row._id || row.id || rowIndex;

                    return (
                      <motion.tr
                        key={rowId}
                        component={TableRow}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                        onClick={() => onRowClick && onRowClick(row)}
                        sx={{
                          transition: 'all 0.3s ease',
                          borderLeft: '3px solid transparent',
                          cursor: onRowClick ? 'pointer' : 'default',
                          ...(rowHoverEffect && {
                            '&:hover': {
                              bgcolor: 'rgba(140, 165, 81, 0.04)',
                              transform: 'translateX(4px)',
                              boxShadow: '0 2px 8px rgba(51, 63, 31, 0.08)',
                              borderLeftColor: '#8CA551'
                            }
                          }),
                          '&:last-child td': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        {columns.map((column, colIndex) => {
                          const cellValue = column.field ? row[column.field] : null;

                          return (
                            <TableCell
                              key={column.id || column.field || colIndex}
                              align={column.align || 'left'}
                              sx={{
                                fontFamily: '"Poppins", sans-serif',
                                ...column.cellSx
                              }}
                            >
                              {/* Custom render function */}
                              {column.renderCell
                                ? column.renderCell({ row, value: cellValue })
                                : cellValue}
                            </TableCell>
                          );
                        })}
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      field: PropTypes.string,
      headerName: PropTypes.string,
      label: PropTypes.string,
      align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      renderCell: PropTypes.func,
      headerSx: PropTypes.object,
      cellSx: PropTypes.object
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyState: PropTypes.node,
  onRowClick: PropTypes.func,
  rowHoverEffect: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default DataTable;