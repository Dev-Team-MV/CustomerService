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

function ensureVerticalSpace(doc, requiredHeight = 20) {
  if (doc.y + requiredHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage()
  }
}

function drawSectionTitle(doc, text) {
  ensureVerticalSpace(doc, 30)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(12).text(text)
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
  doc.font('Helvetica-Bold').fontSize(9)
  columns.forEach((column) => {
    doc.text(column.label, column.x, doc.y, { width: column.width })
  })
  doc.moveDown(0.4)
  drawDivider(doc)

  rows.forEach((row) => {
    const estimatedHeight = 20
    ensureVerticalSpace(doc, estimatedHeight)
    doc.font('Helvetica').fontSize(9)
    const rowTop = doc.y
    columns.forEach((column) => {
      const rawValue = row[column.key]
      const value = rawValue == null || rawValue === '' ? '-' : String(rawValue)
      doc.text(value, column.x, rowTop, { width: column.width })
    })
    doc.moveDown(1)
  })
}

function createPdfResponse(res, fileName) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const safeName = String(fileName || 'statement')
    .replace(/[^a-zA-Z0-9_.-]+/g, '-')
    .replace(/-+/g, '-')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`)
  doc.pipe(res)
  return doc
}

function renderPropertySections(doc, payload) {
  const {
    property,
    projectName,
    lotNumber,
    modelName,
    ownerNames,
    totals,
    payments,
    phases = [],
    totalConstructionPercentage = 0
  } = payload

  drawSectionTitle(doc, 'Property Information')
  drawKeyValueLine(doc, 'Project', projectName || '-')
  drawKeyValueLine(doc, 'Lot', lotNumber || '-')
  drawKeyValueLine(doc, 'Model', modelName || '-')
  drawKeyValueLine(doc, 'Property ID', String(property?._id || '-'))
  drawKeyValueLine(doc, 'Owners', ownerNames || '-')

  drawSectionTitle(doc, 'Account Status')
  drawKeyValueLine(doc, 'Total Price', formatCurrency(totals.totalPrice))
  drawKeyValueLine(doc, 'Initial Payment', formatCurrency(totals.initialPayment))
  drawKeyValueLine(doc, 'Approved Payments', formatCurrency(totals.signedPayments))
  drawKeyValueLine(doc, 'Pending Payments', formatCurrency(totals.pendingPayments))
  drawKeyValueLine(doc, 'Rejected Payments', formatCurrency(totals.rejectedPayments))
  drawKeyValueLine(doc, 'Outstanding Balance', formatCurrency(totals.outstandingBalance))

  drawSectionTitle(doc, 'Construction Progress')
  drawKeyValueLine(doc, 'Overall Progress', `${totalConstructionPercentage.toFixed(1)}%`)
  if (phases.length) {
    doc.moveDown(0.5)
    drawSimpleTable(
      doc,
      [
        { key: 'phaseNumber', label: 'Phase #', x: 50, width: 60 },
        { key: 'title', label: 'Title', x: 110, width: 260 },
        { key: 'constructionPercentage', label: 'Progress %', x: 370, width: 100 }
      ],
      phases.map((p) => ({
        phaseNumber: String(p.phaseNumber),
        title: p.title || '-',
        constructionPercentage: `${p.constructionPercentage ?? 0}%`
      }))
    )
  }

  drawSectionTitle(doc, 'Payment History')
  if (!payments.length) {
    doc.font('Helvetica').fontSize(10).text('No payments registered for this property.')
  } else {
    drawSimpleTable(
      doc,
      [
        { key: 'date', label: 'Date', x: 50, width: 80 },
        { key: 'status', label: 'Status', x: 130, width: 70 },
        { key: 'type', label: 'Type', x: 200, width: 120 },
        { key: 'amount', label: 'Amount', x: 320, width: 80 },
        { key: 'notes', label: 'Notes', x: 400, width: 160 }
      ],
      payments.map((payment) => ({
        date: formatDate(payment.date),
        status: payment.status || '-',
        type: payment.type || '-',
        amount: formatCurrency(payment.amount),
        notes: payment.notes || payment.support || '-'
      }))
    )
  }
}

export function generatePropertyStatementPdf(res, payload) {
  const { lotNumber, property } = payload
  const doc = createPdfResponse(res, `property-statement-${lotNumber || property?._id || 'export'}`)
  doc.font('Helvetica-Bold').fontSize(18).text('Property Account Statement')
  doc.moveDown(0.3)
  doc.font('Helvetica').fontSize(10).text(`Generated at: ${new Date().toLocaleString('en-US')}`)
  drawDivider(doc)
  renderPropertySections(doc, payload)
  doc.end()
}

export function generateBulkCombinedStatementPdf(res, propertiesPayload) {
  const doc = createPdfResponse(res, 'combined-statement')
  doc.font('Helvetica-Bold').fontSize(18).text('Combined Property Statements')
  doc.moveDown(0.3)
  doc.font('Helvetica').fontSize(10).text(`Generated at: ${new Date().toLocaleString('en-US')}`)
  doc.font('Helvetica').fontSize(10).text(`Properties included: ${propertiesPayload.length}`)
  drawDivider(doc)

  propertiesPayload.forEach((payload, index) => {
    if (index > 0) doc.addPage()
    doc.font('Helvetica-Bold').fontSize(14).text(
      `Property ${index + 1} / ${propertiesPayload.length} — Lot ${payload.lotNumber}`
    )
    drawDivider(doc)
    renderPropertySections(doc, payload)
  })

  doc.end()
}

export function generateBalanceGeneralPdf(res, { projectName, totalProperties, totals, properties }) {
  const doc = createPdfResponse(res, 'balance-general')

  doc.font('Helvetica-Bold').fontSize(18).text('Balance General')
  doc.moveDown(0.3)
  doc.font('Helvetica').fontSize(10).text(`Generated at: ${new Date().toLocaleString('en-US')}`)
  if (projectName && projectName !== '-') {
    doc.font('Helvetica').fontSize(10).text(`Project: ${projectName}`)
  }
  drawDivider(doc)

  drawSectionTitle(doc, 'Financial Summary')
  drawKeyValueLine(doc, 'Total Properties', String(totalProperties))
  drawKeyValueLine(doc, 'Portfolio Value', formatCurrency(totals.totalPrice))
  drawKeyValueLine(doc, 'Total Approved Payments', formatCurrency(totals.signedPayments))
  drawKeyValueLine(doc, 'Total Pending Payments', formatCurrency(totals.pendingPayments))
  drawKeyValueLine(doc, 'Total Outstanding Balance', formatCurrency(totals.outstandingBalance))

  drawSectionTitle(doc, 'Properties Breakdown')
  drawSimpleTable(
    doc,
    [
      { key: 'lot',          label: 'Lot',      x: 50,  width: 45  },
      { key: 'model',        label: 'Model',    x: 95,  width: 70  },
      { key: 'owners',       label: 'Owners',   x: 165, width: 115 },
      { key: 'price',        label: 'Price',    x: 280, width: 75  },
      { key: 'paid',         label: 'Paid',     x: 355, width: 70  },
      { key: 'pending',      label: 'Pending',  x: 425, width: 70  },
      { key: 'construction', label: 'Constr.%', x: 495, width: 50  }
    ],
    properties.map((p) => ({
      lot:          String(p.lotNumber),
      model:        p.modelName || '-',
      owners:       p.ownerNames || '-',
      price:        formatCurrency(p.totalPrice),
      paid:         formatCurrency(p.signedPayments),
      pending:      formatCurrency(p.outstandingBalance),
      construction: `${p.constructionPct.toFixed(1)}%`
    }))
  )

  doc.end()
}

export function generateProjectStatementPdf(res, payload) {
  const {
    project,
    properties,
    totals,
    payments
  } = payload

  const doc = createPdfResponse(res, `project-statement-${project?.slug || project?._id || 'export'}`)

  doc.font('Helvetica-Bold').fontSize(18).text('Project Account Statement')
  doc.moveDown(0.3)
  doc.font('Helvetica').fontSize(10).text(`Generated at: ${new Date().toLocaleString('en-US')}`)
  drawDivider(doc)

  drawSectionTitle(doc, 'Project Information')
  drawKeyValueLine(doc, 'Project', project?.name || '-')
  drawKeyValueLine(doc, 'Project ID', String(project?._id || '-'))
  drawKeyValueLine(doc, 'Total Properties', String(properties.length))

  drawSectionTitle(doc, 'General Account Status')
  drawKeyValueLine(doc, 'Portfolio Value', formatCurrency(totals.totalPrice))
  drawKeyValueLine(doc, 'Initial Payments', formatCurrency(totals.initialPayment))
  drawKeyValueLine(doc, 'Approved Payments', formatCurrency(totals.signedPayments))
  drawKeyValueLine(doc, 'Pending Payments', formatCurrency(totals.pendingPayments))
  drawKeyValueLine(doc, 'Rejected Payments', formatCurrency(totals.rejectedPayments))
  drawKeyValueLine(doc, 'Outstanding Balance', formatCurrency(totals.outstandingBalance))

  drawSectionTitle(doc, 'Properties Summary')
  if (!properties.length) {
    doc.font('Helvetica').fontSize(10).text('No properties found in this project.')
  } else {
    drawSimpleTable(
      doc,
      [
        { key: 'lot', label: 'Lot', x: 50, width: 60 },
        { key: 'owners', label: 'Owners', x: 110, width: 180 },
        { key: 'price', label: 'Price', x: 290, width: 80 },
        { key: 'paid', label: 'Paid', x: 370, width: 80 },
        { key: 'pending', label: 'Pending', x: 450, width: 90 }
      ],
      properties.map((property) => ({
        lot: property.lotNumber || '-',
        owners: property.ownerNames || '-',
        price: formatCurrency(property.price),
        paid: formatCurrency(property.signedPayments),
        pending: formatCurrency(property.pending)
      }))
    )
  }

  drawSectionTitle(doc, 'Payment History')
  if (!payments.length) {
    doc.font('Helvetica').fontSize(10).text('No payments registered in this project.')
  } else {
    drawSimpleTable(
      doc,
      [
        { key: 'date', label: 'Date', x: 50, width: 75 },
        { key: 'lot', label: 'Lot', x: 125, width: 60 },
        { key: 'status', label: 'Status', x: 185, width: 70 },
        { key: 'type', label: 'Type', x: 255, width: 100 },
        { key: 'amount', label: 'Amount', x: 355, width: 80 },
        { key: 'owner', label: 'Owner', x: 435, width: 125 }
      ],
      payments.map((payment) => ({
        date: formatDate(payment.date),
        lot: payment.lotNumber || '-',
        status: payment.status || '-',
        type: payment.type || '-',
        amount: formatCurrency(payment.amount),
        owner: payment.ownerName || '-'
      }))
    )
  }

  doc.end()
}
