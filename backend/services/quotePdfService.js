import PDFDocument from 'pdfkit'

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

function formatCurrency(value) {
  const amount = Number(value || 0)
  return CURRENCY_FORMATTER.format(Number.isFinite(amount) ? amount : 0)
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US')
}

function formatPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return `${n.toFixed(2)}%`
}

function ensureVerticalSpace(doc, requiredHeight = 20) {
  if (doc.y + requiredHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage()
  }
}

function drawSectionTitle(doc, text, accentColor = '#1a365d') {
  ensureVerticalSpace(doc, 30)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(12).fillColor(accentColor).text(text)
  doc.fillColor('#000000')
  doc.moveDown(0.25)
}

function drawKeyValueLine(doc, label, value) {
  ensureVerticalSpace(doc, 18)
  doc.font('Helvetica-Bold').fontSize(10).text(`${label}: `, { continued: true })
  doc.font('Helvetica').fontSize(10).text(value ?? '-')
}

function drawDivider(doc) {
  const startX = doc.page.margins.left
  const endX = doc.page.width - doc.page.margins.right
  const y = doc.y + 6
  ensureVerticalSpace(doc, 14)
  doc.moveTo(startX, y).lineTo(endX, y).stroke('#d6d6d6')
  doc.moveDown(0.8)
}

function drawSimpleTable(doc, columns, rows) {
  ensureVerticalSpace(doc, 26)
  doc.font('Helvetica-Bold').fontSize(8)
  const headerY = doc.y
  columns.forEach((column) => {
    doc.text(column.label, column.x, headerY, { width: column.width })
  })
  doc.moveDown(0.4)
  drawDivider(doc)

  rows.forEach((row) => {
    ensureVerticalSpace(doc, 16)
    doc.font('Helvetica').fontSize(8)
    const rowTop = doc.y
    columns.forEach((column) => {
      const rawValue = row[column.key]
      const value = rawValue == null || rawValue === '' ? '-' : String(rawValue)
      doc.text(value, column.x, rowTop, { width: column.width })
    })
    doc.y = rowTop + 12
  })
}

function resolveBrandColors(project) {
  const colors = Array.isArray(project?.brandColors) ? project.brandColors : []
  const map = Object.fromEntries(
    colors
      .filter((c) => c?.key && c?.value)
      .map((c) => [String(c.key).toLowerCase(), c.value])
  )
  return {
    primary: map.primary || '#1a365d',
    secondary: map.secondary || '#2c5282',
    accent: map.accent || '#2b6cb0'
  }
}

function renderQuoteBody(doc, payload) {
  const {
    quote,
    project,
    lot,
    model,
    facade,
    building,
    apartment,
    lead,
    client,
    termsAndConditions
  } = payload

  const brand = resolveBrandColors(project)
  const projectName = project?.name || project?.title || project?.slug || 'Project'

  doc.font('Helvetica-Bold').fontSize(20).fillColor(brand.primary).text(projectName)
  doc.font('Helvetica').fontSize(11).fillColor('#333333').text('Sales Quote / Cotización')
  doc.fillColor('#000000')
  doc.moveDown(0.3)
  drawDivider(doc)

  drawKeyValueLine(doc, 'Quote ID', String(quote?._id || '-'))
  drawKeyValueLine(doc, 'Status', quote?.status || '-')
  drawKeyValueLine(doc, 'Valid Until', formatDate(quote?.validUntil))
  drawKeyValueLine(doc, 'Created', formatDate(quote?.createdAt))

  drawSectionTitle(doc, 'Unit Details', brand.primary)
  if (apartment || quote?.apartmentId) {
    drawKeyValueLine(
      doc,
      'Apartment',
      apartment?.apartmentNumber != null
        ? String(apartment.apartmentNumber)
        : String(quote.apartmentId)
    )
    if (apartment?.floorNumber != null) {
      drawKeyValueLine(doc, 'Floor', String(apartment.floorNumber))
    }
    drawKeyValueLine(
      doc,
      'Building',
      building?.name || String(quote?.buildingId || '-')
    )
  } else {
    drawKeyValueLine(doc, 'Lot', lot?.number != null ? String(lot.number) : String(quote?.lotId || '-'))
    drawKeyValueLine(doc, 'Model', model?.model || model?.modelNumber || String(quote?.modelId || '-'))
    if (facade?.title || quote?.facadeId) {
      drawKeyValueLine(doc, 'Facade', facade?.title || String(quote.facadeId))
    }
  }

  drawSectionTitle(doc, 'Client / Lead', brand.primary)
  if (client) {
    const name = [client.firstName, client.lastName].filter(Boolean).join(' ') || '-'
    drawKeyValueLine(doc, 'Client', name)
    if (client.email) drawKeyValueLine(doc, 'Email', client.email)
    if (client.phoneNumber) drawKeyValueLine(doc, 'Phone', client.phoneNumber)
  } else if (lead) {
    drawKeyValueLine(doc, 'Lead', lead.name || '-')
    if (lead.email) drawKeyValueLine(doc, 'Email', lead.email)
    if (lead.phone) drawKeyValueLine(doc, 'Phone', lead.phone)
  } else {
    drawKeyValueLine(doc, 'Recipient', '-')
  }

  drawSectionTitle(doc, 'Financing Summary', brand.primary)
  drawKeyValueLine(doc, 'Total Price', formatCurrency(quote.totalPrice))
  drawKeyValueLine(
    doc,
    'Down Payment',
    `${formatCurrency(quote.downPayment)} (${formatPercent(quote.downPaymentPercentage)})`
  )
  drawKeyValueLine(doc, 'Financed Amount', formatCurrency(quote.financedAmount))
  drawKeyValueLine(doc, 'Interest Rate (annual)', formatPercent(quote.interestRate))
  drawKeyValueLine(doc, 'Term', `${quote.termMonths} months`)
  drawKeyValueLine(doc, 'Monthly Payment', formatCurrency(quote.monthlyPayment))
  drawKeyValueLine(doc, 'Amortization', quote.amortizationMethod || 'fixed')
  if (quote.balloonAmount) {
    drawKeyValueLine(doc, 'Balloon Payment', formatCurrency(quote.balloonAmount))
    drawKeyValueLine(doc, 'Balloon Month', String(quote.balloonMonth || '-'))
  }

  const schedule = Array.isArray(quote.schedule) ? quote.schedule : []
  if (schedule.length) {
    drawSectionTitle(doc, 'Amortization Schedule', brand.primary)
    const displayRows = schedule.map((row) => ({
      month: String(row.monthNumber) + (row.isBalloon ? '*' : ''),
      date: formatDate(row.date),
      payment: formatCurrency(row.payment),
      principal: formatCurrency(row.principal),
      interest: formatCurrency(row.interest),
      balance: formatCurrency(row.balance)
    }))

    // Paginate large schedules: first 24 then note, or all with page breaks
    drawSimpleTable(
      doc,
      [
        { key: 'month', label: '#', x: 50, width: 30 },
        { key: 'date', label: 'Date', x: 80, width: 70 },
        { key: 'payment', label: 'Payment', x: 155, width: 75 },
        { key: 'principal', label: 'Principal', x: 235, width: 75 },
        { key: 'interest', label: 'Interest', x: 315, width: 70 },
        { key: 'balance', label: 'Balance', x: 390, width: 75 }
      ],
      displayRows
    )

    if (schedule.some((r) => r.isBalloon)) {
      ensureVerticalSpace(doc, 20)
      doc.font('Helvetica-Oblique').fontSize(8).text('* Balloon payment month')
    }
  }

  const terms = termsAndConditions || quote?.termsAndConditions
  if (terms) {
    drawSectionTitle(doc, 'Terms and Conditions', brand.primary)
    ensureVerticalSpace(doc, 40)
    doc.font('Helvetica').fontSize(9).text(terms, { align: 'justify' })
  }

  doc.moveDown(1.5)
  ensureVerticalSpace(doc, 40)
  doc.font('Helvetica').fontSize(8).fillColor('#666666')
    .text('This quote is informational and subject to change. Final terms are defined in the purchase contract.')
  doc.fillColor('#000000')
}

/**
 * Stream a quote PDF to an Express response.
 */
export function generateQuotePdf(res, payload) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const id = String(payload?.quote?._id || 'quote').slice(-8)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="quote-${id}.pdf"`)
  doc.pipe(res)
  renderQuoteBody(doc, payload)
  doc.end()
}

/**
 * Build a PDF Buffer (for GCS upload / email attachment).
 * @returns {Promise<Buffer>}
 */
export function generateQuotePdfBuffer(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    renderQuoteBody(doc, payload)
    doc.end()
  })
}
