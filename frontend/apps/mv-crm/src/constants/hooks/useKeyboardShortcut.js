// apps/mv-crm/src/constants/hooks/useKeyboardShortcut.js
import { useEffect } from 'react'

export const useKeyboardShortcut = (key, callback, options = {}) => {
  const { ctrlKey = false, metaKey = false, shiftKey = false } = options

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMatch = 
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey

      if (isMatch) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, callback, ctrlKey, metaKey, shiftKey])
}

export default useKeyboardShortcut