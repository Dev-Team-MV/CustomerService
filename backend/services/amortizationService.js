/**
 * Amortization schedule generation.
 * Supports fixed (cuota fija), declining balance (saldo insoluto), and balloon payments.
 */

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function addMonths(date, months) {
  const d = new Date(date)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  // Handle month overflow (e.g. Jan 31 + 1 month)
  if (d.getDate() < day) d.setDate(0)
  return d
}

/**
 * Fixed (level) payment for a standard amortizing loan.
 */
function fixedMonthlyPayment(principal, annualRatePercent, termMonths) {
  const r = (Number(annualRatePercent) || 0) / 100 / 12
  const n = Math.max(1, Number(termMonths) || 1)
  const p = Number(principal) || 0
  if (p <= 0) return 0
  if (r === 0) return roundMoney(p / n)
  const factor = Math.pow(1 + r, n)
  return roundMoney((p * r * factor) / (factor - 1))
}

/**
 * @param {number} totalPrice
 * @param {number} downPayment
 * @param {number} interestRate - annual %
 * @param {number} termMonths
 * @param {object} [options]
 * @param {'fixed'|'declining'} [options.method='fixed']
 * @param {number} [options.balloonAmount=0]
 * @param {number|null} [options.balloonMonth] - month number when balloon is due (default: last month)
 * @param {Date|string} [options.startDate]
 * @returns {{ financedAmount, monthlyPayment, schedule, method, balloonAmount, balloonMonth }}
 */
export function generateSchedule(
  totalPrice,
  downPayment,
  interestRate,
  termMonths,
  options = {}
) {
  const total = Math.max(0, Number(totalPrice) || 0)
  const down = Math.max(0, Math.min(total, Number(downPayment) || 0))
  let principal = roundMoney(total - down)
  const rateAnnual = Number(interestRate) || 0
  const n = Math.max(1, Math.floor(Number(termMonths) || 1))
  const method = options.method === 'declining' ? 'declining' : 'fixed'
  const balloonAmount = roundMoney(Math.max(0, Number(options.balloonAmount) || 0))
  let balloonMonth =
    options.balloonMonth != null
      ? Math.max(1, Math.min(n, Number(options.balloonMonth)))
      : balloonAmount > 0
        ? n
        : null

  const startDate = options.startDate ? new Date(options.startDate) : new Date()
  if (Number.isNaN(startDate.getTime())) {
    throw new Error('Invalid startDate')
  }

  // Principal financed after reserving balloon (balloon is principal paid at balloon month)
  let amortizingPrincipal = principal
  if (balloonAmount > 0) {
    if (balloonAmount >= principal) {
      throw new Error('balloonAmount must be less than financed amount')
    }
    amortizingPrincipal = roundMoney(principal - balloonAmount)
  }

  const monthlyRate = rateAnnual / 100 / 12
  const schedule = []
  let balance = principal
  let levelPayment = 0

  if (method === 'fixed') {
    levelPayment = fixedMonthlyPayment(amortizingPrincipal, rateAnnual, n)
  }

  for (let month = 1; month <= n; month++) {
    const interest = roundMoney(balance * monthlyRate)
    let principalPaid
    let payment
    let isBalloon = false

    if (method === 'fixed') {
      if (month === n) {
        // Last payment clears remaining (excluding balloon handled below)
        principalPaid = roundMoney(balance - (balloonMonth === n ? balloonAmount : 0))
        payment = roundMoney(principalPaid + interest + (balloonMonth === n ? balloonAmount : 0))
        if (balloonMonth === n && balloonAmount > 0) isBalloon = true
      } else if (balloonMonth === month && balloonAmount > 0) {
        principalPaid = roundMoney(levelPayment - interest + balloonAmount)
        if (principalPaid > balance) principalPaid = balance
        payment = roundMoney(principalPaid + interest)
        isBalloon = true
      } else {
        principalPaid = roundMoney(levelPayment - interest)
        if (principalPaid > balance) principalPaid = balance
        payment = roundMoney(principalPaid + interest)
      }
    } else {
      // Declining balance: equal principal payments + interest on remaining
      const basePrincipal = roundMoney(amortizingPrincipal / n)
      if (month === n) {
        principalPaid = balance
        payment = roundMoney(principalPaid + interest)
        if (balloonAmount > 0 && balloonMonth === n) isBalloon = true
      } else if (balloonMonth === month && balloonAmount > 0) {
        principalPaid = roundMoney(basePrincipal + balloonAmount)
        if (principalPaid > balance) principalPaid = balance
        payment = roundMoney(principalPaid + interest)
        isBalloon = true
      } else {
        principalPaid = Math.min(basePrincipal, balance)
        payment = roundMoney(principalPaid + interest)
      }
    }

    balance = roundMoney(Math.max(0, balance - principalPaid))

    // Fix floating point leftover on last row
    if (month === n && balance !== 0 && Math.abs(balance) < 0.05) {
      payment = roundMoney(payment + balance)
      principalPaid = roundMoney(principalPaid + balance)
      balance = 0
    }

    schedule.push({
      monthNumber: month,
      date: addMonths(startDate, month),
      principal: principalPaid,
      interest,
      payment,
      balance,
      isBalloon
    })
  }

  const representativePayment =
    method === 'fixed'
      ? levelPayment
      : schedule.find((s) => !s.isBalloon)?.payment ?? schedule[0]?.payment ?? 0

  return {
    financedAmount: principal,
    monthlyPayment: roundMoney(representativePayment),
    schedule,
    method,
    balloonAmount,
    balloonMonth,
    downPayment: down,
    downPaymentPercentage: total > 0 ? roundMoney((down / total) * 100) : 0,
    totalPrice: total,
    interestRate: rateAnnual,
    termMonths: n
  }
}

export { fixedMonthlyPayment, roundMoney }
