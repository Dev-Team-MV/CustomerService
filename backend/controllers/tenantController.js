import Tenant from '../models/Tenant.js'

export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ isActive: true }).sort({ name: 1 })
    res.json(tenants)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
    if (tenant) {
      res.json(tenant)
    } else {
      res.status(404).json({ message: 'Tenant not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createTenant = async (req, res) => {
  try {
    const { name, slug, settings } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Tenant name is required' })
    }
    const tenant = await Tenant.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      settings: settings || {}
    })
    res.status(201).json(tenant)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
    if (tenant) {
      if (req.body.name !== undefined) tenant.name = req.body.name
      if (req.body.slug !== undefined) tenant.slug = req.body.slug
      if (req.body.isActive !== undefined) tenant.isActive = req.body.isActive
      if (req.body.settings !== undefined) tenant.settings = req.body.settings
      const updated = await tenant.save()
      res.json(updated)
    } else {
      res.status(404).json({ message: 'Tenant not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
    if (tenant) {
      await tenant.deleteOne()
      res.json({ message: 'Tenant deleted successfully' })
    } else {
      res.status(404).json({ message: 'Tenant not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
