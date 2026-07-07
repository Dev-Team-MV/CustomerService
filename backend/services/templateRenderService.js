export function extractPlaceholders(template = '') {
  const matcher = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g
  const placeholders = new Set()

  let match = matcher.exec(template)
  while (match !== null) {
    placeholders.add(match[1])
    match = matcher.exec(template)
  }

  return [...placeholders]
}

export function getPathValue(root, path = '') {
  if (!path) return undefined
  return path.split('.').reduce((accumulator, key) => {
    if (accumulator === null || accumulator === undefined) return undefined
    return accumulator[key]
  }, root)
}

export function renderTemplate(template, variables = {}) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    const value = getPathValue(variables, key)
    return value === undefined || value === null ? '' : String(value)
  })
}

export function buildMessageFromTemplate(template, variables = {}) {
  if (!template || typeof template !== 'string') {
    throw new Error('Template must be a non-empty string')
  }

  const missingVariables = new Set()
  const renderedMessage = template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    const value = getPathValue(variables, key)

    if (value === undefined || value === null) {
      missingVariables.add(key)
      return ''
    }

    return String(value)
  })

  return {
    renderedMessage,
    missingVariables: [...missingVariables]
  }
}
