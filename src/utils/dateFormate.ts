export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    return '-'
  }
}

export const toISODate = (ddmmyyyy: string): string => {
  if (!ddmmyyyy) return ''
  
  const parts = ddmmyyyy.split('/')
  if (parts.length !== 3) return ''
  
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const getTodayDDMMYYYY = (): string => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  
  return `${day}/${month}/${year}`
}

export const getTodayISO = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
