import { useMemo } from 'react'

const useDashboardStats = (lots = []) => {
  return useMemo(() => {
    const totalLots     = lots.length
    const availableLots = lots.filter(l => l.status === 'available').length
    const holdLots      = lots.filter(l => l.status === 'pending').length
    const soldLots      = lots.filter(l => l.status === 'sold').length
    const occupancyRate = totalLots > 0
      ? parseFloat(((soldLots / totalLots) * 100).toFixed(1))
      : 0

    const now              = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd      = currentMonthStart

    const soldWithDates = lots.filter(l => l.status === 'sold' && l.updatedAt)

    const inRange = (date, from, to) => date >= from && (!to || date < to)

    const currentMonthSold = soldWithDates.filter(l =>
      inRange(new Date(l.updatedAt), currentMonthStart)
    ).length

    const lastMonthSold = soldWithDates.filter(l =>
      inRange(new Date(l.updatedAt), lastMonthStart, lastMonthEnd)
    ).length

    const soldDifference       = currentMonthSold - lastMonthSold
    const soldPercentageChange = lastMonthSold > 0
      ? parseFloat((((currentMonthSold - lastMonthSold) / lastMonthSold) * 100).toFixed(1))
      : currentMonthSold > 0 ? 100 : 0

    const getRevenue = (list) =>
      list.reduce((s, l) => s + (l.totalPrice || l.price || l.basePrice || 0), 0)

    const currentMonthRevenue = getRevenue(
      soldWithDates.filter(l => inRange(new Date(l.updatedAt), currentMonthStart))
    )
    const lastMonthRevenue = getRevenue(
      soldWithDates.filter(l => inRange(new Date(l.updatedAt), lastMonthStart, lastMonthEnd))
    )

    const revenuePercentageChange = lastMonthRevenue > 0
      ? parseFloat((((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
      : currentMonthRevenue > 0 ? 100 : 0

    return {
      totalLots,
      availableLots,
      holdLots,
      soldLots,
      occupancyRate,
      soldDifference,
      soldPercentageChange,
      currentMonthRevenue,
      revenuePercentageChange
    }
  }, [lots])
}

export default useDashboardStats