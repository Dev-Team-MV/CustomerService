import { Box, Paper, Typography, Card } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const DeckPanel = ({ selectedFacade, selectedDeck, onSelectDeck }) => {
  if (!selectedFacade) {
    return null;
  }

  const decks = selectedFacade.decks || [];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#fafafa',
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
      }}
    >
      {/* Header */}
      <Box 
        p={2.5} 
        sx={{
          bgcolor: 'white',
          borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
        }}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight={700}
          sx={{
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            mb: 0.5
          }}
        >
          Available Decks
        </Typography>
        <Typography 
          variant="caption" 
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.75rem'
          }}
        >
          For {selectedFacade.title}
        </Typography>
      </Box>

      {/* Decks List */}
      <Box 
        sx={{ 
          overflowY: 'auto', 
          p: 2, 
          flex: 1,
          '&::-webkit-scrollbar': {
            width: 6
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(51, 63, 31, 0.2)',
            borderRadius: 3
          }
        }}
      >
        {decks.length > 0 ? (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {decks.map((deck, index) => {
              const isDeckSelected = selectedDeck?.name === deck.name;
              
              return (
                <motion.div
                  key={deck._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    elevation={0}
                    onClick={() => onSelectDeck(deck)}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: isDeckSelected ? '2px solid #8CA551' : '1px solid #e0e0e0',
                      bgcolor: isDeckSelected ? 'rgba(140, 165, 81, 0.08)' : 'white',
                      transition: 'all 0.3s',
                      boxShadow: isDeckSelected 
                        ? '0 4px 12px rgba(140, 165, 81, 0.15)' 
                        : '0 2px 8px rgba(0,0,0,0.04)',
                      '&:hover': {
                        borderColor: '#8CA551',
                        boxShadow: '0 8px 20px rgba(140, 165, 81, 0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box display="flex" p={1.5} gap={2} alignItems="center">
                      {/* Thumbnail */}
                      <Box 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          borderRadius: 2, 
                          bgcolor: '#f5f5f5',
                          backgroundImage: deck.images?.[0] 
                            ? `url(${deck.images[0]})` 
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          flexShrink: 0,
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      
                      {/* Info */}
                      <Box flex={1}>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={700}
                          sx={{
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            mb: 0.5
                          }}
                        >
                          {deck.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: '#8CA551',
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: '0.9rem'
                          }}
                        >
                          ${deck.price?.toLocaleString() || '0'}
                        </Typography>
                      </Box>

                      {/* Check Icon */}
                      {isDeckSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <CheckCircleIcon sx={{ color: '#8CA551', fontSize: 28 }} />
                        </motion.div>
                      )}
                    </Box>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        ) : (
          <Box 
            textAlign="center" 
            py={6}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px dashed #e0e0e0'
            }}
          >
            <Typography 
              variant="body2"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              No decks available for this facade
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

DeckPanel.propTypes = {
  selectedFacade: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    decks: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string.isRequired,
        price: PropTypes.number,
        images: PropTypes.arrayOf(PropTypes.string)
      })
    )
  }),
  selectedDeck: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string)
  }),
  onSelectDeck: PropTypes.func.isRequired
};

export default DeckPanel;