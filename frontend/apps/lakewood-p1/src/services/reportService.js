import api from './api'

export const getUploadTracker = async ({ startDate, endDate, types }) => {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  if (types && types.length) params.append('types', types.join(','))

  const response = await api.get(`/reports/upload-tracker?${params.toString()}`)
  return response.data
}
