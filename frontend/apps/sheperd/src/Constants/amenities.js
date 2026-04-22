// @sheperd/Constants/amenities.js

import { buildingsConfigs } from '@shared/config/buildingConfig'

const sheperdConfig = buildingsConfigs.sheperd?.floors?.amenities

export const OUTDOOR_AMENITIES = sheperdConfig?.types || []
export const AMENITY_FLOORS = sheperdConfig?.floors || []
export const ALLOW_MULTIPLE_FLOORS = sheperdConfig?.allowMultipleFloorsPerAmenity || false

export const getAmenitiesByFloor = (floorNumber) => {
  return OUTDOOR_AMENITIES.filter(a => a.floor === floorNumber)
}

export const getAmenityName = (key) => {
  const amenity = OUTDOOR_AMENITIES.find(a => a.key === key)
  return amenity?.name || key
}

export const getAmenityIcon = (key) => {
  const amenity = OUTDOOR_AMENITIES.find(a => a.key === key)
  return amenity?.icon || 'Deck'
}

export const AMENITIES_BY_FLOOR = AMENITY_FLOORS.reduce((acc, floor) => {
  acc[floor] = getAmenitiesByFloor(floor)
  return acc
}, {})