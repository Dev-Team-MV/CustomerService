const STATUS_COLORS = {
  sold:     { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' },
  active:   { bg: 'rgba(33, 150, 243, 0.12)',  color: '#1976d2', border: 'rgba(33, 150, 243, 0.3)' },
  pending:  { bg: 'rgba(229, 134, 60, 0.12)',  color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' },
  resident: { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' },
  owner:    { bg: 'rgba(51, 63, 31, 0.12)',    color: '#333F1F', border: 'rgba(51, 63, 31, 0.3)'  },
  draft:    { bg: 'rgba(229, 134, 60, 0.12)',  color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' },
  inactive: { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' },
  paid:     { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' },
  overdue:  { bg: 'rgba(211, 47, 47, 0.12)',   color: '#d32f2f', border: 'rgba(211, 47, 47, 0.3)'  },
  default:  { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' },
}

const useStatusColor = (status) => STATUS_COLORS[status] ?? STATUS_COLORS.default

export default useStatusColor
export { STATUS_COLORS }