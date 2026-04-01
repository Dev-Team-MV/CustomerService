import Project from '../models/Project.js'
import { COMMUNITY_SPACE_IDS } from '../constants/communitySpaceIds.js'
import { hydrateUrlsInObject } from '../services/urlResolverService.js'
import { normalizeImageArray, normalizeImageItem } from '../utils/imageUtils.js'

function normalizeLocalized (val) {
  if (!val || typeof val !== 'object') return { en: '', es: '' }
  return {
    en: val.en != null ? String(val.en) : '',
    es: val.es != null ? String(val.es) : ''
  }
}

function normalizePlanoItems (items) {
  if (!Array.isArray(items)) return []
  const out = []
  for (const item of items) {
    if (item == null) continue
    const base = normalizeImageItem(item)
    if (!base) continue
    const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : (item.name ?? null)
    out.push({ ...base, name })
  }
  return out
}

/** Objetos planos para respuesta (evita subdocs + hydrate recursivo infinito) */
function toPlainCommunitySpace (raw) {
  if (!raw) return null
  const s = typeof raw.toObject === 'function' ? raw.toObject() : { ...raw }
  const sections = s.sections || {}
  const ext = sections.exterior || {}
  const pl = sections.planos || {}
  return {
    id: s.id,
    label: s.label != null ? String(s.label) : '',
    sections: {
      exterior: {
        title: normalizeLocalized(ext.title),
        images: normalizeImageArray(ext.images)
      },
      planos: {
        items: normalizePlanoItems(pl.items)
      }
    }
  }
}

function normalizeIncomingBody (body) {
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  const sections = body?.sections && typeof body.sections === 'object' ? body.sections : {}
  const exterior = sections.exterior && typeof sections.exterior === 'object' ? sections.exterior : {}
  const planos = sections.planos && typeof sections.planos === 'object' ? sections.planos : {}

  return {
    label,
    sections: {
      exterior: {
        title: normalizeLocalized(exterior.title),
        images: normalizeImageArray(exterior.images)
      },
      planos: {
        items: normalizePlanoItems(planos.items)
      }
    }
  }
}

function validateSpaceId (paramId) {
  const id = String(paramId || '').trim().toLowerCase()
  if (!COMMUNITY_SPACE_IDS.includes(id)) {
    return { ok: false, message: `spaceId must be one of: ${COMMUNITY_SPACE_IDS.join(', ')}` }
  }
  return { ok: true, id }
}

export const getCommunitySpaces = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('slug communitySpaces')
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const list = (project.communitySpaces || []).map((s) => toPlainCommunitySpace(s)).filter(Boolean)
    const payload = {
      projectId: project._id,
      slug: project.slug,
      spaces: list
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunitySpacesBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase()
    const project = await Project.findOne({ slug }).select('slug communitySpaces')
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const list = (project.communitySpaces || []).map((s) => toPlainCommunitySpace(s)).filter(Boolean)
    const payload = {
      projectId: project._id,
      slug: project.slug,
      spaces: list
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunitySpaceById = async (req, res) => {
  try {
    const v = validateSpaceId(req.params.spaceId)
    if (!v.ok) return res.status(400).json({ message: v.message })

    const project = await Project.findById(req.params.id).select('slug communitySpaces')
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const found = (project.communitySpaces || []).find((s) => s.id === v.id)
    if (!found) {
      return res.status(404).json({ message: 'Community space not found for this project' })
    }

    const payload = {
      projectId: project._id,
      slug: project.slug,
      space: toPlainCommunitySpace(found)
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommunitySpaceBySlug = async (req, res) => {
  try {
    const v = validateSpaceId(req.params.spaceId)
    if (!v.ok) return res.status(400).json({ message: v.message })

    const slug = String(req.params.slug || '').trim().toLowerCase()
    const project = await Project.findOne({ slug }).select('slug communitySpaces')
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const found = (project.communitySpaces || []).find((s) => s.id === v.id)
    if (!found) {
      return res.status(404).json({ message: 'Community space not found for this project' })
    }

    const payload = {
      projectId: project._id,
      slug: project.slug,
      space: toPlainCommunitySpace(found)
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * PUT body: { label?, sections: { exterior: { title?: {en,es}, images: [] }, planos: { items: [] } } }
 * Crea o reemplaza el espacio con id = spaceId (solo agora).
 */
export const upsertCommunitySpace = async (req, res) => {
  try {
    const v = validateSpaceId(req.params.spaceId)
    if (!v.ok) return res.status(400).json({ message: v.message })

    if (req.body?.id != null && String(req.body.id).trim().toLowerCase() !== v.id) {
      return res.status(400).json({ message: 'Body id must match path spaceId' })
    }

    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const normalized = normalizeIncomingBody(req.body)
    const entry = {
      id: v.id,
      label: normalized.label,
      sections: normalized.sections
    }

    const arr = project.communitySpaces || []
    const idx = arr.findIndex((s) => s.id === v.id)
    if (idx >= 0) {
      arr.splice(idx, 1, entry)
    } else {
      arr.push(entry)
    }
    project.communitySpaces = arr
    await project.save()

    const saved = project.communitySpaces.find((s) => s.id === v.id)
    const payload = {
      projectId: project._id,
      slug: project.slug,
      space: toPlainCommunitySpace(saved)
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }
    res.status(500).json({ message: error.message })
  }
}

