import Property from '../models/Property.js'
import PropertyShare from '../models/PropertyShare.js'
import mongoose from 'mongoose'

/**
 * Returns the list of property IDs that the given user can see:
 * - properties where user is in users (owner)
 * - properties shared with user via PropertyShare
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
export async function getVisiblePropertyIdsForUser(userId) {
  const [owned, shared] = await Promise.all([
    Property.find({ users: userId }).distinct('_id'),
    PropertyShare.find({ sharedWith: userId }).distinct('property')
  ])
  const set = new Set([...owned.map(id => id.toString()), ...shared.map(id => id.toString())])
  return Array.from(set).map(id => new mongoose.Types.ObjectId(id))
}

/**
 * Checks whether the user can access the property (is owner or has a share).
 * @param {mongoose.Types.ObjectId} userId
 * @param {mongoose.Types.ObjectId} propertyId
 * @returns {Promise<boolean>}
 */
export async function canUserAccessProperty(userId, propertyId) {
  const [isOwner, hasShare] = await Promise.all([
    Property.exists({ _id: propertyId, users: userId }),
    PropertyShare.exists({ property: propertyId, sharedWith: userId })
  ])
  return Boolean(isOwner || hasShare)
}
