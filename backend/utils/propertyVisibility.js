import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import PropertyShare from '../models/PropertyShare.js'
import FamilyGroup from '../models/FamilyGroup.js'
import mongoose from 'mongoose'

async function getFamilyGroupIdsForUser(userId) {
  const groups = await FamilyGroup.find({
    $or: [
      { createdBy: userId },
      { 'members.user': userId }
    ]
  }).distinct('_id')

  return groups.map(id => id.toString())
}

/**
 * Returns the list of property IDs that the given user can see:
 * - properties where user is in users (owner)
 * - properties shared with user via PropertyShare
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
export async function getVisiblePropertyIdsForUser(userId) {
  const familyGroupIds = await getFamilyGroupIdsForUser(userId)

  const [owned, sharedByUser, sharedByFamilyGroup] = await Promise.all([
    Property.find({ users: userId }).distinct('_id'),
    PropertyShare.find({
      sharedWith: userId,
      property: { $exists: true, $ne: null }
    }).distinct('property'),
    // When shares were created earlier for group members, a new member might
    // not have PropertyShare(sharedWith=userId). Using familyGroup keeps access consistent.
    familyGroupIds.length
      ? PropertyShare.find({
        familyGroup: { $in: familyGroupIds },
        property: { $exists: true, $ne: null }
      }).distinct('property')
      : []
  ])

  const set = new Set([
    ...owned.map(id => id.toString()),
    ...sharedByUser.map(id => id.toString()),
    ...sharedByFamilyGroup.map(id => id.toString())
  ])
  return Array.from(set).map(id => new mongoose.Types.ObjectId(id))
}

/**
 * Returns the list of apartment IDs that the given user can see:
 * - apartments where user is in users (owner)
 * - apartments shared with user via PropertyShare
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
export async function getVisibleApartmentIdsForUser(userId) {
  const familyGroupIds = await getFamilyGroupIdsForUser(userId)

  const [owned, sharedByUser, sharedByFamilyGroup] = await Promise.all([
    Apartment.find({ users: userId }).distinct('_id'),
    PropertyShare.find({
      sharedWith: userId,
      apartment: { $exists: true, $ne: null }
    }).distinct('apartment'),
    familyGroupIds.length
      ? PropertyShare.find({
        familyGroup: { $in: familyGroupIds },
        apartment: { $exists: true, $ne: null }
      }).distinct('apartment')
      : []
  ])

  const set = new Set([
    ...owned.map(id => id.toString()),
    ...sharedByUser.map(id => id.toString()),
    ...sharedByFamilyGroup.map(id => id.toString())
  ])
  return Array.from(set).map(id => new mongoose.Types.ObjectId(id))
}

/**
 * Checks whether the user can access the property (is owner or has a share).
 * @param {mongoose.Types.ObjectId} userId
 * @param {mongoose.Types.ObjectId} propertyId
 * @returns {Promise<boolean>}
 */
export async function canUserAccessProperty(userId, propertyId) {
  const familyGroupIds = await getFamilyGroupIdsForUser(userId)

  const [isOwner, hasShareByUser, hasShareByFamilyGroup] = await Promise.all([
    Property.exists({ _id: propertyId, users: userId }),
    PropertyShare.exists({ property: propertyId, sharedWith: userId }),
    familyGroupIds.length
      ? PropertyShare.exists({
        property: propertyId,
        familyGroup: { $in: familyGroupIds }
      })
      : false
  ])

  return Boolean(isOwner || hasShareByUser || hasShareByFamilyGroup)
}

/**
 * Checks whether the user can access the apartment (is owner or has a share).
 * @param {mongoose.Types.ObjectId} userId
 * @param {mongoose.Types.ObjectId} apartmentId
 * @returns {Promise<boolean>}
 */
export async function canUserAccessApartment(userId, apartmentId) {
  const familyGroupIds = await getFamilyGroupIdsForUser(userId)

  const [isOwner, hasShareByUser, hasShareByFamilyGroup] = await Promise.all([
    Apartment.exists({ _id: apartmentId, users: userId }),
    PropertyShare.exists({ apartment: apartmentId, sharedWith: userId }),
    familyGroupIds.length
      ? PropertyShare.exists({
        apartment: apartmentId,
        familyGroup: { $in: familyGroupIds }
      })
      : false
  ])

  return Boolean(isOwner || hasShareByUser || hasShareByFamilyGroup)
}
