import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TIMEOUT_DURATION = 5 * 60 * 1000
const WARNING_DURATION = 30 * 1000

export const useSessionTimeout = () => {
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    setShowWarning(false)

    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true)
    }, TIMEOUT_DURATION - WARNING_DURATION)

    timeoutRef.current = setTimeout(() => {
      logout()
    }, TIMEOUT_DURATION)
  }

  const extendSession = () => {
    setShowWarning(false)
    resetTimer()
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleActivity = () => {
      resetTimer()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    resetTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }
  }, [])

  return { showWarning, extendSession, logout }
}
