const STATUS_COLORS = {
  // Properties
  sold:     { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' },
  active:   { bg: 'rgba(33, 150, 243, 0.12)',  color: '#1976d2', border: 'rgba(33, 150, 243, 0.3)' },
  pending:  { bg: 'rgba(229, 134, 60, 0.12)',  color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' },
  // Residents / Users
  resident: { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' },
  owner:    { bg: 'rgba(51, 63, 31, 0.12)',    color: '#333F1F', border: 'rgba(51, 63, 31, 0.3)'  },
  // Models
  draft:    { bg: 'rgba(229, 134, 60, 0.12)',  color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' },
  inactive: { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' },
  // Payloads
  paid:     { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' },
  overdue:  { bg: 'rgba(211, 47, 47, 0.12)',   color: '#d32f2f', border: 'rgba(211, 47, 47, 0.3)'  },
  // Default
  default:  { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' },
}

const useStatusColor = (status) => {
  return STATUS_COLORS[status] ?? STATUS_COLORS.default
}

export default useStatusColor

// También exporta el mapa para usar fuera de hooks (ej: en columnas de tabla)
export { STATUS_COLORS }