// Date formatter - "Jan 19, 2026"
export function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '-'
  }
}

// Currency formatter - "$5,000"
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Parse currency string to number
export function parseCurrency(value: string): number | null {
  if (!value || value === '-') return null
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '')
  const num = parseFloat(cleaned)
  
  return isNaN(num) ? null : num
}

// Phone formatter - "(708) 901-4213" for 10 digits
export function formatPhone(phone: string | null): string {
  if (!phone) return '-'
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // Format if 11 digits (with country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // Return as-is if not standard format
  return phone
}

// URL domain extractor - "linkedin.com"
export function extractDomain(url: string | null): string {
  if (!url) return '-'
  
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(urlWithProtocol)
    
    // Remove www. prefix
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// Ensure URL has protocol
export function ensureProtocol(url: string | null): string {
  if (!url) return ''
  return url.startsWith('http') ? url : `https://${url}`
}

// Parse date input value to ISO string
export function parseDateInput(value: string): string | null {
  if (!value) return null
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

// Format date for input value (YYYY-MM-DD)
export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}
