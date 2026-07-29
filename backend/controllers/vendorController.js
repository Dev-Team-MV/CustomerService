import Vendor from '../models/Vendor.js'
import {
  getVendorTaxonomyResponse,
  isValidVendorCategory,
  isSubcategoryOfCategory
} from '../constants/vendorTaxonomy.js'
import { isStaffRole } from '../utils/roles.js'

const PROJECT_POPULATE = { path: 'projectId', select: 'name' }

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizePhones = (phones) => {
  if (!Array.isArray(phones)) return null
  return phones.map((p) => String(p).trim()).filter(Boolean)
}

const normalizeLocations = (locations) => {
  if (locations === undefined) return undefined
  if (!Array.isArray(locations)) return null
  return locations.map((loc) => ({
    formattedAddress: loc.formattedAddress?.trim?.() || loc.formattedAddress || '',
    placeId: loc.placeId?.trim?.() || loc.placeId || null,
    lat: loc.lat !== undefined && loc.lat !== null && loc.lat !== '' ? Number(loc.lat) : null,
    lng: loc.lng !== undefined && loc.lng !== null && loc.lng !== '' ? Number(loc.lng) : null,
    label: loc.label?.trim?.() || loc.label || ''
  }))
}

export const getVendorCategories = async (req, res) => {
  try {
    res.json(getVendorTaxonomyResponse())
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllVendors = async (req, res) => {
  try {
    const { category, subcategory, projectId, location, search, status, scope } = req.query
    const filter = {}

    if (category) {
      if (!isValidVendorCategory(category)) {
        return res.status(400).json({ message: `Invalid category: ${category}` })
      }
      filter.category = category
    }

    if (subcategory) {
      if (category && !isSubcategoryOfCategory(category, subcategory)) {
        return res.status(400).json({
          message: `Subcategory "${subcategory}" does not belong to category "${category}"`
        })
      }
      filter.subcategory = subcategory
    }

    if (scope === 'general') {
      filter.projectId = null
    } else if (scope === 'project') {
      if (!projectId) {
        return res.status(400).json({ message: 'projectId is required when scope=project' })
      }
      filter.projectId = projectId
    } else if (projectId) {
      filter.$or = [{ projectId }, { projectId: null }]
    }

    if (location) {
      filter['locations.formattedAddress'] = {
        $regex: escapeRegex(location),
        $options: 'i'
      }
    }

    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: 'i' }
    }

    const isStaff = isStaffRole(req.user?.role)
    if (status) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'status must be active or inactive' })
      }
      if (!isStaff && status !== 'active') {
        return res.status(403).json({ message: 'Not authorized to filter inactive vendors' })
      }
      filter.status = status
    } else if (!isStaff) {
      filter.status = 'active'
    }

    const vendors = await Vendor.find(filter).populate(PROJECT_POPULATE).sort({ name: 1 })
    res.json(vendors)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(PROJECT_POPULATE)

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    if (vendor.status === 'inactive' && !isStaffRole(req.user?.role)) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    res.json(vendor)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createVendor = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      contactPhones,
      locations,
      projectId,
      photo,
      website,
      status
    } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'name is required' })
    }
    if (!category || !isValidVendorCategory(category)) {
      return res.status(400).json({ message: 'Valid category is required' })
    }
    if (!subcategory || !isSubcategoryOfCategory(category, subcategory)) {
      return res.status(400).json({
        message: `Valid subcategory for category "${category}" is required`
      })
    }

    const phones = normalizePhones(contactPhones)
    if (!phones || phones.length < 1) {
      return res.status(400).json({ message: 'At least one contact phone is required' })
    }

    const normalizedLocations = normalizeLocations(locations)
    if (locations !== undefined && normalizedLocations === null) {
      return res.status(400).json({ message: 'locations must be an array' })
    }

    const vendor = await Vendor.create({
      name: name.trim(),
      category,
      subcategory,
      contactPhones: phones,
      locations: normalizedLocations || [],
      projectId: projectId || null,
      photo: photo?.trim?.() || photo || null,
      website: website?.trim?.() || website || null,
      status: status || 'active'
    })

    const populated = await Vendor.findById(vendor._id).populate(PROJECT_POPULATE)
    res.status(201).json(populated)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: error.message })
  }
}

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    const {
      name,
      category,
      subcategory,
      contactPhones,
      locations,
      projectId,
      photo,
      website,
      status
    } = req.body

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ message: 'name cannot be empty' })
      }
      vendor.name = name.trim()
    }

    const nextCategory = category !== undefined ? category : vendor.category
    const nextSubcategory = subcategory !== undefined ? subcategory : vendor.subcategory

    if (category !== undefined || subcategory !== undefined) {
      if (!isValidVendorCategory(nextCategory)) {
        return res.status(400).json({ message: 'Valid category is required' })
      }
      if (!isSubcategoryOfCategory(nextCategory, nextSubcategory)) {
        return res.status(400).json({
          message: `Subcategory "${nextSubcategory}" does not belong to category "${nextCategory}"`
        })
      }
      vendor.category = nextCategory
      vendor.subcategory = nextSubcategory
    }

    if (contactPhones !== undefined) {
      const phones = normalizePhones(contactPhones)
      if (!phones || phones.length < 1) {
        return res.status(400).json({ message: 'At least one contact phone is required' })
      }
      vendor.contactPhones = phones
    }

    if (locations !== undefined) {
      const normalizedLocations = normalizeLocations(locations)
      if (normalizedLocations === null) {
        return res.status(400).json({ message: 'locations must be an array' })
      }
      vendor.locations = normalizedLocations
    }

    if (projectId !== undefined) {
      vendor.projectId = projectId || null
    }

    if (photo !== undefined) {
      vendor.photo = photo?.trim?.() || photo || null
    }

    if (website !== undefined) {
      vendor.website = website?.trim?.() || website || null
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'status must be active or inactive' })
      }
      vendor.status = status
    }

    await vendor.save()
    const populated = await Vendor.findById(vendor._id).populate(PROJECT_POPULATE)
    res.json(populated)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: error.message })
  }
}

export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    await vendor.deleteOne()
    res.json({ message: 'Vendor removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
