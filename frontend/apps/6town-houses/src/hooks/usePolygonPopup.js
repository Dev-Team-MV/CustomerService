// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/hooks/usePolygonPopup.js

import { useState, useRef } from 'react'

export const usePolygonPopup = (buildings, validBuildings) => {
  const [selectedPolygonBuilding, setSelectedPolygonBuilding] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [showPopup, setShowPopup] = useState(false)
  
  const isOverPopupRef = useRef(false)
  const isOverPolygonRef = useRef(false)
  const closeTimeoutRef = useRef(null)

  const handlePolygonHover = (polygonId, mouseEvent) => {
    if (!mouseEvent) {
      console.warn('⚠️ mouseEvent is null/undefined')
      return
    }

    let clientX = mouseEvent.clientX
    let clientY = mouseEvent.clientY

    if (clientX === undefined || clientY === undefined) {
      clientX = window.innerWidth / 2
      clientY = window.innerHeight / 2
    }
    
    isOverPolygonRef.current = true

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    const building = buildings.find(b => b._id === polygonId)
    
    if (building && validBuildings.includes(building)) {
      setPopupPosition({ x: clientX, y: clientY })
      setSelectedPolygonBuilding(building)
      setShowPopup(true)
    }
  }

  const handlePolygonLeave = () => {
    isOverPolygonRef.current = false

    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverPolygonRef.current) {
        setShowPopup(false)
        setSelectedPolygonBuilding(null)
      }
    }, 200)
  }

  const handlePopupEnter = () => {
    isOverPopupRef.current = true

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handlePopupLeave = () => {
    isOverPopupRef.current = false

    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverPolygonRef.current) {
        setShowPopup(false)
        setSelectedPolygonBuilding(null)
      }
    }, 200)
  }

  const handleSelectFromPopup = (onBuildingSelect) => {
    if (selectedPolygonBuilding) {
      setShowPopup(false)
      setSelectedPolygonBuilding(null)
      onBuildingSelect(selectedPolygonBuilding)
    }
  }

  return {
    selectedPolygonBuilding,
    popupPosition,
    showPopup,
    handlePolygonHover,
    handlePolygonLeave,
    handlePopupEnter,
    handlePopupLeave,
    handleSelectFromPopup
  }
}