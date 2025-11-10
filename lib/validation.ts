// Input sanitization and validation utilities

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

export function sanitizeValue(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_') // Only allow alphanumeric and underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 50) // Limit length
}

export function sanitizeNumber(input: any): number {
  const num = parseFloat(input)
  if (isNaN(num) || !isFinite(num)) return 0
  return Math.max(0, Math.min(999999.99, num)) // Limit range
}

export function validateRegistrationTypeInput(data: any): {
  isValid: boolean
  errors: string[]
  sanitized: {
    value?: string
    label?: string
    fee?: number
    description?: string
  }
} {
  const errors: string[] = []
  const sanitized: any = {}

  // Validate and sanitize value (for POST requests)
  if (data.value !== undefined) {
    const value = sanitizeValue(data.value)
    if (!value || value.length < 2) {
      errors.push('Value must be at least 2 characters long')
    } else if (!/^[a-z0-9_]+$/.test(value)) {
      errors.push('Value can only contain lowercase letters, numbers, and underscores')
    } else {
      sanitized.value = value
    }
  }

  // Validate and sanitize label
  if (data.label !== undefined) {
    const label = sanitizeString(data.label)
    if (!label || label.length < 2) {
      errors.push('Label must be at least 2 characters long')
    } else if (label.length > 100) {
      errors.push('Label cannot exceed 100 characters')
    } else {
      sanitized.label = label
    }
  }

  // Validate and sanitize fee
  if (data.fee !== undefined) {
    const fee = sanitizeNumber(data.fee)
    if (fee <= 0) {
      errors.push('Fee must be a positive number')
    } else if (fee > 999999.99) {
      errors.push('Fee cannot exceed 999,999.99')
    } else {
      sanitized.fee = fee
    }
  }

  // Validate and sanitize description
  if (data.description !== undefined && data.description !== null) {
    const description = sanitizeString(data.description)
    if (description.length > 500) {
      errors.push('Description cannot exceed 500 characters')
    } else {
      sanitized.description = description || null
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

export function validateId(id: string): { isValid: boolean; numericId?: number; error?: string } {
  const numericId = parseInt(id, 10)
  
  if (isNaN(numericId)) {
    return { isValid: false, error: 'Invalid ID format' }
  }
  
  if (numericId <= 0) {
    return { isValid: false, error: 'ID must be positive' }
  }
  
  if (numericId > 2147483647) { // MySQL INT max value
    return { isValid: false, error: 'ID too large' }
  }
  
  return { isValid: true, numericId }
}