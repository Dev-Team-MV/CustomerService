/**
 * Catálogo estático de recorridos para variables de mensajes.
 * Cada nodo describe campos escalares (hoja) o referencias (se puede seguir con otro segmento).
 */

const L = (es, en) => ({ es, en })

const RECORRIDO_NODES = {
  user: {
    label: L('Usuario', 'User'),
    description: L('Residente o usuario del sistema', 'Resident or system user'),
    fields: [
      { key: 'firstName', type: 'scalar', label: L('Nombre', 'First name') },
      { key: 'lastName', type: 'scalar', label: L('Apellido', 'Last name') },
      { key: 'email', type: 'scalar', label: L('Correo', 'Email') },
      { key: 'phoneNumber', type: 'scalar', label: L('Teléfono', 'Phone') },
      { key: 'role', type: 'scalar', label: L('Rol', 'Role') },
      { key: 'birthday', type: 'scalar', label: L('Fecha de nacimiento', 'Birthday') },
      { key: 'isActive', type: 'scalar', label: L('Activo', 'Active') }
    ]
  },
  client: {
    label: L('Cliente', 'Client'),
    description: L('Cliente o residente (mismos campos que usuario)', 'Client or resident (same fields as user)'),
    aliasOf: 'user'
  },
  lot: {
    label: L('Lote', 'Lot'),
    description: L('Lote del proyecto', 'Project lot'),
    fields: [
      { key: 'number', type: 'scalar', label: L('Número', 'Number') },
      { key: 'price', type: 'scalar', label: L('Precio', 'Price') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'color', type: 'scalar', label: L('Color', 'Color') },
      { key: 'model', type: 'ref', ref: 'model', label: L('Modelo', 'Model') },
      { key: 'assignedUser', type: 'ref', ref: 'user', label: L('Usuario asignado', 'Assigned user') }
    ]
  },
  property: {
    label: L('Propiedad', 'Property'),
    description: L('Propiedad vendida o en proceso', 'Sold or in-progress property'),
    fields: [
      { key: 'price', type: 'scalar', label: L('Precio total', 'Total price') },
      { key: 'pending', type: 'scalar', label: L('Saldo pendiente', 'Pending balance') },
      { key: 'initialPayment', type: 'scalar', label: L('Enganche inicial', 'Initial payment') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'saleDate', type: 'scalar', label: L('Fecha de venta', 'Sale date') },
      { key: 'lot', type: 'ref', ref: 'lot', label: L('Lote', 'Lot') },
      { key: 'model', type: 'ref', ref: 'model', label: L('Modelo', 'Model') },
      { key: 'facade', type: 'ref', ref: 'facade', label: L('Fachada', 'Facade') }
    ]
  },
  project: {
    label: L('Proyecto', 'Project'),
    description: L('Datos del proyecto', 'Project data'),
    fields: [
      { key: 'name', type: 'scalar', label: L('Nombre', 'Name') },
      { key: 'slug', type: 'scalar', label: L('Slug', 'Slug') },
      { key: 'phase', type: 'scalar', label: L('Fase', 'Phase') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'location', type: 'scalar', label: L('Ubicación', 'Location') },
      { key: 'area', type: 'scalar', label: L('Área', 'Area') },
      { key: 'type', type: 'scalar', label: L('Tipo', 'Type') },
      { key: 'title.en', type: 'scalar', label: L('Título (EN)', 'Title (EN)') },
      { key: 'title.es', type: 'scalar', label: L('Título (ES)', 'Title (ES)') }
    ]
  },
  lead: {
    label: L('Lead', 'Lead'),
    description: L('Prospecto de venta', 'Sales lead'),
    fields: [
      { key: 'name', type: 'scalar', label: L('Nombre', 'Name') },
      { key: 'phone', type: 'scalar', label: L('Teléfono', 'Phone') },
      { key: 'email', type: 'scalar', label: L('Correo', 'Email') },
      { key: 'source', type: 'scalar', label: L('Origen', 'Source') },
      { key: 'stage', type: 'scalar', label: L('Etapa', 'Stage') },
      { key: 'notes', type: 'scalar', label: L('Notas', 'Notes') },
      { key: 'assignedTo', type: 'ref', ref: 'user', label: L('Asignado a', 'Assigned to') }
    ]
  },
  model: {
    label: L('Modelo', 'Model'),
    description: L('Modelo de vivienda', 'House model'),
    fields: [
      { key: 'model', type: 'scalar', label: L('Nombre del modelo', 'Model name') },
      { key: 'modelNumber', type: 'scalar', label: L('Número de modelo', 'Model number') },
      { key: 'price', type: 'scalar', label: L('Precio base', 'Base price') },
      { key: 'bedrooms', type: 'scalar', label: L('Recámaras', 'Bedrooms') },
      { key: 'bathrooms', type: 'scalar', label: L('Baños', 'Bathrooms') },
      { key: 'sqft', type: 'scalar', label: L('Pies cuadrados', 'Square feet') },
      { key: 'stories', type: 'scalar', label: L('Pisos', 'Stories') },
      { key: 'description', type: 'scalar', label: L('Descripción', 'Description') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') }
    ]
  },
  facade: {
    label: L('Fachada', 'Facade'),
    description: L('Fachada del modelo', 'Model facade'),
    fields: [
      { key: 'title', type: 'scalar', label: L('Título', 'Title') },
      { key: 'price', type: 'scalar', label: L('Precio', 'Price') }
    ]
  },
  building: {
    label: L('Edificio', 'Building'),
    description: L('Edificio del proyecto (torres / apartamentos)', 'Project building (towers / apartments)'),
    fields: [
      { key: 'name', type: 'scalar', label: L('Nombre', 'Name') },
      { key: 'section', type: 'scalar', label: L('Sección', 'Section') },
      { key: 'floors', type: 'scalar', label: L('Pisos', 'Floors') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'totalApartments', type: 'scalar', label: L('Total apartamentos', 'Total apartments') },
      { key: 'availabilityStatus', type: 'scalar', label: L('Disponibilidad', 'Availability') }
    ]
  },
  apartment: {
    label: L('Apartamento', 'Apartment'),
    description: L('Unidad de apartamento asignada', 'Assigned apartment unit'),
    fields: [
      { key: 'apartmentNumber', type: 'scalar', label: L('Número de apartamento', 'Apartment number') },
      { key: 'floorNumber', type: 'scalar', label: L('Piso', 'Floor number') },
      { key: 'price', type: 'scalar', label: L('Precio', 'Price') },
      { key: 'pending', type: 'scalar', label: L('Saldo pendiente', 'Pending balance') },
      { key: 'initialPayment', type: 'scalar', label: L('Enganche inicial', 'Initial payment') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'saleDate', type: 'scalar', label: L('Fecha de venta', 'Sale date') },
      { key: 'building', type: 'ref', ref: 'building', label: L('Edificio', 'Building') },
      { key: 'apartmentModel', type: 'ref', ref: 'apartmentModel', label: L('Modelo de apartamento', 'Apartment model') }
    ]
  },
  apartmentModel: {
    label: L('Modelo de apartamento', 'Apartment model'),
    description: L('Tipología de apartamento en el edificio', 'Apartment typology in the building'),
    fields: [
      { key: 'name', type: 'scalar', label: L('Nombre', 'Name') },
      { key: 'modelNumber', type: 'scalar', label: L('Número de modelo', 'Model number') },
      { key: 'sqft', type: 'scalar', label: L('Pies cuadrados', 'Square feet') },
      { key: 'bedrooms', type: 'scalar', label: L('Recámaras', 'Bedrooms') },
      { key: 'bathrooms', type: 'scalar', label: L('Baños', 'Bathrooms') },
      { key: 'apartmentCount', type: 'scalar', label: L('Cantidad de unidades', 'Unit count') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'building', type: 'ref', ref: 'building', label: L('Edificio', 'Building') }
    ]
  },
  payment: {
    label: L('Pago', 'Payment'),
    description: L('Abono o pago registrado', 'Registered payment'),
    fields: [
      { key: 'amount', type: 'scalar', label: L('Monto', 'Amount') },
      { key: 'date', type: 'scalar', label: L('Fecha', 'Date') },
      { key: 'status', type: 'scalar', label: L('Estado', 'Status') },
      { key: 'type', type: 'scalar', label: L('Tipo', 'Type') },
      { key: 'notes', type: 'scalar', label: L('Notas', 'Notes') },
      { key: 'property', type: 'ref', ref: 'property', label: L('Propiedad', 'Property') }
    ]
  }
}

const ROOT_KEYS = [
  'user',
  'client',
  'lot',
  'property',
  'building',
  'apartment',
  'apartmentModel',
  'project',
  'lead',
  'payment'
]

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'es'
}

function pickLabel(labelObj, lang) {
  if (!labelObj) return ''
  if (typeof labelObj === 'string') return labelObj
  return labelObj[lang] || labelObj.es || labelObj.en || ''
}

function resolveNode(key) {
  const node = RECORRIDO_NODES[key]
  if (!node) return null
  if (node.aliasOf) return RECORRIDO_NODES[node.aliasOf]
  return node
}

function normalizePath(path = '') {
  if (!path || typeof path !== 'string') return []
  return path
    .split('.')
    .map(segment => segment.trim())
    .filter(Boolean)
}

export function getRecorridoRoots(lang = 'es') {
  const resolvedLang = resolveLang(lang)

  return ROOT_KEYS.map(key => {
    const node = RECORRIDO_NODES[key]
    const resolved = resolveNode(key)
    return {
      key,
      label: pickLabel(node.label, resolvedLang),
      description: pickLabel(node.description, resolvedLang),
      hasChildren: Boolean(resolved?.fields?.length)
    }
  })
}

export function getRecorridoSegments(path = '', lang = 'es') {
  const resolvedLang = resolveLang(lang)
  const segments = normalizePath(path)

  if (segments.length === 0) {
    return { error: 'path is required', status: 400 }
  }

  let currentNode = null
  const rootKey = segments[0]
  const rootNode = resolveNode(rootKey)

  if (!rootNode) {
    return {
      error: `Unknown recorrido root "${rootKey}"`,
      status: 404,
      path: rootKey
    }
  }

  currentNode = rootNode
  let currentNodeKey = rootKey

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    const parentField = currentNode.fields?.find(field => field.key === segment)

    if (!parentField) {
      return {
        error: `Field "${segment}" not found on "${segments.slice(0, i).join('.')}"`,
        status: 404,
        path: segments.slice(0, i + 1).join('.')
      }
    }

    if (parentField.type !== 'ref' || !parentField.ref) {
      return {
        error: `"${segments.slice(0, i).join('.')}.${segment}" is a scalar field and has no nested segments`,
        status: 400,
        path: segments.slice(0, i + 1).join('.')
      }
    }

    const refNode = resolveNode(parentField.ref)
    if (!refNode) {
      return {
        error: `Referenced node "${parentField.ref}" is not defined`,
        status: 404,
        path: segments.slice(0, i + 1).join('.')
      }
    }

    currentNode = refNode
    currentNodeKey = parentField.ref
  }

  const basePath = segments.join('.')
  const parentLabel = pickLabel(
    segments.length === 1 ? RECORRIDO_NODES[rootKey]?.label : currentNode.label,
    resolvedLang
  )

  const items = (currentNode.fields || []).map(field => {
    const itemPath = `${basePath}.${field.key}`
    const item = {
      key: field.key,
      label: pickLabel(field.label, resolvedLang),
      type: field.type,
      recorrido: itemPath
    }

    if (field.type === 'ref') {
      item.ref = field.ref
      item.hasChildren = Boolean(resolveNode(field.ref)?.fields?.length)
    }

    return item
  })

  return {
    path: basePath,
    node: currentNodeKey,
    parentLabel,
    items
  }
}

export default {
  getRecorridoRoots,
  getRecorridoSegments
}
